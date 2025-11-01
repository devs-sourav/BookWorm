const express = require("express");
const {
  createOrderWithCouponController,
  createOrderController,
  getAllOrdersController,
  getOrderController,
  updateOrderWithStockController,
  updateOrderStatusController,
  deleteOrderController,
  cancelOrderController,
  getUserOrdersController,
  initiateSSLCommerzPayment,
  handleSSLCommerzSuccess,
  handleSSLCommerzFail,
  handleSSLCommerzCancel,
  handleSSLCommerzIPN, // NEW: IPN handler
  validateSSLCommerzTransaction, // NEW: Manual validation
} = require("../../controllers/orderController");

const router = express.Router();

// User-specific orders - should come before /:id route
router.get("/user/:userId", getUserOrdersController);

// SSL Commerz payment routes
router.post("/payment/sslcommerz/initiate", initiateSSLCommerzPayment);
router.post("/payment/success", handleSSLCommerzSuccess);
router.post("/payment/fail", handleSSLCommerzFail);
router.post("/payment/cancel", handleSSLCommerzCancel);
router.post("/payment/sslcommerz/ipn", handleSSLCommerzIPN); // NEW: IPN endpoint
router.post("/payment/validate", validateSSLCommerzTransaction); // NEW: Manual validation

router.post("/withCoupon", createOrderWithCouponController);

// Basic CRUD operations
router
  .route("/")
  .post(createOrderController)
  .get(getAllOrdersController);

router
  .route("/:id")
  .get(getOrderController)
  .delete(deleteOrderController);

// Order update routes - separated for different use cases
router.patch("/:id/status", updateOrderStatusController); // For simple status updates
router.patch("/:id/with-stock", updateOrderWithStockController); // For updates that affect products/stock
router.patch("/:id", updateOrderStatusController); // Default update route (safe updates only)

// Cancel order and restore stock
router.patch("/:id/cancel", cancelOrderController);

module.exports = router;