import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaTimes,
  FaStar,
  FaClock,
} from "react-icons/fa";
import { FiGrid, FiList, FiRefreshCw, FiTrendingUp } from "react-icons/fi";
import { BiLoader } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi";
import ProductItem from "../productitem/ProductItem";
import ApiContext from "../baseapi/BaseApi";
import { resetColor } from "../../redux/slices/colorSlice";

const LatestSale = () => {
  const baseApi = useContext(ApiContext);
  const dispatch = useDispatch();
  
  // State management
  const [allProduct, setAllProduct] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [isSearching, setIsSearching] = useState(false);
  const [newestProducts, setNewestProducts] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    thisWeek: 0,
    lastWeek: 0,
    trending: 0,
  });

  const productsPerPage = 20;

  // Redux selectors
  const { minPrice, maxPrice } = useSelector((state) => state.priceRange);
  const selectedSortOption = useSelector((state) => state.sort.selectedSortOption);
  const selectedColor = useSelector((state) => state.colors?.selectedColor);

  // Helper function to get the actual price for sorting/filtering
  const getProductPrice = (product) => {
    return product.salePrice || product.price || 0;
  };

  // Client-side sorting function
  const sortProducts = (products, sortOption) => {
    const sortedProducts = [...products];
    
    switch (sortOption) {
      case "low-to-high":
        return sortedProducts.sort((a, b) => getProductPrice(a) - getProductPrice(b));
      
      case "high-to-low":
        return sortedProducts.sort((a, b) => getProductPrice(b) - getProductPrice(a));
      
      case "popularity":
        return sortedProducts.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0));
      
      case "discount":
      case "discount-percent":
        return sortedProducts.sort((a, b) => (b.discountValue || 0) - (a.discountValue || 0));
      
      case "latest":
      default:
        return sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  // Get sort parameter for API (for initial load only)
  const getSortParameter = () => {
    // For initial load, we'll always get latest first, then sort client-side
    return "-createdAt";
  };

  // Debounced search function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const searchProducts = useCallback(
    debounce((query) => {
      setIsSearching(true);
      let filtered = [...allProduct];

      // Apply search filter
      if (query.trim()) {
        filtered = filtered.filter(
          (product) =>
            product.title?.toLowerCase().includes(query.toLowerCase()) ||
            product.brand?.title?.toLowerCase().includes(query.toLowerCase()) ||
            product.category?.title?.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Apply price filter
      filtered = filtered.filter((product) => {
        const price = getProductPrice(product);
        return price >= minPrice && price <= maxPrice;
      });

      // Apply sorting
      filtered = sortProducts(filtered, selectedSortOption);

      setFilteredProducts(filtered);
      setCurrentPage(1);
      setIsSearching(false);
    }, 300),
    [allProduct, minPrice, maxPrice, selectedSortOption]
  );

  useEffect(() => {
    searchProducts(searchQuery);
  }, [searchQuery, searchProducts]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / productsPerPage));
    setTotalProducts(filteredProducts.length);
  }, [filteredProducts]);

  // Calculate weekly statistics
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const thisWeekProducts = filteredProducts.filter((product) => {
        const createdDate = new Date(product.createdAt);
        return createdDate >= oneWeekAgo;
      });

      const lastWeekProducts = filteredProducts.filter((product) => {
        const createdDate = new Date(product.createdAt);
        return createdDate >= twoWeeksAgo && createdDate < oneWeekAgo;
      });

      const trendingProducts = filteredProducts.filter((product) => {
        return product.visitCount > 100 || product.saleNumber > 50;
      });

      setWeeklyStats({
        thisWeek: thisWeekProducts.length,
        lastWeek: lastWeekProducts.length,
        trending: trendingProducts.length,
      });

      // Set newest 5 products
      const sorted = [...filteredProducts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNewestProducts(sorted.slice(0, 5));
    }
  }, [filteredProducts]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sortParam = getSortParameter();
      const params = {
        // Remove price filters from API call to get all products
        ...(sortParam && { sort: sortParam }),
      };

      const response = await axios.get(`${baseApi}/product`, { params });
      const fetchedProducts = response.data.data.doc || [];

      // Store all products without filtering - filtering will happen client-side
      setAllProduct(fetchedProducts);
      
    } catch (err) {
      setError("Failed to load latest products. Please try again later.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baseApi) {
      fetchData();
    }
  }, [baseApi]);

  // Re-apply filters and sorting when dependencies change
  useEffect(() => {
    if (allProduct.length > 0) {
      searchProducts(searchQuery);
    }
  }, [allProduct, minPrice, maxPrice, selectedSortOption]);

  useEffect(() => {
    dispatch(resetColor());
  }, [dispatch]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return totalPages > 1 ? rangeWithDots : [1];
  };

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Calculate days since product creation
  const getDaysAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Loading skeleton component
  const ProductSkeleton = () => (
    <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[380px]">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <FaTimes className="text-red-500 text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FiRefreshCw />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="p-6">
          {/* Title and Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <HiSparkles className="text-purple-500" />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Latest Arrivals
                </span>
              </h1>
              <p className="text-gray-600 mt-1">
                Fresh picks and newest additions to our collection
              </p>
            </div>
            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search latest products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <BiLoader className="animate-spin text-purple-500" />
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          {!loading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <HiSparkles className="text-sm" />
                  <span className="text-xs font-medium">THIS WEEK</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {weeklyStats.thisWeek}
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <FaClock className="text-sm" />
                  <span className="text-xs font-medium">LAST WEEK</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {weeklyStats.lastWeek}
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <FiTrendingUp className="text-sm" />
                  <span className="text-xs font-medium">TRENDING</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {weeklyStats.trending}
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                  <FaStar className="text-sm" />
                  <span className="text-xs font-medium">TOTAL NEW</span>
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  {totalProducts}
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Results Info */}
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                {loading ? "Loading..." : `${totalProducts} Latest Products`}
              </div>
              {searchQuery && (
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                  Searching: "{searchQuery}"
                </div>
              )}
            </div>
            {/* View Controls */}
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  title="List View"
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        {loading ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {Array(12)
              .fill()
              .map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <HiSparkles className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery
                ? "No latest products found"
                : "No new products available"}
            </h3>
            <p className="text-gray-600 mb-4 max-w-md">
              {searchQuery
                ? `We couldn't find any latest products matching "${searchQuery}". Try different search terms.`
                : "No new products have been added recently. Check back soon for fresh arrivals!"}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-5 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
                : "grid-cols-1 max-w-4xl mx-auto"
            }`}
          >
            {paginatedProducts.map((item, index) => {
              const daysAgo = getDaysAgo(item.createdAt);
              return (
                <div
                  key={item._id}
                  className={`relative ${
                    viewMode === "list" ? "" : "transform transition-all duration-300 hover:scale-105"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  {/* New Badge */}
                  {daysAgo <= 7 && (
                    <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <HiSparkles className="text-xs" />
                      {daysAgo === 1 ? "NEW!" : `${daysAgo}d ago`}
                    </div>
                  )}
                 
                  {/* Fixed height container for consistent product heights */}
                  <div className={viewMode === "grid" ? "h-[350px]" : "h-auto"}>
                    <ProductItem
                      product={item}
                      image={item.photos}
                      id={item._id}
                      subtitle={item.brand?.title}
                      title={item.title}
                      categoryId={item.category?._id}
                      brandId={item.brand?._id}
                      categoryName={item.category?.title}
                      discount={item.discountValue}
                      discountType={item.discountType}
                      priceAfterDiscount={item.salePrice}
                      freeShipping={item.freeShipping}
                      regularprice={item.price}
                      classItem="w-full h-full"
                      viewMode={viewMode}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {paginatedProducts.length > 0 && totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            getPageNumbers={getPageNumbers}
            totalProducts={totalProducts}
            productsPerPage={productsPerPage}
          />
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  getPageNumbers,
  totalProducts,
  productsPerPage,
}) => {
  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * productsPerPage + 1;
  const endItem = Math.min(currentPage * productsPerPage, totalProducts);

  return (
    <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-800">{startItem}</span> to{" "}
          <span className="font-semibold text-gray-800">{endItem}</span> of{" "}
          <span className="font-semibold text-gray-800">{totalProducts}</span>{" "}
          latest products
        </div>
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center justify-center space-x-2 flex-wrap gap-y-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-gray-300 hover:border-purple-300"
          }`}
        >
          <FaChevronLeft className="text-sm" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {pageNumbers.map((number, index) => (
          <button
            key={index}
            onClick={() => number !== "..." && onPageChange(number)}
            disabled={number === "..."}
            className={`min-w-[40px] h-10 rounded-lg border transition-all duration-200 ${
              number === currentPage
                ? "bg-purple-500 text-white border-purple-500 shadow-md"
                : number === "..."
                ? "bg-transparent text-gray-400 cursor-default border-transparent"
                : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-gray-300 hover:border-purple-300"
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border-gray-300 hover:border-purple-300"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <FaChevronRight className="text-sm" />
        </button>
      </div>

      {/* Quick Jump */}
      {totalPages > 10 && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Jump to page:</span>
          <select
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default LatestSale;