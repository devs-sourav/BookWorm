const express = require("express");
const {
  createSubCategoryController,
  getAllSubCategoryController,
  getSubCategoryController,
  updateSubCategoryController,
  deleteSubCategoryController,
  getProductsBySubCategory,
  getBooksDetailsBySubCategory,
  getBooksByAuthorInSubCategory,
  getPopularBooksBySubCategory,
  // Remove these if they don't exist in your controller
  // getVariantsBySubCategory,
  // getOptionsBySubCategory,
} = require("../../controllers/subCategoryController");

const router = express.Router();

// Basic CRUD routes
router
  .route("/")
  .post(createSubCategoryController)
  .get(getAllSubCategoryController);

router
  .route("/:id")
  .get(getSubCategoryController)
  .patch(updateSubCategoryController)
  .delete(deleteSubCategoryController);

// Product/Book related routes by sub-category
router.get("/:subCategoryId/products", getProductsBySubCategory);
router.get("/:subCategoryId/books", getBooksDetailsBySubCategory);
router.get("/:subCategoryId/books/popular", getPopularBooksBySubCategory);
router.get("/:subCategoryId/authors/:authorId/books", getBooksByAuthorInSubCategory);

// Keep these if you have the corresponding controllers
// router.get("/:subCategoryId/variants", getVariantsBySubCategory);
// router.get("/:subCategoryId/options", getOptionsBySubCategory);

module.exports = router;