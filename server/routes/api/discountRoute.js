const express = require("express");
const {
  applyDiscountController,
  removeDiscountController,
  getDiscountedProductsController,
  applyBulkDiscountController,
} = require("../../controllers/discountController");

const router = express.Router();

// Apply discount to products by type (category, subCategory, brand, product, author)
router.put("/apply", applyDiscountController);

// Remove discount from products by type
router.put("/remove", removeDiscountController);

// Apply bulk discount to multiple specific products
router.put("/bulk", applyBulkDiscountController);

// Get products with active discounts (with optional filtering)
router.get("/products", getDiscountedProductsController);

module.exports = router;