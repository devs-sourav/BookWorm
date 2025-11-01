const Coupon = require("../models/couponModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { getAll } = require("../utils/handleFactory");

// Create coupon with enhanced validation
exports.createCouponCodeController = catchAsync(async (req, res, next) => {
  const { discountType, discountPercent, discountAmount, validFrom, validUntil } = req.body;

  // Validate discount type and corresponding value
  if (!discountType) {
    return next(new AppError("Discount type is required", 400));
  }

  if (discountType === 'percentage') {
    if (discountPercent === undefined || discountPercent === null) {
      return next(new AppError("Discount percentage is required when discount type is percentage", 400));
    }
    if (discountPercent < 0 || discountPercent > 100) {
      return next(new AppError("Discount percentage must be between 0 and 100", 400));
    }
    // Clear discountAmount if provided
    req.body.discountAmount = undefined;
  } else if (discountType === 'amount') {
    if (discountAmount === undefined || discountAmount === null) {
      return next(new AppError("Discount amount is required when discount type is amount", 400));
    }
    if (discountAmount < 0) {
      return next(new AppError("Discount amount must be at least 0", 400));
    }
    // Clear discountPercent if provided
    req.body.discountPercent = undefined;
  } else {
    return next(new AppError("Discount type must be either 'percentage' or 'amount'", 400));
  }

  // Validate dates
  if (new Date(validUntil) <= new Date(validFrom)) {
    return next(new AppError("Valid until date must be after valid from date", 400));
  }

  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Coupon created successfully",
    data: {
      coupon,
    },
  });
});

exports.getAllCouponCodeController = getAll(Coupon);

exports.getCouponCodeController = catchAsync(async (req, res, next) => {
  let coupon = await Coupon.findOne({ coupon: req.params.coupon }).select("-__v");
  
  if (!coupon) {
    return next(new AppError("No coupon was found with that name!", 404));
  }

  // Check if coupon is still valid
  const now = new Date();
  const isExpired = now > coupon.validUntil;
  const isNotYetValid = now < coupon.validFrom;

  res.status(200).json({
    status: "success",
    data: {
      coupon,
      isValid: coupon.isActive && !isExpired && !isNotYetValid,
      isExpired,
      isNotYetValid,
    },
  });
});

exports.updateCouponCodeController = catchAsync(async (req, res, next) => {
  const { discountType, discountPercent, discountAmount, validFrom, validUntil } = req.body;

  // Get existing coupon first to check current state
  const existingCoupon = await Coupon.findOne({ coupon: req.params.coupon });
  if (!existingCoupon) {
    return next(new AppError("No coupon was found with that name!", 404));
  }

  // Auto-detect discount type based on which field is being updated
  let finalDiscountType = discountType || existingCoupon.discountType;

  // If updating discountPercent, automatically set type to percentage
  if (discountPercent !== undefined) {
    finalDiscountType = 'percentage';
    req.body.discountType = 'percentage';
  }
  
  // If updating discountAmount, automatically set type to amount
  if (discountAmount !== undefined) {
    finalDiscountType = 'amount';
    req.body.discountType = 'amount';
  }

  // Validate and handle discount type logic
  if (finalDiscountType === 'percentage') {
    if (discountPercent !== undefined) {
      if (discountPercent < 0 || discountPercent > 100) {
        return next(new AppError("Discount percentage must be between 0 and 100", 400));
      }
    }
    // Always unset discountAmount when dealing with percentage
    req.body.$unset = { discountAmount: 1 };
    
  } else if (finalDiscountType === 'amount') {
    if (discountAmount !== undefined) {
      if (discountAmount < 0) {
        return next(new AppError("Discount amount must be at least 0", 400));
      }
    }
    // Always unset discountPercent when dealing with amount
    req.body.$unset = { discountPercent: 1 };
    
  } else {
    return next(new AppError("Discount type must be either 'percentage' or 'amount'", 400));
  }

  // Validate dates if both are provided
  if (validFrom && validUntil) {
    if (new Date(validUntil) <= new Date(validFrom)) {
      return next(new AppError("Valid until date must be after valid from date", 400));
    }
  }

  const coupon = await Coupon.findOneAndUpdate(
    { coupon: req.params.coupon },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).select("-__v");

  res.status(200).json({
    status: "success",
    message: "Coupon has been updated successfully",
    data: {
      coupon,
    },
  });
});

exports.deleteCouponCodeController = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findOneAndDelete({ coupon: req.params.coupon });
  
  if (!coupon) {
    return next(new AppError("No coupon was found with that name!", 404));
  }

  res.status(200).json({
    status: "success",
    message: `Coupon '${req.params.coupon}' has been deleted successfully`,
    data: null,
  });
});

// Additional utility function to validate coupon usage
exports.validateCouponForUse = catchAsync(async (req, res, next) => {
  const { coupon: couponCode } = req.params;
  
  const coupon = await Coupon.findOne({ coupon: couponCode });
  
  if (!coupon) {
    return next(new AppError("Invalid coupon code", 404));
  }

  const now = new Date();
  
  if (!coupon.isActive) {
    return next(new AppError("This coupon is no longer active", 400));
  }
  
  if (now < coupon.validFrom) {
    return next(new AppError("This coupon is not yet valid", 400));
  }
  
  if (now > coupon.validUntil) {
    return next(new AppError("This coupon has expired", 400));
  }

  res.status(200).json({
    status: "success",
    message: "Coupon is valid",
    data: {
      coupon,
      discount: {
        type: coupon.discountType,
        value: coupon.discountType === 'percentage' ? coupon.discountPercent : coupon.discountAmount,
      },
    },
  });
});