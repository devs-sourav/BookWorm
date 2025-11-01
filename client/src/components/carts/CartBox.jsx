import React, { useState, useEffect } from "react";
import Containar from "../../layouts/Containar";
import { HiOutlineShoppingBag, HiOutlineTrash } from "react-icons/hi2";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  decrementQuantity,
  deleteFromCart,
  incrementQuantity,
  resetCart,
  updateItemStock,
  updateQuantity, // Make sure this action exists in your Redux slice
} from "../../redux/slices/cartSlices";
import { PiPercentBold } from "react-icons/pi";
import { IoInformationCircle, IoWarning } from "react-icons/io5";
import { BsBookmark } from "react-icons/bs";

const CartBox = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [stockLoading, setStockLoading] = useState({});
  const [stockErrors, setStockErrors] = useState({});
  const [outOfStockItems, setOutOfStockItems] = useState(new Set());
  const [editingQuantity, setEditingQuantity] = useState({});
  const [tempQuantities, setTempQuantities] = useState({});
  const { user, isAuthenticated } = useSelector((state) => state.auth);

const navigate = useNavigate();

  //  useEffect(() => {
  //   if (!isAuthenticated || !user) {
  //     navigate("/login");
  //   }
  // }, [isAuthenticated, user, navigate]);


  // Function to fetch current stock for a product
  const fetchProductStock = async (productId) => {
    try {
      setStockLoading((prev) => ({ ...prev, [productId]: true }));
      setStockErrors((prev) => ({ ...prev, [productId]: null }));

      const response = await fetch(
        `http://localhost:8000/api/v1/product/${productId}`
      );
      const data = await response.json();

      if (data.status === "success" && data.data.product) {
        const currentStock = data.data.product.stock;
        const isActive = data.data.product.isActive;

        // Update stock in Redux store
        dispatch(
          updateItemStock({ _id: productId, stock: currentStock, isActive })
        );

        // Track out of stock items
        setOutOfStockItems((prev) => {
          const newSet = new Set(prev);
          if (currentStock === 0 || !isActive) {
            newSet.add(productId);
          } else {
            newSet.delete(productId);
          }
          return newSet;
        });

        return { stock: currentStock, isActive };
      } else {
        throw new Error("Failed to fetch product data");
      }
    } catch (error) {
      console.error(`Error fetching stock for product ${productId}:`, error);
      setStockErrors((prev) => ({
        ...prev,
        [productId]: "Failed to check stock availability",
      }));
      return null;
    } finally {
      setStockLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Function to check stock for all cart items
  const checkAllStocks = async () => {
    const promises = cartItems.map((item) => fetchProductStock(item._id));
    await Promise.all(promises);
  };

  // Initial stock check when component mounts
  useEffect(() => {
    if (cartItems.length > 0) {
      checkAllStocks();
    }
  }, []); // Only run once on mount

  // Periodic stock check every 30 seconds
  useEffect(() => {
    if (cartItems.length === 0) return;

    const interval = setInterval(() => {
      checkAllStocks();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [cartItems.length]);

  // Handle quantity increment with stock validation
  const handleIncrementQuantity = async (item) => {
    // First check current stock
    const stockData = await fetchProductStock(item._id);

    if (stockData && stockData.isActive) {
      if (item.quantity < stockData.stock) {
        dispatch(incrementQuantity({ _id: item._id }));
      }
    }
  };

  // Handle manual quantity input
  const handleQuantityInputClick = (itemId, currentQuantity) => {
    setEditingQuantity(prev => ({ ...prev, [itemId]: true }));
    setTempQuantities(prev => ({ ...prev, [itemId]: currentQuantity.toString() }));
  };

  const handleQuantityInputChange = (itemId, value) => {
    // Allow only numbers and empty string
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setTempQuantities(prev => ({ ...prev, [itemId]: value }));
    }
  };

  const handleQuantityInputBlur = async (item) => {
    const tempValue = tempQuantities[item._id];
    let newQuantity = parseInt(tempValue) || 1;

    // Validate quantity bounds
    if (newQuantity < 1) {
      newQuantity = 1;
    }

    // Check stock availability
    const stockData = await fetchProductStock(item._id);
    if (stockData && stockData.isActive) {
      if (newQuantity > stockData.stock) {
        newQuantity = stockData.stock;
      }
    }

    // Update quantity in Redux if changed
    if (newQuantity !== item.quantity) {
      dispatch(updateQuantity({ _id: item._id, quantity: newQuantity }));
    }

    // Reset editing state
    setEditingQuantity(prev => ({ ...prev, [item._id]: false }));
    setTempQuantities(prev => ({ ...prev, [item._id]: '' }));
  };

  const handleQuantityInputKeyPress = (e, item) => {
    if (e.key === 'Enter') {
      handleQuantityInputBlur(item);
    } else if (e.key === 'Escape') {
      // Cancel editing
      setEditingQuantity(prev => ({ ...prev, [item._id]: false }));
      setTempQuantities(prev => ({ ...prev, [item._id]: '' }));
    }
  };

  // Calculate totals
  const totalItems = cartItems.reduce(
    (total, item) => total + item?.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (item?.discountValue > 0 ? Math.ceil(item?.salePrice) : item?.price) *
        item?.quantity,
    0
  );

  const originalTotal = cartItems.reduce(
    (total, item) => total + item?.price * item?.quantity,
    0
  );

  const totalSavings = originalTotal - subtotal;

  const handleClearCart = () => {
    dispatch(resetCart());
    setShowClearConfirm(false);
    setOutOfStockItems(new Set());
    setStockErrors({});
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("bn-BD").format(Math.ceil(price));
  };

  // Filter available items (in stock and active)
  const availableItems = cartItems.filter(
    (item) => !outOfStockItems.has(item._id) && item.stock > 0
  );
  const unavailableItems = cartItems.filter(
    (item) => outOfStockItems.has(item._id) || item.stock === 0
  );

  // Quantity Input Component
  const QuantityInput = ({ item, isMobile = false }) => {
    const isEditing = editingQuantity[item._id];
    const tempValue = tempQuantities[item._id] || '';

    return (
      <div className={`flex items-center ${isMobile ? 'bg-gray-100 rounded-lg' : 'bg-gray-100 rounded-xl border-2 border-gray-200'} overflow-hidden`}>
        <button
          onClick={() => dispatch(decrementQuantity({ _id: item._id }))}
          className={`${isMobile ? 'p-2' : 'p-3'} hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={item.quantity <= 1}
        >
          <FaMinus size={isMobile ? 10 : 12} className="text-gray-700" />
        </button>
        
        {isEditing ? (
          <input
            type="text"
            value={tempValue}
            onChange={(e) => handleQuantityInputChange(item._id, e.target.value)}
            onBlur={() => handleQuantityInputBlur(item)}
            onKeyDown={(e) => handleQuantityInputKeyPress(e, item)}
            className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-lg'} font-bold ${isMobile ? 'min-w-[60px]' : 'min-w-[70px]'} text-center bg-white border-none outline-none focus:ring-2 focus:ring-blue-500`}
            autoFocus
            placeholder="Qty"
          />
        ) : (
          <button
            onClick={() => handleQuantityInputClick(item._id, item.quantity)}
            className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-lg'} font-bold ${isMobile ? 'min-w-[60px]' : 'min-w-[70px]'} text-center bg-white hover:bg-blue-50 transition-colors cursor-pointer`}
            title="Click to edit quantity"
          >
            {item.quantity}
          </button>
        )}
        
        <button
          onClick={() => handleIncrementQuantity(item)}
          className={`${isMobile ? 'p-2' : 'p-3'} hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={item.quantity >= item.stock || stockLoading[item._id]}
        >
          <FaPlus size={isMobile ? 10 : 12} className="text-gray-700" />
        </button>
      </div>
    );
  };

  return (
    <section className="bg-gray-100 min-h-screen">
      <Containar>
        {cartItems.length > 0 ? (
          <div className="py-6 lg:py-10">
            {/* Enhanced Header */}
            <div className="mb-8 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <HiOutlineShoppingBag className="text-blue-600" size={24} />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Shopping Cart
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                {totalItems} {totalItems === 1 ? "book" : "books"} selected for
                purchase
              </p>
              {unavailableItems.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                  <div className="flex items-center">
                    <IoWarning className="text-amber-600 mr-2" size={20} />
                    <p className="text-amber-800">
                      {unavailableItems.length} item(s) in your cart are
                      currently out of stock or unavailable
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Desktop Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-gradient-to-r from-blue-200 to-white border-b font-semibold text-gray-700 text-sm">
                    <div className="col-span-1"></div>
                    <div className="col-span-5">Book Details</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-3">Quantity</div>
                    <div className="col-span-1">Subtotal</div>
                  </div>

                  {/* Available Items */}
                  {availableItems.map((item, index) => (
                    <div
                      key={item._id}
                      className={`${
                        index !== availableItems.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      } hover:bg-gray-50 transition-colors duration-200`}
                    >
                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-6 items-center">
                        <div className="col-span-1">
                          <button
                            onClick={() =>
                              dispatch(deleteFromCart({ _id: item._id }))
                            }
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full group"
                            title="Remove from cart"
                          >
                            <RxCross2
                              size={18}
                              className="group-hover:scale-110 transition-transform"
                            />
                          </button>
                        </div>

                        <div className="col-span-5">
                          <div className="flex gap-5 items-center">
                            <div className="relative w-24 h-32 flex-shrink-0 group">
                              <img
                                className="w-full h-full object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300"
                                src={item?.photos[0]}
                                alt={item?.title}
                                onError={(e) => {
                                  e.target.src = "/placeholder-book.jpg";
                                }}
                              />
                              {item?.discountValue > 0 && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md">
                                  {item?.discountType === "amount" ? (
                                    <span className="flex items-center gap-0.5">
                                      <FaBangladeshiTakaSign size={8} />
                                      {item?.discountValue}
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5">
                                      {item?.discountValue}
                                      <PiPercentBold size={8} />
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full p-1">
                                <BsBookmark
                                  className="text-blue-600"
                                  size={12}
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">
                                <Link
                                  to={`/productdetail/${item?._id}`}
                                  className="hover:text-blue-600 transition-colors hover:underline"
                                >
                                  {item?.title}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-600 mb-2 font-medium">
                                by {item?.author?.name}
                              </p>
                              <div className="flex items-center gap-6 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                                <span className="flex items-center gap-1">
                                  <span className="font-semibold">ISBN:</span>{" "}
                                  {item?.isbn}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-semibold">Format:</span>{" "}
                                  {item?.format}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-semibold">
                                    Language:
                                  </span>{" "}
                                  {item?.language}
                                </span>
                              </div>
                              {/* Stock Status */}
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs font-medium">
                                  Stock:
                                  <span
                                    className={`ml-1 ${
                                      item.stock <= 5
                                        ? "text-amber-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {stockLoading[item._id]
                                      ? "Checking..."
                                      : `${item.stock} available`}
                                  </span>
                                </span>
                                {stockErrors[item._id] && (
                                  <span className="text-xs text-red-500">
                                    {stockErrors[item._id]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="flex flex-col items-start">
                            {item?.discountValue > 0 ? (
                              <>
                                <span className="font-bold text-blue-600 text-lg flex items-center gap-1">
                                  <FaBangladeshiTakaSign size={14} />
                                  {formatPrice(item?.salePrice)}
                                </span>
                                <span className="text-sm text-gray-400 line-through flex items-center gap-1">
                                  <FaBangladeshiTakaSign size={10} />
                                  {formatPrice(item?.price)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-gray-900 text-lg flex items-center gap-1">
                                <FaBangladeshiTakaSign size={14} />
                                {formatPrice(item?.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-3">
                          <div className="flex items-center gap-4">
                            <QuantityInput item={item} />
                            {item.quantity >= item.stock && (
                              <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
                                Max stock
                              </span>
                            )}
                            {item.stock <= 5 && item.stock > 0 && (
                              <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                                Low stock
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-1">
                          <span className="font-bold text-gray-900 text-xl flex items-center gap-1">
                            <FaBangladeshiTakaSign size={16} />
                            {formatPrice(
                              (item?.discountValue > 0
                                ? item?.salePrice
                                : item?.price) * item.quantity
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Layout for Available Items */}
                      <div className="md:hidden p-6">
                        <div className="flex gap-4">
                          <div className="relative w-20 h-28 flex-shrink-0">
                            <img
                              className="w-full h-full object-cover rounded-lg shadow-md"
                              src={item?.photos[0]}
                              alt={item?.title}
                              onError={(e) => {
                                e.target.src = "/placeholder-book.jpg";
                              }}
                            />
                            {item?.discountValue > 0 && (
                              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                                {item?.discountType === "amount" ? (
                                  <span>৳{item?.discountValue}</span>
                                ) : (
                                  <span>{item?.discountValue}%</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-gray-900 text-sm leading-tight">
                                <Link
                                  to={`/productdetail/${item?._id}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {item?.title}
                                </Link>
                              </h3>
                              <button
                                onClick={() =>
                                  dispatch(deleteFromCart({ _id: item._id }))
                                }
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2"
                              >
                                <RxCross2 size={16} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 font-medium">
                              by {item?.author?.name}
                            </p>

                            {/* Stock info for mobile */}
                            <div className="mb-3 flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Stock:
                                <span
                                  className={`ml-1 ${
                                    item.stock <= 5
                                      ? "text-amber-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {stockLoading[item._id]
                                    ? "Checking..."
                                    : `${item.stock} left`}
                                </span>
                              </span>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                              <div className="flex flex-col">
                                {item?.discountValue > 0 ? (
                                  <>
                                    <span className="font-bold text-blue-600 flex items-center gap-1">
                                      <FaBangladeshiTakaSign size={10} />
                                      {formatPrice(item?.salePrice)}
                                    </span>
                                    <span className="text-xs text-gray-400 line-through flex items-center gap-1">
                                      <FaBangladeshiTakaSign size={8} />
                                      {formatPrice(item?.price)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-bold text-gray-900 flex items-center gap-1">
                                    <FaBangladeshiTakaSign size={10} />
                                    {formatPrice(item?.price)}
                                  </span>
                                )}
                              </div>

                              <QuantityInput item={item} isMobile={true} />
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                              <span className="text-sm text-gray-600 font-medium">
                                Item Total:
                              </span>
                              <span className="font-bold text-gray-900 text-lg flex items-center gap-1">
                                <FaBangladeshiTakaSign size={12} />
                                {formatPrice(
                                  (item?.discountValue > 0
                                    ? item?.salePrice
                                    : item?.price) * item.quantity
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Unavailable Items Section */}
                  {unavailableItems.length > 0 && (
                    <div className="bg-gray-50 border-t-2 border-gray-200">
                      <div className="px-8 py-4 bg-gray-100 border-b">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                          <IoWarning className="text-amber-500" size={20} />
                          Unavailable Items ({unavailableItems.length})
                        </h3>
                      </div>

                      {unavailableItems.map((item, index) => (
                        <div
                          key={item._id}
                          className={`${
                            index !== unavailableItems.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          } opacity-60`}
                        >
                          {/* Desktop Layout for Unavailable Items */}
                          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-6 items-center">
                            <div className="col-span-1">
                              <button
                                onClick={() =>
                                  dispatch(deleteFromCart({ _id: item._id }))
                                }
                                className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full group"
                                title="Remove from cart"
                              >
                                <RxCross2
                                  size={18}
                                  className="group-hover:scale-110 transition-transform"
                                />
                              </button>
                            </div>

                            <div className="col-span-11">
                              <div className="flex gap-5 items-center">
                                <div className="relative w-24 h-32 flex-shrink-0">
                                  <img
                                    className="w-full h-full object-cover rounded-xl shadow-md grayscale"
                                    src={item?.photos[0]}
                                    alt={item?.title}
                                    onError={(e) => {
                                      e.target.src = "/placeholder-book.jpg";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-red-500/20 rounded-xl flex items-center justify-center">
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                                      OUT OF STOCK
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-700 mb-2 text-lg leading-tight">
                                    {item?.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 mb-2">
                                    by {item?.author?.name}
                                  </p>
                                  <div className="flex items-center gap-4">
                                    <span className="text-red-600 font-medium text-sm bg-red-50 px-3 py-1 rounded-full">
                                      Currently unavailable
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Mobile Layout for Unavailable Items */}
                          <div className="md:hidden p-6">
                            <div className="flex gap-4">
                              <div className="relative w-20 h-28 flex-shrink-0">
                                <img
                                  className="w-full h-full object-cover rounded-lg shadow-md grayscale"
                                  src={item?.photos[0]}
                                  alt={item?.title}
                                  onError={(e) => {
                                    e.target.src = "/placeholder-book.jpg";
                                  }}
                                />
                                <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                  <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded font-bold">
                                    OUT
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-gray-700 text-sm leading-tight">
                                    {item?.title}
                                  </h3>
                                  <button
                                    onClick={() =>
                                      dispatch(
                                        deleteFromCart({ _id: item._id })
                                      )
                                    }
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2"
                                  >
                                    <RxCross2 size={16} />
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                  by {item?.author?.name}
                                </p>
                                <div className="flex justify-between items-center">
                                  <span className="text-red-600 font-medium text-xs bg-red-50 px-2 py-1 rounded">
                                    Out of Stock
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enhanced Cart Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="flex items-center gap-3 px-6 bg-white shadow-md py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 font-medium group"
                    >
                      <HiOutlineTrash
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                      Clear All Items
                    </button>

                    <button
                      onClick={checkAllStocks}
                      className="flex items-center gap-3 px-6 bg-white shadow-md py-3 border-2 border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 font-medium"
                      disabled={Object.values(stockLoading).some(Boolean)}
                    >
                      <IoInformationCircle size={18} />
                      {Object.values(stockLoading).some(Boolean)
                        ? "Checking..."
                        : "Refresh Stock"}
                    </button>
                  </div>

                  <Link
                    to="/shop"
                    className="px-8 py-3 bg-gradient-to-r from-white to-white text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Enhanced Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Order Summary
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-2"></div>
                  </div>

                  <div className="space-y-5 mb-8">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Available Items (
                        {availableItems.reduce(
                          (total, item) => total + item.quantity,
                          0
                        )}
                        )
                      </span>
                      <span className="flex items-center gap-1 font-bold text-gray-900">
                        <FaBangladeshiTakaSign size={14} />
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    {unavailableItems.length > 0 && (
                      <div className="flex justify-between items-center py-2 text-gray-500 text-sm">
                        <span>
                          Unavailable Items (
                          {unavailableItems.reduce(
                            (total, item) => total + item.quantity,
                            0
                          )}
                          )
                        </span>
                        <span>Not counted</span>
                      </div>
                    )}

                    {totalSavings > 0 && (
                      <div className="flex justify-between items-center py-2 bg-green-50 px-4 rounded-lg border border-green-200">
                        <span className="text-green-700 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Total Savings
                        </span>
                        <span className="flex items-center gap-1 font-bold text-green-700">
                          <FaBangladeshiTakaSign size={12} />
                          {formatPrice(totalSavings)}
                        </span>
                      </div>
                    )}

                    <div className="pt-4 border-t-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">
                          Grand Total
                        </span>
                        <span className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                          <FaBangladeshiTakaSign size={18} />
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {availableItems.length > 0 ? (
                    <Link
                      to="/checkout"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 block text-center"
                    >
                      Proceed to Checkout
                    </Link>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-500 mb-4">
                        All items in your cart are currently unavailable
                      </p>
                      <Link
                        to="/shop"
                        className="w-full bg-gray-300 text-gray-600 py-4 rounded-xl font-bold text-lg block text-center cursor-not-allowed"
                      >
                        Browse Available Books
                      </Link>
                    </div>
                  )}

                  <div className="mt-6 text-center text-sm text-gray-500">
                    <p className="flex items-center justify-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      Stock updated every 30 seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="min-h-[60vh] flex items-center justify-center py-16">
            <div className="text-center max-w-xl mx-auto">
              <div className="mb-8 relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <HiOutlineShoppingBag size={64} className="text-blue-500" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-white font-bold text-xl">0</span>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Looks like you haven't added any books yet. Start exploring our
                collection and find your next great read!
              </p>

              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <HiOutlineShoppingBag size={24} />
                Start Shopping
              </Link>

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BsBookmark className="text-blue-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Vast Collection
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Thousands of books across all genres
                  </p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaBangladeshiTakaSign
                      className="text-green-600"
                      size={24}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Best Prices
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Competitive pricing with regular discounts
                  </p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HiOutlineShoppingBag
                      className="text-purple-600"
                      size={24}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Fast Delivery
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Quick and reliable shipping nationwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineTrash size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Clear Shopping Cart?
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to remove all {totalItems} items from
                  your cart? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCart}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </Containar>
    </section>
  );
};

export default CartBox;