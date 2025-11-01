const express = require("express");
const { searchController, searchSuggestions } = require("../../controllers/searchController");
const router = express.Router();

// Search suggestions/autocomplete endpoint
// Usage: GET /search/suggestions?query=java&limit=5
router.get("/suggestions", searchSuggestions);

// Main search route with query parameter
// Usage: GET /search?query=javascript&limit=10&page=1&sortBy=price-low&category=programming
router.get("/", searchController);

// Alternative: Search with URL parameter (more RESTful)
// Usage: GET /search/javascript
router.get("/:query", (req, res, next) => {
  // Move URL parameter to query parameter for controller compatibility
  req.query.query = req.params.query;
  searchController(req, res, next);
});

module.exports = router;