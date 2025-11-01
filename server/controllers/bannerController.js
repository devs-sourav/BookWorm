const fs = require("fs").promises;
const path = require("path");
const Banner = require("../models/bannerModel");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const deleteFile = require("../utils/deleteFile");
const { getOne, getAll } = require("../utils/handleFactory");

exports.createBannerController = catchAsync(async (req, res, next) => {
  const body = req.body;

  if (req.file) {
    body.photo = `${req.protocol}://${req.get("host")}/uploads/banner/${
      req.file.filename
    }`;
  } else {
    return next(new AppError("Banner photo is required", 400));
  }

  try {
    const banner = await Banner.create(body);

    res.status(201).json({
      status: "success",
      message: "Banner has been created successfully",
      data: {
        banner,
      },
    });
  } catch (error) {
    // Delete uploaded file if banner creation fails
    if (req.file) {
      const filePath = `uploads/banner/${req.file.filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Failed to delete file after banner creation error:", err);
        }
      });
    }

    if (error.errors) {
      const messages = Object.values(error.errors)
        .map((item) => item.properties.message)
        .join(", ");
      return next(new AppError(`Validation failed, ${messages}.`, 400));
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern).join(" ");
      const capitalizeField =
        field.charAt(0).toUpperCase() + field.slice(1).toLowerCase();

      const message = `${capitalizeField} already exists, Please use another ${field}.`;
      return next(new AppError(message, 409));
    }

    return next(
      new AppError("Something went unexpected while creating the banner", 400)
    );
  }
});

exports.updateBannerController = catchAsync(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    return next(new AppError("No banner was found with that ID!", 404));
  }

  const body = req.body;

  let oldPhotoLink = null;
  if (banner.photo) {
    const photoName = banner.photo.split("/");
    oldPhotoLink = `uploads/banner/${photoName[photoName.length - 1]}`;
  }

  if (req.file) {
    body.photo = `${req.protocol}://${req.get("host")}/uploads/banner/${
      req.file.filename
    }`;
  } else {
    delete body.photo;
  }

  try {
    Object.keys(body).forEach((key) => {
      banner[key] = body[key];
    });

    await banner.save();

    // Delete old photo if a new one was uploaded and an old photo exists
    if (req.file && oldPhotoLink) {
      fs.unlink(oldPhotoLink, (err) => {
        if (err) {
          console.error("Failed to delete old photo:", err);
        }
      });
    }

    res.status(200).json({
      status: "success",
      message: "Banner has been updated successfully",
      data: {
        banner,
      },
    });
  } catch (error) {
    // Delete new uploaded file if update fails
    if (req.file) {
      const filePath = `uploads/banner/${req.file.filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Failed to delete file after banner update error:", err);
        }
      });
    }

    if (error.errors) {
      const messages = Object.values(error.errors)
        .map((item) => item.properties.message)
        .join(", ");
      return next(new AppError(`Validation failed, ${messages}.`, 400));
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern).join(" ");
      const capitalizeField =
        field.charAt(0).toUpperCase() + field.slice(1).toLowerCase();

      const message = `${capitalizeField} already exists, Please use another ${field}.`;
      return next(new AppError(message, 409));
    }

    return next(
      new AppError("Something went unexpected while updating the banner", 400)
    );
  }
});

exports.getBannerController = getOne(Banner);

exports.getAllBannerController = getAll(Banner);

exports.deleteBannerController = catchAsync(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    return next(new AppError("No banner was found with that ID!", 404));
  }

  // Delete banner photo if it exists
  if (banner.photo) {
    const photoName = banner.photo.split("/").pop();
    const photoPath = path.join(__dirname, "..", "uploads", "banner", photoName);

    try {
      await fs.access(photoPath); // Check if the file exists
      await deleteFile(photoPath);
    } catch (err) {
      console.error(`Failed to delete file: ${err.message}`);
      // Continue with the banner deletion even if the file deletion fails
    }
  }

  // Delete the banner itself
  await Banner.findByIdAndDelete(banner._id);

  res.status(204).json({
    status: "success",
    message: "Banner has been deleted successfully",
    data: null,
  });
});

// Get banners by type
exports.getBannersByType = catchAsync(async (req, res, next) => {
  const { bannerType } = req.params;
  
  const validTypes = ["Main Banner", "Deals of the Week", "New Release", "top banner", "bottom banner"];
  
  if (!validTypes.includes(bannerType)) {
    return next(new AppError("Invalid banner type", 400));
  }

  const query = Banner.find({ bannerType }).select("-__v");

  // Apply API features for filtering, sorting, pagination
  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const banners = await features.query;

  res.status(200).json({
    status: "success",
    results: banners.length,
    data: {
      banners,
    },
  });
});

// Get active banners only
exports.getActiveBanners = catchAsync(async (req, res, next) => {
  const query = Banner.find({ isActive: true }).select("-__v");

  // Apply API features for filtering, sorting, pagination
  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const banners = await features.query;

  res.status(200).json({
    status: "success",
    results: banners.length,
    data: {
      banners,
    },
  });
});

// Get active banners by type
exports.getActiveBannersByType = catchAsync(async (req, res, next) => {
  const { bannerType } = req.params;
  
  const validTypes = ["Main Banner", "Deals of the Week", "New Release", "top banner", "bottom banner"];
  
  if (!validTypes.includes(bannerType)) {
    return next(new AppError("Invalid banner type", 400));
  }

  const query = Banner.find({ 
    bannerType, 
    isActive: true 
  }).select("-__v");

  // Apply API features for filtering, sorting, pagination
  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const banners = await features.query;

  res.status(200).json({
    status: "success",
    results: banners.length,
    data: {
      banners,
    },
  });
});

// Toggle banner active status
exports.toggleBannerStatus = catchAsync(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);
  
  if (!banner) {
    return next(new AppError("No banner was found with that ID!", 404));
  }

  banner.isActive = !banner.isActive;
  await banner.save();

  res.status(200).json({
    status: "success",
    message: `Banner has been ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      banner,
    },
  });
});

// Get banner statistics
exports.getBannerStatistics = catchAsync(async (req, res, next) => {
  const statistics = await Banner.aggregate([
    {
      $group: {
        _id: null,
        totalBanners: { $sum: 1 },
        activeBanners: { 
          $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } 
        },
        inactiveBanners: { 
          $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } 
        },
      }
    }
  ]);

  // Get banners by type distribution
  const typeDistribution = await Banner.aggregate([
    { $group: { _id: "$bannerType", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get active banners by type
  const activeTypeDistribution = await Banner.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$bannerType", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      statistics: statistics[0] || { totalBanners: 0, activeBanners: 0, inactiveBanners: 0 },
      typeDistribution,
      activeTypeDistribution,
    },
  });
});