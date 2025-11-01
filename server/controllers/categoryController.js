const fs = require("fs").promises;
const path = require("path");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/AppError");
const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel");
const Brand = require("../models/brandModel");
const Product = require("../models/productModel");
const Author = require("../models/authorModel");
const catchAsync = require("../utils/catchAsync");
const deleteFile = require("../utils/deleteFile");
const {
  createOne,
  getAll,
  getOne,
} = require("../utils/handleFactory");

exports.createCategoryController = createOne(Category);

exports.getAllCategoryController = getAll(Category, {
  path: "subCategories",
  select: "slug isActive",
});

exports.getCategoryController = getOne(Category, {
  path: "subCategories",
  select: "title slug isActive",
});

// Custom update controller to handle slug regeneration
exports.updateCategoryController = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return next(new AppError("No category found with that ID!", 404));
  }

  // Update the category fields
  Object.keys(req.body).forEach(key => {
    category[key] = req.body[key];
  });

  // Save the category (this will trigger the pre-save hook to update slug)
  const updatedCategory = await category.save();

  res.status(200).json({
    status: "success",
    data: {
      category: updatedCategory,
    },
  });
});

exports.deleteCategoryController = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError("No category was found with that ID!", 404));
  }

  // Find all sub-categories related to the category
  const subCategories = await SubCategory.find({ category: category._id });

  for (const subCategory of subCategories) {
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
          await fs.access(photoPath); // Check if the file exists
          await deleteFile(photoPath);
        } catch (err) {
          console.log(`Failed to delete brand photo: ${err.message}`);
        }
      }

      // Find all products associated with this brand
      const products = await Product.find({ brand: brand._id });

      for (const product of products) {
        // Delete product photos if they exist
        if (product.photos && product.photos.length > 0) {
          for (const photoPath of product.photos) {
            const photoName = photoPath.split("/").pop();
            const fullPath = path.join(
              __dirname,
              "..",
              "uploads",
              "products",
              photoName
            );

            try {
              await fs.access(fullPath); // Check if the file exists
              await deleteFile(fullPath);
            } catch (err) {
              console.log(`Failed to delete product photo: ${err.message}`);
            }
          }
        }

        // Delete the product itself (no variants/options to handle)
        await Product.findByIdAndDelete(product._id);
      }

      // Delete the brand itself
      await Brand.findByIdAndDelete(brand._id);
    }

    // Delete the sub-category itself
    await SubCategory.findByIdAndDelete(subCategory._id);
  }

  // Finally, delete the category itself
  await Category.findByIdAndDelete(category._id);

  res.status(200).json({
    status: "success",
    message:
      "Category has been deleted successfully along with all associated sub-categories, brands, and products.",
    data: null,
  });
});

exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("No category found with that ID!", 404));
  }

  // Find products associated with the category with author population
  const products = await Product.find({ category: categoryId })
    .populate([
      {
        path: "category subCategory brand",
        select: "title",
      },
      {
        path: "author",
        select: "name photo bio",
      },
    ])
    .select("-__v");

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

// New method to get products by category with enhanced filtering for books
exports.getBooksByCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("No category found with that ID!", 404));
  }

  // Build query with enhanced filtering for book-specific fields
  const query = Product.find({ category: categoryId })
    .populate([
      {
        path: "category subCategory brand",
        select: "title",
      },
      {
        path: "author",
        select: "name photo bio",
      },
    ])
    .select("-__v");

  // Apply API features for filtering, sorting, pagination
  const features = new APIFeatures(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const books = await features.query;

  res.status(200).json({
    status: "success",
    results: books.length,
    data: {
      books,
    },
  });
});

// Get books by author within a category
exports.getBooksByAuthorInCategory = catchAsync(async (req, res, next) => {
  const { categoryId, authorId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("No category found with that ID!", 404));
  }

  const author = await Author.findById(authorId);
  if (!author) {
    return next(new AppError("No author found with that ID!", 404));
  }

  const books = await Product.find({ 
    category: categoryId, 
    author: authorId 
  })
    .populate([
      {
        path: "category subCategory brand",
        select: "title",
      },
      {
        path: "author",
        select: "name photo bio",
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

// Get book formats available in a category
exports.getBookFormatsByCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("No category found with that ID!", 404));
  }

  // Get distinct formats available in this category
  const formats = await Product.distinct("format", { category: categoryId });

  res.status(200).json({
    status: "success",
    results: formats.length,
    data: {
      formats,
    },
  });
});

// Get books by language within a category
exports.getBooksByLanguageInCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;
  const { language } = req.query;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("No category found with that ID!", 404));
  }

  const filter = { category: categoryId };
  if (language) {
    filter.language = language;
  }

  const books = await Product.find(filter)
    .populate([
      {
        path: "category subCategory brand",
        select: "title",
      },
      {
        path: "author",
        select: "name photo bio",
      },
    ])
    .select("-__v");

  res.status(200).json({
    status: "success",
    results: books.length,
    data: {
      books,
    },
  });
});