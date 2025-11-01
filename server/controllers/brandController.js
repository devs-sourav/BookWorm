const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const SubCategory = require("../models/subCategoryModel");
const Brand = require("../models/brandModel");
const Product = require("../models/productModel");
const Author = require("../models/authorModel");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const deleteFile = require("../utils/deleteFile");
const { getOne, getAll } = require("../utils/handleFactory");

exports.createBrandController = catchAsync(async (req, res, next) => {
  const body = req.body;

  if (req.file) {
    body.photo = `${req.protocol}://${req.get("host")}/uploads/brand/${
      req.file.filename
    }`;
  } else {
    delete body.photo;
  }

  try {
    const brand = await Brand.create(body);

    // Only update subcategory if subCategory is provided
    if (brand.subCategory) {
      const subCategory = await SubCategory.findOneAndUpdate(
        { _id: brand.subCategory },
        { $push: { brands: brand._id } },
        { new: true }
      );

      if (!subCategory) {
        return next(new AppError("No sub-category was found with that ID!", 404));
      }
    }

    res.status(201).json({
      status: "success",
      message: "Brand has been created successfully",
      data: {
        brand,
      },
    });
  } catch (error) {
    if (req.file) {
      const filePath = `uploads/brand/${req.file.filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          return next(
            new AppError("Something went wrong while creating the brand", 500)
          );
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
        field.charAt(0).toUpperCase() + field.slice(1).toLocaleLowerCase();

      const message = `${capitalizeField} already exists, Please use another ${field}.`;
      return next(new AppError(message, 409));
    }

    return next(
      new AppError("Something went unexpected while creating the brand", 400)
    );
  }
});

exports.updateBrandController = catchAsync(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError("No brand was found with that ID!", 404));
  }

  const body = req.body;

  let oldPhotoLink = null;
  if (brand.photo) {
    const photoName = brand.photo.split("/");
    oldPhotoLink = `uploads/brand/${photoName[photoName.length - 1]}`;
  }

  if (req.file) {
    body.photo = `${req.protocol}://${req.get("host")}/uploads/brand/${
      req.file.filename
    }`;
  } else {
    delete body.photo;
  }

  Object.keys(body).forEach((key) => {
    brand[key] = body[key];
  });

  await brand.save();

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
    message: "Brand has been updated successfully",
    data: {
      brand,
    },
  });
});

exports.getBrandController = getOne(Brand);

exports.getAllBrandsController = getAll(Brand);

exports.deleteBrandController = catchAsync(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(new AppError("No brand was found with that ID!", 404));
  }

  // Delete brand photo if it exists
  if (brand.photo) {
    const photoName = brand.photo.split("/").pop();
    const photoPath = path.join(__dirname, "..", "uploads", "brand", photoName);

    try {
      await fs.access(photoPath); // Check if the file exists
      await deleteFile(photoPath);
    } catch (err) {
      console.error(`Failed to delete file: ${err.message}`);
      // Continue with the brand deletion even if the file deletion fails
    }
  }

  // Find all products (books) associated with this brand
  const products = await Product.find({ brand: brand._id });

  for (const product of products) {
    // Delete product photos if they exist
    if (product.photos && product.photos.length > 0) {
      for (const photoPath of product.photos) {
        const photoName = photoPath.split("/").pop();
        const productPhotoPath = path.join(
          __dirname,
          "..",
          "uploads",
          "products",
          photoName
        );

        try {
          await fs.access(productPhotoPath); // Check if the file exists
          await deleteFile(productPhotoPath);
        } catch (err) {
          console.error(`Failed to delete file: ${err.message}`);
          // Continue with the product deletion even if the file deletion fails
        }
      }
    }

    // Delete the product (book) itself
    await Product.findByIdAndDelete(product._id);
  }

  // Remove this brand from the subcategory's brands array (only if subCategory exists)
  if (brand.subCategory) {
    await SubCategory.updateMany(
      { brands: brand._id },
      { $pull: { brands: brand._id } }
    );
  }

  // Delete the brand itself
  await Brand.findByIdAndDelete(brand._id);

  res.status(204).json({
    status: "success",
    message: "Brand has been deleted successfully with all associated books.",
    data: null,
  });
});

// Get all books (products) by Brand:
exports.getProductsByBrand = catchAsync(async (req, res, next) => {
  const { brandId } = req.params;

  const brand = await Brand.findById(brandId);
  if (!brand) {
    return next(new AppError("No brand found with that ID!", 404));
  }

  // Build query with populate for related data
  const query = Product.find({ brand: brandId })
    .populate([
      {
        path: "author",
        select: "name photo bio",
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
        select: "title slug photo",
      },
    ])
    .select("-__v");

  // Apply API features for filtering, sorting, pagination
  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

// Get books with detailed information by brand
exports.getBooksDetailsByBrand = catchAsync(async (req, res, next) => {
  const { brandId } = req.params;

  const brand = await Brand.findById(brandId);
  if (!brand) {
    return next(new AppError("No brand found with that ID!", 404));
  }

  // Get books with full details
  const query = Product.find({ brand: brandId })
    .populate([
      {
        path: "author",
        select: "name photo bio",
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
        select: "title slug photo",
      },
    ])
    .select("-__v");

  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const books = await features.query;

  // Calculate additional statistics
  const totalBooks = await Product.countDocuments({ brand: brandId });
  const stockInfo = await Product.aggregate([
    { $match: { brand: new mongoose.Types.ObjectId(brandId) } },
    { 
      $group: { 
        _id: null, 
        totalStock: { $sum: "$stock" },
        totalSales: { $sum: "$saleNumber" },
        averagePrice: { $avg: "$price" }
      } 
    }
  ]);

  res.status(200).json({
    status: "success",
    results: books.length,
    totalBooks,
    statistics: stockInfo[0] || { totalStock: 0, totalSales: 0, averagePrice: 0 },
    data: {
      brand,
      books,
    },
  });
});

// Get books by author within a specific brand
exports.getBooksByAuthorInBrand = catchAsync(async (req, res, next) => {
  const { brandId, authorId } = req.params;

  const brand = await Brand.findById(brandId);
  if (!brand) {
    return next(new AppError("No brand found with that ID!", 404));
  }

  const author = await Author.findById(authorId);
  if (!author) {
    return next(new AppError("No author found with that ID!", 404));
  }

  const books = await Product.find({ 
    brand: brandId,
    author: authorId 
  })
  .populate([
    {
      path: "author",
      select: "name photo bio",
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
      select: "title slug photo",
    },
  ])
  .select("-__v");

  res.status(200).json({
    status: "success",
    results: books.length,
    data: {
      brand,
      author,
      books,
    },
  });
});

// Get bestselling books by brand
exports.getBestsellingBooksByBrand = catchAsync(async (req, res, next) => {
  const { brandId } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  const brand = await Brand.findById(brandId);
  if (!brand) {
    return next(new AppError("No brand found with that ID!", 404));
  }

  const books = await Product.find({ brand: brandId })
    .populate([
      {
        path: "author",
        select: "name photo",
      },
      {
        path: "brand",
        select: "title slug",
      },
    ])
    .sort({ saleNumber: -1, visitCount: -1 })
    .limit(limit)
    .select("-__v");

  res.status(200).json({
    status: "success",
    results: books.length,
    data: {
      brand,
      books,
    },
  });
});

// Get brand statistics
exports.getBrandStatistics = catchAsync(async (req, res, next) => {
  const { brandId } = req.params;

  const brand = await Brand.findById(brandId);
  if (!brand) {
    return next(new AppError("No brand found with that ID!", 404));
  }

  const statistics = await Product.aggregate([
    { $match: { brand: new mongoose.Types.ObjectId(brandId) } },
    {
      $group: {
        _id: null,
        totalBooks: { $sum: 1 },
        totalStock: { $sum: "$stock" },
        totalSales: { $sum: "$saleNumber" },
        totalVisits: { $sum: "$visitCount" },
        averagePrice: { $avg: "$price" },
        highestPrice: { $max: "$price" },
        lowestPrice: { $min: "$price" },
      }
    }
  ]);

  // Get books by format distribution
  const formatDistribution = await Product.aggregate([
    { $match: { brand: new mongoose.Types.ObjectId(brandId) } },
    { $group: { _id: "$format", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get books by language distribution
  const languageDistribution = await Product.aggregate([
    { $match: { brand: new mongoose.Types.ObjectId(brandId) } },
    { $group: { _id: "$language", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      brand,
      statistics: statistics[0] || {},
      formatDistribution,
      languageDistribution,
    },
  });
});