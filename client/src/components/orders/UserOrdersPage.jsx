import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Package,
  MapPin,
  Clock,
  CreditCard,
  Truck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { id: userId } = useParams();

  useEffect(() => {
    if (userId) {
      fetchUserOrders();
    }
  }, [userId]);

  useEffect(() => {
    filterOrders();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [orders, searchTerm, statusFilter]);

  const fetchUserOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `http://localhost:8000/api/v1/order/user/${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.data?.orders || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.formattedOrderNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.products.some(
            (product) =>
              product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.author.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredOrders(filtered);
  };

  // Pagination calculations
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top when page changes
      document.getElementById('order_details_user')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show smart pagination
      if (currentPage <= 3) {
        // Show first 5 pages
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last 5 pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show current page and 2 pages before and after
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: Clock,
        bgClass: "bg-yellow-100",
      },
      confirmed: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle,
        bgClass: "bg-blue-100",
      },
      processing: {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Package,
        bgClass: "bg-purple-100",
      },
      shipped: {
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: Truck,
        bgClass: "bg-indigo-100",
      },
      delivered: {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
        bgClass: "bg-green-100",
      },
      cancelled: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        bgClass: "bg-red-100",
      },
    };
    return configs[status] || configs.pending;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-orange-100 text-orange-800 border-orange-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.orderStatus === "pending").length,
      delivered: orders.filter((o) => o.orderStatus === "delivered").length,
      processing: orders.filter((o) =>
        ["confirmed", "processing", "shipped"].includes(o.orderStatus)
      ).length,
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Loading your orders...
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch your order history
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => fetchUserOrders()}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-105 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div
      id="order_details_user"
      className="min-h-screen shadow-lg bg-gradient-to-br from-gray-50 to-blue-50 mt-20 py-8"
    >
      <div className="container">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Orders
              </h1>
              <p className="text-gray-600 text-lg">
                Track and manage your order history
              </p>
            </div>
            <button
              onClick={() => fetchUserOrders(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <Package className="h-12 w-12 text-blue-600 bg-blue-100 rounded-lg p-3" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Processing</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {stats.processing}
                </p>
              </div>
              <Clock className="h-12 w-12 text-purple-600 bg-purple-100 rounded-lg p-3" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.delivered}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600 bg-green-100 rounded-lg p-3" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {stats.pending}
                </p>
              </div>
              <AlertCircle className="h-12 w-12 text-yellow-600 bg-yellow-100 rounded-lg p-3" />
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No orders yet
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              Start shopping to see your orders here
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium">
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by order number, book title, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders List Header with Pagination Info and Items Per Page */}
            {filteredOrders.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-600">
                      Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} orders
                    </p>
                    <div className="flex items-center gap-2">
                      <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                        Show:
                      </label>
                      <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-600">per page</span>
                    </div>
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders List */}
            <div className="space-y-4">
              {currentOrders.map((order) => {
                const statusConfig = getStatusConfig(order.orderStatus);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={order.id}
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="bg-white  rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Compact Order Header */}
                    <div
                      className={`p-4 cursor-pointer ${
                        expandedOrder === order.id
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Left side - Order info */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${statusConfig.bgClass}`}
                          >
                            <StatusIcon className="h-5 w-5 text-current" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {order.formattedOrderNumber}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>{formatDateShort(order.createdAt)}</span>
                              <span>•</span>
                              <span>{order.products.length} items</span>
                              <span>•</span>
                              <span className="capitalize">
                                {order.deliveryType}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Center - Status and payment info for larger screens */}
                        <div className="hidden md:flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            Order Status:
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}
                            >
                              {order.orderStatus.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            Payment Status:
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Right side - Price and expand button */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              ৳{order.totalCost}
                            </p>
                            <div className="md:hidden flex gap-2 mt-1">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}
                              >
                                {order.orderStatus.charAt(0).toUpperCase() +
                                  order.orderStatus.slice(1)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                          >
                            {expandedOrder === order.id ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Order Details - Keep the original detailed view */}
                    {expandedOrder === order.id && (
                      <>
                        {/* Quick Order Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-600">Payment</p>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                                    order.paymentStatus
                                  )}`}
                                >
                                  {order.paymentStatus.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Truck className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  Delivery
                                </p>
                                <p className="font-medium text-gray-900">
                                  {order.deliveryType}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Clock className="h-5 w-5 text-purple-600" />
                              <div>
                                <p className="text-sm text-gray-600">
                                  Estimated
                                </p>
                                <p className="font-medium text-gray-900">
                                  {order.estimatedDeliveryDate
                                    ? formatDate(order.estimatedDeliveryDate)
                                    : "TBD"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Order Items */}
                            <div className="xl:col-span-2">
                              <h4 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Package className="h-6 w-6 text-blue-600" />
                                Order Items
                              </h4>
                              <div className="space-y-4">
                                {order.products.map((item) => (
                                  <div
                                    key={item.id}
                                    className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                                  >
                                    <div className="flex gap-6">
                                      {item.product.photos &&
                                        item.product.photos[0] && (
                                          <img
                                            src={item.product.photos[0]}
                                            alt={item.title}
                                            className="w-20 h-24 object-cover rounded-lg border border-gray-200"
                                          />
                                        )}
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900 text-lg mb-1">
                                          {item.title}
                                        </h5>
                                        <p className="text-gray-600 mb-2">
                                          by {item.author}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                          <span>Format: {item.format}</span>
                                          <span>ISBN: {item.isbn}</span>
                                          <span>Qty: {item.quantity}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className="h-4 w-4 text-yellow-400 fill-current"
                                              />
                                            ))}
                                          </div>
                                          <div className="text-right">
                                            {item.price !== item.salePrice && (
                                              <span className="text-sm text-gray-500 line-through">
                                                ৳{item.price}
                                              </span>
                                            )}
                                            <span className="text-lg font-semibold text-gray-900 ml-2">
                                              ৳{item.salePrice} each
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Details Sidebar */}
                            <div className="space-y-6">
                              {/* Delivery Information */}
                              <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <MapPin className="h-5 w-5 text-green-600" />
                                  Delivery Information
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Name:</span>
                                    <span className="font-medium text-gray-900">
                                      {order.name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Phone:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {order.phone}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Email:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {order.email}
                                    </span>
                                  </div>
                                  <hr className="my-3" />
                                  <div>
                                    <span className="text-gray-600 text-xs uppercase tracking-wide">
                                      Address
                                    </span>
                                    <p className="font-medium text-gray-900 mt-1">
                                      {order.streetAddress}
                                    </p>
                                    <p className="text-gray-600">
                                      {order.area.areaName},{" "}
                                      {order.zone.zoneName}
                                    </p>
                                    <p className="text-gray-600">
                                      {order.city.cityName}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Summary */}
                              <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <CreditCard className="h-5 w-5 text-blue-600" />
                                  Payment Summary
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Subtotal:
                                    </span>
                                    <span className="font-medium">
                                      ৳{order.subtotal}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Shipping:
                                    </span>
                                    <span className="font-medium">
                                      ৳{order.shippingCost}
                                    </span>
                                  </div>
                                  {order.coupon && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Coupon ({order.coupon}):</span>
                                      <span className="font-medium">
                                        -৳{order.couponDiscount}
                                      </span>
                                    </div>
                                  )}
                                  <hr className="my-3" />
                                  <div className="flex justify-between text-lg font-semibold">
                                    <span>Total:</span>
                                    <span>৳{order.totalCost}</span>
                                  </div>
                                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                                      Payment Method
                                    </p>
                                    <p className="font-medium text-gray-900 mt-1">
                                      {order.paymentMethod
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {(order.notes || order.adminNotes) && (
                            <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                                Notes
                              </h4>
                              <div className="space-y-4">
                                {order.notes && (
                                  <div className="p-4 bg-blue-50 rounded-lg">
                                    <span className="text-sm font-medium text-blue-800">
                                      Customer Notes:
                                    </span>
                                    <p className="text-blue-700 mt-1">
                                      {order.notes}
                                    </p>
                                  </div>
                                )}
                                {order.adminNotes && (
                                  <div className="p-4 bg-yellow-50 rounded-lg">
                                    <span className="text-sm font-medium text-yellow-800">
                                      Admin Notes:
                                    </span>
                                    <p className="text-yellow-700 mt-1">
                                      {order.adminNotes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} orders
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    {/* First Page */}
                    <button
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
                      title="First page"
                    >
                      <ChevronsLeft className="h-5 w-5" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
                      title="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 mx-2">
                      {currentPage > 3 && totalPages > 5 && (
                        <>
                          <button
                            onClick={() => goToPage(1)}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                        </>
                      )}
                      
                      {getPageNumbers().map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === pageNumber
                              ? "bg-blue-600 text-white font-medium"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}

                      {currentPage < totalPages - 2 && totalPages > 5 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => goToPage(totalPages)}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Next Page */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
                      title="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
                      title="Last page"
                    >
                      <ChevronsRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Quick Page Jump */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Go to:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= totalPages) {
                          goToPage(page);
                        }
                      }}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;