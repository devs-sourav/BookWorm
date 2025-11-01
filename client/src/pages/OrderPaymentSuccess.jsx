import React, { useState, useEffect, useRef } from "react";
import { useParams,Link } from "react-router-dom";
import { resetCart } from "../redux/slices/cartSlices";

import {
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Phone,
  Mail,
  Copy,
  Download,
  User,
  Clock,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  FileText,
} from "lucide-react";
import { useDispatch } from "react-redux";

const OrderPaymentSuccess = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paymentUpdating, setPaymentUpdating] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const invoiceRef = useRef();
  const dispatch = useDispatch()

  const { orderId } = useParams();

  useEffect(() => {
    const updatePaymentAndFetchOrder = async () => {
      if (!orderId) {
        setError("Order ID not found in URL");
        setLoading(false);
        setPaymentUpdating(false);
        return;
      }

      try {
        setPaymentUpdating(true);
        const updateResponse = await fetch(
          `http://localhost:8000/api/v1/order/${orderId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentStatus: "paid",
              orderStatus: "confirmed",
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(
            errorData.message || "Failed to update payment status"
          );
        }

        setUpdateSuccess(true);
        setPaymentUpdating(false);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const orderResponse = await fetch(
          `http://localhost:8000/api/v1/order/${orderId}`
        );

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.message || "Failed to fetch order details");
        }

        const orderResult = await orderResponse.json();
        setOrderData(orderResult.data.doc);
      } catch (err) {
        setError(err.message);
        setPaymentUpdating(false);
        console.error("Order processing error:", err);
      } finally {
        setLoading(false);
      }
    };

    updatePaymentAndFetchOrder();
    dispatch(resetCart())
  }, [orderId]);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderData?.formattedOrderNumber || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateInvoicePDF = async () => {
    setDownloadingInvoice(true);

    // Create a new window with the invoice content
    const printWindow = window.open("", "_blank");
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${orderData.formattedOrderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #1f2937; }
            .invoice-title { font-size: 18px; margin-top: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #374151; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .table th, .table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            .table th { background-color: #f9fafb; }
            .total-section { margin-top: 20px; text-align: right; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .grand-total { font-weight: bold; font-size: 18px; color: #059669; }
            .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-paid { background-color: #d1fae5; color: #065f46; }
            .status-confirmed { background-color: #dbeafe; color: #1e40af; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">BookWorm</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          
          <div class="section">
            <div class="section-title">Order Information</div>
            <div class="info-row"><span>Order Number:</span><span>${
              orderData.formattedOrderNumber
            }</span></div>
            <div class="info-row"><span>Order Date:</span><span>${formatDateTime(
              orderData.createdAt
            )}</span></div>
            <div class="info-row"><span>Payment Method:</span><span>SSLCommerz</span></div>
            <div class="info-row">
              <span>Order Status:</span>
              <span class="status-badge status-confirmed">${orderData.orderStatus?.toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span>Payment Status:</span>
              <span class="status-badge status-paid">${orderData.paymentStatus?.toUpperCase()}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="info-row"><span>Name:</span><span>${
              orderData.name
            }</span></div>
            <div class="info-row"><span>Email:</span><span>${
              orderData.email
            }</span></div>
            <div class="info-row"><span>Phone:</span><span>${
              orderData.phone
            }</span></div>
            <div class="info-row"><span>Address:</span><span>${
              orderData.streetAddress
            }, ${orderData.area?.areaName}, ${orderData.zone?.zoneName}, ${
      orderData.city?.cityName
    }</span></div>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Author</th>
                  <th>Format</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderData.products
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.title}</td>
                    <td>${item.author}</td>
                    <td>${item.format}</td>
                    <td>${item.quantity}</td>
                    <td>৳${item.salePrice}</td>
                    <td>৳${item.salePrice * item.quantity}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <div class="total-row"><span>Subtotal:</span><span>৳${
              orderData.subtotal
            }</span></div>
            <div class="total-row"><span>Shipping:</span><span>৳${
              orderData.shippingCost
            }</span></div>
            <div class="total-row grand-total"><span>Total:</span><span>৳${
              orderData.totalCost
            }</span></div>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Thank you for your business!</p>
            <p>This is a computer generated invoice.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();

    setTimeout(() => setDownloadingInvoice(false), 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl">
          {paymentUpdating ? (
            <>
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Processing Payment
              </h2>
              <p className="mt-2 text-gray-600">
                Securely confirming your payment...
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </>
          ) : updateSuccess ? (
            <>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
                  <CheckCircle className="h-12 w-12 text-emerald-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Payment Confirmed!
              </h2>
              <p className="mt-2 text-gray-600">
                Loading your order details...
              </p>
              <div className="animate-pulse mt-4 space-y-2">
                <div className="h-2 bg-blue-200 rounded w-full"></div>
                <div className="h-2 bg-blue-200 rounded w-3/4"></div>
              </div>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">
                Loading order details...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Order
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Order Data
          </h1>
          <p className="text-gray-600">Unable to load order information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 py-8">
      <div className="container">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6 shadow-lg">
            <CheckCircle className="h-14 w-14 text-emerald-600" />
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for your order! We've received your payment and will start
            processing your order immediately.
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button
              onClick={generateInvoicePDF}
              disabled={downloadingInvoice}
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {downloadingInvoice ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Download Invoice
                </>
              )}
            </button>

            {/* <button className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Truck className="h-5 w-5 mr-2" />
              Track Order
            </button> */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Overview Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Details
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Order placed</div>
                  <div className="font-semibold">
                    {formatDateTime(orderData.createdAt)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 font-medium">
                      Order Number
                    </span>
                    <div className="flex items-center">
                      <span className="font-bold text-gray-900 mr-2">
                        {orderData.formattedOrderNumber}
                      </span>
                      <button
                        onClick={copyOrderNumber}
                        className="p-1.5 hover:bg-white rounded-lg transition-colors"
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                      {copied && (
                        <span className="text-emerald-600 text-sm ml-2 animate-pulse">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 font-medium">
                      Payment Method
                    </span>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-semibold">SSLCommerz</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                    <span className="text-gray-600 font-medium">
                      Order Status
                    </span>
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">
                      {orderData.orderStatus?.charAt(0).toUpperCase() +
                        orderData.orderStatus?.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <span className="text-gray-600 font-medium">
                      Payment Status
                    </span>
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                      {orderData.paymentStatus?.charAt(0).toUpperCase() +
                        orderData.paymentStatus?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Amount Highlight */}
              <div className="mt-6 p-6 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-emerald-100 text-sm">
                      Total Amount Paid
                    </div>
                    <div className="text-3xl font-bold">
                      ৳{orderData.totalCost}
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                  <ShoppingBag className="h-6 w-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Items
                </h2>
              </div>

              <div className="space-y-6">
                {orderData.products?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-6 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={
                        item.product?.photos?.[0] || "/api/placeholder/100/120"
                      }
                      alt={item.title}
                      className="w-20 h-24 object-cover rounded-xl shadow-md"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-1">by {item.author}</p>
                      <p className="text-sm text-gray-500 mb-1">
                        ISBN: {item.isbn}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                          {item.format}
                        </span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        {item.price !== item.salePrice && (
                          <span className="text-gray-400 line-through text-sm">
                            ৳{item.price}
                          </span>
                        )}
                        <span className="text-xl font-bold text-emerald-600">
                          ৳{item.salePrice}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: ৳{item.salePrice * item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-6 mt-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">৳{orderData.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping & Handling</span>
                    <span className="font-semibold">
                      ৳{orderData.shippingCost}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-emerald-600">
                        ৳{orderData.totalCost}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Delivery Information */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                  <Truck className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Info
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 font-medium block mb-2">
                    Delivery Address
                  </label>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">
                        {orderData.name}
                      </p>
                      <p className="text-gray-700">{orderData.streetAddress}</p>
                      <p className="text-gray-700">
                        {orderData.area?.areaName}, {orderData.zone?.zoneName}
                      </p>
                      <p className="text-gray-700">
                        {orderData.city?.cityName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm text-gray-500 font-medium block mb-2">
                    Contact Information
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {orderData.phone}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {orderData.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm text-gray-500 font-medium block mb-2">
                    Estimated Delivery
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(orderData.estimatedDeliveryDate)}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-blue-600 mr-2" />
                    <p className="text-sm font-semibold text-blue-900">
                      Delivery Type:{" "}
                      {orderData.deliveryType?.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                  <p className="text-xs text-blue-700">
                    You'll receive notifications when your order is shipped and
                    out for delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Customer</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-semibold">{orderData.user?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-semibold">{orderData.user?.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Member Since</div>
                  <div className="font-semibold">
                    {formatDate(orderData.user?.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link to={"/shop"} className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-700 font-medium">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
                {/* <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors text-blue-700 font-medium">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Order History
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Support */}
        <div className="mt-12 bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-6">
            Questions about your order? Our support team is here to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@bookworm.com"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Mail className="h-5 w-5 mr-2" />
              Email Support
            </a>
            <a
              href="tel:+8801234567890"
              className="inline-flex items-center px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-200"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Support
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Order confirmation and tracking details have been sent to{" "}
            <span className="font-semibold">{orderData.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentSuccess;
