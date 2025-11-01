const express = require("express");
const {
  createCouponCodeController,
  getAllCouponCodeController,
  getCouponCodeController,
  deleteCouponCodeController,
  updateCouponCodeController,
  validateCouponForUse,
} = require("../../controllers/couponController");

const router = express.Router();

router
  .route("/")
  .post(createCouponCodeController)
  .get(getAllCouponCodeController);

// Add validation route before the parameterized route
router.route("/:coupon/validate").get(validateCouponForUse);

router
  .route("/:coupon")
  .get(getCouponCodeController)
  .patch(updateCouponCodeController)
  .delete(deleteCouponCodeController);

module.exports = router;