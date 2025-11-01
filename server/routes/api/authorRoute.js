const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createAuthor,
  getAllAuthors,
  getAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorBySlug,
  searchAuthors,
  checkNameAvailability,
  getSuggestedSlug,
} = require("../../controllers/authorController");

const router = express.Router();

// Configure multer for author photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads", "authors"));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "author-" + uniqueSuffix + extension);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Utility routes (should be before parameterized routes)
router.get("/search", searchAuthors);
router.get("/check-name", checkNameAvailability);
router.get("/suggest-slug", getSuggestedSlug);

// Basic CRUD routes
router
  .route("/")
  .post(upload.single("photo"), createAuthor)
  .get(getAllAuthors);

// Get author by slug
router.get("/slug/:slug", getAuthorBySlug);

// Routes with ID parameter
router
  .route("/:id")
  .get(getAuthor) // This now handles both ID and slug
  .patch(upload.single("photo"), updateAuthor)
  .delete(deleteAuthor);

module.exports = router;