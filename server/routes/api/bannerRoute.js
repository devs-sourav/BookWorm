const express = require("express");
const {
  createBannerController,
  updateBannerController,
  getAllBannerController,
  getBannerController,
  deleteBannerController,
  getBannersByType,
  getActiveBanners,
  getActiveBannersByType,
  toggleBannerStatus,
  getBannerStatistics,
} = require("../../controllers/bannerController");
const {
  uploadPhotoMiddleware,
  resizePhotoMiddleware,
} = require("../../middlewares/uploadPhotoMiddleware");

const router = express.Router();

// Statistics route (should be before :id routes)
router.route("/statistics").get(getBannerStatistics);

// Active banners routes
router.route("/active").get(getActiveBanners);
router.route("/active/type/:bannerType").get(getActiveBannersByType);

// Banner type routes
router.route("/type/:bannerType").get(getBannersByType);

// Main CRUD routes
router
  .route("/")
  .post(
    uploadPhotoMiddleware(),
    resizePhotoMiddleware("banner"),
    createBannerController
  )
  .get(getAllBannerController);

router
  .route("/:id")
  .get(getBannerController)
  .patch(
    uploadPhotoMiddleware(),
    resizePhotoMiddleware("banner"),
    updateBannerController
  )
  .delete(deleteBannerController);

// Toggle status route
router.route("/:id/toggle-status").patch(toggleBannerStatus);

module.exports = router;