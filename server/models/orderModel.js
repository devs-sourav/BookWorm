const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    // User reference to track who placed the order (optional for guest checkout)
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    
    // Customer information (can be different from user account info)
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    
    // Delivery address
    city: {
      cityID: {
        type: Number,
        required: [true, "City ID is required"],
      },
      cityName: {
        type: String,
        required: [true, "City name is required"],
        trim: true,
      },
    },
    zone: {
      zoneID: {
        type: Number,
        required: [true, "Zone ID is required"],
      },
      zoneName: {
        type: String,
        required: [true, "Zone name is required"],
        trim: true,
      },
    },
    area: {
      areaID: {
        type: Number,
        required: [true, "Area ID is required"],
      },
      areaName: {
        type: String,
        required: [true, "Area name is required"],
        trim: true,
      },
    },
    streetAddress: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
    },
    
    // Delivery and shipping
    deliveryType: {
      type: String,
      enum: {
        values: ["normal", "on_demand"], // normal --> 48 Hours, on_demand --> 12 Hours
        message: "{VALUE} is not supported, Enter a valid delivery type",
      },
      default: "normal",
    },
    shippingCost: {
      type: Number,
      required: [true, "Shipping cost is required"],
      min: [0, "Shipping cost cannot be negative"],
    },
    
    // Coupon and discount
    coupon: {
      type: String,
      default: null,
      trim: true,
    },
    couponDiscount: {
      type: Number,
      default: 0,
      min: [0, "Coupon discount cannot be negative"],
    },
    couponDiscountType: {
      type: String,
      enum: {
        values: ["percentage", "amount"],
        message: "{VALUE} is not supported",
      },
      default: null,
    },
    
    // Order totals
    subtotal: {
      type: Number,
      default: 0,
      min: [0, "Subtotal cannot be negative"],
    },
    totalCost: {
      type: Number,
      default: 0,
      min: [0, "Total cost cannot be negative"],
    },
    
    // Order status
    orderStatus: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "processing", "shipped", "delivered", "canceled", "returned"],
        message: "{VALUE} is not supported, Enter a valid order status",
      },
      default: "pending",
    },
    
    // Payment information
    paymentMethod: {
      type: String,
      enum: {
        values: ["cash_on_delivery", "bkash", "credit_card", "bank_transfer", "sslcommerz"],
        message: "{VALUE} is not supported",
      },
      default: "cash_on_delivery",
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed", "refunded", "partial", "processing"],
        message: "{VALUE} is not supported",
      },
      default: "pending",
    },
    
    // Payment gateway transaction IDs
    bkashTransactionId: {
      type: String,
      default: null,
      trim: true,
    },
    sslcommerzTransactionId: {
      type: String,
      default: null,
      trim: true,
    },
    
    // SSL Commerz specific fields
    sslcommerzData: {
      sessionkey: {
        type: String,
        default: null,
      },
      GatewayPageURL: {
        type: String,
        default: null,
      },
      storeBanner: {
        type: String,
        default: null,
      },
      storeLogo: {
        type: String,
        default: null,
      },
      redirectGatewayURL: {
        type: String,
        default: null,
      },
      directPaymentURLBank: {
        type: String,
        default: null,
      },
      directPaymentURLCard: {
        type: String,
        default: null,
      },
      directPaymentURL: {
        type: String,
        default: null,
      },
      redirectGatewayURLFailed: {
        type: String,
        default: null,
      },
      GatewayPageURLFailed: {
        type: String,
        default: null,
      },
      // SSL Commerz validation response
      validationResponse: {
        type: Schema.Types.Mixed,
        default: null,
      },
      // Store the bank/card used for payment
      cardType: {
        type: String,
        default: null,
      },
      cardNo: {
        type: String,
        default: null,
      },
      bankName: {
        type: String,
        default: null,
      },
      cardIssuer: {
        type: String,
        default: null,
      },
      cardBrand: {
        type: String,
        default: null,
      },
      cardIssuerCountry: {
        type: String,
        default: null,
      },
      cardIssuerCountryCode: {
        type: String,
        default: null,
      },
    },
    
    // Order notes
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    adminNotes: {
      type: String,
      default: "",
      trim: true,
    },
    
    // Products ordered - only require product ID and quantity from client
    products: [
      {
        // Required from client
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        
        // Auto-populated by controller (not required in schema validation)
        price: {
          type: Number,
          min: [0, "Product price cannot be negative"],
        },
        salePrice: {
          type: Number,
          min: [0, "Product sale price cannot be negative"],
        },
        title: {
          type: String,
          trim: true,
        },
        isbn: {
          type: String,
          trim: true,
        },
        author: {
          type: String,
          trim: true,
        },
        format: {
          type: String,
          trim: true,
        },
      },
    ],
    
    // Tracking information
    trackingNumber: {
      type: String,
      default: null,
      trim: true,
    },
    
    // Delivery information
    deliveryDate: {
      type: Date,
      default: null,
    },
    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },
    
    // Order number for customer reference
    orderNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique order number before saving
orderSchema.pre("save", async function (next) {
  try {
    if (this.isNew && !this.orderNumber) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      
      // Get the start and end of current month for more accurate counting
      const monthStart = new Date(currentYear, currentDate.getMonth(), 1);
      const monthEnd = new Date(currentYear, currentDate.getMonth() + 1, 1);
      
      // Get the count of orders for this month
      const orderCount = await this.constructor.countDocuments({
        createdAt: {
          $gte: monthStart,
          $lt: monthEnd
        }
      });
      
      // Generate order number: YYMM + 4-digit counter
      const yearSuffix = currentYear.toString().slice(-2);
      const orderSequence = String(orderCount + 1).padStart(4, '0');
      const orderNumber = `${yearSuffix}${currentMonth}${orderSequence}`;
      
      this.orderNumber = orderNumber;
      
      console.log(`Generated order number: ${orderNumber}`);
    }
    
    // Calculate subtotal from products (only if products have salePrice populated)
    if (this.products && this.products.length > 0) {
      this.subtotal = this.products.reduce((total, item) => {
        // Only add to total if salePrice is available (auto-populated)
        if (item.salePrice !== undefined) {
          return total + (item.salePrice * item.quantity);
        }
        return total;
      }, 0);
      
      // Calculate total cost (subtotal + shipping - coupon discount)
      let discount = 0;
      if (this.couponDiscount > 0) {
        if (this.couponDiscountType === "percentage") {
          discount = (this.subtotal * this.couponDiscount) / 100;
        } else if (this.couponDiscountType === "amount") {
          discount = this.couponDiscount;
        }
      }
      
      this.totalCost = this.subtotal + this.shippingCost - discount;
      
      // Ensure total cost is not negative
      if (this.totalCost < 0) {
        this.totalCost = 0;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate estimated delivery date based on delivery type
orderSchema.pre("save", function (next) {
  if (this.isNew && !this.estimatedDeliveryDate) {
    const now = new Date();
    if (this.deliveryType === "on_demand") {
      // 12 hours for on-demand delivery
      this.estimatedDeliveryDate = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    } else {
      // 48 hours for normal delivery
      this.estimatedDeliveryDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    }
  }
  next();
});

// Validate products array is not empty
orderSchema.pre("validate", function (next) {
  if (!this.products || this.products.length === 0) {
    this.invalidate("products", "At least one product is required");
  }
  next();
});

// Add method to check if order can be canceled
orderSchema.methods.canBeCanceled = function() {
  return ['pending', 'confirmed'].includes(this.orderStatus) && 
         this.paymentStatus !== 'paid';
};

// Add method to calculate order summary
orderSchema.methods.getOrderSummary = function() {
  return {
    orderNumber: this.orderNumber,
    formattedOrderNumber: this.formattedOrderNumber,
    totalItems: this.products.reduce((total, item) => total + item.quantity, 0),
    subtotal: this.subtotal,
    shippingCost: this.shippingCost,
    discount: this.couponDiscount,
    totalCost: this.totalCost,
    status: this.orderStatus,
    paymentStatus: this.paymentStatus,
    estimatedDelivery: this.estimatedDeliveryDate
  };
};

// Add method to update order status with validation
orderSchema.methods.updateStatus = function(newStatus) {
  const validTransitions = {
    'pending': ['confirmed', 'canceled'],
    'confirmed': ['processing', 'canceled'],
    'processing': ['shipped', 'canceled'],
    'shipped': ['delivered', 'returned'],
    'delivered': ['returned'],
    'canceled': [],
    'returned': []
  };
  
  if (validTransitions[this.orderStatus].includes(newStatus)) {
    this.orderStatus = newStatus;
    return true;
  }
  return false;
};

// Static method to find orders by user with optional filters
orderSchema.statics.findByUser = async function(userId, filters = {}) {
  const query = { user: userId };
  
  if (filters.status) {
    query.orderStatus = filters.status;
  }
  
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }
  
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      query.createdAt.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      query.createdAt.$lte = new Date(filters.dateTo);
    }
  }
  
  return this.find(query)
    .populate({
      path: "products.product",
      select: "title isbn price salePrice author photos slug",
      populate: [
        {
          path: "author",
          select: "name title slug",
        },
        {
          path: "category",
          select: "name title slug",
        },
        {
          path: "subCategory",
          select: "name title slug",
        },
        {
          path: "brand",
          select: "name title slug",
        }
      ]
    })
    .sort({ createdAt: -1 });
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function(filters = {}) {
  const matchStage = {};
  
  if (filters.dateFrom || filters.dateTo) {
    matchStage.createdAt = {};
    if (filters.dateFrom) {
      matchStage.createdAt.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      matchStage.createdAt.$lte = new Date(filters.dateTo);
    }
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalCost" },
        averageOrderValue: { $avg: "$totalCost" },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] }
        },
        confirmedOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "confirmed"] }, 1, 0] }
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] }
        },
        canceledOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "canceled"] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    canceledOrders: 0
  };
};

// Static method to search orders
orderSchema.statics.searchOrders = async function(searchTerm, filters = {}) {
  const query = {
    $or: [
      { orderNumber: { $regex: searchTerm, $options: 'i' } },
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { phone: { $regex: searchTerm, $options: 'i' } }
    ]
  };
  
  if (filters.status) {
    query.orderStatus = filters.status;
  }
  
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }
  
  return this.find(query)
    .populate({
      path: "products.product",
      select: "title isbn price salePrice author photos slug"
    })
    .populate({
      path: "user",
      select: "name email phone"
    })
    .sort({ createdAt: -1 });
};

// Add indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ phone: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentMethod: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "products.product": 1 });
orderSchema.index({ name: "text", email: "text", phone: "text" });

// Virtual for formatted order number
orderSchema.virtual('formattedOrderNumber').get(function() {
  return `ORD-${this.orderNumber}`;
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const orderDate = this.createdAt;
  const diffTime = Math.abs(now - orderDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function() {
  if (this.orderStatus === 'delivered') {
    return 'Delivered';
  } else if (this.orderStatus === 'shipped') {
    return 'In Transit';
  } else if (this.orderStatus === 'processing') {
    return 'Processing';
  } else if (this.orderStatus === 'confirmed') {
    return 'Confirmed';
  } else if (this.orderStatus === 'pending') {
    return 'Pending';
  } else if (this.orderStatus === 'canceled') {
    return 'Canceled';
  } else if (this.orderStatus === 'returned') {
    return 'Returned';
  }
  return 'Unknown';
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = model("Order", orderSchema);
module.exports = Order;