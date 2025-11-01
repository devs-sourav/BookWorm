const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const User = require("../models/userModel"); // Added User model import

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, userId } = req.body;

    // Validate required fields
    if (!productId || !rating || !userId) {
      return res.status(400).json({
        success: false,
        message: "productId, rating, and userId are required",
      });
    }

    // Validate rating range
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create new review - only include fields that have values
    const reviewData = {
      product: productId,
      user: userId,
      rating: ratingNum,
      isVerifiedPurchase: false,
    };

    // Only add title and comment if they are provided and not empty
    if (title && title.trim()) {
      reviewData.title = title.trim();
    }
    
    if (comment && comment.trim()) {
      reviewData.comment = comment.trim();
    }

    const review = new Review(reviewData);
    await review.save();

    // Populate user details for response
    await review.populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      rating,
    } = req.query;

    // Validate productId
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Build filter query
    const filter = {
      product: productId,
      isApproved: true,
      isActive: true,
    };

    if (rating && !isNaN(rating)) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        filter.rating = ratingNum;
      }
    }

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50 items per page
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    const allowedSortFields = ['createdAt', 'rating', 'helpfulVotes'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Get reviews with pagination
    const reviews = await Review.find(filter)
      .populate("user", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Review.countDocuments(filter);

    // Get rating statistics
    const ratingStats = await Review.calculateAverageRating(productId);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalReviews: total,
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
          limit: limitNum,
        },
        ratingStats,
      },
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get product stats
exports.getProductStats = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const ratingStats = await Review.calculateAverageRating(productId);

    res.status(200).json({
      success: true,
      data: ratingStats,
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get product stats",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Validate reviewId
    if (!reviewId || !reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(reviewId)
      .populate("user", "name")
      .populate("product", "title author");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get review",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, userId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Validate reviewId
    if (!reviewId || !reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user is the author of the review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }

    // Update review fields
    if (rating !== undefined && !isNaN(rating)) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        review.rating = ratingNum;
      } else {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
    }
    
    // Handle title - can be empty string to remove title
    if (title !== undefined) {
      review.title = title.trim() || undefined;
    }
    
    // Handle comment - can be empty string to remove comment
    if (comment !== undefined) {
      review.comment = comment.trim() || undefined;
    }

    await review.save();

    // Populate user details for response
    await review.populate("user", "name");

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId, userRole } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Validate reviewId
    if (!reviewId || !reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user is the author of the review or an admin
    if (review.user.toString() !== userId && userRole !== "aklogicAdmin") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Delete a specific review (No user validation - Admin/System power)
exports.deleteReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Validate reviewId
    if (!reviewId || !reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // Find the review first to get product info for rating update
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Store product ID for later rating update
    const productId = review.product;

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Update product rating after deletion (handled by post-delete hook in model)
    // But we can also manually trigger it to ensure it happens
    try {
      await Review.updateProductRating(productId);
    } catch (updateError) {
      console.warn('Warning: Failed to update product rating after review deletion:', updateError);
      // Don't fail the entire operation if rating update fails
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: {
        deletedReviewId: reviewId,
        productId: productId.toString(),
      },
    });
  } catch (error) {
    console.error('Delete review by ID error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Add helpful vote to a review
exports.addHelpfulVote = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Validate reviewId
    if (!reviewId || !reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Users shouldn't be able to vote their own reviews as helpful
    if (review.user.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot vote your own review as helpful",
      });
    }

    // Check if user already voted this review as helpful
    if (!review.canUserVoteHelpful(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already voted this review as helpful",
      });
    }

    await review.addHelpfulVote(userId);

    res.status(200).json({
      success: true,
      message: "Review voted as helpful",
      data: { 
        helpfulVotes: review.helpfulVotes,
        reviewId: review._id
      },
    });
  } catch (error) {
    console.error('Add helpful vote error:', error);
    
    if (error.message === 'User has already voted this review as helpful') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to vote review as helpful",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get current user's reviews
exports.getMyReviews = async (req, res) => {
  try {
    const { userId } = req.body;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ user: userId })
      .populate("product", "title photos")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalReviews: total,
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get your reviews",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get user's reviews (public)
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate userId
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Only show approved and active reviews for public view
    const reviews = await Review.find({ 
      user: userId,
      isApproved: true,
      isActive: true
    })
      .populate("product", "title photos")
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ 
      user: userId,
      isApproved: true,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalReviews: total,
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get user reviews",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Admin: Approve/Disapprove a review
exports.moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    // Validate reviewId
    if (!reviewId || !reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isApproved must be a boolean value",
      });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved },
      { new: true }
    ).populate("user", "name")
     .populate("product", "title");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Review ${isApproved ? "approved" : "disapproved"} successfully`,
      data: review,
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to moderate review",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get reviews pending moderation (Admin only)
exports.getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ 
      isApproved: false,
      isActive: true
    })
      .populate("user", "name email")
      .populate("product", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ 
      isApproved: false,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalReviews: total,
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get pending reviews",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};