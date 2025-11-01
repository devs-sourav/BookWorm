const path = require("path");
const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel");
const Brand = require("../models/brandModel");
const Product = require("../models/productModel");
const Author = require("../models/authorModel");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const deleteFile = require("../utils/deleteFile");
const { getAll, getOne } = require("../utils/handleFactory");

exports.createSubCategoryController = catchAsync(async (req, res, next) => {
  const subCategory = await SubCategory.create(req.body);

  const category = await Category.findOneAndUpdate(
    { _id: subCategory.category },
    { $push: { subCategories: subCategory._id } },
    { new: true }
  );

  if (!category)
    return next(new AppError("No category found with that ID!", 404));

  res.status(201).json({
    status: "success",
    data: {
      subCategory,
    },
  });
});

exports.getAllSubCategoryController = getAll(SubCategory, {
  path: "brands",
  select: "photo slug isActive",
});

exports.getSubCategoryController = getOne(SubCategory, [
  {
    path: "category",
    select: "slug",
  },
  {
    path: "brands",
    select: "photo slug isActive",
  },
]);

// Custom update controller that handles slug generation
exports.updateSubCategoryController = catchAsync(async (req, res, next) => {
  // Check if title is being updated and generate slug
  if (req.body.title) {
    req.body.slug = await SubCategory.generateAvailableSlug(req.body.title, req.params.id);
  }

  // Update the document
  const subCategory = await SubCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!subCategory) {
    return next(new AppError("No sub-category found with that ID!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      subCategory,
    },
  });
});

exports.deleteSubCategoryController = catchAsync(async (req, res, next) => {
  // Find the sub-category by ID
  const subCategory = await SubCategory.findById(req.params.id);
  if (!subCategory) {
    return next(new AppError("No Sub-Category was found with that ID!", 404));
  }

  // Find all brands associated with this sub-category
  const brands = await Brand.find({ subCategory: subCategory._id });

  for (const brand of brands) {
    // Delete brand photo if it exists
    if (brand.photo) {
      const photoName = brand.photo.split("/").pop();
      const photoPath = path.join(
        __dirname,
        "..",
        "uploads",
        "brand",
        photoName
      );

      try {
        await deleteFile(photoPath);
      } catch (err) {
        console.log(`Failed to delete brand photo: ${err.message}`);
        // Continue with the deletion process even if the photo deletion fails
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
            await deleteFile(productPhotoPath);
          } catch (err) {
            console.log(`Failed to delete product photo: ${err.message}`);
            // Continue with the deletion process even if the photo deletion fails
          }
        }
      }

      // Delete the product (book) itself
      await Product.findByIdAndDelete(product._id);
    }

    // Delete the brand itself
    await Brand.findByIdAndDelete(brand._id);
  }

  // Remove the sub-category from all categories that include it
  await Category.updateMany(
    { subCategories: subCategory._id },
    { $pull: { subCategories: subCategory._id } }
  );

  // Finally, delete the sub-category itself
  await SubCategory.findByIdAndDelete(subCategory._id);

  res.status(204).json({
    status: "success",
    message:
      "Sub-Category has been deleted successfully along with all associated brands and books",
    data: null,
  });
});

// Get all books (products) by Sub-Category:
exports.getProductsBySubCategory = catchAsync(async (req, res, next) => {
  const { subCategoryId } = req.params;

  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return next(new AppError("No sub-category found with that ID!", 404));
  }

  // Build query with populate for related data
  const query = Product.find({ subCategory: subCategoryId })
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
        select: "title slug photo", // This could be publisher
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

// Get books with detailed information including author details
exports.getBooksDetailsBySubCategory = catchAsync(async (req, res, next) => {
  const { subCategoryId } = req.params;

  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return next(new AppError("No sub-category found with that ID!", 404));
  }

  // Get books with full details
  const query = Product.find({ subCategory: subCategoryId })
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
        select: "title slug photo", // Publisher information
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
  const totalBooks = await Product.countDocuments({ subCategory: subCategoryId });
  const totalStock = await Product.aggregate([
    { $match: { subCategory: new mongoose.Types.ObjectId(subCategoryId) } },
    { $group: { _id: null, totalStock: { $sum: "$stock" } } }
  ]);

  res.status(200).json({
    status: "success",
    results: books.length,
    totalBooks,
    totalStock: totalStock[0]?.totalStock || 0,
    data: {
      books,
    },
  });
});

// Get books by author within a sub-category
exports.getBooksByAuthorInSubCategory = catchAsync(async (req, res, next) => {
  const { subCategoryId, authorId } = req.params;

  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return next(new AppError("No sub-category found with that ID!", 404));
  }

  const author = await Author.findById(authorId);
  if (!author) {
    return next(new AppError("No author found with that ID!", 404));
  }

  const books = await Product.find({ 
    subCategory: subCategoryId,
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
      books,
      author,
    },
  });
});

// Get popular books in sub-category (based on sale numbers and visit count)
exports.getPopularBooksBySubCategory = catchAsync(async (req, res, next) => {
  const { subCategoryId } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return next(new AppError("No sub-category found with that ID!", 404));
  }

  const books = await Product.find({ subCategory: subCategoryId })
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
      books,
    },
  });
});