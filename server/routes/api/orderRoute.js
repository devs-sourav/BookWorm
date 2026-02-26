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

// handle both POST (preferred) and GET (some gateways redirect with query params)
router.post("/payment/success", handleSSLCommerzSuccess);
router.get("/payment/success", (req, res, next) => {
  // copy query parameters into body so handler can use same logic
  req.body = { ...(req.query || {}) };
  // call the handler but don't await - it handles all errors internally
  handleSSLCommerzSuccess(req, res, next);
});

router.post("/payment/fail", handleSSLCommerzFail);
router.get("/payment/fail", (req, res, next) => {
  req.body = { ...(req.query || {}) };
  handleSSLCommerzFail(req, res, next);
});

router.post("/payment/cancel", handleSSLCommerzCancel);
router.get("/payment/cancel", (req, res, next) => {
  req.body = { ...(req.query || {}) };
  handleSSLCommerzCancel(req, res, next);
});
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