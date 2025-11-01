const AppError = require("../utils/AppError");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");

exports.searchController = catchAsync(async (req, res, next) => {
  const { query, limit = 20, page = 1, sortBy = "relevance", category, minPrice, maxPrice } = req.query;
 
  if (!query) {
    return next(new AppError("Query parameter is required", 400));
  }

  // Pagination
  const skip = (page - 1) * limit;
  const limitNum = parseInt(limit);

  // Define regex for search (case-insensitive)
  const searchRegex = new RegExp(query, "i");
  
  // Build search criteria
  const searchCriteria = {
    $or: [
      { title: searchRegex },
      { description: searchRegex },
      { isbn: searchRegex },
      { language: searchRegex },
      { format: searchRegex },
      { "author.name": searchRegex } // Search in populated author name
    ],
    isActive: true // Only search active products
  };

  // Add optional filters
  if (category) {
    searchCriteria.category = category;
  }

  if (minPrice || maxPrice) {
    searchCriteria.price = {};
    if (minPrice) searchCriteria.price.$gte = parseFloat(minPrice);
    if (maxPrice) searchCriteria.price.$lte = parseFloat(maxPrice);
  }

  // Define sorting options
  let sortOptions = {};
  switch (sortBy) {
    case "price-low":
      sortOptions = { price: 1 };
      break;
    case "price-high":
      sortOptions = { price: -1 };
      break;
    case "newest":
      sortOptions = { createdAt: -1 };
      break;
    case "popular":
      sortOptions = { visitCount: -1, saleNumber: -1 };
      break;
    case "relevance":
    default:
      // For relevance, we'll use text score if text index exists, otherwise popularity
      sortOptions = { visitCount: -1, saleNumber: -1 };
      break;
  }

  // Search in products with comprehensive fields
  const products = await Product.find(searchCriteria)
    .populate("category subCategory brand author", "title name") // Added author population
    .select(
      "title author isbn photos description category subCategory brand " +
      "price salePrice stock discountType discountValue freeShipping " +
      "pageCount language format publicationYear visitCount saleNumber slug createdAt"
    )
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  // Get total count for pagination
  const totalResults = await Product.countDocuments(searchCriteria);
  const totalPages = Math.ceil(totalResults / limitNum);

  // Check if any results found
  if (products.length === 0) {
    return next(new AppError("No results were found!", 404));
  }

  // Send response with pagination info
  res.status(200).json({
    status: "success",
    results: products.length,
    totalResults,
    totalPages,
    currentPage: parseInt(page),
    data: {
      products
    },
  });
});

// Additional controller for search suggestions/autocomplete
exports.searchSuggestions = catchAsync(async (req, res, next) => {
  const { query, limit = 5 } = req.query;
  
  if (!query || query.length < 2) {
    return next(new AppError("Query must be at least 2 characters", 400));
  }

  const searchRegex = new RegExp(`^${query}`, "i"); // Starts with query
  
  const suggestions = await Product.find({
    title: searchRegex,
    isActive: true
  })
    .select("title")
    .limit(parseInt(limit))
    .sort({ visitCount: -1 });

  res.status(200).json({
    status: "success",
    data: {
      suggestions: suggestions.map(p => p.title)
    }
  });
});