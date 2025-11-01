const express = require("express");
const {
  uploadPhotoMiddleware,
  resizePhotoMiddleware,
} = require("../../middlewares/uploadPhotoMiddleware");
const {
  createBrandController,
  getAllBrandsController,
  getBrandController,
  updateBrandController,
  deleteBrandController,
  getProductsByBrand,
  getBooksDetailsByBrand,
  getBooksByAuthorInBrand,
  getBestsellingBooksByBrand,
  getBrandStatistics,
} = require("../../controllers/brandController");

const router = express.Router();

// Basic CRUD operations
router
  .route("/")
  .post(
    uploadPhotoMiddleware(),
    resizePhotoMiddleware("brand"),
    createBrandController
  )
  .get(getAllBrandsController);

router
  .route("/:id")
  .get(getBrandController)
  .patch(
    uploadPhotoMiddleware(),
    resizePhotoMiddleware("brand"),
    updateBrandController
  )
  .delete(deleteBrandController);

// Brand-specific book operations
// Note: More specific routes should come before less specific ones
router.get("/:brandId/books/bestselling", getBestsellingBooksByBrand); // Bestselling books
router.get("/:brandId/statistics", getBrandStatistics); // Brand statistics
router.get("/:brandId/authors/:authorId/books", getBooksByAuthorInBrand); // Books by specific author in brand
router.get("/:brandId/products", getProductsByBrand); // Basic products by brand
router.get("/:brandId/books", getBooksDetailsByBrand); // Detailed books with statistics

module.exports = router;