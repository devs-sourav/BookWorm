import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaTimes,
  FaPercent,
  FaTag,
} from "react-icons/fa";
import { FiGrid, FiList, FiRefreshCw } from "react-icons/fi";
import { BiLoader } from "react-icons/bi";
import ProductItem from "../productitem/ProductItem";
import ApiContext from "../baseapi/BaseApi";
import { resetColor } from "../../redux/slices/colorSlice";

const OfferSale = () => {
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
  const [averageDiscount, setAverageDiscount] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);

  const productsPerPage = 20;

  // Redux selectors
  const { minPrice, maxPrice } = useSelector((state) => state.priceRange);
  const selectedSortOption = useSelector(
    (state) => state.sort.selectedSortOption
  );
  const selectedColor = useSelector((state) => state.colors?.selectedColor);

  // Helper function to calculate discount percentage
  const getDiscountPercentage = (product) => {
    if (product.discountType === "percent") {
      return product.discountValue;
    } else if (product.discountType === "amount" && product.price > 0) {
      return Math.round((product.discountValue / product.price) * 100);
    }
    return 0;
  };

  // Helper function to check if product has discount
  const hasDiscount = (product) => {
    return (
      (product.discountType === "percent" || product.discountType === "amount") &&
      product.discountValue > 0
    );
  };

  const getSortParameter = () => {
    switch (selectedSortOption) {
      case "popularity":
        return "-visitCount";
      case "low-to-high":
        return "salePrice";
      case "discount":
        return "discount"; // Will handle client-side sorting
      case "high-to-low":
        return "-salePrice";
      case "discount-percent":
        return "discount"; // Will handle client-side sorting
      case "latest":
        return "-createdAt";
      default:
        return "discount"; // Will handle client-side sorting
    }
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
      if (!query.trim()) {
        setFilteredProducts(allProduct);
      } else {
        const filtered = allProduct.filter(
          (product) =>
            product.title?.toLowerCase().includes(query.toLowerCase()) ||
            product.brand?.title?.toLowerCase().includes(query.toLowerCase()) ||
            product.category?.title?.toLowerCase().includes(query.toLowerCase()) ||
            product.author?.name?.toLowerCase().includes(query.toLowerCase()) ||
            product.description?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProducts(filtered);
      }
      setCurrentPage(1);
      setIsSearching(false);
    }, 300),
    [allProduct]
  );

  useEffect(() => {
    searchProducts(searchQuery);
  }, [searchQuery, searchProducts]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / productsPerPage));
    setTotalProducts(filteredProducts.length);
  }, [filteredProducts]);

  // Enhanced discount calculation
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const discountPercentages = [];

      filteredProducts.forEach((product) => {
        if (hasDiscount(product)) {
          const discountPercentage = getDiscountPercentage(product);
          if (discountPercentage > 0) {
            discountPercentages.push(discountPercentage);
          }
        }
      });

      if (discountPercentages.length > 0) {
        const avgDiscount =
          discountPercentages.reduce((sum, discount) => sum + discount, 0) /
          discountPercentages.length;
        const maxDiscountValue = Math.max(...discountPercentages);

        setAverageDiscount(Math.round(avgDiscount));
        setMaxDiscount(maxDiscountValue);
      } else {
        setAverageDiscount(0);
        setMaxDiscount(0);
      }
    }
  }, [filteredProducts]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sortParam = getSortParameter();
      const params = {
        "price[lt]": maxPrice || 10000,
        "price[gt]": minPrice || 0,
        limit: 100, // Fetch more products to have better filtering options
        // Only add sort param if it's not discount-based (handled client-side)
        ...(sortParam !== "discount" && { sort: sortParam }),
      };

      const response = await axios.get(`${baseApi}/product`, {
        params,
      });

      // Handle the response structure from your API
      let fetchedProducts = [];
      if (response.data.data.discountedProducts) {
        fetchedProducts = response.data.data.discountedProducts;
      } else if (response.data.data.doc) {
        // Filter products that have discounts
        fetchedProducts = response.data.data.doc.filter(product => hasDiscount(product));
      } else if (response.data.data) {
        fetchedProducts = Array.isArray(response.data.data) 
          ? response.data.data.filter(product => hasDiscount(product))
          : [];
      }

      let processedProducts = fetchedProducts.filter((product) => {
        const price = product.salePrice || product.price;
        const priceInRange = price >= (minPrice || 0) && price <= (maxPrice || 10000);
        const hasValidDiscount = hasDiscount(product);
        return priceInRange && hasValidDiscount;
      });

      // Client-side sorting for discount-based options
      if (
        sortParam === "discount" ||
        selectedSortOption === "discount" ||
        selectedSortOption === "discount-percent"
      ) {
        processedProducts.sort((a, b) => {
          const discountA = getDiscountPercentage(a);
          const discountB = getDiscountPercentage(b);
          return discountB - discountA; // Highest discount first
        });
      }

      setAllProduct(processedProducts);
      setFilteredProducts(processedProducts);
    } catch (err) {
      setError("Failed to load discount products. Please try again later.");
      console.error("Error fetching discount products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baseApi) {
      fetchData();
    }
  }, [baseApi, minPrice, maxPrice, selectedSortOption]);

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

  // Loading skeleton component
  const ProductSkeleton = () => (
    <div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[350px]">
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
                ⚡{" "}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Flash Offers
                </span>
              </h1>
              <p className="text-gray-600 mt-1">
                Limited time deals with incredible discounts
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search offers, brands, categories, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
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
                  <BiLoader className="animate-spin text-orange-500" />
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          {!loading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                  <FaPercent className="text-sm" />
                  <span className="text-xs font-medium">MAX DISCOUNT</span>
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  {maxDiscount}%
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                  <FaTag className="text-sm" />
                  <span className="text-xs font-medium">AVG SAVINGS</span>
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {averageDiscount}%
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <span className="text-xs font-medium">TOTAL OFFERS</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {totalProducts}
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <span className="text-xs font-medium">ACTIVE DEALS</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {filteredProducts.filter(hasDiscount).length}
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Results Info */}
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                {loading ? "Loading..." : `${totalProducts} Offers Found`}
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
                      ? "bg-white text-orange-600 shadow-sm"
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
                      ? "bg-white text-orange-600 shadow-sm"
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
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
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
              <FaPercent className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery ? "No offers found" : "No offers available"}
            </h3>
            <p className="text-gray-600 mb-4 max-w-md">
              {searchQuery
                ? `We couldn't find any offers matching "${searchQuery}". Try different search terms.`
                : "There are currently no discount offers available. Check back soon for amazing deals!"}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
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
            {paginatedProducts.map((item, index) => (
              <div
                key={item._id}
                className={`transform transition-all duration-300 hover:scale-105 h-[350px] ${
                  viewMode === "list" ? "hover:scale-100" : ""
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                <div className="h-[350px] w-full">
                  <ProductItem
                    product={item}
                    image={item.photos}
                    id={item._id}
                    subtitle={item.brand?.title || item.author?.name}
                    title={item.title}
                    categoryId={item.category?._id}
                    brandId={item.brand?._id}
                    categoryName={item.category?.title}
                    discount={item.discountValue}
                    discountType={item.discountType}
                    priceAfterDiscount={item.salePrice}
                    freeShipping={item.freeShipping}
                    regularprice={item.price}
                    classItem={
                      viewMode === "list" ? "w-full h-full" : "w-full h-full"
                    }
                    viewMode={viewMode}
                  />
                </div>
              </div>
            ))}
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
          offers
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
              : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-gray-300 hover:border-orange-300"
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
                ? "bg-orange-500 text-white border-orange-500 shadow-md"
                : number === "..."
                ? "bg-transparent text-gray-400 cursor-default border-transparent"
                : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-gray-300 hover:border-orange-300"
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
              : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-gray-300 hover:border-orange-300"
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
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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

export default OfferSale;