const fs = require("fs");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel");
const Author = require("../models/authorModel");
const Product = require("../models/productModel");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const deleteFile = require("../utils/deleteFile");
const { getAll, getOne } = require("../utils/handleFactory");

// Helper function to check if title already exists
const checkTitleExists = async (title, excludeId = null) => {
  const query = { title: { $regex: new RegExp(`^${title}$`, "i") } }; // Case-insensitive exact match
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingProduct = await Product.findOne(query);
  return existingProduct;
};

exports.createProductController = catchAsync(async (req, res, next) => {
  const body = req.body;

  // Check if title already exists before proceeding
  if (body.title) {
    const existingProduct = await checkTitleExists(body.title.trim());
    if (existingProduct) {
      // Clean up uploaded files if any
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          const filePath = `uploads/products/${file.filename}`;
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error removing file: ${filePath}`, err);
            }
          });
        });
      }

      return next(
        new AppError(
          "Already have a product using this title. Please use a different title.",
          409
        )
      );
    }
  }

  // Validate required references exist - only check provided fields
  const validationPromises = [];
  const validationFields = [];

  // Category is always required
  if (body.category) {
    validationPromises.push(Category.findById(body.category));
    validationFields.push("category");
  }

  // SubCategory is optional
  if (body.subCategory) {
    validationPromises.push(SubCategory.findById(body.subCategory));
    validationFields.push("subCategory");
  }

  // Brand is optional
  if (body.brand) {
    validationPromises.push(Brand.findById(body.brand));
    validationFields.push("brand");
  }

  // Author is required
  if (body.author) {
    validationPromises.push(Author.findById(body.author));
    validationFields.push("author");
  }

  const results = await Promise.all(validationPromises);

  // Check validation results
  for (let i = 0; i < results.length; i++) {
    const field = validationFields[i];
    const result = results[i];

    if (!result) {
      // Clean up uploaded files on validation error
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          const filePath = `uploads/products/${file.filename}`;
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error removing file: ${filePath}`, err);
            }
          });
        });
      }

      const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
      return next(new AppError(`${fieldName} not found`, 404));
    }
  }

  // Validate that subcategory belongs to the selected category (only if both are provided)
  if (body.category && body.subCategory) {
    const subCategory = await SubCategory.findById(body.subCategory);
    if (
      subCategory &&
      subCategory.category.toString() !== body.category.toString()
    ) {
      // Clean up uploaded files on validation error
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          const filePath = `uploads/products/${file.filename}`;
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error removing file: ${filePath}`, err);
            }
          });
        });
      }
      return next(
        new AppError(
          "Sub-category does not belong to the selected category",
          400
        )
      );
    }
  }

  // Handle photo uploads
  if (req.files && req.files.length > 0) {
    body.photos = req.files.map((file) => {
      return `${req.protocol}://${req.get("host")}/uploads/products/${
        file.filename
      }`;
    });
  } else {
    // If no files uploaded, ensure photos field is not set to pass validation
    delete body.photos;
  }

  // Calculate salePrice based on discount
  if (body.discountType && body.discountType !== "none" && body.discountValue) {
    if (body.discountType === "percent") {
      body.salePrice = body.price - (body.price * body.discountValue) / 100;
    } else if (body.discountType === "amount") {
      body.salePrice = body.price - body.discountValue;
    }
  } else {
    body.salePrice = body.price;
  }

  try {
    const product = await Product.create(body);

    // Update brand with new product (only if brand is provided)
    if (product.brand) {
      await Brand.findOneAndUpdate(
        { _id: product.brand },
        {
          $push: { products: product._id },
        },
        { new: true }
      );
    }

    res.status(201).json({
      status: "success",
      message: "Book has been created successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    console.log("Error creating product:", error); // Debug log

    // Handle validation errors
    if (error.errors) {
      const messages = Object.values(error.errors)
        .map((item) => {
          // Handle different error structures
          if (item && item.properties && item.properties.message) {
            return item.properties.message;
          } else if (item && item.message) {
            return item.message;
          } else if (typeof item === "string") {
            return item;
          } else {
            return "Invalid field value";
          }
        })
        .filter((msg) => msg) // Remove any undefined/null messages
        .join(", ");

      // Clean up files on validation error
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          const filePath = `uploads/products/${file.filename}`;
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error removing file: ${filePath}`, err);
            }
          });
        });
      }
      return next(
        new AppError(
          `Validation failed: ${messages || "Please check your input data"}`,
          400
        )
      );
    }

    // Handle duplicate key errors (as fallback)
    else if (error.code === 11000) {
      let message = "Duplicate entry found.";

      if (error.keyPattern && error.keyPattern.title) {
        message =
          "Already have a product using this title. Please use a different title.";
      } else if (error.keyPattern && error.keyPattern.isbn) {
        message = "ISBN already exists. Please use another ISBN.";
      } else if (error.keyPattern && error.keyPattern.slug) {
        message = "URL slug already exists. Please modify the title.";
      } else {
        const field = Object.keys(error.keyPattern || {}).join(" ") || "field";
        const capitalizeField =
          field.charAt(0).toUpperCase() + field.slice(1).toLowerCase();
        message = `${capitalizeField} already exists. Please use another ${field}.`;
      }

      // Clean up files on duplicate error
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          const filePath = `uploads/products/${file.filename}`;
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error removing file: ${filePath}`, err);
            }
          });
        });
      }
      return next(new AppError(message, 409));
    }

    // Handle cast errors (invalid ObjectId)
    else if (error.name === "CastError") {
      // Clean up files on cast error
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          const filePath = `uploads/products/${file.filename}`;
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error removing file: ${filePath}`, err);
            }
          });
        });
      }

      return next(new AppError(`Invalid ${error.path}: ${error.value}`, 400));
    }

    // Clean up uploaded files if product creation fails for any other reason
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const filePath = `uploads/products/${file.filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error removing file: ${filePath}`, err);
          }
        });
      });
    }
    return next(
      new AppError(
        `Something went wrong while creating book: ${
          error.message || "Unknown error"
        }`,
        500
      )
    );
  }
});

exports.updateProductController = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("No book was found with that ID!", 404));
  }

  const body = req.body;

  // Check if title is being updated and if it already exists
  if (body.title && body.title.trim() !== product.title) {
    const existingProduct = await checkTitleExists(
      body.title.trim(),
      req.params.id
    );
    if (existingProduct) {
      return next(
        new AppError(
          "Already have a product using this title. Please use a different title.",
          409
        )
      );
    }
  }

  // Validate references if they are being updated - only validate provided fields
  const validationPromises = [];
  const validationFields = [];

  if (body.category) {
    validationPromises.push(Category.findById(body.category));
    validationFields.push("category");
  }

  if (body.subCategory) {
    validationPromises.push(SubCategory.findById(body.subCategory));
    validationFields.push("subCategory");
  }

  if (body.brand) {
    validationPromises.push(Brand.findById(body.brand));
    validationFields.push("brand");
  }

  if (body.author) {
    validationPromises.push(Author.findById(body.author));
    validationFields.push("author");
  }

  if (validationPromises.length > 0) {
    const results = await Promise.all(validationPromises);

    for (let i = 0; i < results.length; i++) {
      const field = validationFields[i];
      const result = results[i];

      if (!result) {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
        return next(new AppError(`${fieldName} not found`, 404));
      }
    }

    // Validate subcategory-category relationship if both are being updated or one is updated
    const categoryId = body.category || product.category;
    const subCategoryId = body.subCategory || product.subCategory;

    if (categoryId && subCategoryId && (body.category || body.subCategory)) {
      const subCat = await SubCategory.findById(subCategoryId);
      if (subCat && subCat.category.toString() !== categoryId.toString()) {
        return next(
          new AppError(
            "Sub-category does not belong to the selected category",
            400
          )
        );
      }
    }
  }

  // Handle photo uploads if present
  if (req.files && req.files.length > 0) {
    // Remove old photos from file system
    if (product.photos && product.photos.length > 0) {
      for (const photoPath of product.photos) {
        const photoName = photoPath.split("/").pop();
        const path = `uploads/products/${photoName}`;
        try {
          await deleteFile(path);
        } catch (err) {
          console.error(`Failed to delete file: ${err.message}`);
        }
      }
    }

    // Update photos
    body.photos = req.files.map(
      (file) =>
        `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
    );
  }

  // Calculate salePrice based on discount if price or discount is being updated
  if (body.price || body.discountType || body.discountValue !== undefined) {
    const price = body.price || product.price;
    const discountType = body.discountType || product.discountType;
    const discountValue =
      body.discountValue !== undefined
        ? body.discountValue
        : product.discountValue;

    if (discountType && discountType !== "none" && discountValue > 0) {
      if (discountType === "percent") {
        body.salePrice = price - (price * discountValue) / 100;
      } else if (discountType === "amount") {
        body.salePrice = price - discountValue;
      }
    } else {
      body.salePrice = price;
    }
  }

  try {
    // Update only the fields that are present in the request body
    Object.keys(body).forEach((key) => {
      product[key] = body[key];
    });

    await product.save();

    res.status(200).json({
      status: "success",
      message: "Book has been updated successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    console.log("Error updating product:", error); // Debug log

    // Handle validation errors
    if (error.errors) {
      const messages = Object.values(error.errors)
        .map((item) => {
          if (item && item.properties && item.properties.message) {
            return item.properties.message;
          } else if (item && item.message) {
            return item.message;
          } else {
            return "Invalid field value";
          }
        })
        .filter((msg) => msg)
        .join(", ");
      return next(new AppError(`Validation failed: ${messages}`, 400));
    } else if (error.code === 11000) {
      let message = "Duplicate entry found.";

      if (error.keyPattern && error.keyPattern.title) {
        message =
          "Already have a product using this title. Please use a different title.";
      } else if (error.keyPattern && error.keyPattern.isbn) {
        message = "ISBN already exists. Please use another ISBN.";
      } else if (error.keyPattern && error.keyPattern.slug) {
        message = "URL slug already exists. Please modify the title.";
      } else {
        const field = Object.keys(error.keyPattern || {}).join(" ") || "field";
        const capitalizeField =
          field.charAt(0).toUpperCase() + field.slice(1).toLowerCase();
        message = `${capitalizeField} already exists. Please use another ${field}.`;
      }
      return next(new AppError(message, 409));
    }
    return next(
      new AppError(
        `Something went wrong while updating book: ${error.message}`,
        500
      )
    );
  }
});

// Additional helper function to check title availability (can be used by frontend)
exports.checkTitleAvailability = catchAsync(async (req, res, next) => {
  const { title } = req.params;
  const { excludeId } = req.query; // Optional: exclude current product when updating

  if (!title) {
    return next(new AppError("Title is required", 400));
  }

  const existingProduct = await checkTitleExists(title, excludeId);

  res.status(200).json({
    status: "success",
    data: {
      available: !existingProduct,
      message: existingProduct
        ? "Already have a product using this title"
        : "Title is available",
    },
  });
});

// Rest of your existing controller methods remain the same...
exports.getAllProductsController = getAll(Product, [
  {
    path: "category subCategory brand author",
    select: "title name",
  },
]);

exports.getProductController = catchAsync(async (req, res, next) => {
  let query = Product.findById(req.params.id).select("-__v");

  const popOptions = [
    {
      path: "category subCategory brand author",
      select: "title name",
    },
  ];

  if (popOptions && Array.isArray(popOptions)) {
    popOptions.forEach((option) => {
      query = query.populate(option);
    });
  }

  const product = await query;

  if (!product) {
    return next(new AppError("No book found with that ID!", 404));
  }

  // Increment visit count
  await Product.findOneAndUpdate(
    { _id: req.params.id },
    { $inc: { visitCount: 1 } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

exports.deleteProductController = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("No book was found with that ID!", 404));
  }

  // Remove product photos from file system
  if (product.photos && product.photos.length > 0) {
    for (const photoPath of product.photos) {
      const photoName = photoPath.split("/").pop();
      const path = `uploads/products/${photoName}`;
      try {
        await deleteFile(path);
      } catch (err) {
        console.error(`Failed to delete file: ${err.message}`);
      }
    }
  }

  // Remove the product ID from the associated brand's products array (only if brand exists)
  if (product.brand) {
    await Brand.findOneAndUpdate(
      { _id: product.brand },
      { $pull: { products: product._id } },
      { new: true }
    );
  }

  // Delete the product
  await Product.findByIdAndDelete(product._id);

  res.status(204).json({
    status: "success",
    message: "Book has been deleted successfully",
    data: null,
  });
});

// Additional BookWorm-specific controllers
// Get books by author
exports.getBooksByAuthor = catchAsync(async (req, res, next) => {
  const { authorId } = req.params;

  // Validate author exists
  const author = await Author.findById(authorId);
  if (!author) {
    return next(new AppError("Author not found", 404));
  }

  const query = Product.find({
    author: authorId,
    isActive: true,
  }).populate([
    {
      path: "category subCategory brand author",
      select: "title name",
    },
  ]);

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
      author,
    },
  });
});

// Get books by category
exports.getBooksByCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  // Validate category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  const query = Product.find({
    category: categoryId,
    isActive: true,
  }).populate([
    {
      path: "category subCategory brand author",
      select: "title name",
    },
  ]);

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
      category,
    },
  });
});

// Get books by subcategory - updated to handle cases where subCategory might not exist
exports.getBooksBySubCategory = catchAsync(async (req, res, next) => {
  const { subCategoryId } = req.params;

  // Validate subcategory exists
  const subCategory = await SubCategory.findById(subCategoryId).populate(
    "category",
    "title"
  );
  if (!subCategory) {
    return next(new AppError("Sub-category not found", 404));
  }

  const query = Product.find({
    subCategory: subCategoryId,
    isActive: true,
  }).populate([
    {
      path: "category subCategory brand author",
      select: "title name",
    },
  ]);

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
      subCategory,
    },
  });
});

// Search books by title, author, or description
exports.searchBooks = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return next(new AppError("Search query is required", 400));
  }

  // First, search for authors matching the query
  const authors = await Author.find({
    name: { $regex: q, $options: "i" },
  });
  const authorIds = authors.map((author) => author._id);

  const query = Product.find({
    $and: [
      {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { isbn: { $regex: q, $options: "i" } },
          { author: { $in: authorIds } }, // Search by author name
        ],
      },
      { isActive: true },
    ],
  }).populate([
    {
      path: "category subCategory brand author",
      select: "title name",
    },
  ]);

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

// Get books by ISBN
exports.getBookByISBN = catchAsync(async (req, res, next) => {
  const { isbn } = req.params;

  const book = await Product.findOne({ isbn, isActive: true }).populate([
    {
      path: "category subCategory brand author",
      select: "title name bio photo", // Include more author details for ISBN lookup
    },
  ]);

  if (!book) {
    return next(new AppError("No book found with that ISBN!", 404));
  }

  // Increment visit count
  await Product.findOneAndUpdate(
    { _id: book._id },
    { $inc: { visitCount: 1 } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      book,
    },
  });
});

// Get featured/popular books
exports.getFeaturedBooks = catchAsync(async (req, res, next) => {
  const query = Product.find({ isActive: true })
    .sort("-saleNumber -visitCount -createdAt")
    .limit(20)
    .populate([
      {
        path: "category subCategory brand author",
        select: "title name",
      },
    ]);

  const books = await query;

  res.status(200).json({
    status: "success",
    results: books.length,
    data: {
      books,
    },
  });
});

// Update stock after purchase
exports.updateStock = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new AppError("Valid quantity is required", 400));
  }

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError("No book found with that ID!", 404));
  }

  if (product.stock < quantity) {
    return next(new AppError("Insufficient stock available", 400));
  }

  // Update stock and sale number
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      $inc: {
        stock: -quantity,
        saleNumber: quantity,
      },
    },
    { new: true }
  ).populate([
    {
      path: "category subCategory brand author",
      select: "title name",
    },
  ]);

  res.status(200).json({
    status: "success",
    message: "Stock updated successfully",
    data: {
      product: updatedProduct,
    },
  });
});

// Get books by brand/publisher - updated to handle cases where brand might not exist
exports.getBooksByBrand = catchAsync(async (req, res, next) => {
  const { brandId } = req.params;

  // Validate brand exists
  const brand = await Brand.findById(brandId);
  if (!brand) {
    return next(new AppError("Brand not found", 404));
  }

  const query = Product.find({
    brand: brandId,
    isActive: true,
  }).populate([
    {
      path: "category subCategory brand author",
      select: "title name",
    },
  ]);

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
      brand,
    },
  });
});

// Get books on sale
exports.getBooksOnSale = catchAsync(async (req, res, next) => {
  const query = Product.find({
    isActive: true,
    discountType: { $ne: "none" },
    discountValue: { $gt: 0 },
  }).populate([
    {
      path: "category subCategory brand author",
      select: "title name",
    },
  ]);

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

// Get related books (same category/author) - updated to handle optional subCategory and brand
exports.getRelatedBooks = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  const currentBook = await Product.findById(id);
  if (!currentBook) {
    return next(new AppError("Book not found", 404));
  }

  // Build the $or conditions dynamically based on what fields exist
  const orConditions = [];

  // Always include category if it exists
  if (currentBook.category) {
    orConditions.push({ category: currentBook.category });
  }

  // Include author if it exists
  if (currentBook.author) {
    orConditions.push({ author: currentBook.author });
  }

  // Include subCategory only if it exists
  if (currentBook.subCategory) {
    orConditions.push({ subCategory: currentBook.subCategory });
  }

  // Include brand only if it exists
  if (currentBook.brand) {
    orConditions.push({ brand: currentBook.brand });
  }

  // If no conditions are available, fall back to category only
  if (orConditions.length === 0 && currentBook.category) {
    orConditions.push({ category: currentBook.category });
  }

  const relatedBooks = await Product.find({
    $and: [
      { _id: { $ne: id } }, // Exclude current book
      { isActive: true },
      orConditions.length > 0 ? { $or: orConditions } : {},
    ],
  })
    .populate([
      {
        path: "category subCategory brand author",
        select: "title name",
      },
    ])
    .limit(limit)
    .sort("-saleNumber -visitCount");

  res.status(200).json({
    status: "success",
    results: relatedBooks.length,
    data: {
      books: relatedBooks,
    },
  });
});

// Get books without subcategory (for products that only have category)
exports.getBooksWithoutSubCategory = catchAsync(async (req, res, next) => {
  const query = Product.find({
    subCategory: { $exists: false },
    isActive: true,
  }).populate([
    {
      path: "category brand author", // Note: subCategory excluded since it doesn't exist
      select: "title name",
    },
  ]);

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

// Get books without brand (for products that don't have publisher/brand info)
exports.getBooksWithoutBrand = catchAsync(async (req, res, next) => {
  const query = Product.find({
    brand: { $exists: false },
    isActive: true,
  }).populate([
    {
      path: "category subCategory author", // Note: brand excluded since it doesn't exist
      select: "title name",
    },
  ]);

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

exports.getHighestProductPrice = async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: null,
          highestPrice: { $max: "$price" },
        },
      },
    ]);

    const highestPrice = result.length > 0 ? result[0].highestPrice : 0;

    res.status(200).json({
      success: true,
      highestPrice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving highest product price",
      error: error.message,
    });
  }
};