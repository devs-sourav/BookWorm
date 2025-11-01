const express = require('express');
const router = express.Router();
const reviewController = require('../../controllers/reviewController');

// Public routes

// Get all reviews for a specific product with pagination and filtering
router.get('/product/:productId', reviewController.getProductReviews);

// Get product rating statistics
router.get('/product/:productId/stats', reviewController.getProductStats);

// Get a single review by ID
router.get('/:reviewId', reviewController.getReviewById);

// Get user's reviews (public view - only approved and active reviews)
router.get('/user/:userId', reviewController.getUserReviews);

// Review management routes

// Create a new review
router.post('/', reviewController.createReview);

// Update a review (user can only update their own reviews)
router.put('/:reviewId', reviewController.updateReview);

// Delete a review (user can only delete their own reviews, or admin can delete any)
router.delete('/:reviewId', reviewController.deleteReview);

// Add helpful vote to a review
router.post('/:reviewId/helpful', reviewController.addHelpfulVote);

// Get current user's reviews (private view - shows all user's reviews regardless of status)
router.get('/my/reviews', reviewController.getMyReviews);

// Admin routes

// Approve or disapprove a review (admin only)
router.patch('/:reviewId/moderate', reviewController.moderateReview);

// Get reviews pending moderation (admin only)
router.get('/admin/pending', reviewController.getPendingReviews);
router.get('/delete/:reviewId', reviewController.deleteReviewById);


module.exports = router;

// Usage in your main app.js or server.js:
// const reviewRoutes = require('./routes/reviewRoutes');
// app.use('/api/reviews', reviewRoutes);