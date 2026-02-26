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
  handleSSLCommerzIPN,
  validateSSLCommerzTransaction,
} = require("../../controllers/orderController");

const router = express.Router();

// ─── User-specific orders ─────────────────────────────────────────────────────
router.get("/user/:userId", getUserOrdersController);

// ─── SSL Commerz: Initiate payment ───────────────────────────────────────────
router.post("/payment/sslcommerz/initiate", initiateSSLCommerzPayment);

// ─── SSL Commerz: Success callback (POST from gateway + GET fallback) ─────────
router.post("/payment/success", handleSSLCommerzSuccess);
router.get("/payment/success", handleSSLCommerzSuccess);

// ─── SSL Commerz: Fail callback ───────────────────────────────────────────────
router.post("/payment/fail", handleSSLCommerzFail);
router.get("/payment/fail", handleSSLCommerzFail);

// ─── SSL Commerz: Cancel callback ────────────────────────────────────────────
router.post("/payment/cancel", handleSSLCommerzCancel);
router.get("/payment/cancel", handleSSLCommerzCancel);

// ─── SSL Commerz: IPN (Instant Payment Notification) ─────────────────────────
router.post("/payment/sslcommerz/ipn", handleSSLCommerzIPN);

// ─── SSL Commerz: Manual transaction validation ───────────────────────────────
router.post("/payment/validate", validateSSLCommerzTransaction);

// ─── Order with coupon ────────────────────────────────────────────────────────
router.post("/withCoupon", createOrderWithCouponController);

// ─── Basic CRUD ───────────────────────────────────────────────────────────────
router
  .route("/")
  .post(createOrderController)
  .get(getAllOrdersController);

router
  .route("/:id")
  .get(getOrderController)
  .delete(deleteOrderController);

// ─── Order update routes ──────────────────────────────────────────────────────
router.patch("/:id/status", updateOrderStatusController);       // status-only updates
router.patch("/:id/with-stock", updateOrderWithStockController); // updates that affect stock
router.patch("/:id/cancel", cancelOrderController);              // cancel + restore stock
router.patch("/:id", updateOrderStatusController);               // default safe update

module.exports = router;