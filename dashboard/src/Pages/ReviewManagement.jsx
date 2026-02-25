import React, { useState, useEffect } from 'react';
import { Star, Trash2, ThumbsUp, Eye, User, Book, Search, AlertTriangle } from 'lucide-react';

// API service for backend integration
const API_BASE = 'https://bookwormm.netlify.app/api/v1';

const apiService = {
  // Get all products
  getProducts: async () => {
    try {
      const response = await fetch(`${API_BASE}/product`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error - getProducts:', error);
      throw error;
    }
  },

  // Get product reviews
  getProductReviews: async (productId, params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/review/product/${productId}?${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error - getProductReviews:', error);
      throw error;
    }
  },
  
  // Get product stats
  getProductStats: async (productId) => {
    try {
      const response = await fetch(`${API_BASE}/review/product/${productId}/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error - getProductStats:', error);
      throw error;
    }
  },
  
  // Delete review (with user validation)
  deleteReview: async (reviewId, data) => {
    try {
      const response = await fetch(`${API_BASE}/review/${reviewId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error - deleteReview:', error);
      throw error;
    }
  },

  // Delete review by ID (Admin/System power - no user validation)
  deleteReviewById: async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE}/review/delete/${reviewId}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Error - deleteReviewById:', error);
      throw error;
    }
  }
};

// Star Rating Component
const StarRating = ({ rating, readonly = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// Product Selector Component
const ProductSelector = ({ products, selectedProduct, onSelect, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium text-gray-900">Select Product:</h3>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Failed to load products</div>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                onClick={() => onSelect(product)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedProduct?._id === product._id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={product.photos[0]}
                    alt={product.title}
                    className="w-12 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA0OCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMyNi4yMDkxIDMyIDI4IDMwLjIwOTEgMjggMjhDMjggMjUuNzkwOSAyNi4yMDkxIDI0IDI0IDI0QzIxLjc5MDkgMjQgMjAgMjUuNzkwOSAyMCAyOEMyMCAzMC4yMDkxIDIxLjc5MDkgMzIgMjQgMzJaIiBmaWxsPSIjOUI5QjlCIi8+CjwvZz4KPC9zdmc+';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {product.title}
                    </h4>
                    <p className="text-xs text-gray-600">by {product.author.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <StarRating rating={product.averageRating || 0} size="sm" />
                      <span className="text-xs text-gray-500">
                        ({product.totalReviews || 0})
                      </span>
                    </div>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      ৳{product.salePrice}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? `No products found for "${searchTerm}"` : 'No products available'}
          </div>
        )}
        
        {selectedProduct && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900">Selected Product:</h4>
            <p className="text-blue-800">{selectedProduct.title} by {selectedProduct.author.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Rating Statistics Component
const RatingStats = ({ stats }) => {
  if (!stats) return null;

  const { averageRating, totalReviews, ratingDistribution, percentageDistribution } = stats;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-500 mb-2">
            {averageRating ? averageRating.toFixed(1) : '0.0'}
          </div>
          <StarRating rating={averageRating || 0} size="lg" />
          <div className="text-gray-500 mt-2">{totalReviews || 0} reviews</div>
        </div>
        <div className="col-span-2">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center space-x-3">
                <span className="w-8 text-sm font-medium">{star}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentageDistribution?.[star] || 0}%` }}
                  />
                </div>
                <span className="w-20 text-sm text-gray-600 text-right">
                  {ratingDistribution?.[star] || 0} ({percentageDistribution?.[star] || 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Review Item Component
const ReviewItem = ({ review, onDelete, onForceDelete }) => {
  // Mock user data for demonstration (replace with actual state)
  const user = {
    _id: 'mock-user-id',
    name: 'Demo User',
    role: 'aklogicAdmin' // Change to see admin actions
  };
  
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      onDelete(review._id);
    }
  };

  const handleForceDelete = async () => {
    if (window.confirm('⚠️ ADMIN ACTION: This will permanently delete the review without user validation. Are you sure?')) {
      setForceDeleteLoading(true);
      try {
        const result = await apiService.deleteReviewById(review._id);
        if (result.success) {
          alert(`Review deleted successfully. Product ${result.data.productId} rating updated.`);
          onForceDelete();
        } else {
          alert(result.message || 'Failed to delete review');
        }
      } catch (error) {
        console.error('Force delete error:', error);
        alert('An error occurred while deleting the review');
      } finally {
        setForceDeleteLoading(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</div>
            <div className="text-sm text-gray-500">
              {review.timeAgo || new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <StarRating rating={review.rating} size="sm" />
          {review.isVerifiedPurchase && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Verified Purchase
            </span>
          )}
          {review.hasOwnProperty('isApproved') && !review.isApproved && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              Pending Approval
            </span>
          )}
        </div>
      </div>

      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      )}

      {review.comment && (
        <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">Helpful ({review.helpfulVotes || 0})</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Standard Delete - with user validation */}
          <button
            onClick={handleDelete}
            className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
          
          {/* Admin Force Delete - No user validation required */}
          {user.role === 'aklogicAdmin' && (
            <button
              onClick={handleForceDelete}
              disabled={forceDeleteLoading}
              className="flex items-center space-x-1 text-red-800 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Admin: Force delete without user validation"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {forceDeleteLoading ? 'Deleting...' : 'Force Delete'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Review Management Component
const ReviewManagement = () => {
  // Mock state for demonstration (replace with actual authentication)
  const isAuthenticated = true;
  const user = {
    _id: 'mock-user-id',
    name: 'Demo User',
    role: 'aklogicAdmin' // Change to 'user' to see normal user features
  };
  
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    rating: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const result = await apiService.getProducts();
      
      if (result.status === 'success' && result.data && result.data.doc) {
        setProducts(result.data.doc);
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProductsError(error.message || 'Failed to fetch products. Please check your connection.');
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchProductReviews = async (product = selectedProduct, params = filters) => {
    if (!product) return;
    
    setLoading(true);
    try {
      const result = await apiService.getProductReviews(product._id, params);
      if (result.success) {
        setProductReviews(result.data.reviews || []);
        setProductStats(result.data.ratingStats);
        setPagination({
          current: result.data.pagination?.currentPage || 1,
          pageSize: result.data.pagination?.limit || 10,
          total: result.data.pagination?.totalReviews || 0
        });
      } else {
        // Handle case where there are no reviews yet
        setProductReviews([]);
        setProductStats(null);
        setPagination({ current: 1, pageSize: 10, total: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      // Don't show alert for API errors, just log and reset state
      setProductReviews([]);
      setProductStats(null);
      setPagination({ current: 1, pageSize: 10, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      fetchProductReviews();
    }
  }, [filters, selectedProduct]);

  const handleDelete = async (reviewId) => {
    try {
      const result = await apiService.deleteReview(reviewId, { 
        userId: user._id,
        userRole: user.role 
      });
      if (result.success) {
        alert(result.message || 'Review deleted successfully');
        fetchProductReviews();
      } else {
        alert(result.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the review');
    }
  };

  const handleForceDelete = () => {
    // Refresh the reviews after force delete
    fetchProductReviews();
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setProductReviews([]);
    setProductStats(null);
    setPagination({ current: 1, pageSize: 10, total: 0 });
  };

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the review management system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Management</h1>
        <p className="text-gray-600">View and manage product reviews</p>
        <div className="mt-2 text-sm text-gray-500">
          Welcome, {user?.name} ({user?.role})
        </div>
      </div>

      <div className="space-y-6">
        {/* Product Selector */}
        <ProductSelector
          products={products}
          selectedProduct={selectedProduct}
          onSelect={handleProductSelect}
          loading={productsLoading}
          error={productsError}
        />

        {selectedProduct && (
          <>
            {/* Product Header */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium">
                Reviews for "{selectedProduct.title}"
              </h3>
            </div>

            {/* Rating Statistics */}
            <RatingStats stats={productStats} />

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-4 flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Rating:</span>
                  <select
                    value={filters.rating || ''}
                    onChange={(e) => handleFilterChange('rating', e.target.value || null)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All ratings</option>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>{rating} stars</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Sort by:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="createdAt">Date</option>
                    <option value="rating">Rating</option>
                    <option value="helpfulVotes">Helpful Votes</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Order:</span>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading reviews...</p>
                </div>
              ) : productReviews.length > 0 ? (
                <>
                  {productReviews.map(review => (
                    <ReviewItem
                      key={review._id}
                      review={review}
                      onDelete={handleDelete}
                      onForceDelete={handleForceDelete}
                    />
                  ))}
                  {/* Pagination */}
                  {pagination.total > pagination.pageSize && (
                    <div className="flex justify-center items-center space-x-4 mt-8">
                      <button
                        onClick={() => handleFilterChange('page', Math.max(1, pagination.current - 1))}
                        disabled={pagination.current === 1}
                        className="px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-gray-600">
                        Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
                      </span>
                      <button
                        onClick={() => handleFilterChange('page', Math.min(Math.ceil(pagination.total / pagination.pageSize), pagination.current + 1))}
                        disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                        className="px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                  <p className="text-gray-600">This product doesn't have any reviews yet.</p>
                </div>
              )}
            </div>
          </>
        )}

        {!selectedProduct && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Product</h3>
            <p className="text-gray-600">Choose a product from above to view its reviews.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;