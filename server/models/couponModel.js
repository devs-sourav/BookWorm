const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const couponSchema = new Schema(
  {
    coupon: {
      type: String,
      required: [true, "Coupon code is required"],
      minLength: [3, "Coupon code must be at least 3 characters"],
      maxLength: [20, "Coupon code cannot exceed 20 characters"],
      unique: true,
      trim: true,
      uppercase: true, // Automatically convert to uppercase
    },
    discountType: {
      type: String,
      enum: {
        values: ['percentage', 'amount'],
        message: 'Discount type must be either percentage or amount'
      },
      required: [true, "Discount type is required"],
    },
    discountPercent: {
      type: Number,
      min: [0, "Discount percentage must be at least 0"],
      max: [100, "Discount percentage cannot exceed 100"],
      validate: {
        validator: function(value) {
          // Only validate if discountType is percentage
          if (this.discountType === 'percentage') {
            return value != null && value >= 0 && value <= 100;
          }
          return true;
        },
        message: 'Discount percentage is required when discount type is percentage'
      }
    },
    discountAmount: {
      type: Number,
      min: [0, "Discount amount must be at least 0"],
      validate: {
        validator: function(value) {
          // Only validate if discountType is amount
          if (this.discountType === 'amount') {
            return value != null && value >= 0;
          }
          return true;
        },
        message: 'Discount amount is required when discount type is amount'
      }
    },
    validFrom: {
      type: Date,
      required: [true, "Start date is required"],
    },
    validUntil: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value >= this.validFrom;
        },
        message: "valid Until date must be after or equal to validFrom date",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to ensure only one discount value is set
couponSchema.pre('save', function(next) {
  if (this.discountType === 'percentage') {
    this.discountAmount = undefined;
    if (!this.discountPercent && this.discountPercent !== 0) {
      return next(new Error('Discount percentage is required when discount type is percentage'));
    }
  } else if (this.discountType === 'amount') {
    this.discountPercent = undefined;
    if (!this.discountAmount && this.discountAmount !== 0) {
      return next(new Error('Discount amount is required when discount type is amount'));
    }
  }
  next();
});

// Pre-update middleware
couponSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  const update = this.getUpdate();
  
  if (update.discountType === 'percentage') {
    update.discountAmount = undefined;
  } else if (update.discountType === 'amount') {
    update.discountPercent = undefined;
  }
  
  next();
});

const Coupon = model("Coupon", couponSchema);
module.exports = Coupon;