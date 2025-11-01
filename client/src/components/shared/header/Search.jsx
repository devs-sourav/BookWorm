import React, { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { BiLoader } from "react-icons/bi";
import axios from "axios";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { Link } from "react-router-dom";

const Search = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState("");

  const searchRef = useRef();
  const inputRef = useRef();
  const debounceRef = useRef();
  const suggestionDebounceRef = useRef();

  // Debounced search function for main search
  const debouncedSearch = (query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query.trim().length > 0) {
        fetchProducts(query.trim());
      }
    }, 500);
  };

  // Debounced function for search suggestions
  const debouncedSuggestions = (query) => {
    if (suggestionDebounceRef.current) {
      clearTimeout(suggestionDebounceRef.current);
    }

    suggestionDebounceRef.current = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchSuggestions(query.trim());
      } else {
        setSuggestions([]);
      }
    }, 300);
  };

  // Function to fetch products from the API
  const fetchProducts = async (query) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/search`, {
        params: {
          query,
          limit: 10,
          page: 1,
          sortBy: "relevance",
        },
      });

      const responseData = response.data;
      if (responseData.status === "success") {
        setProducts(responseData.data.products || []);
        setTotalResults(responseData.totalResults || 0);
        setSuggestions([]); // Clear suggestions when showing full results
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.message || "Error searching products");
      setProducts([]);
      setTotalResults(0);
      setLoading(false);
    }
  };

  // Function to fetch search suggestions
  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/search/suggestions`,
        {
          params: {
            query,
            limit: 5,
          },
        }
      );

      const responseData = response.data;
      if (responseData.status === "success") {
        setSuggestions(responseData.data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  // Handle search input changes
  useEffect(() => {
    if (search.length > 0) {
      setShowList(true);
      // Fetch suggestions for short queries, full search for longer ones
      if (search.length >= 2) {
        debouncedSuggestions(search);
      }
      if (search.length >= 3) {
        debouncedSearch(search);
      }
    } else {
      setProducts([]);
      setSuggestions([]);
      setShowList(false);
      setLoading(false);
      setError("");
      setTotalResults(0);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (suggestionDebounceRef.current) {
        clearTimeout(suggestionDebounceRef.current);
      }
    };
  }, [search]);

  // Save search to history
  const saveToHistory = (query) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory.slice(0, 4)];
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
  };

  // Load search history on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Error parsing search history:", error);
        setSearchHistory([]);
      }
    }
  }, []);

  // Function to handle product click
  const handleProductClick = (productTitle) => {
    saveToHistory(search);
    setSearch("");
    setShowList(false);
    setIsSearchOpen(false);
  };

  // Function to handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion);
    debouncedSearch(suggestion);
    setSuggestions([]);
  };

  // Function to open search bar
  const handleSearchOpen = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 350);
  };

  // Function to close search bar
  const handleSearchClose = () => {
    if (search.trim()) {
      saveToHistory(search);
    }
    setSearch("");
    setShowList(false);
    setIsSearchOpen(false);
    setProducts([]);
    setSuggestions([]);
    setError("");
    setTotalResults(0);
  };

  // Handle clicks outside of the search input and product list
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowList(false);
        if (search === "") {
          setIsSearchOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [search]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        if (!isSearchOpen) {
          handleSearchOpen();
        }
      }
      // Escape to close
      if (event.key === "Escape") {
        handleSearchClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    setSearch(historyItem);
    debouncedSearch(historyItem);
    setShowList(true);
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  // Calculate discount percentage
  const getDiscountPercentage = (product) => {
    if (product.discountType === "percent") {
      return product.discountValue;
    } else if (product.discountType === "amount" && product.price > 0) {
      return Math.round((product.discountValue / product.price) * 100);
    }
    return 0;
  };

  return (
    <div ref={searchRef} className="relative lg:flex hidden items-center">
      {/* Search Icon Trigger */}
      {!isSearchOpen && (
        <div
          onClick={handleSearchOpen}
          className="group cursor-pointer p-2 bg-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105"
          title="Search books (Ctrl+K)"
        >
          <CiSearch className="text-2xl text-black group-hover:text-gray-200 transition-colors duration-200" />
        </div>
      )}

      {/* Backdrop overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleSearchClose}
        />
      )}

      {/* Search Input Container */}
      <div
        className={`fixed top-0 right-0 h-screen bg-white shadow-2xl transition-all duration-500 ease-out z-50 ${
          isSearchOpen
            ? "w-[400px] lg:w-[450px] xl:w-[500px] translate-x-0"
            : "w-0 translate-x-full"
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Books
              </h3>
              <button
                onClick={handleSearchClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
                title="Close (Esc)"
              >
                <IoClose className="text-xl text-gray-500 group-hover:text-gray-700" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                ref={inputRef}
                placeholder="Search for books, authors, ISBN, categories..."
                className="w-full bg-white hover:bg-gray-50 focus:bg-white border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 px-12 py-3 outline-none rounded-xl text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <CiSearch className="text-xl text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <IoClose className="text-lg text-gray-500" />
                </button>
              )}
            </div>

            {/* Quick Stats */}
            {search && !loading && !error && (
              <div className="mt-3 text-sm text-gray-600">
                {products.length > 0
                  ? `Found ${totalResults} book${
                      totalResults === 1 ? "" : "s"
                    } (showing ${products.length})`
                  : totalResults === 0 && search.length >= 3
                  ? "No books found"
                  : suggestions.length > 0
                  ? `${suggestions.length} suggestions`
                  : ""}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading State */}
            {loading && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-4">
                  <BiLoader className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
                <p className="text-gray-600 font-medium">Searching books...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Please wait a moment
                </p>
              </div>
            )}

            {/* Suggestions (shown for short queries) */}
            {search &&
              search.length >= 2 &&
              search.length < 3 &&
              suggestions.length > 0 &&
              !loading && (
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 px-2">
                    Suggestions
                  </h4>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 group"
                      >
                        <CiSearch className="text-gray-400 group-hover:text-gray-600" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {suggestion}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Search Results */}
            {search && search.length >= 3 && showList && !loading && !error && (
              <div className="p-4">
                {products.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 px-2">
                      Search Results
                    </h4>
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="group rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                        onClick={() => handleProductClick(product?.title)}
                      >
                        <Link
                          className="flex items-center gap-4 p-4"
                          to={`/productdetail/${product._id}`}
                        >
                          <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                            <img
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              src={product?.photos?.[0]}
                              alt={product?.title || "Book"}
                              onError={(e) => {
                                e.target.src = "/api/placeholder/64/64";
                              }}
                            />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors duration-200">
                              {product?.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              by {product?.author?.name || "Unknown Author"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                <FaBangladeshiTakaSign className="text-xs text-green-600" />
                                <span className="text-sm font-semibold text-green-600">
                                  {product?.salePrice ||
                                    product?.price ||
                                    "N/A"}
                                </span>
                              </div>
                              {product?.discountType !== "none" &&
                                product?.discountValue > 0 && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                    {product.discountType === "amount" ? (
                                      <>
                                        <FaBangladeshiTakaSign className="inline text-[10px]" />
                                        {product.discountValue} off
                                      </>
                                    ) : (
                                      `${product.discountValue}% off`
                                    )}
                                  </span>
                                )}
                            </div>
                            {product?.format && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {product.format}
                                </span>
                                {product?.stock && product.stock < 5 && (
                                  <span className="text-xs text-orange-600">
                                    Only {product.stock} left
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CiSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      No books found
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search terms
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>• Check spelling</p>
                      <p>• Use fewer keywords</p>
                      <p>• Try searching by author or ISBN</p>
                      <p>• Use more general terms</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Search History & Suggestions */}
            {!search && !loading && (
              <div className="p-4">
                {searchHistory.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 px-2">
                        Recent Searches
                      </h4>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-1">
                      {searchHistory.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleHistoryClick(item)}
                          className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 group"
                        >
                          <CiSearch className="text-gray-400 group-hover:text-gray-600" />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">
                            {item}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Tips */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Search Tips
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>
                        Use{" "}
                        <kbd className="px-2 py-1 bg-white rounded text-xs border">
                          Ctrl+K
                        </kbd>{" "}
                        to quickly open search
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>
                        Search by book title, author, ISBN, or category
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>
                        Try formats like "Hardcover", "Paperback", "eBook"
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span>
                        Press{" "}
                        <kbd className="px-2 py-1 bg-white rounded text-xs border">
                          Esc
                        </kbd>{" "}
                        to close
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
