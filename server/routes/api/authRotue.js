const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  signupController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  verifyEmailController,
  resendVerificationEmailController,
  // Update controllers
  updateProfileController,
  updatePasswordController,
  deactivateAccountController,
  reactivateAccountController,
  getMeController,
  updateEmailVerificationController,
  // Photo controllers
  updateUserPhotoController,
  deleteUserPhotoController,
  // Error handling
  handleMulterError,
   getAllUsersController,
  getUserStatsController,
  searchUsersController,
  getUsersByRoleController,
} = require("../../controllers/authController");

const router = express.Router();

// ====================== MULTER CONFIGURATION (Same as Author) ======================

// Configure multer for user photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads", "users"));
  },
  filename: (req, file, cb) => {
    // Generate unique filename (matching author pattern)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "user-" + uniqueSuffix + extension);
  },
});

// File filter for images only (same as author)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer upload configuration (same as author)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Bulk upload configuration for admin
const uploadMultiple = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10, // Maximum 10 files
  },
}).array("photos", 10);

// ====================== EXISTING AUTH ROUTES ======================

router.post("/signup", signupController);
router.post("/login", loginController);

// Email verification routes
router.get("/verify-email/:token", verifyEmailController);
router.post("/resend-verification", resendVerificationEmailController);

// Password reset routes
router.post("/forgotPassword", forgotPasswordController);
router.patch("/resetPassword/:token", resetPasswordController);

// ====================== PROFILE MANAGEMENT ROUTES ======================

// Get user profile
router.get("/me/:userId", getMeController);

// Update profile with optional photo upload (using single upload like author)
router.patch(
  "/update-profile/:userId",
  upload.single("photo"),
  handleMulterError,
  updateProfileController
);

// Dedicated photo management routes
router.patch(
  "/update-photo/:userId",
  upload.single("photo"),
  handleMulterError,
  updateUserPhotoController
);

router.delete("/delete-photo/:userId", deleteUserPhotoController);

// Password update route (no file upload needed)
router.patch("/update-password/:userId", updatePasswordController);

// ====================== ACCOUNT MANAGEMENT ROUTES ======================

router.patch("/deactivate-account/:userId", deactivateAccountController);
router.post("/reactivate-account", reactivateAccountController);

// Get all users with filtering, pagination, and sorting
router.get("/users", getAllUsersController);

// Get user statistics
router.get("/users/stats", getUserStatsController);

// Search users
router.get("/users/search", searchUsersController);

// Get users by role
router.get("/users/role/:role", getUsersByRoleController);

// ====================== ADMIN ROUTES ======================

// Admin email verification update
router.patch("/admin/update-email-verification/:userId", updateEmailVerificationController);

// Bulk photo upload for admin (using multiple upload)
router.post(
  "/admin/upload-photos",
  uploadMultiple,
  handleMulterError,
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload at least one photo!'
      });
    }

    const photoURLs = req.files.map(file =>
      `${req.protocol}://${req.get('host')}/uploads/users/${file.filename}`
    );
   
    res.status(200).json({
      status: 'success',
      message: `${req.files.length} photos uploaded successfully!`,
      data: {
        files: req.files.map((file, index) => ({
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          url: photoURLs[index]
        }))
      }
    });
  }
);

module.exports = router;