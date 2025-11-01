const express = require("express");
const {
  createCategoryController,
  getAllCategoryController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getProductsByCategory,
  getBooksByCategory,
  getBooksByAuthorInCategory,
  getBookFormatsByCategory,
  getBooksByLanguageInCategory,
} = require("../../controllers/categoryController");

const router = express.Router();

// Basic CRUD operations
router
  .route("/")
  .post(createCategoryController)
  .get(getAllCategoryController);

router
  .route("/:id")
  .get(getCategoryController)
  .patch(updateCategoryController)
  .delete(deleteCategoryController);

// Category-specific book operations
router.get("/:categoryId/products", getProductsByCategory); // Basic products by category
router.get("/:categoryId/books", getBooksByCategory); // Enhanced books with filtering
router.get("/:categoryId/formats", getBookFormatsByCategory); // Available book formats
router.get("/:categoryId/books/language", getBooksByLanguageInCategory); // Books by language
router.get("/:categoryId/authors/:authorId/books", getBooksByAuthorInCategory); // Books by author in category

module.exports = router;