const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid product ID'
      }
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid user ID'
      }
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer'
      }
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Review title cannot exceed 100 characters"],
      // Custom validator to ensure title is meaningful if provided
      validate: {
        validator: function(v) {
          // If title is provided, it should have at least 3 meaningful characters
          if (v && v.trim().length > 0 && v.trim().length < 3) {
            return false;
          }
          return true;
        },
        message: 'Title must be at least 3 characters long if provided'
      }
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Review comment cannot exceed 1000 characters"],
      // Custom validator to ensure comment is meaningful if provided
      validate: {
        validator: function(v) {
          // If comment is provided, it should have at least 10 meaningful characters
          if (v && v.trim().length > 0 && v.trim().length < 10) {
            return false;
          }
          return true;
        },
        message: 'Comment must be at least 10 characters long if provided'
      }
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: [0, "Helpful votes cannot be negative"],
    },
    // Track users who voted helpful to prevent duplicate votes
    helpfulVoters: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function(v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid voter user ID'
      }
    }],
    isApproved: {
      type: Boolean,
      default: true, // Can be set to false for moderation workflow
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Additional metadata
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: {
      type: Date,
    },
    moderationReason: {
      type: String,
      trim: true,
      maxlength: [500, "Moderation reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    // Add version key for optimistic concurrency control
    versionKey: '__v',
  }
);

// Compound index to ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for better query performance
reviewSchema.index({ product: 1, isApproved: 1, isActive: 1 });
reviewSchema.index({ user: 1, isApproved: 1, isActive: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 }); // For sorting by date
reviewSchema.index({ helpfulVotes: -1 }); // For sorting by helpfulness
reviewSchema.index({ isApproved: 1, createdAt: -1 }); // For moderation workflow

// Virtual for formatted date
reviewSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString();
});

// Virtual for time ago format
reviewSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

// Virtual to check if review has content (title or comment)
reviewSchema.virtual("hasContent").get(function () {
  return !!(this.title || this.comment);
});

// Pre-save middleware to ensure at least one of title or comment exists
reviewSchema.pre('save', function(next) {
  if (!this.title && !this.comment) {
    const error = new Error('At least one of title or comment must be provided');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Pre-save middleware for moderation tracking
reviewSchema.pre('save', function(next) {
  if (this.isModified('isApproved') && !this.isNew) {
    this.moderatedAt = new Date();
  }
  next();
});

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function (productId) {
  try {
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }

    const stats = await this.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          isApproved: true,
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    if (stats.length > 0) {
      const result = stats[0];
      
      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      result.ratingDistribution.forEach(rating => {
        distribution[rating]++;
      });

      // Calculate percentage distribution
      const percentageDistribution = {};
      Object.keys(distribution).forEach(star => {
        percentageDistribution[star] = Math.round((distribution[star] / result.totalReviews) * 100);
      });

      return {
        averageRating: Math.round(result.averageRating * 10) / 10,
        totalReviews: result.totalReviews,
        ratingDistribution: distribution,
        percentageDistribution,
      };
    }

    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentageDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentageDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
};

// Static method to get review statistics for a product
reviewSchema.statics.getProductReviewStats = async function (productId) {
  try {
    const [ratingStats, recentReviews] = await Promise.all([
      this.calculateAverageRating(productId),
      this.find({
        product: productId,
        isApproved: true,
        isActive: true
      })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('rating title comment createdAt user')
    ]);

    return {
      ...ratingStats,
      recentReviews
    };
  } catch (error) {
    console.error('Error getting product review stats:', error);
    throw error;
  }
};

// Method to check if user can vote helpful
reviewSchema.methods.canUserVoteHelpful = function(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return false;
  }
  return !this.helpfulVoters.some(voterId => voterId.toString() === userId.toString());
};

// Method to add helpful vote
reviewSchema.methods.addHelpfulVote = async function(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }
  
  if (!this.canUserVoteHelpful(userId)) {
    throw new Error('User has already voted this review as helpful');
  }
  
  this.helpfulVoters.push(new mongoose.Types.ObjectId(userId));
  this.helpfulVotes += 1;
  await this.save();
  
  return this;
};

// Method to remove helpful vote (for undo functionality)
reviewSchema.methods.removeHelpfulVote = async function(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }
  
  const voterIndex = this.helpfulVoters.findIndex(voterId => voterId.toString() === userId.toString());
  if (voterIndex === -1) {
    throw new Error('User has not voted this review as helpful');
  }
  
  this.helpfulVoters.splice(voterIndex, 1);
  this.helpfulVotes = Math.max(0, this.helpfulVotes - 1);
  await this.save();
  
  return this;
};

// Static method to update product rating
reviewSchema.statics.updateProductRating = async function (productId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }
    
    // Dynamically import to avoid circular dependency
    const Product = mongoose.model('Product');
    
    const ratingStats = await this.calculateAverageRating(productId);
    
    await Product.findByIdAndUpdate(productId, {
      averageRating: ratingStats.averageRating,
      totalReviews: ratingStats.totalReviews,
      ratingDistribution: ratingStats.ratingDistribution,
    });
    
    return ratingStats;
  } catch (error) {
    console.error('Error updating product rating:', error);
    throw error;
  }
};

// Static method for bulk operations
reviewSchema.statics.bulkApprove = async function(reviewIds) {
  try {
    const result = await this.updateMany(
      { _id: { $in: reviewIds } },
      { 
        isApproved: true,
        moderatedAt: new Date()
      }
    );
    
    // Update product ratings for affected products
    const reviews = await this.find({ _id: { $in: reviewIds } }).distinct('product');
    await Promise.all(reviews.map(productId => this.updateProductRating(productId)));
    
    return result;
  } catch (error) {
    console.error('Error in bulk approve:', error);
    throw error;
  }
};

// Post-save hook to update product's average rating
reviewSchema.post("save", async function () {
  try {
    await this.constructor.updateProductRating(this.product);
  } catch (error) {
    console.error('Error in post-save hook:', error);
  }
});

// Post-deleteOne hook
reviewSchema.post("deleteOne", { document: true, query: false }, async function () {
  try {
    await this.constructor.updateProductRating(this.product);
  } catch (error) {
    console.error('Error in post-deleteOne hook:', error);
  }
});

// Post-findOneAndDelete hook
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    try {
      await this.model.updateProductRating(doc.product);
    } catch (error) {
      console.error('Error in post-findOneAndDelete hook:', error);
    }
  }
});

// Post-findOneAndUpdate hook to handle approval status changes
reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    try {
      await this.model.updateProductRating(doc.product);
    } catch (error) {
      console.error('Error in post-findOneAndUpdate hook:', error);
    }
  }
});

// Ensure virtual fields are included in JSON output
reviewSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

reviewSchema.set('toObject', { virtuals: true });

const Review = model("Review", reviewSchema);
module.exports = Review;