import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Package,
} from "lucide-react";

const PaymentFailPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  // Extract order ID and failure reason from URL
  // For demo purposes, parsing from window.location. In real React Router app, use useParams() and useSearchParams()
  const getUrlParams = () => {
    const path = window.location.pathname;
    const search = window.location.search;

    // Extract order ID from path: /order/payment/fail/{orderId}
    const pathParts = path.split("/");
    const orderId = pathParts[pathParts.length - 1];

    // Extract reason from query params
    const urlParams = new URLSearchParams(search);
    const failureReason = urlParams.get("reason") || "payment_failed";

    return { orderId, failureReason };
  };

  const { orderId, failureReason } = getUrlParams();

  const getFailureMessage = (reason) => {
    switch (reason) {
      case "payment_failed":
        return "Your payment could not be processed. Please check your payment details and try again.";
      case "payment_cancelled":
        return "You cancelled the payment process. You can retry the payment anytime.";
      case "payment_timeout":
        return "The payment session timed out. Please try again.";
      case "insufficient_funds":
        return "Insufficient funds in your account. Please check your balance and try again.";
      case "card_declined":
        return "Your card was declined. Please try with a different payment method.";
      case "network_error":
        return "A network error occurred during payment. Please check your connection and try again.";
      default:
        return "An error occurred during payment processing. Please try again.";
    }
  };

  const fetchOrderDetails = async () => {
    if (!orderId) {
      setError("Order ID not found in URL");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://bookwormm.netlify.app/api/v1/order/${orderId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrderData(data.data.doc);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleRetryPayment = async () => {
    setRetrying(true);
    // Simulate retry delay
    setTimeout(() => {
      // In real app, redirect to payment gateway
      window.location.href = orderData?.sslcommerzData?.GatewayPageURL || "#";
      setRetrying(false);
    }, 1000);
  };

  const handleBackToShop = () => {
    // In real app, use React Router
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-100 border-t-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Order
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchOrderDetails}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
      {/* Header */}
      {/* <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">BookWorm</span>
          </div>
          <button
            onClick={handleBackToShop}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Shop</span>
          </button>
        </div>
      </div> */}

      <div className="max-w-4xl mx-auto p-4 py-16 ">
        {/* Main Failure Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-red-100 text-lg">
              We couldn't process your payment for order #
              {orderData?.formattedOrderNumber}
            </p>
          </div>

          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">
                    Payment Failed
                  </h3>
                  <p className="text-red-600 text-sm">
                    {getFailureMessage(failureReason)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={handleRetryPayment}
                disabled={retrying}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {retrying ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                <span>{retrying ? "Redirecting..." : "Retry Payment"}</span>
              </button>

              <button
                onClick={handleBackToShop}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Continue Shopping</span>
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Order Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Order Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-semibold text-gray-800">
                      {orderData?.formattedOrderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(orderData?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {orderData?.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Type:</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {orderData?.deliveryType?.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{orderData?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{orderData?.phone}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="text-gray-700">
                      <div>{orderData?.streetAddress}</div>
                      <div className="text-sm text-gray-500">
                        {orderData?.area?.areaName}, {orderData?.zone?.zoneName}
                        , {orderData?.city?.cityName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Items Ordered
                </h4>
                {orderData?.products?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 bg-white rounded-lg mb-3 last:mb-0"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800">
                        {item.title}
                      </h5>
                      <p className="text-sm text-gray-500">ISBN: {item.isbn}</p>
                      <p className="text-sm text-gray-500">
                        Author: {item.author}
                      </p>
                      <p className="text-sm text-gray-500">
                        Format: {item.format}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        ৳{item.salePrice} × {item.quantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        ৳{item.salePrice * item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>৳{orderData?.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>৳{orderData?.shippingCost}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800 border-t pt-2">
                  <span>Total:</span>
                  <span>৳{orderData?.totalCost}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Phone className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 mb-1">Call Us</h4>
              <p className="text-gray-600 text-sm">+880 1XXX-XXXXXX</p>
            </div>
            <div className="text-center p-4">
              <Mail className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 mb-1">
                Email Support
              </h4>
              <p className="text-gray-600 text-sm">support@bookworm.com</p>
            </div>
            <div className="text-center p-4">
              <RefreshCw className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800 mb-1">FAQ</h4>
              <p className="text-gray-600 text-sm">Common payment issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailPage;
