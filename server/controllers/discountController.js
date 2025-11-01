const Product = require("../models/productModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

exports.applyDiscountController = catchAsync(async (req, res, next) => {
  let { type, id, discountType, discountValue } = req.body;
  
  // Validate discount type and value
  if (
    !["percent", "amount", "none"].includes(discountType) ||
    discountValue == null ||
    isNaN(discountValue) ||
    discountValue < 0
  ) {
    return next(new AppError("Invalid discount type or value", 400));
  }

  if (!id) {
    return next(new AppError("ID is required to implement discount", 400));
  }

  // Updated valid types (removed variant and option)
  if (
    ![
      "category",
      "subCategory", 
      "brand",
      "product",
      "author",
    ].includes(type)
  ) {
    return next(
      new AppError(
        "Invalid type, must be category, subCategory, brand, product, or author",
        400
      )
    );
  }

  // Validate ObjectId format for non-product types
  if (type !== "product" && !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid ID format", 400));
  }

  // Determine the filter based on the type
  let filter;
  if (type === "category") {
    filter = { category: new mongoose.Types.ObjectId(id) };
  } else if (type === "subCategory") {
    filter = { subCategory: new mongoose.Types.ObjectId(id) };
  } else if (type === "brand") {
    filter = { brand: new mongoose.Types.ObjectId(id) };
  } else if (type === "product") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid product ID format", 400));
    }
    filter = { _id: new mongoose.Types.ObjectId(id) };
  } else if (type === "author") {
    filter = { author: new mongoose.Types.ObjectId(id) };
  }

  console.log("Filter being used:", filter); // Debug log

  // Find all the products matching with the filter
  const products = await Product.find(filter);

  console.log("Products found:", products.length); // Debug log

  if (products.length === 0) {
    return next(new AppError("No products found matching the criteria", 404));
  }

  // Check each product to ensure the discount is valid
  for (const product of products) {
    const effectivePrice =
      product.price -
      (discountType === "percent"
        ? (product.price * discountValue) / 100
        : discountValue);
    
    if (effectivePrice <= 0) {
      return next(
        new AppError(
          `Discounted price for "${product.title}" cannot be equal to or less than zero`,
          400
        )
      );
    }
  }

  // Calculate the new discount value and update salePrice
  const updateResults = [];
  for (const product of products) {
    let salePrice;
    
    if (discountValue === 0 || discountType === "none") {
      salePrice = product.price; // Reset to original price when no discount
    } else {
      if (discountType === "percent") {
        salePrice = product.price - (product.price * discountValue) / 100;
      } else if (discountType === "amount") {
        salePrice = product.price - discountValue;
      }
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: product._id },
      {
        salePrice,
        discountType: discountValue == 0 ? "none" : discountType,
        discountValue,
      },
      {
        new: true,
        select: "title price salePrice discountType discountValue",
      }
    );

    updateResults.push(updatedProduct);
  }

  res.status(200).json({
    status: "success",
    message: `Discount applied successfully to ${products.length} book(s)`,
    affectedBooks: products.length,
    data: {
      updatedProducts: updateResults,
    },
  });
});

// Remove discount from products
exports.removeDiscountController = catchAsync(async (req, res, next) => {
  let { type, id } = req.body;

  if (!id) {
    return next(new AppError("ID is required to remove discount", 400));
  }

  if (
    ![
      "category",
      "subCategory",
      "brand", 
      "product",
      "author",
    ].includes(type)
  ) {
    return next(
      new AppError(
        "Invalid type, must be category, subCategory, brand, product, or author",
        400
      )
    );
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid ID format", 400));
  }

  // Determine the filter based on the type
  let filter;
  if (type === "category") {
    filter = { category: new mongoose.Types.ObjectId(id) };
  } else if (type === "subCategory") {
    filter = { subCategory: new mongoose.Types.ObjectId(id) };
  } else if (type === "brand") {
    filter = { brand: new mongoose.Types.ObjectId(id) };
  } else if (type === "product") {
    filter = { _id: new mongoose.Types.ObjectId(id) };
  } else if (type === "author") {
    filter = { author: new mongoose.Types.ObjectId(id) };
  }

  // Update products to remove discount
  const result = await Product.updateMany(
    filter,
    {
      $set: {
        discountType: "none",
        discountValue: 0,
      },
    }
  );

  // Update salePrice to match original price
  await Product.updateMany(
    filter,
    [
      {
        $set: {
          salePrice: "$price"
        }
      }
    ]
  );

  res.status(200).json({
    status: "success",
    message: `Discount removed successfully from ${result.modifiedCount} book(s)`,
    modifiedCount: result.modifiedCount,
  });
});

// Get products with active discounts
exports.getDiscountedProductsController = catchAsync(async (req, res, next) => {
  const { type, id } = req.query;

  let filter = { discountType: { $ne: "none" } };

  // Add additional filter if type and id are provided
  if (type && id) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid ID format", 400));
    }

    if (type === "category") {
      filter.category = new mongoose.Types.ObjectId(id);
    } else if (type === "subCategory") {
      filter.subCategory = new mongoose.Types.ObjectId(id);
    } else if (type === "brand") {
      filter.brand = new mongoose.Types.ObjectId(id);
    } else if (type === "author") {
      filter.author = new mongoose.Types.ObjectId(id);
    }
  }

  const discountedProducts = await Product.find(filter)
    .populate([
      {
        path: "author",
        select: "name photo",
      },
      {
        path: "category",
        select: "title slug",
      },
      {
        path: "subCategory", 
        select: "title slug",
      },
      {
        path: "brand",
        select: "title slug",
      },
    ])
    .select("title price salePrice discountType discountValue photos slug")
    .sort({ discountValue: -1 });

  res.status(200).json({
    status: "success",
    results: discountedProducts.length,
    data: {
      discountedProducts,
    },
  });
});

// Apply bulk discount to multiple products
exports.applyBulkDiscountController = catchAsync(async (req, res, next) => {
  const { productIds, discountType, discountValue } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new AppError("Product IDs array is required", 400));
  }

  if (
    !["percent", "amount", "none"].includes(discountType) ||
    discountValue == null ||
    isNaN(discountValue) ||
    discountValue < 0
  ) {
    return next(new AppError("Invalid discount type or value", 400));
  }

  // Validate all product IDs
  const validObjectIds = productIds.map(id => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(`Invalid product ID format: ${id}`, 400);
    }
    return new mongoose.Types.ObjectId(id);
  });

  // Find all products with the given IDs
  const products = await Product.find({ _id: { $in: validObjectIds } });

  if (products.length === 0) {
    return next(new AppError("No products found with the provided IDs", 404));
  }

  // Validate discount for each product
  for (const product of products) {
    const effectivePrice =
      product.price -
      (discountType === "percent"
        ? (product.price * discountValue) / 100
        : discountValue);
    
    if (effectivePrice <= 0) {
      return next(
        new AppError(
          `Discounted price for "${product.title}" cannot be equal to or less than zero`,
          400
        )
      );
    }
  }

  // Apply discount to all products
  const updateOperations = products.map(product => {
    let salePrice;
    
    if (discountValue === 0 || discountType === "none") {
      salePrice = product.price;
    } else {
      if (discountType === "percent") {
        salePrice = product.price - (product.price * discountValue) / 100;
      } else if (discountType === "amount") {
        salePrice = product.price - discountValue;
      }
    }

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          salePrice,
          discountType: discountValue == 0 ? "none" : discountType,
          discountValue,
        },
      },
    };
  });

  await Product.bulkWrite(updateOperations);

  res.status(200).json({
    status: "success",
    message: `Bulk discount applied successfully to ${products.length} book(s)`,
    affectedBooks: products.length,
  });
});