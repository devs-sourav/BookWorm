const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const User = require("../models/userModel");
const Email = require("../utils/Email");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { getAll, getOne, deleteOne } = require("../utils/handleFactory");

// Add these at the top for SSL Commerz
const SSLCommerzPayment = require("sslcommerz-lts");
const axios = require("axios");

// ADD THIS HELPER FUNCTION AT THE TOP OF YOUR orderController.js file
const formatOrderForSSLCommerz = (order) => {
  // Validate order structure
  if (!order || !order.products || !Array.isArray(order.products)) {
    return {
      short: `Order #${order?.orderNumber || "Unknown"}`,
      medium: `Order #${order?.orderNumber || "Unknown"} - No items`,
      detailed: `Order #${
        order?.orderNumber || "Unknown"
      } - No items available`,
      breakdown: `Total: ${order?.totalCost || 0} BDT`,
    };
  }

  // Create detailed product list with enhanced formatting
  const productList = order.products
    .map((item, index) => {
      const product = item.product || item;
      const title = product.title || item.title || "Unknown Book";
      const author = product.author?.name || product.author || "";
      const isbn = product.isbn || item.isbn || "";
      const price = item.salePrice || item.price || 0;
      const qty = item.quantity || 1;
      const totalPrice = price * qty;

      // Format: "1. Book Title by Author (ISBN: 123) x2 = 500 BDT"
      let formattedItem = `${index + 1}. ${title}`;

      if (author) {
        formattedItem += ` by ${author}`;
      }

      if (isbn) {
        formattedItem += ` (${isbn})`;
      }

      formattedItem += ` x${qty} = ${totalPrice} BDT`;

      return formattedItem;
    })
    .join(" | "); // Using | separator for single line

  // Create different length summaries with smart truncation
  const summary = {
    // Short version - Basic info only (under 50 chars)
    short: `Order #${order.orderNumber} - ${order.products.length} Book${
      order.products.length > 1 ? "s" : ""
    }`,

    // Medium version - Book titles with quantities (under 150 chars)
    medium: `Order #${order.orderNumber}: ${order.products
      .map((item) => {
        const product = item.product || item;
        const title = product.title || item.title || "Unknown";
        // Truncate long titles for medium summary
        const truncatedTitle =
          title.length > 30 ? title.substring(0, 27) + "..." : title;
        return `${truncatedTitle} (x${item.quantity})`;
      })
      .join(", ")}`,

    // Detailed version - Full product information (under 255 chars)
    detailed: productList,

    // Smart truncated version - Fits within 255 char limit
    smartTruncated: (() => {
      if (productList.length <= 255) return productList;

      // If too long, create abbreviated version
      const abbreviated = order.products
        .map((item, index) => {
          const product = item.product || item;
          const title = product.title || item.title || "Book";
          const shortTitle =
            title.length > 20 ? title.substring(0, 17) + "..." : title;
          return `${index + 1}. ${shortTitle} x${item.quantity}`;
        })
        .join(" | ");

      // If still too long, use summary format
      if (abbreviated.length > 255) {
        return `Order #${order.orderNumber}: ${order.products.length} books, Total: ${order.totalCost} BDT`;
      }

      return abbreviated;
    })(),

    // Breakdown - Financial summary
    breakdown: (() => {
      let breakdown = `Subtotal: ${order.subtotal || 0} BDT`;

      if (order.shippingCost && order.shippingCost > 0) {
        breakdown += `, Shipping: ${order.shippingCost} BDT`;
      }

      if (order.couponDiscount && order.couponDiscount > 0) {
        breakdown += `, Discount: -${order.couponDiscount} BDT`;
      }

      breakdown += `, Total: ${order.totalCost} BDT`;

      return breakdown;
    })(),
  };

  return summary;
};

// Helper function to enrich products with full details
const enrichProductsData = async (products) => {
  // Aggregate the product prices
  const productAggregation = await Product.aggregate([
    {
      $match: {
        _id: {
          $in: products.map(
            (item) => new mongoose.Types.ObjectId(item.product)
          ),
        },
      },
    },
    {
      $lookup: {
        from: "authors",
        localField: "author",
        foreignField: "_id",
        as: "authorData",
      },
    },
    {
      $project: {
        title: 1,
        price: 1,
        salePrice: 1,
        freeShipping: 1,
        stock: 1,
        isbn: 1,
        format: 1,
        author: { $arrayElemAt: ["$authorData.name", 0] },
      },
    },
    {
      $addFields: {
        effectivePrice: {
          $cond: {
            if: { $gt: ["$salePrice", 0] },
            then: "$salePrice",
            else: "$price",
          },
        },
      },
    },
  ]);

  // Create enriched products array
  const enrichedProducts = [];
  let hasFreeShippingProduct = false;

  products.forEach((productItem) => {
    const product = productAggregation.find((p) =>
      p._id.equals(new mongoose.Types.ObjectId(productItem.product))
    );
    if (product) {
      if (product.freeShipping === true) hasFreeShippingProduct = true;

      enrichedProducts.push({
        product: productItem.product,
        quantity: productItem.quantity,
        price: product.price,
        salePrice: product.effectivePrice,
        title: product.title,
        isbn: product.isbn,
        author: product.author,
        format: product.format,
      });
    }
  });

  return { enrichedProducts, hasFreeShippingProduct };
};

exports.createOrderController = catchAsync(async (req, res, next) => {
  console.log("🛒 createOrderController payload:", JSON.stringify(req.body));

  // determine user id from request body or authenticated user (guest allowed)
  let userDoc = null;
  const userId = req.body.user || req.user?.id || null;
  if (userId) {
    userDoc = await User.findById(userId);
    if (!userDoc) {
      return next(new AppError("User not found", 404));
    }
    // ensure body contains user field for later use if coming from auth
    req.body.user = userId;
  }

  // Validate that products exist and is an array
  if (
    !req.body.products ||
    !Array.isArray(req.body.products) ||
    req.body.products.length === 0
  ) {
    return next(
      new AppError("Products array is required and cannot be empty", 400)
    );
  }

  // Validate stock availability before creating order
  for (const item of req.body.products) {
    // Validate item structure - only require product ID and quantity
    if (!item.product || !item.quantity) {
      return next(
        new AppError("Each product item must have product ID and quantity", 400)
      );
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return next(
        new AppError(`Product with ID ${item.product} not found`, 404)
      );
    }

    if (product.stock < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for "${product.title}". Available: ${product.stock}, Requested: ${item.quantity}`,
          400
        )
      );
    }

    if (!product.isActive) {
      return next(
        new AppError(`Product "${product.title}" is not active`, 400)
      );
    }
  }

  // Enrich products with full details
  const { enrichedProducts, hasFreeShippingProduct } = await enrichProductsData(
    req.body.products
  );

  // Determine shipping cost if it wasn't supplied by client
  // Use order-level deliveryType to estimate default rates.
  if (req.body.shippingCost == null) {
    if (hasFreeShippingProduct && req.body.deliveryType !== "on_demand") {
      req.body.shippingCost = 0;
    } else if (req.body.deliveryType === "on_demand") {
      // express delivery default
      req.body.shippingCost = 160;
    } else {
      // normal delivery default
      req.body.shippingCost = 80;
    }
  }

  // If shipping cost is provided from backend, respect it regardless of free shipping
  // This allows you to override free shipping with a manual shipping cost if needed

  // Start a MongoDB session for transaction to ensure data consistency
  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      // Update stock and saleNumber immediately before creating order
      await Promise.all(
        req.body.products.map(async (productItem) => {
          const updatedProduct = await Product.findByIdAndUpdate(
            productItem.product,
            {
              $inc: {
                saleNumber: productItem.quantity,
                stock: -productItem.quantity,
              },
            },
            { new: true, session }
          );

          if (!updatedProduct) {
            throw new AppError(
              `Product with ID ${productItem.product} not found during stock update`,
              404
            );
          }
        })
      );

      // Create the order after stock is successfully reduced
      const createdOrders = await Order.create(
        [
          {
            ...req.body,
            products: enrichedProducts,
            // totalCost and subtotal will be calculated by the pre-save middleware
          },
        ],
        { session }
      );

      order = createdOrders[0]; // Extract from array since create with session returns array
    });
  } catch (error) {
    // No need to manually abort - mongoose handles this automatically
    return next(error);
  } finally {
    await session.endSession();
  }

  // Populate the order after successful creation - SIMPLIFIED POPULATION
  order = await Order.findById(order._id)
    .populate("user", "name email phone")
    .populate(
      "products.product",
      "title isbn price salePrice discountType discountValue author photos slug"
    );

  const orderUrl = `${req.protocol}://bookwormm.netlify.app/orders/${order._id}`;
  const email = new Email({ email: order.email, name: order.name }, orderUrl);

  // send email in background; don't let failures stop order creation
  email.sendInvoice(order).catch((err) => {
    console.error("📧 Invoice email failed after order creation:", err.message);
  });

  res.status(201).json({
    status: "success",
    message: "Order created successfully. Check your email inbox please",
    data: {
      order,
    },
  });
});

// WITH COUPON CODE:
exports.createOrderWithCouponController = catchAsync(async (req, res, next) => {
  console.log("🛍️ createOrderWithCouponController payload:", JSON.stringify(req.body));
  const { coupon, products, user } = req.body;

  // determine user id from request body or authenticated user (guest allowed)
  let userData = null;
  const userId = user || req.user?.id || null;
  if (userId) {
    userData = await User.findById(userId);
    if (!userData) {
      return next(new AppError("User not found", 404));
    }
    req.body.user = userId;
  }

  if (!coupon) {
    return next(
      new AppError("You need to enter a coupon code to use this route", 400)
    );
  }

  // Validate that products exist and is an array
  if (!products || !Array.isArray(products) || products.length === 0) {
    return next(
      new AppError("Products array is required and cannot be empty", 400)
    );
  }

  // Check if the coupon is valid
  const couponData = await Coupon.findOne({
    coupon,
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
  });

  if (!couponData) {
    return next(new AppError("Invalid, inactive, or expired coupon code", 400));
  }

  // Validate stock availability before creating order
  for (const item of products) {
    // Validate item structure - only require product ID and quantity
    if (!item.product || !item.quantity) {
      return next(
        new AppError("Each product item must have product ID and quantity", 400)
      );
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return next(
        new AppError(`Product with ID ${item.product} not found`, 404)
      );
    }

    if (product.stock < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for "${product.title}". Available: ${product.stock}, Requested: ${item.quantity}`,
          400
        )
      );
    }

    if (!product.isActive) {
      return next(
        new AppError(`Product "${product.title}" is not active`, 400)
      );
    }
  }

  // Enrich products with full details
  const { enrichedProducts, hasFreeShippingProduct } = await enrichProductsData(
    products
  );

  // Determine shipping cost if not provided by client
  if (req.body.shippingCost == null) {
    if (hasFreeShippingProduct && req.body.deliveryType !== "on_demand") {
      req.body.shippingCost = 0;
    } else if (req.body.deliveryType === "on_demand") {
      req.body.shippingCost = 160;
    } else {
      req.body.shippingCost = 80;
    }
  }

  // Calculate the total product cost
  const productTotal = enrichedProducts.reduce((total, item) => {
    return total + item.salePrice * item.quantity;
  }, 0);

  // Calculate the discount based on the coupon type
  let couponDiscount = 0;
  if (couponData.discountType === "percentage") {
    couponDiscount = (productTotal * couponData.discountPercent) / 100;
  } else if (couponData.discountType === "amount") {
    couponDiscount = Math.min(couponData.discountAmount, productTotal);
  }

  // FIXED: Only set shipping cost to 0 if no shipping cost was provided AND there's a free shipping product
  if (hasFreeShippingProduct && !req.body.shippingCost) {
    req.body.shippingCost = 0;
  }

  // Start a MongoDB session for transaction to ensure data consistency
  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      // Update stock and saleNumber immediately before creating order
      await Promise.all(
        products.map(async (productItem) => {
          const updatedProduct = await Product.findByIdAndUpdate(
            productItem.product,
            {
              $inc: {
                saleNumber: productItem.quantity,
                stock: -productItem.quantity,
              },
            },
            { new: true, session }
          );

          if (!updatedProduct) {
            throw new AppError(
              `Product with ID ${productItem.product} not found during stock update`,
              404
            );
          }
        })
      );

      // Create the order with the calculated total cost after stock is reduced
      const createdOrders = await Order.create(
        [
          {
            ...req.body,
            products: enrichedProducts,
            couponDiscount: couponDiscount,
            couponDiscountType: couponData.discountType,
            // subtotal and totalCost will be calculated by pre-save middleware
          },
        ],
        { session }
      );

      order = createdOrders[0]; // Extract from array since create with session returns array
    });
  } catch (error) {
    // No need to manually abort - mongoose handles this automatically
    return next(error);
  } finally {
    await session.endSession();
  }

  // Populate the order after successful creation - SIMPLIFIED POPULATION
  order = await Order.findById(order._id)
    .populate("user", "name email phone")
    .populate(
      "products.product",
      "title isbn price salePrice discountType discountValue author photos slug"
    )
    .select("-__v");

  const orderUrl = `${req.protocol}://bookwormm.netlify.app/orders/${order._id}`;
  const email = new Email({ email: order.email, name: order.name }, orderUrl);

  // Pass the discount information to email template
  const discountInfo = {
    type: couponData.discountType,
    value:
      couponData.discountType === "percentage"
        ? couponData.discountPercent
        : couponData.discountAmount,
    amount: couponDiscount,
  };

  // fire-and-forget email
  email.sendInvoiceWithCoupon(order, discountInfo).catch((err) => {
    console.error("📧 Coupon invoice email failed after order creation:", err.message);
  });

  res.status(201).json({
    status: "success",
    message:
      "Order created successfully with coupon applied, Check your email inbox please",
    data: {
      order,
    },
  });
});

exports.initiateSSLCommerzPayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  console.log("🚀 SSL Commerz Payment Initiation Started");
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Store ID:", process.env.SSLCOMMERZ_STORE_ID ? "Set" : "Missing");
  console.log(
    "Store Password:",
    process.env.SSLCOMMERZ_STORE_PASSWORD ? "Set" : "Missing"
  );
  console.log("Frontend Base URL:", process.env.FRONTEND_BASE_URL);

  const order = await Order.findById(orderId)
    .populate("user", "name email phone")
    .populate(
      "products.product",
      "title isbn price salePrice author photos slug"
    );

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (order.paymentStatus === "paid") {
    return next(new AppError("Order is already paid", 400));
  }

  const is_live = process.env.NODE_ENV === "production";
  console.log("SSL Commerz Mode:", is_live ? "Live" : "Sandbox");

  // Initialize SSL Commerz
  const sslcz = new SSLCommerzPayment(
    process.env.SSLCOMMERZ_STORE_ID,
    process.env.SSLCOMMERZ_STORE_PASSWORD,
    is_live
  );

  // Generate unique transaction ID
  const tran_id = `${order.orderNumber}_${Date.now()}`;

  // Format product description using the helper function
  const orderSummary = formatOrderForSSLCommerz(order);

  // SSL Commerz payment data with improved URLs
  const data = {
    total_amount: order.totalCost,
    currency: "BDT",
    tran_id: tran_id,
    success_url: `${
      process.env.BACKEND_BASE_URL || "https://bookworm-t3mi.onrender.com"
    }/api/v1/order/payment/success`,
    fail_url: `${
      process.env.BACKEND_BASE_URL || "https://bookworm-t3mi.onrender.com"
    }/api/v1/order/payment/fail`,
    cancel_url: `${
      process.env.BACKEND_BASE_URL || "https://bookworm-t3mi.onrender.com"
    }/api/v1/order/payment/cancel`,
    ipn_url: `${
      process.env.BACKEND_BASE_URL || "https://bookworm-t3mi.onrender.com"
    }/api/v1/order/payment/ipn`,

    shipping_method: order.deliveryType === "on_demand" ? "Express" : "Regular",
    product_name: orderSummary.medium, // Use formatted order summary
    product_category: "Books",
    product_profile: "physical-goods",

    // Customer information
    cus_name: order.name,
    cus_email: order.email,
    cus_add1: order.streetAddress,
    cus_city: order.city?.cityName || "Dhaka",
    cus_state: order.zone?.zoneName || "Dhaka",
    cus_postcode: order.postcode || "1000",
    cus_country: "Bangladesh",
    cus_phone: order.phone,

    // Shipping information
    ship_name: order.name,
    ship_add1: order.streetAddress,
    ship_city: order.city?.cityName || "Dhaka",
    ship_state: order.zone?.zoneName || "Dhaka",
    ship_postcode: order.postcode || "1000",
    ship_country: "Bangladesh",
    ship_phone: order.phone,

    // Optional fields for better tracking
    value_a: orderId, // Store order ID for reference
    value_b: order.orderNumber,
    value_c: order.user?.toString(),
    value_d: orderSummary.breakdown,
  };

  console.log("💳 Payment Data:", JSON.stringify(data, null, 2));

  try {
    console.log("🔄 Calling SSL Commerz API...");
    const sslcommerzResponse = await sslcz.init(data);

    console.log(
      "📨 SSL Commerz Response:",
      JSON.stringify(sslcommerzResponse, null, 2)
    );

    if (sslcommerzResponse?.GatewayPageURL) {
      console.log(
        "✅ Payment URL Generated:",
        sslcommerzResponse.GatewayPageURL
      );

      // Update order with SSL Commerz data
      order.paymentStatus = "processing";
      order.sslcommerzTransactionId = tran_id;
      order.sslcommerzData = {
        sessionkey: sslcommerzResponse.sessionkey,
        GatewayPageURL: sslcommerzResponse.GatewayPageURL,
        storeBanner: sslcommerzResponse.storeBanner,
        storeLogo: sslcommerzResponse.storeLogo,
        redirectGatewayURL: sslcommerzResponse.redirectGatewayURL,
        directPaymentURLBank: sslcommerzResponse.directPaymentURLBank,
        directPaymentURLCard: sslcommerzResponse.directPaymentURLCard,
        directPaymentURL: sslcommerzResponse.directPaymentURL,
        initiatedAt: new Date(),
        paymentData: data, // Store the payment data for reference
      };
      await order.save();

      res.status(200).json({
        status: "success",
        message: "SSL Commerz payment session initiated successfully",
        data: {
          paymentUrl: sslcommerzResponse.GatewayPageURL,
          sessionkey: sslcommerzResponse.sessionkey,
          transactionId: tran_id,
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            totalCost: order.totalCost,
            paymentStatus: order.paymentStatus,
          },
        },
      });
    } else {
      console.log("❌ No Gateway URL in response");
      console.log("Full response:", sslcommerzResponse);
      return next(
        new AppError("Failed to initiate SSL Commerz payment session", 500)
      );
    }
  } catch (error) {
    console.error("💥 SSL Commerz initialization error:", error);
    console.error("Error details:", error.response?.data || error.message);

    // Update order with error information
    order.paymentStatus = "failed";
    order.sslcommerzData = {
      ...order.sslcommerzData,
      initializationError: error.message,
      failedAt: new Date(),
    };
    await order.save();

    return next(new AppError("SSL Commerz payment initialization failed", 500));
  }
});

// FIXED SSL Commerz Success Callback with validation - NO catchAsync!
exports.handleSSLCommerzSuccess = async (req, res) => {
  const frontendBaseUrl =
    process.env.FRONTEND_BASE_URL || "https://bookwormm.netlify.app";

  // STEP 0: Immediately log everything
  console.log("=== SSL SUCCESS HANDLER ENTERED ===");
  console.log("Method:", req.method);
  console.log("Body:", JSON.stringify(req.body));
  console.log("Query:", JSON.stringify(req.query));
  console.log("Headers:", JSON.stringify(req.headers));

  const safeRedirect = (url) => {
    console.log("=== REDIRECTING TO:", url, "===");
    if (res.headersSent) {
      console.warn("⚠️ Headers already sent!");
      return;
    }
    return res.redirect(302, url);
  };

  // STEP 1: Try to send a test redirect immediately to confirm handler is reached
  // Comment this out after confirming handler is reached
  // return safeRedirect(`${frontendBaseUrl}/payment/error?type=test`);

  try {
    const data = { ...(req.body || {}), ...(req.query || {}) };
    console.log("STEP 1 - Merged data:", JSON.stringify(data));

    const { tran_id, val_id, amount, currency, bank_tran_id,
            card_type, card_no, card_issuer, card_brand } = data;

    console.log("STEP 2 - tran_id:", tran_id, "val_id:", val_id, "amount:", amount);

    if (!tran_id || !val_id) {
      console.log("STEP 2 FAIL - Missing params");
      return safeRedirect(`${frontendBaseUrl}/payment/error?type=missing_params`);
    }

    console.log("STEP 3 - Finding order...");
    let order;
    try {
      order = await Order.findOne({ sslcommerzTransactionId: tran_id })
        .populate("user", "name email")
        .populate("products.product", "title author");
      console.log("STEP 3 - Order found:", order ? order._id : "NULL");
    } catch (dbErr) {
      console.error("STEP 3 FAIL - DB error:", dbErr.message, dbErr.stack);
      return safeRedirect(`${frontendBaseUrl}/payment/error?type=db_error`);
    }

    if (!order) {
      console.log("STEP 3 FAIL - Order not found for tran_id:", tran_id);
      return safeRedirect(
        `${frontendBaseUrl}/payment/error?type=order_not_found&tran_id=${encodeURIComponent(tran_id)}`
      );
    }

    console.log("STEP 4 - Payment status:", order.paymentStatus, "totalCost:", order.totalCost);

    if (order.paymentStatus === "paid") {
      console.log("STEP 4 - Already paid");
      return safeRedirect(`${frontendBaseUrl}/order/payment/success/${order._id}`);
    }

    console.log("STEP 5 - Amount validation...");
    const receivedAmount = Math.round(parseFloat(amount || "0"));
    const expectedAmount = Math.round(parseFloat(order.totalCost || "0"));
    console.log("STEP 5 - received:", receivedAmount, "expected:", expectedAmount);

    if (receivedAmount !== expectedAmount) {
      console.log("STEP 5 FAIL - Amount mismatch");
      try {
        order.paymentStatus = "failed";
        order.orderStatus = "payment_failed";
        order.sslcommerzData = {
          ...(order.sslcommerzData
            ? order.sslcommerzData.toObject?.() || order.sslcommerzData
            : {}),
          amountMismatch: { receivedAmount, expectedAmount },
          failedAt: new Date(),
        };
        await order.save();
      } catch (saveErr) {
        console.error("STEP 5 SAVE ERROR:", saveErr.message);
      }
      return safeRedirect(
        `${frontendBaseUrl}/order/payment/fail/${order._id}?error=amount_mismatch`
      );
    }

    console.log("STEP 6 - SSL Commerz validation...");
    console.log("STEP 6 - NODE_ENV:", process.env.NODE_ENV);
    console.log("STEP 6 - Store ID:", process.env.SSLCOMMERZ_STORE_ID ? "SET" : "MISSING");
    console.log("STEP 6 - Store Password:", process.env.SSLCOMMERZ_STORE_PASSWORD ? "SET" : "MISSING");

    let validation;
    try {
      const is_live = process.env.NODE_ENV === "production";
      const storeId = process.env.SSLCOMMERZ_STORE_ID;
      const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;

      if (!storeId || !storePassword) {
        throw new Error("SSL Commerz credentials missing from environment");
      }

      const sslcz = new SSLCommerzPayment(storeId, storePassword, is_live);
      console.log("STEP 6 - Calling sslcz.validate with val_id:", val_id);
      validation = await sslcz.validate({ val_id });
      console.log("STEP 6 - Validation response:", JSON.stringify(validation));
    } catch (validationErr) {
      console.error("STEP 6 FAIL - Validation error:", validationErr.message, validationErr.stack);
      try {
        order.paymentStatus = "failed";
        order.orderStatus = "payment_failed";
        order.sslcommerzData = {
          ...(order.sslcommerzData
            ? order.sslcommerzData.toObject?.() || order.sslcommerzData
            : {}),
          validationError: validationErr.message,
          failedAt: new Date(),
        };
        await order.save();
      } catch (saveErr) {
        console.error("STEP 6 SAVE ERROR:", saveErr.message);
      }
      return safeRedirect(
        `${frontendBaseUrl}/order/payment/fail/${order._id}?reason=validation_error`
      );
    }

    console.log("STEP 7 - Validation status:", validation?.status);

    if (validation?.status === "VALID" || validation?.status === "VALIDATED") {
      console.log("STEP 7 - Payment VALID, saving order...");
      try {
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paidAt = new Date();
        order.sslcommerzData = {
          ...(order.sslcommerzData
            ? order.sslcommerzData.toObject?.() || order.sslcommerzData
            : {}),
          validationResponse: data,
          validationData: validation,
          paymentDetails: {
            cardType: card_type,
            cardNo: card_no ? card_no.slice(-4) : null,
            cardIssuer: card_issuer,
            cardBrand: card_brand,
            bankTranId: bank_tran_id,
            paidAmount: receivedAmount,
            currency: currency,
            paidAt: new Date(),
          },
        };
        await order.save();
        console.log("STEP 7 - Order saved successfully");
      } catch (saveErr) {
        console.error("STEP 7 SAVE ERROR:", saveErr.message, saveErr.stack);
        // Don't return — still redirect to success
      }

      // Fire-and-forget email
      try {
        const orderUrl = `${frontendBaseUrl}/orders/${order._id}`;
        const email = new Email(
          { email: order.email, name: order.name },
          orderUrl
        );
        email.sendInvoice(order).catch((emailErr) => {
          console.error("📧 Email failed:", emailErr.message);
        });
      } catch (emailErr) {
        console.error("📧 Email setup failed:", emailErr.message);
      }

      console.log("STEP 8 - Redirecting to success page");
      return safeRedirect(
        `${frontendBaseUrl}/order/payment/success/${order._id}`
      );
    } else {
      console.log("STEP 7 FAIL - Invalid validation status:", validation?.status);
      try {
        order.paymentStatus = "failed";
        order.orderStatus = "payment_failed";
        order.sslcommerzData = {
          ...(order.sslcommerzData
            ? order.sslcommerzData.toObject?.() || order.sslcommerzData
            : {}),
          validationResponse: data,
          invalidStatus: validation?.status,
          failedAt: new Date(),
        };
        await order.save();
      } catch (saveErr) {
        console.error("STEP 7 SAVE ERROR:", saveErr.message);
      }
      return safeRedirect(
        `${frontendBaseUrl}/order/payment/fail/${order._id}?reason=invalid_validation`
      );
    }
  } catch (unexpectedErr) {
    console.error("=== UNEXPECTED TOP LEVEL ERROR ===");
    console.error("Message:", unexpectedErr.message);
    console.error("Stack:", unexpectedErr.stack);
    return safeRedirect(
      `${frontendBaseUrl}/payment/error?type=unexpected_error`
    );
  }
};

exports.handleSSLCommerzFail = async (req, res) => {
  const params = { ...(req.body || {}), ...(req.query || {}) };
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "https://bookwormm.netlify.app";
  
  const safeRedirect = (url) => {
    if (res.headersSent) return;
    return res.redirect(302, url);
  };

  try {
    const { tran_id, failedreason } = params;
    console.log("❌ SSL Fail callback:", { tran_id, failedreason });

    if (!tran_id) {
      return safeRedirect(`${frontendBaseUrl}/payment/error?type=missing_tran_id`);
    }

    let order;
    try {
      order = await Order.findOne({ sslcommerzTransactionId: tran_id });
    } catch (dbErr) {
      return safeRedirect(`${frontendBaseUrl}/payment/error?type=db_error`);
    }

    if (!order) {
      return safeRedirect(`${frontendBaseUrl}/order/payment/fail/unknown?error=order_not_found&tran_id=${encodeURIComponent(tran_id)}`);
    }

    if (order.paymentStatus === "paid") {
      return safeRedirect(`${frontendBaseUrl}/order/payment/success/${order._id}`);
    }

    try {
      order.paymentStatus = "failed";
      order.orderStatus = "pending";
      order.sslcommerzData = {
        ...(order.sslcommerzData ? order.sslcommerzData.toObject?.() || order.sslcommerzData : {}),
        failureResponse: params,
        failureReason: failedreason || "payment_failed",
        failedAt: new Date(),
      };
      await order.save();
    } catch (saveErr) {
      console.error("💥 Error saving failed status:", saveErr);
    }

    return safeRedirect(
      `${frontendBaseUrl}/order/payment/fail/${order._id}?reason=${encodeURIComponent(failedreason || "payment_failed")}`
    );

  } catch (unexpectedErr) {
    console.error("💥 Unexpected error in handleSSLCommerzFail:", unexpectedErr);
    return safeRedirect(`${frontendBaseUrl}/payment/error?type=unexpected_error`);
  }
};


// ============================================================
// FIXED: handleSSLCommerzCancel
// ============================================================

exports.handleSSLCommerzCancel = async (req, res) => {
  const params = { ...(req.body || {}), ...(req.query || {}) };
  const frontendBaseUrl =
    process.env.FRONTEND_BASE_URL || "https://bookwormm.netlify.app";

  const safeRedirect = (url) => {
    if (res.headersSent) return;
    return res.redirect(302, url);
  };

  try {
    const { tran_id } = params;
    console.log("🚫 SSL Cancel callback:", { tran_id, params });

    // ── 1. Validate tran_id ──────────────────────────────────
    if (!tran_id) {
      console.warn("⚠️  Missing tran_id in cancel callback");
      return safeRedirect(
        `${frontendBaseUrl}/payment/error?type=missing_tran_id`
      );
    }

    // ── 2. Find the order ────────────────────────────────────
    let order;
    try {
      order = await Order.findOne({ sslcommerzTransactionId: tran_id });
    } catch (dbErr) {
      console.error("💥 DB error finding order:", dbErr);
      return safeRedirect(
        `${frontendBaseUrl}/payment/error?type=db_error&tran_id=${encodeURIComponent(tran_id)}`
      );
    }

    if (!order) {
      console.error("❌ Order not found for cancelled transaction:", tran_id);
      return safeRedirect(
        `${frontendBaseUrl}/order/payment/cancel/unknown?error=order_not_found&tran_id=${encodeURIComponent(tran_id)}`
      );
    }

    console.log("📦 Order found:", {
      orderNumber: order.orderNumber,
      orderId: order._id,
      currentPaymentStatus: order.paymentStatus,
    });

    // ── 3. Idempotency — don't overwrite an already-paid order ──
    if (order.paymentStatus === "paid") {
      console.warn(
        "⚠️  Cancel callback received for already-paid order:",
        order.orderNumber
      );
      return safeRedirect(
        `${frontendBaseUrl}/order/payment/success/${order._id}`
      );
    }

    // ── 4. Update order status ───────────────────────────────
    try {
      order.paymentStatus = "failed";
      order.orderStatus = "canceled";
      order.sslcommerzData = {
        ...(order.sslcommerzData
          ? order.sslcommerzData.toObject?.() || order.sslcommerzData
          : {}),
        cancelResponse: params,
        cancelledAt: new Date(),
      };
      await order.save();
      console.log("💾 Order marked as cancelled:", order.orderNumber);
    } catch (saveErr) {
      console.error("💥 Error saving cancelled status:", saveErr);
      // Still redirect — don't return error to the customer
    }

    // ── 5. Redirect to cancel page ───────────────────────────
    return safeRedirect(
      `${frontendBaseUrl}/order/payment/cancel/${order._id}`
    );
  } catch (unexpectedErr) {
    // CATCH-ALL: this handler must NEVER let Express handle errors with JSON
    console.error(
      "💥 Unexpected error in handleSSLCommerzCancel:",
      unexpectedErr
    );
    return safeRedirect(
      `${frontendBaseUrl}/payment/error?type=unexpected_error`
    );
  }
};


// NEW: SSL Commerz IPN (Instant Payment Notification) Handler
exports.handleSSLCommerzIPN = catchAsync(async (req, res, next) => {
  const {
    tran_id,
    amount,
    currency,
    bank_tran_id,
    card_type,
    card_no,
    card_issuer,
    card_brand,
    val_id,
    status,
  } = req.body;

  console.log("SSL Commerz IPN received:", req.body);

  const order = await Order.findOne({ sslcommerzTransactionId: tran_id });

  if (!order) {
    return res.status(404).send("Order not found");
  }

  try {
    // Validate with SSL Commerz
    const is_live = process.env.NODE_ENV === "production";
    const sslcz = new SSLCommerzPayment(
      process.env.SSLCOMMERZ_STORE_ID,
      process.env.SSLCOMMERZ_STORE_PASSWORD,
      is_live
    );

    const validation = await sslcz.validate({ val_id });

    if (validation?.status === "VALID" || validation?.status === "VALIDATED") {
      // Only update if not already paid (to avoid duplicate processing)
      if (order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.sslcommerzData = {
          ...order.sslcommerzData,
          ipnResponse: req.body,
          validationData: validation,
          cardType: card_type,
          cardNo: card_no?.slice(-4),
          cardIssuer: card_issuer,
          cardBrand: card_brand,
          bankTranId: bank_tran_id,
        };

        await order.save();

        // Send confirmation email
        const orderUrl = `${req.protocol}://bookwormm.netlify.app/orders/${order._id}`;
        const email = new Email(
          { email: order.email, name: order.name },
          orderUrl
        );
        await email.sendInvoice(order);
      }
    }

    res.status(200).send("IPN processed successfully");
  } catch (error) {
    console.error("SSL Commerz IPN validation error:", error);
    res.status(500).send("IPN processing failed");
  }
});

// NEW: Manual SSL Commerz Transaction Validation
exports.validateSSLCommerzTransaction = catchAsync(async (req, res, next) => {
  const { orderId, val_id } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  try {
    const is_live = process.env.NODE_ENV === "production";
    const sslcz = new SSLCommerzPayment(
      process.env.SSLCOMMERZ_STORE_ID,
      process.env.SSLCOMMERZ_STORE_PASSWORD,
      is_live
    );

    const validation = await sslcz.validate({ val_id });

    res.status(200).json({
      status: "success",
      data: {
        validation,
        order,
      },
    });
  } catch (error) {
    console.error("SSL Commerz validation error:", error);
    return next(new AppError("Transaction validation failed", 500));
  }
});

// Get user's orders
exports.getUserOrdersController = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.user?.id;

  if (!userId) {
    return next(new AppError("User ID is required", 400));
  }

  // Build query conditions
  const query = { user: userId };

  if (req.query.status) {
    query.orderStatus = req.query.status;
  }

  if (req.query.paymentStatus) {
    query.paymentStatus = req.query.paymentStatus;
  }

  // Execute query with simplified population
  const orders = await Order.find(query)
    .populate(
      "products.product",
      "title isbn price salePrice author photos slug"
    )
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

exports.getAllOrdersController = getAll(Order, {
  path: "user products.product",
  select: "-__v",
});

exports.getOrderController = getOne(Order, {
  path: "user products.product",
  select: "-__v",
});

exports.updateOrderWithStockController = catchAsync(async (req, res, next) => {
  const { products: newProducts } = req.body;
  const session = await mongoose.startSession();
  let order;

  try {
    await session.withTransaction(async () => {
      const currentOrder = await Order.findById(req.params.id)
        .populate("products.product")
        .session(session);

      if (!currentOrder) {
        throw new AppError("No order found with that ID!", 404);
      }

      // If products are being updated, handle stock changes
      if (newProducts && Array.isArray(newProducts)) {
        // STEP 1: Validate all new products first (before any stock changes)
        for (const item of newProducts) {
          if (!item.product || !item.quantity || item.quantity <= 0) {
            throw new AppError(
              "Each product item must have valid product ID and positive quantity",
              400
            );
          }

          const product = await Product.findById(item.product).session(session);
          if (!product) {
            throw new AppError(
              `Product with ID ${item.product} not found`,
              404
            );
          }

          if (!product.isActive) {
            throw new AppError(`Product "${product.title}" is not active`, 400);
          }
        }

        // STEP 2: Calculate net stock changes needed
        const currentProductMap = new Map();
        currentOrder.products.forEach((item) => {
          const productId = item.product._id.toString();
          currentProductMap.set(
            productId,
            (currentProductMap.get(productId) || 0) + item.quantity
          );
        });

        const newProductMap = new Map();
        newProducts.forEach((item) => {
          const productId = item.product.toString();
          newProductMap.set(
            productId,
            (newProductMap.get(productId) || 0) + item.quantity
          );
        });

        // STEP 3: Check stock availability for net increases
        const stockChecks = [];
        for (const [productId, newQuantity] of newProductMap) {
          const currentQuantity = currentProductMap.get(productId) || 0;
          const netChange = newQuantity - currentQuantity;

          if (netChange > 0) {
            // Only check if we need more stock
            stockChecks.push({ productId, netIncrease: netChange });
          }
        }

        // Validate stock availability for net increases
        for (const { productId, netIncrease } of stockChecks) {
          const product = await Product.findById(productId).session(session);
          if (product.stock < netIncrease) {
            throw new AppError(
              `Insufficient stock for "${product.title}". Available: ${product.stock}, Additional needed: ${netIncrease}`,
              400
            );
          }
        }

        // STEP 4: Apply all stock changes atomically

        // First, restore stock for all current products
        await Promise.all(
          currentOrder.products.map(async (productItem) => {
            await Product.findByIdAndUpdate(
              productItem.product._id,
              {
                $inc: {
                  stock: productItem.quantity,
                  saleNumber: -productItem.quantity,
                },
              },
              { new: true, session }
            );
          })
        );

        // Then, reduce stock for all new products
        await Promise.all(
          newProducts.map(async (productItem) => {
            await Product.findByIdAndUpdate(
              productItem.product,
              {
                $inc: {
                  saleNumber: productItem.quantity,
                  stock: -productItem.quantity,
                },
              },
              { new: true, session }
            );
          })
        );

        // STEP 5: Enrich the new products with full details
        const { enrichedProducts } = await enrichProductsData(newProducts);
        req.body.products = enrichedProducts;
      }

      // Update the order
      order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        session,
      });

      if (!order) {
        throw new AppError("Failed to update order!", 500);
      }
    });
  } catch (error) {
    // No need to manually abort - mongoose handles this automatically
    return next(error);
  } finally {
    await session.endSession();
  }

  // Re-fetch with populated data
  order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate(
      "products.product",
      "title isbn price salePrice discountType discountValue author photos slug"
    )
    .select("-__v");

  const orderUrl = `${req.protocol}://bookwormm.netlify.app/orders/${order._id}`;
  const email = new Email({ email: order.email, name: order.name }, orderUrl);

  const { orderStatus } = req.body;
  if (["confirmed", "delivered", "shipped", "canceled"].includes(orderStatus)) {
    await email.sendInvoice(order);
  }

  res.status(200).json({
    status: "success",
    message: "Order has been updated successfully with stock management",
    data: {
      order,
    },
  });
});

// ALTERNATIVE: Simpler approach for quantity-only updates
exports.updateProductQuantityController = catchAsync(async (req, res, next) => {
  const { productId, newQuantity } = req.body;

  if (!productId || !newQuantity || newQuantity <= 0) {
    return next(
      new AppError("Product ID and positive quantity are required", 400)
    );
  }

  const session = await mongoose.startSession();
  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id)
        .populate("products.product")
        .session(session);

      if (!order) {
        throw new AppError("No order found with that ID!", 404);
      }

      // Find the product in the current order
      const productIndex = order.products.findIndex(
        (item) => item.product._id.toString() === productId
      );

      if (productIndex === -1) {
        throw new AppError("Product not found in this order", 404);
      }

      const currentQuantity = order.products[productIndex].quantity;
      const quantityDifference = newQuantity - currentQuantity;

      if (quantityDifference !== 0) {
        // Check stock availability if increasing quantity
        if (quantityDifference > 0) {
          const product = await Product.findById(productId).session(session);
          if (product.stock < quantityDifference) {
            throw new AppError(
              `Insufficient stock for "${product.title}". Available: ${product.stock}, Additional needed: ${quantityDifference}`,
              400
            );
          }
        }

        // Update product stock and sale numbers
        await Product.findByIdAndUpdate(
          productId,
          {
            $inc: {
              stock: -quantityDifference, // Negative of difference
              saleNumber: quantityDifference,
            },
          },
          { new: true, session }
        );

        // Update the order product quantity
        order.products[productIndex].quantity = newQuantity;

        // Mark the order as modified to trigger pre-save middleware for total calculation
        order.markModified("products");
        updatedOrder = await order.save({ session });
      } else {
        updatedOrder = order;
      }
    });
  } catch (error) {
    // No need to manually abort - mongoose handles this automatically
    return next(error);
  } finally {
    await session.endSession();
  }

  // Re-fetch updated order
  updatedOrder = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("products.product", "title isbn price salePrice stock");

  res.status(200).json({
    status: "success",
    message: "Product quantity updated successfully",
    data: {
      order: updatedOrder,
    },
  });
});

// Simple order update without stock changes (for status updates only)
exports.updateOrderStatusController = catchAsync(async (req, res, next) => {
  // this helper endpoint is intentionally *narrow* – it's meant for rapid
  // status/payment updates from the dashboard and from webhooks.  anything
  // outside of the list below is silently ignored.  if you need to change
  // customer details, order totals, address, etc. you must use the
  // `/order/:id/with-stock` route (or expand the array here accordingly).
  const allowedUpdates = [
    "orderStatus",
    "paymentStatus",
    "notes",
    "adminNotes",
    "trackingNumber",
    "deliveryDate",
    // added below so frontend updates won't be silently dropped
    "name",
    "phone",
    "email",
    "streetAddress",
    "deliveryType",
    "shippingCost",
    "paymentMethod",
    "coupon",
    "subtotal",
    "couponDiscount",
    "totalCost",
    // city/zone/area are stored as sub-documents; the dashboard currently only
    // exposes the "Name" fields and those are disabled, so they're not
    // propagated here.  to modify them properly you'd need to send the whole
    // object (e.g. { city: { cityID, cityName } }).
    // "city",
    // "zone",
    // "area",
  ];
  const updateData = {};

  // Only allow specific field updates
  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("user", "name email phone")
    .populate(
      "products.product",
      "title isbn price salePrice discountType discountValue author photos slug"
    )
    .select("-__v");

  if (!order) return next(new AppError("No order found with that ID!", 404));

  const orderUrl = `${req.protocol}://bookwormm.netlify.app/orders/${order._id}`;
  const email = new Email({ email: order.email, name: order.name }, orderUrl);

  const { orderStatus } = req.body;
  if (["confirmed", "delivered", "shipped", "canceled"].includes(orderStatus)) {
    await email.sendInvoice(order);
  }

  res.status(200).json({
    status: "success",
    message: "Order status has been updated successfully",
    data: {
      order,
    },
  });
});

exports.deleteOrderController = deleteOne(Order);

// Cancel order and restore stock
exports.cancelOrderController = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id)
        .populate("products.product")
        .populate("user", "name email")
        .session(session);

      if (!order) {
        throw new AppError("No order found with that ID!", 404);
      }

      if (!order.canBeCanceled()) {
        throw new AppError("This order cannot be canceled", 400);
      }

      // Handle refund for paid orders
      if (order.paymentStatus === "paid") {
        if (order.paymentMethod === "bkash") {
          order.paymentStatus = "refunded";
          // Here you would integrate with bKash refund API
        } else if (order.paymentMethod === "sslcommerz") {
          order.paymentStatus = "refunded";
          // Here you would integrate with SSL Commerz refund API
        }
      }

      // Validate that order has products before restoring stock
      if (order.products && Array.isArray(order.products)) {
        // Restore stock for each product atomically
        await Promise.all(
          order.products.map(async (productItem) => {
            await Product.findByIdAndUpdate(
              productItem.product._id,
              {
                $inc: {
                  stock: productItem.quantity,
                  saleNumber: -productItem.quantity,
                },
              },
              { new: true, session }
            );
          })
        );
      }

      // Update order status
      order.orderStatus = "canceled";
      updatedOrder = await order.save({ session });
    });
  } catch (error) {
    // No need to manually abort - mongoose handles this automatically
    return next(error);
  } finally {
    await session.endSession();
  }

  // Re-fetch updated order for response - SIMPLIFIED POPULATION
  updatedOrder = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("products.product", "title isbn price salePrice stock");

  // Send cancellation email
  const orderUrl = `${req.protocol}://bookwormm.netlify.app/orders/${updatedOrder._id}`;
  const email = new Email(
    { email: updatedOrder.email, name: updatedOrder.name },
    orderUrl
  );
  await email.sendInvoice(updatedOrder);

  res.status(200).json({
    status: "success",
    message: "Order has been canceled successfully and stock has been restored",
    data: {
      order: updatedOrder,
    },
  });
});

// Get order statistics
