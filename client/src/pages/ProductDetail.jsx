import React, { useContext, useEffect, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import {
  FaMinus,
  FaPlus,
  FaThumbsUp,
  FaEdit,
  FaTrash,
  FaTiktok,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlices";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaBangladeshiTakaSign, FaChevronRight, FaStar } from "react-icons/fa6";
import { TbTruckDelivery, TbCreditCard, TbShieldCheck } from "react-icons/tb";
import { RiSecurePaymentLine, RiBook2Line } from "react-icons/ri";
import { MdCheckCircleOutline, MdLanguage } from "react-icons/md";
import { LiaHandsHelpingSolid } from "react-icons/lia";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import { BsBuilding } from "react-icons/bs";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { motion } from "framer-motion";
import axios from "axios";
import RelatedProduct from "../components/productdetails/RelatedProduct";
import RightPartProduct from "../components/productdetails/RightPartProduct";
import { Facebook, Instagram, Twitter } from "lucide-react";

// Mock context and components - replace with your actual imports
const ApiContext = React.createContext("https://bookwormm.netlify.app/api/v1");

const socialList = [
  { logo: () => <Facebook />, link: "https://facebook.com" },
  { logo: () => <Instagram />, link: "https://instagram.com" },
  { logo: () => <Twitter />, link: "https://twitter.com" },
  { logo: () => <FaTiktok />, link: "https://tiktok.com" },
];

const serviceList = [
  {
    icon: TbTruckDelivery,
    title: "Fast Delivery",
    details: "2-3 Days",
    color: "text-green-500",
  },
  {
    icon: TbShieldCheck,
    title: "Secure Payment",
    details: "100% Protected",
    color: "text-blue-500",
  },
  {
    icon: MdCheckCircleOutline,
    title: "Money Back",
    details: "30 Days Guarantee",
    color: "text-purple-500",
  },
  {
    icon: LiaHandsHelpingSolid,
    title: "24/7 Support",
    details: "Expert Help",
    color: "text-orange-500",
  },
];

// Star Rating Component
// SVG Star Component with fractional fill support
const SvgStar = ({
  fillPercentage = 0,
  size = 20,
  filledColor = "#FBBF24", // yellow-400
  emptyColor = "#D1D5DB", // gray-300
  strokeColor = "#FBBF24",
  strokeWidth = 1,
  interactive = false,
  onHover = null,
  onClick = null,
}) => {
  const starId = `star-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={
        interactive ? "cursor-pointer transition-transform hover:scale-110" : ""
      }
      onMouseEnter={onHover}
      onClick={onClick}
    >
      <defs>
        <linearGradient id={starId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset={`${fillPercentage}%`} stopColor={filledColor} />
          <stop offset={`${fillPercentage}%`} stopColor={emptyColor} />
        </linearGradient>
      </defs>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={`url(#${starId})`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Enhanced Star Rating Component with SVG support
const StarRating = ({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = "w-5 h-5", // Keep your existing size prop format
  maxRating = 5,
  filledColor = "#FBBF24", // yellow-400
  emptyColor = "#D1D5DB", // gray-300
  hoverColor = "#F59E0B", // yellow-500
  strokeColor = "#FBBF24",
  strokeWidth = 1,
  className = "",
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const currentRating = hoveredRating || rating;

  // Convert Tailwind size classes to pixel values
  const getSizeInPixels = (sizeClass) => {
    const sizeMap = {
      "w-3 h-3": 12,
      "w-4 h-4": 16,
      "w-5 h-5": 20,
      "w-6 h-6": 24,
      "w-8 h-8": 32,
    };
    return sizeMap[sizeClass] || 20;
  };

  const pixelSize = getSizeInPixels(size);

  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= maxRating; i++) {
      let fillPercentage = 0;
      let starFilledColor = filledColor;

      // Calculate fill percentage for fractional ratings
      if (currentRating >= i) {
        fillPercentage = 100;
      } else if (currentRating > i - 1) {
        fillPercentage = (currentRating - (i - 1)) * 100;
      }

      // Use hover color when hovering (for interactive mode)
      if (hoveredRating > 0 && i <= hoveredRating) {
        starFilledColor = hoverColor;
        fillPercentage = 100;
      }

      stars.push(
        <SvgStar
          key={i}
          fillPercentage={fillPercentage}
          size={pixelSize}
          filledColor={starFilledColor}
          emptyColor={emptyColor}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          interactive={!readonly}
          onHover={() => !readonly && setHoveredRating(i)}
          onClick={() => !readonly && onRatingChange && onRatingChange(i)}
        />
      );
    }

    return stars;
  };

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={() => !readonly && setHoveredRating(0)}
    >
      {renderStars()}
    </div>
  );
};

// Review Form Component
// Review Form Component - Fixed version
const ReviewForm = ({
  productId,
  onReviewSubmitted,
  editingReview = null,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    rating: editingReview?.rating || 5,
    title: editingReview?.title || "",
    comment: editingReview?.comment || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const baseApi = useContext(ApiContext);

  // Get user from Redux store
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2">🔐 Login Required</h3>
        <p className="text-gray-700 mb-4">
          Please log in to write a review for this product.
        </p>
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login to Review
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only validate that we have either a title OR comment (at least something)
    // Remove this validation entirely if you want both to be truly optional
    if (!formData.title.trim() && !formData.comment.trim()) {
      setError("Please provide either a title or comment for your review");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const reviewData = {
        productId,
        userId: user._id,
        rating: formData.rating, // Rating is always required
        title: formData.title.trim() || undefined,
        comment: formData.comment.trim() || undefined,
      };

      let reviewResponse;
      if (editingReview) {
        reviewResponse = await axios.put(
          `${baseApi}/review/${editingReview._id}`,
          reviewData
        );
      } else {
        reviewResponse = await axios.post(`${baseApi}/review`, reviewData);
      }

      setFormData({ rating: 5, title: "", comment: "" });
      onReviewSubmitted(reviewResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">
        {editingReview ? "✏️ Edit Your Review" : "✍️ Write a Review"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRating
            rating={formData.rating}
            onRatingChange={(rating) =>
              setFormData((prev) => ({ ...prev, rating }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title
            <span className="text-gray-400 text-xs ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Summarize your review in a few words"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
            <span className="text-gray-400 text-xs ml-1">(Optional)</span>
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comment: e.target.value }))
            }
            placeholder="Tell others about your experience with this book..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.comment.length}/1000 characters
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Info message about optional fields */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 text-sm">
            💡 <strong>Note:</strong> You can submit a review with just a rating, or add a title and/or comment for more detail.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
              ? "Submitting..."
              : editingReview
              ? "Update Review"
              : "Submit Review"}
          </button>

          {(editingReview || onCancel) && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            )}
        </div>
      </form>
    </div>
  );
};

// Individual Review Component
const ReviewCard = ({
  review,
  onEdit,
  onDelete,
  onHelpfulVote,
  currentUserId,
}) => {
  const [isVoting, setIsVoting] = useState(false);

  const handleHelpfulVote = async () => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await onHelpfulVote(review._id);
    } finally {
      setIsVoting(false);
    }
  };

  const canEdit = currentUserId === review.user._id;
  const canVoteHelpful = currentUserId && currentUserId !== review.user._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {review.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{review.user.name}</h4>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} readonly size="w-4 h-4" />
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
              {review.isVerifiedPurchase && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                  ✓ Verified Purchase
                </span>
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(review)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Review"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(review._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Review"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {review.title && (
        <h5 className="font-medium text-gray-900">{review.title}</h5>
      )}

      {review.comment && (
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {canVoteHelpful && (
          <button
            onClick={handleHelpfulVote}
            disabled={isVoting}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            <FaThumbsUp className="w-4 h-4" />
            <span>Helpful ({review.helpfulVotes})</span>
          </button>
        )}

        {!canVoteHelpful && review.helpfulVotes > 0 && (
          <span className="text-sm text-gray-500">
            {review.helpfulVotes} people found this helpful
          </span>
        )}
      </div>
    </motion.div>
  );
};

// Reviews Section Component
// Reviews Section Component - Updated to prevent multiple reviews
const ReviewsSection = ({ productId, onRatingUpdate }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [filterRating, setFilterRating] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [userReview, setUserReview] = useState(null); // Track user's existing review
  const baseApi = useContext(ApiContext);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        sortBy,
        ...(filterRating && { rating: filterRating }),
      });

      const [reviewsRes, statsRes] = await Promise.all([
        axios.get(`${baseApi}/review/product/${productId}?${params}`),
        axios.get(`${baseApi}/review/product/${productId}/stats`),
      ]);

      const reviewsData = reviewsRes.data.data.reviews;
      setReviews(reviewsData);
      setPagination(reviewsRes.data.data.pagination);
      setReviewStats(statsRes.data.data);

      // Find if current user has already reviewed this product
      if (isAuthenticated && user) {
        const existingUserReview = reviewsData.find(
          (review) => review.user._id === user._id
        );
        setUserReview(existingUserReview || null);
      }

      // Update parent component's rating when stats change
      if (onRatingUpdate && statsRes.data.data) {
        onRatingUpdate({
          averageRating: statsRes.data.data.averageRating,
          totalReviews: statsRes.data.data.totalReviews,
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, page, sortBy, filterRating]);

  // Update userReview when user authentication changes
  useEffect(() => {
    if (isAuthenticated && user && reviews.length > 0) {
      const existingUserReview = reviews.find(
        (review) => review.user._id === user._id
      );
      setUserReview(existingUserReview || null);
    } else {
      setUserReview(null);
    }
  }, [isAuthenticated, user, reviews]);

  const handleReviewSubmitted = (newReviewData) => {
    setShowReviewForm(false);
    setEditingReview(null);
    setPage(1);

    // Immediately update local state for instant feedback
    if (newReviewData?.data?.review) {
      const newReview = newReviewData.data.review;

      if (!editingReview) {
        // New review - add to the top of the list
        setReviews((prev) => [newReview, ...prev]);
        setUserReview(newReview); // Set as user's review
      } else {
        // Updated review - update the existing review in the list
        setReviews((prev) =>
          prev.map((review) =>
            review._id === newReview._id ? newReview : review
          )
        );
        setUserReview(newReview); // Update user's review
      }

      // Update review stats immediately for visual feedback
      setReviewStats((prev) => {
        if (!prev) return prev;

        const isNewReview = !editingReview;
        let newTotalReviews = prev.totalReviews;
        let newAverageRating = prev.averageRating;

        if (isNewReview) {
          // Calculate new average for new review
          const totalRatingPoints =
            prev.averageRating * prev.totalReviews + newReview.rating;
          newTotalReviews = prev.totalReviews + 1;
          newAverageRating = totalRatingPoints / newTotalReviews;
        } else {
          // For edited reviews, we'll refetch to get accurate data
          // but provide immediate feedback
          newAverageRating = prev.averageRating; // Keep existing until refetch
        }

        const updatedStats = {
          ...prev,
          totalReviews: newTotalReviews,
          averageRating: newAverageRating,
        };

        // Update parent component immediately
        if (onRatingUpdate) {
          onRatingUpdate({
            averageRating: newAverageRating,
            totalReviews: newTotalReviews,
          });
        }

        return updatedStats;
      });
    }

    // Fetch fresh data to ensure accuracy
    setTimeout(() => {
      fetchReviews();
    }, 500);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await axios.delete(`${baseApi}/review/${reviewId}`, {
        data: { userId: user._id },
      });

      // Remove review from local state immediately
      setReviews((prev) => prev.filter((review) => review._id !== reviewId));

      // Clear user review if it was deleted
      if (userReview && userReview._id === reviewId) {
        setUserReview(null);
      }

      // Update stats immediately
      setReviewStats((prev) => {
        if (!prev || prev.totalReviews <= 1) {
          const updatedStats = {
            ...prev,
            totalReviews: 0,
            averageRating: 0,
          };

          if (onRatingUpdate) {
            onRatingUpdate({
              averageRating: 0,
              totalReviews: 0,
            });
          }

          return updatedStats;
        }

        // Recalculate average (approximate)
        const deletedReview = reviews.find((r) => r._id === reviewId);
        if (deletedReview) {
          const totalRatingPoints =
            prev.averageRating * prev.totalReviews - deletedReview.rating;
          const newTotalReviews = prev.totalReviews - 1;
          const newAverageRating =
            newTotalReviews > 0 ? totalRatingPoints / newTotalReviews : 0;

          const updatedStats = {
            ...prev,
            totalReviews: newTotalReviews,
            averageRating: newAverageRating,
          };

          if (onRatingUpdate) {
            onRatingUpdate({
              averageRating: newAverageRating,
              totalReviews: newTotalReviews,
            });
          }

          return updatedStats;
        }

        return prev;
      });

      // Fetch fresh data for accuracy
      setTimeout(() => {
        fetchReviews();
      }, 500);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    try {
      await axios.post(`${baseApi}/review/${reviewId}/helpful`, {
        userId: user._id,
      });
      fetchReviews();
    } catch (error) {
      console.error("Error voting helpful:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  // Determine what review actions to show
  const renderReviewActions = () => {
    if (!isAuthenticated || !user) {
      return (
        <Link
          to="/login"
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Login to Review
        </Link>
      );
    }

    if (userReview) {
      // User has already reviewed - show edit option
      return (
        <div className="flex gap-3">
          <button
            onClick={() => handleEditReview(userReview)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaEdit className="w-4 h-4" />
            Edit Your Review
          </button>
          <button
            onClick={() => handleDeleteReview(userReview._id)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaTrash className="w-4 h-4" />
            Delete Review
          </button>
        </div>
      );
    }

    // User hasn't reviewed yet - show write review option
    return (
      <button
        onClick={() => setShowReviewForm(!showReviewForm)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {showReviewForm ? "Cancel" : "✍️ Write Review"}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {reviewStats && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {reviewStats.averageRating.toFixed(1)}
              </div>
              {/* <StarRating
                rating={Math.round(reviewStats.averageRating)}
                readonly
              /> */}
              <p className="text-gray-600 mt-2">
                Based on {reviewStats.totalReviews} review
                {reviewStats.totalReviews !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-8">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          reviewStats.percentageDistribution?.[star] || 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {reviewStats.percentageDistribution?.[star] || 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Newest First</option>
            <option value="helpfulVotes">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {renderReviewActions()}
      </div>

      {/* Show user's existing review highlight */}
      {/* {userReview && !showReviewForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600 text-lg">✨</span>
            <span className="font-medium text-blue-900">Your Review</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={userReview.rating} readonly size="w-4 h-4" />
            <span className="text-sm text-blue-700">
              {new Date(userReview.createdAt).toLocaleDateString()}
            </span>
          </div>
          {userReview.title && (
            <h5 className="font-medium text-blue-900 mb-1">
              {userReview.title}
            </h5>
          )}
          {userReview.comment && (
            <p className="text-blue-800 text-sm">{userReview.comment}</p>
          )}
        </div>
      )} */}

      {/* Review Form - Only show if user hasn't reviewed yet or is editing */}
      {showReviewForm && (!userReview || editingReview) && (
        <ReviewForm
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
          editingReview={editingReview}
          onCancel={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onHelpfulVote={handleHelpfulVote}
              currentUserId={user?._id}
            />
          ))
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience with this book!
            </p>
            {isAuthenticated && user && !userReview ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write the First Review
              </button>
            ) : !isAuthenticated ? (
              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login to Write Review
              </Link>
            ) : (
              <div className="text-gray-500 text-sm">
                You have already reviewed this product
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const ProductDetail = () => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const baseApi = useContext(ApiContext);
  const { id } = useParams();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseApi}/product/${id}`);
        const productData = response.data.data.product;
        setData(productData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, baseApi]);

  // Handle rating updates from reviews
  const handleRatingUpdate = ({ averageRating, totalReviews }) => {
    setData((prev) => ({
      ...prev,
      averageRating,
      totalReviews,
    }));
  };

  // Check if product is in stock
  const isInStock = data?.stock > 0;
  const isLowStock = data?.stock <= 5 && data?.stock > 0;

  // Handle quantity increase with stock validation
  const handleQuantityIncrease = () => {
    if (quantity < data?.stock) {
      setQuantity(quantity + 1);
    }
  };

  // Handle quantity decrease
  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  const handleQuantityInputChange = (e) => {
    const value = e.target.value;

    // Allow empty input for better UX while typing
    if (value === "") {
      setQuantity("");
      return;
    }

    // Parse the input value
    const numValue = parseInt(value, 10);

    // Validate the input
    if (isNaN(numValue) || numValue < 1) {
      setQuantity(1);
    } else if (numValue > data?.stock) {
      setQuantity(data.stock);
    } else {
      setQuantity(numValue);
    }
  };

  // Add this function to handle input blur (when user clicks away)
  const handleQuantityInputBlur = () => {
    // If quantity is empty or invalid, set it to 1
    if (quantity === "" || quantity < 1) {
      setQuantity(1);
    }
  };

  // Add this function to handle Enter key press
  const handleQuantityInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.target.blur(); // Remove focus from input
    }
  };
  // Reset quantity when stock changes or component mounts
  useEffect(() => {
    if (data?.stock && quantity > data.stock) {
      setQuantity(Math.min(quantity, data.stock));
    }
  }, [data?.stock]);

  useEffect(() => {
    if (data?.stock) {
      // Handle both string and number quantity values
      const numQuantity =
        typeof quantity === "string" ? parseInt(quantity, 10) || 1 : quantity;

      if (numQuantity > data.stock) {
        setQuantity(data.stock);
      } else if (numQuantity < 1) {
        setQuantity(1);
      }
    }
  }, [data?.stock, quantity]);

const handleAddToCart = () => {
  if (!isInStock) return;

  // Ensure quantity is a valid number
  const validQuantity =
    typeof quantity === "string" ? parseInt(quantity, 10) || 1 : quantity;

  // Calculate discount and pricing information
  const calculatePricing = () => {
    const regularPrice = data.price || 0;
    const discountValue = data.discountValue || 0;
    const discountType = data.discountType || 'fixed';
    
    let salePrice = regularPrice;
    let discountPercent = 0;
    
    if (discountValue > 0) {
      if (discountType === 'percent') {
        discountPercent = discountValue;
        salePrice = regularPrice - (regularPrice * discountValue / 100);
      } else {
        // Fixed discount
        salePrice = regularPrice - discountValue;
        discountPercent = ((regularPrice - salePrice) / regularPrice) * 100;
      }
    }
    
    return {
      regularPrice,
      salePrice: Math.max(salePrice, 0), // Ensure positive price
      discountPercent: Math.round(discountPercent * 100) / 100, // Round to 2 decimals
      offerPrice: salePrice,
      priceAfterDiscount: salePrice
    };
  };

  const pricing = calculatePricing();

  // Create comprehensive cart item object with all required fields
  const cartItem = {
    // Core product identification
    _id: data._id,
    title: data.title,
    
    // Author information
    author: data.author ? {
      _id: data.author._id,
      name: data.author.name
    } : null,
    
    // Category and brand information
    category: data.category ? {
      _id: data.category._id,
      title: data.category.title
    } : null,
    brand: data.brand ? {
      _id: data.brand._id,
      title: data.brand.title
    } : null,
    
    // Images
    photos: data.photos || [],
    
    // Stock and availability
    stock: data.stock || 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    
    // Pricing information (comprehensive)
    price: pricing.regularPrice,                    // Original price
    regularprice: pricing.regularPrice,             // Regular price (alias)
    salePrice: pricing.salePrice,                   // Current selling price
    priceAfterDiscount: pricing.priceAfterDiscount, // Price after discount applied
    offerprice: pricing.offerPrice,                 // Offer price (alias)
    
    // Discount information
    discount: data.discountValue || 0,              // Discount value
    discountValue: data.discountValue || 0,         // Discount value (alias)
    discountType: data.discountType || 'fixed',     // 'percent' or 'fixed'
    discountPercent: pricing.discountPercent,       // Calculated discount percentage
    
    // Shipping information
    freeShipping: data.freeShipping || false,
    
    // Additional product details
    isbn: data.isbn || null,
    language: data.language || null,
    pageCount: data.pageCount || null,
    publicationYear: data.publicationYear || null,
    format: data.format || null,
    description: data.description || null,
    
    // Cart specific information
    quantity: validQuantity,
    
    // Rating information (for display purposes)
    averageRating: data.averageRating || 0,
    totalReviews: data.totalReviews || 0,
    
    // Timestamps
    addedToCartAt: new Date().toISOString(),
  };

  // Optional: Add validation to ensure required fields are present
  const validateCartItem = (item) => {
    const requiredFields = ['_id', 'title', 'price', 'quantity'];
    const missingFields = requiredFields.filter(field => 
      item[field] === undefined || item[field] === null
    );
    
    if (missingFields.length > 0) {
      console.error('Missing required cart item fields:', missingFields);
      toast.error(`Error adding item to cart: Missing ${missingFields.join(', ')}`);
      return false;
    }
    
    // Validate quantity
    if (item.quantity <= 0 || item.quantity > item.stock) {
      console.error('Invalid quantity:', item.quantity, 'Stock:', item.stock);
      toast.error('Invalid quantity selected');
      return false;
    }
    
    return true;
  };

  // Validate the cart item before dispatching
  if (!validateCartItem(cartItem)) {
    return;
  }

  // Log cart item for debugging (remove in production)
  console.log('Adding to cart:', cartItem);

  // Dispatch the addToCart action
  try {
    dispatch(addToCart(cartItem));
    
    // Reset quantity to 1 after successful addition
    setQuantity(1);
    
    // Optional: Show additional success message with pricing info
    if (cartItem.discountValue > 0) {
      toast.success(
        `Added "${cartItem.title}" to cart! You saved ৳${
          cartItem.price - cartItem.salePrice
        }`, 
        { autoClose: 2000 }
      );
    }
    
  } catch (error) {
    console.error('Error adding item to cart:', error);
    toast.error('Failed to add item to cart. Please try again.');
  }
};

  const handleBuyNow = () => {
    if (!isInStock) return;

    // Add to cart first
    handleAddToCart();

    // Then navigate to checkout
    navigate("/checkout");
  };

  // Render stock status
  const renderStockStatus = () => {
    if (!isInStock) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-lg">❌</span>
            <span className="text-red-700 font-medium">Out of Stock</span>
          </div>
          <p className="text-red-600 text-sm mt-1">
            This item is currently unavailable
          </p>
        </div>
      );
    }

    if (isLowStock) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-lg">⚠️</span>
            <span className="text-yellow-700 font-medium">Low Stock</span>
          </div>
          <p className="text-yellow-600 text-sm mt-1">
            Only {data.stock} items left in stock!
          </p>
        </div>
      );
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-lg">✅</span>
          <span className="text-green-700 font-medium">In Stock</span>
        </div>
        <p className="text-green-600 text-sm mt-1">
          {data.stock} items available
        </p>
      </div>
    );
  };

  const renderPrice = () => {
    return (
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          {data.discountValue > 0 ? (
            <div className="flex items-center gap-3">
              {/* Sale Price */}
              <div className="flex items-center text-3xl font-bold text-green-600">
                <FaBangladeshiTakaSign className="text-2xl" />
                {Math.ceil(data.salePrice)}
              </div>

              {/* Original Price + Discount Info */}
              <div className="flex flex-col">
                <div className="flex items-center text-lg text-gray-500 line-through">
                  <FaBangladeshiTakaSign className="text-sm" />
                  {data.price}
                </div>

                {/* Discount Label - Fixed to match API */}
                {data.discountType === "percent" ? (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Save {data.discountValue}%
                  </span>
                ) : (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Save ৳{data.discountValue}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* No Discount */
            <div className="flex items-center text-3xl font-bold text-green-600">
              <FaBangladeshiTakaSign className="text-2xl" />
              {data?.price}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDiscount = () => {
    return (
      <>
        <div className="absolute right-4 top-4 z-10 space-y-2">
          {data?.freeShipping && (
            <div className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg shadow-lg backdrop-blur-sm">
              🚚 Free Shipping
            </div>
          )}
        </div>

        {data?.discountValue > 0 && (
          <div className="absolute left-4 top-4 z-10">
            <div className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg shadow-lg backdrop-blur-sm">
              {data.discountType === "percent" ? (
                <>🔥 {data?.discountValue}% OFF</>
              ) : (
                <>💰 ৳{data?.discountValue} OFF</>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const photos = data?.photos || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-xl">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 font-medium">
            Oops! Something went wrong
          </p>
          <p className="text-gray-600 mt-2">
            We couldn't load this product. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Breadcrumb */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-x-3 text-sm py-6">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                🏠 Home
              </Link>
              <FaChevronRight className="w-3 h-3 text-gray-400" />
              <Link
                to="/shop"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                📚 Shop
              </Link>
              <FaChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-gray-700 font-medium line-clamp-1">
                {data?.title}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Product Section */}
      <section className="font-inter py-12 bg-white">
        <div className="container">
          <div className="grid xl:gap-x-12 grid-cols-12">
            <div className="col-span-12 xl:col-span-9">
              <div className="grid md:grid-cols-2 gap-8 xl:gap-12 ">
                {/* Enhanced Image Gallery */}
                <div>
                  <div className="sticky top-20">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                      className="relative bg-gray-50 rounded-2xl p-6"
                    >
                      {renderDiscount()}
                      <PhotoProvider>
                        {photos.length > 0 && (
                          <div className="space-y-4">
                            <Swiper
                              style={{
                                "--swiper-navigation-color": "#3B82F6",
                                "--swiper-navigation-size": "20px",
                              }}
                              loop={true}
                              spaceBetween={10}
                              navigation={true}
                              thumbs={{ swiper: thumbsSwiper }}
                              modules={[FreeMode, Navigation, Thumbs]}
                              className="mySwiper2 w-full h-[650px] rounded-xl overflow-hidden shadow-lg"
                            >
                              {photos.map((item, index) => (
                                <SwiperSlide key={index}>
                                  {index === photos.length - 1 &&
                                  item.includes("youtube.com") ? (
                                    <div className="w-full h-full bg-black rounded-xl overflow-hidden">
                                      <iframe
                                        className="w-full h-full"
                                        src={item}
                                        title="Product Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      ></iframe>
                                    </div>
                                  ) : (
                                    <PhotoView src={item}>
                                      <img
                                        className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300"
                                        src={item}
                                        alt={data?.title}
                                      />
                                    </PhotoView>
                                  )}
                                </SwiperSlide>
                              ))}
                            </Swiper>

                            <Swiper
                              onSwiper={setThumbsSwiper}
                              loop={true}
                              slidesPerView={4}
                              spaceBetween={8}
                              freeMode={true}
                              watchSlidesProgress={true}
                              modules={[FreeMode, Navigation, Thumbs]}
                              className="mySwiper max-h-[120px]"
                            >
                              {photos.map((item, index) => (
                                <SwiperSlide
                                  key={index}
                                  className="cursor-pointer"
                                >
                                  <div className="rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all duration-200">
                                    {index === photos.length - 1 &&
                                    item.includes("youtube.com") ? (
                                      <div className="relative">
                                        <img
                                          className="w-full h-full object-cover"
                                          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkYwMDAwIiByeD0iMTAiLz4KPHN2ZyB4PSIzNSIgeT0iMzAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDE2IiBmaWxsPSJub25lIj4KPHN0eWxlPi5jbHMtMXtmaWxsOiNmZmZ9PC9zdHlsZT4KPHA+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjMuNDk4IDQuMzM1cy0uMjQ2LTEuNzM2LS45OTYtMi41Yy0uOTUzLS45OTctMi4wMjItMS4wMDYtMi41MS0xLjA2NEMxNi41MjIuMTQgMTIgLjE0IDEyIC4xNHMtNC41MjIgMC03Ljk5Mi4xOTFjLS40ODguMDU4LTEuNTU3LjA2Ny0yLjUxIDEuMDY0LS43NSAuNzY0LS45OTYgMi41LS45OTYgMi41UzEgNi4wNiAxIDcuOTR2MS44MjhjMCAzLjI5MS41IDUuNzE4LjUgNS43MThzLjI0NiAxLjczNi45OTYgMi41Yy45NTMuOTk3IDIuMjA2Ljk2OSAyLjc2NCAxLjA3MkMxMC41IDI2Ljg1MiAxMiAyNi45IDEyIDI2LjlzNC41MjMtLjAwNCA3Ljk5Mi0uMTk1Yy40ODgtLjA1OCAxLjU1Ny0uMDY3IDIuNTEtMS4wNjQuNzUtLjc2NC45OTYtMi41Ljk5Ni0yLjVzLjUwMi0yLjQyOC41MDItNS43MThWNy45NHMtLjAwMi0zLjg4LS41LTUuNjA1eiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTkuNTQ1IDEwLjU4N2wzLjc0NC0yLjczNi0zLjc0NC0yLjczNnYyLjczNnoiLz48L3A+PC9zdmc+PC9zdmc+"
                                          alt="Video Thumbnail"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                          <div className="text-white text-2xl">
                                            ▶️
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <img
                                        className="w-full h-full object-cover"
                                        src={item}
                                        alt={`${data?.title} ${index + 1}`}
                                      />
                                    )}
                                  </div>
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </div>
                        )}
                      </PhotoProvider>
                    </motion.div>
                  </div>
                </div>

                {/* Enhanced Product Info */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Title and Author */}
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
                      {data?.title}
                    </h1>
                    {data?.author?.name && (
                      <Link to={`/author/${data?.author?._id}`} className="text-lg text-blue-600 font-medium">
                        ✍️ by {data.author.name}
                      </Link>
                    )}
                  </div>

                  {/* Real Rating Display with instant updates */}
                  <div className="flex items-center gap-3">
                    <StarRating rating={data?.averageRating || 0} readonly />
                    <span className="text-lg font-medium text-gray-900">
                      {data?.averageRating
                        ? data.averageRating.toFixed(1)
                        : "0.0"}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({data?.totalReviews || 0} review
                      {data?.totalReviews !== 1 ? "s" : ""})
                    </span>
                    {/* {data?.totalReviews > 0 && (
                      <motion.span
                        key={`${data.averageRating}-${data.totalReviews}`}
                        initial={{ scale: 1.2, color: "#10B981" }}
                        animate={{ scale: 1, color: "#6B7280" }}
                        transition={{ duration: 0.5 }}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                      >
                        Updated!
                      </motion.span>
                    )} */}
                  </div>

                  {/* Stock Status */}
                  {renderStockStatus()}

                  {/* Price Section */}
                  {renderPrice()}

                  {/* Book Details in Tabs */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex space-x-1 mb-4">
                      {["details", "specs"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === tab
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-gray-600 hover:bg-white hover:text-blue-600"
                          }`}
                        >
                          {tab === "details"
                            ? "📖 Details"
                            : "📋 Specifications"}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {activeTab === "details" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                          {data?.category?.title && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-blue-600">🏷️</span>
                              <span className="font-medium">Category:</span>
                              <span className="text-gray-700">
                                {data.category.title}
                              </span>
                            </div>
                          )}
                          {data?.brand?.title && (
                            <div className="flex items-center gap-2 text-sm">
                              <BsBuilding className="text-blue-600" />
                              <span className="font-medium">Publisher:</span>
                              <span className="text-gray-700">
                                {data.brand.title}
                              </span>
                            </div>
                          )}
                          {data?.language && (
                            <div className="flex items-center gap-2 text-sm">
                              <MdLanguage className="text-blue-600" />
                              <span className="font-medium">Language:</span>
                              <span className="text-gray-700">
                                {data.language}
                              </span>
                            </div>
                          )}
                          {data?.publicationYear && (
                            <div className="flex items-center gap-2 text-sm">
                              <HiOutlineCalendarDays className="text-blue-600" />
                              <span className="font-medium">Published:</span>
                              <span className="text-gray-700">
                                {data.publicationYear}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === "specs" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                          {data?.isbn && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-blue-600">📚</span>
                              <span className="font-medium">ISBN:</span>
                              <span className="text-gray-700 font-mono">
                                {data.isbn}
                              </span>
                            </div>
                          )}
                          {data?.pageCount && (
                            <div className="flex items-center gap-2 text-sm">
                              <RiBook2Line className="text-blue-600" />
                              <span className="font-medium">Pages:</span>
                              <span className="text-gray-700">
                                {data.pageCount}
                              </span>
                            </div>
                          )}
                          {data?.format && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-blue-600">📄</span>
                              <span className="font-medium">Format:</span>
                              <span className="text-gray-700">
                                {data.format}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {data?.description && (
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        📝 Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {data.description}
                      </p>
                    </div>
                  )}

                  {/* Quantity and Add to Cart */}
                  <div className="space-y-4">
                    {isInStock && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">
                          Quantity:
                        </span>
                        <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={handleQuantityDecrease}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            disabled={quantity === 1 || quantity === ""}
                          >
                            <FaMinus className="w-3 h-3" />
                          </button>

                          {/* Enhanced Input Field */}
                          <input
                            type="number"
                            min="1"
                            max={data?.stock}
                            value={quantity}
                            onChange={handleQuantityInputChange}
                            onBlur={handleQuantityInputBlur}
                            onKeyPress={handleQuantityInputKeyPress}
                            className="w-16 h-10 text-center font-medium bg-gray-50 border-0 focus:outline-none focus:bg-blue-50 focus:text-blue-700 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="1"
                          />

                          <button
                            onClick={handleQuantityIncrease}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            disabled={quantity >= data?.stock}
                          >
                            <FaPlus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Enhanced feedback messages */}
                        <div className="flex flex-col text-xs">
                          {quantity >= data?.stock && (
                            <span className="text-orange-600 font-medium">
                              Maximum quantity reached
                            </span>
                          )}
                          {data?.stock <= 10 && data?.stock > 0 && (
                            <span className="text-gray-500">
                              Only {data.stock} left in stock
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleBuyNow}
                        disabled={!isInStock}
                        className={`flex-1 font-semibold py-4 px-6 rounded-xl transition-all duration-300 ${
                          isInStock
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {isInStock ? "🚀 Buy Now" : "❌ Out of Stock"}
                      </button>
                      <button
                        onClick={handleAddToCart}
                        disabled={!isInStock}
                        className={`flex-1 font-semibold py-4 px-6 rounded-xl border-2 transition-all duration-300 ${
                          isInStock
                            ? "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                            : "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {isInStock ? "🛒 Add to Cart" : "❌ Unavailable"}
                      </button>
                    </div>

                    {!isInStock && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg border">
                        <p className="text-gray-600 text-sm">
                          📧 Want to be notified when this item is back in
                          stock?
                          <button className="text-blue-600 hover:text-blue-800 ml-1 underline">
                            Subscribe for updates
                          </button>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Social Share */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                      Share:
                    </span>
                    <div className="flex gap-2">
                      {socialList.slice(0, 4).map((item, index) => {
                        let Icon = item.logo;
                        return (
                          <Link
                            key={index}
                            to={item.link}
                            target="_blanck"
                            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                          >
                            <Icon className="w-4 h-4" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Reviews Section with instant rating updates */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-16"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                    <h2 className="text-2xl font-bold">💬 Customer Reviews</h2>
                    <p className="text-purple-100 mt-1">
                      See what our readers are saying
                    </p>
                  </div>
                  <div className="p-6">
                    <ReviewsSection
                      productId={data?._id}
                      onRatingUpdate={handleRatingUpdate}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="col-span-12 xl:col-span-3 mt-12 xl:mt-0"
            >
              <div className="space-y-6 sticky top-20">
                {/* Related Products */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                    <h3 className="font-semibold">🔍 You might also like</h3>
                  </div>
                  <RightPartProduct productId={data?._id} />
                </div>

                {/* Enhanced Service Features */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4">
                    <h3 className="font-semibold">✨ Why Choose Us</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {serviceList.map((item, index) => {
                      let Icon = item.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className={`text-2xl ${item.color}`}>
                            <Icon />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {item.details}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <RelatedProduct productId={data?._id} />
    </>
  );
};

export default ProductDetail;
