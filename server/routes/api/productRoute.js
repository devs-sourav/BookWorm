const express = require("express");
const router = express.Router();
const {
  createProductController,
  getAllProductsController,
  getProductController,
  updateProductController,
  deleteProductController,
  getBooksByAuthor,
  getBooksByCategory,
  getBooksBySubCategory,
  getBooksByBrand,
  searchBooks,
  getBookByISBN,
  getFeaturedBooks,
  getBooksOnSale,
  getRelatedBooks,
  updateStock,
  checkTitleAvailability,
  getBooksWithoutSubCategory, // New addition
  getBooksWithoutBrand, // New addition
  getHighestProductPrice
} = require("../../controllers/productController");

// Import middleware (adjust paths as needed)
// const { protect, restrictTo } = require("../middleware/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");

// Title availability check (place before other routes to avoid conflicts)
router.get("/check-title/:title", checkTitleAvailability);

// Book-specific routes (place before /:id route to avoid conflicts)
router.get("/search/query", searchBooks);
router.get("/featured/popular", getFeaturedBooks);
router.get("/sale/discounted", getBooksOnSale);
router.get("/without-subcategory", getBooksWithoutSubCategory); // New: Books with only category
router.get("/without-brand", getBooksWithoutBrand); // New: Books without publisher/brand
router.get("/author/:authorId", getBooksByAuthor);
router.get("/category/:categoryId", getBooksByCategory);
router.get("/subcategory/:subCategoryId", getBooksBySubCategory);
router.get("/brand/:brandId", getBooksByBrand);
router.get("/isbn/:isbn", getBookByISBN);
router.get("/:id/related", getRelatedBooks);

// Basic CRUD routes
router
  .route("/")
  .get(getAllProductsController)
  .post(
    // protect,
    // restrictTo("admin"),
    upload.array("photos", 5), // Handle multiple photo uploads
    createProductController
  );

router
  .route("/:id")
  .get(getProductController)
  .patch(
    // protect,
    // restrictTo("admin"),
    upload.array("photos", 5), // Handle photo updates
    updateProductController
  )
  .delete(
    // protect,
    // restrictTo("admin"),
    deleteProductController
  );

// Stock management
router.patch(
  "/:id/stock",
  // protect,
  // restrictTo("admin"),
  updateStock
);

router.get("/stats/highest-price", getHighestProductPrice);

module.exports = router;