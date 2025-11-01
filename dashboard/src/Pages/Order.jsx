import React, { useState, useEffect } from "react";
import {
  Space,
  Table,
  Button,
  message,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  Badge,
  Row,
  Col,
  Statistic,
  Divider,
  Spin,
  Avatar,
  Drawer,
  Steps,
  Timeline,
  Empty,
  Alert,
  Descriptions,
  Image,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import axios from "../Components/Axios";
import { useTheme } from "../LayOut/MainLayout";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const Order = () => {
  const { isDarkMode } = useTheme();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    canceled: 0,
    returned: 0,
    totalRevenue: 0,
    todayOrders: 0,
  });
  const [form] = Form.useForm();

  // Enhanced fetch orders with better error handling
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/order");
      const orders = response.data.data.doc || [];
      setData(orders);
      setFilteredData(orders);

      // Calculate comprehensive stats
      const stats = {
        total: orders.length,
        pending: orders.filter((order) => order.orderStatus === "pending")
          .length,
        confirmed: orders.filter((order) => order.orderStatus === "confirmed")
          .length,
        processing: orders.filter((order) => order.orderStatus === "processing")
          .length,
        shipped: orders.filter((order) => order.orderStatus === "shipped")
          .length,
        delivered: orders.filter((order) => order.orderStatus === "delivered")
          .length,
        canceled: orders.filter((order) => order.orderStatus === "canceled")
          .length,
        returned: orders.filter((order) => order.orderStatus === "returned")
          .length,
        totalRevenue: orders.reduce(
          (sum, order) => sum + (order.totalCost || 0),
          0
        ),
        todayOrders: orders.filter(
          (order) =>
            new Date(order.createdAt).toDateString() ===
            new Date().toDateString()
        ).length,
      };
      setOrderStats(stats);
    } catch (error) {
      message.error("Failed to fetch orders. Please try again.");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Enhanced search and filter functionality
  useEffect(() => {
    let filtered = data;

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(
        (order) =>
          order.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          order.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          order.phone?.includes(searchText) ||
          order.orderNumber?.toString().includes(searchText) ||
          order.formattedOrderNumber
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }

    setFilteredData(filtered);
  }, [data, searchText, statusFilter]);

  // View order details
  const handleView = (record) => {
    setSelectedOrder(record);
    setIsViewDrawerVisible(true);
  };

  // Edit order
  const handleEdit = (record) => {
    setCurrentOrder(record);
    form.setFieldsValue({
      ...record,
      cityName: record.city?.cityName || "",
      zoneName: record.zone?.zoneName || "",
      areaName: record.area?.areaName || "",
    });
    setIsModalVisible(true);
  };

  // Delete order with confirmation
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/order/${id}`);
      message.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      message.error("Failed to delete order. Please try again.");
      console.error("Error deleting order:", error);
    }
  };

  // Update order
  const handleUpdate = async (values) => {
    try {
      await axios.patch(`/order/${currentOrder?._id}/status`, values);
      message.success("Order updated successfully");
      setIsModalVisible(false);
      form.resetFields();
      setCurrentOrder(null);
      fetchOrders();
    } catch (error) {
      message.error("Failed to update order. Please try again.");
      console.error("Error updating order:", error);
    }
  };

  // Quick status update
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`/order/${orderId}/status`, { orderStatus: newStatus });
      message.success("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      message.error("Failed to update order status");
      console.error("Error updating order status:", error);
    }
  };

  // Quick payment status update
  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      await axios.patch(`/order/${orderId}/status`, {
        paymentStatus: newPaymentStatus,
      });
      message.success("Payment status updated successfully");
      fetchOrders();
    } catch (error) {
      message.error("Failed to update payment status");
      console.error("Error updating payment status:", error);
    }
  };

  // Cancel order with stock restoration
  const handleCancelOrder = async (orderId) => {
    try {
      await axios.patch(`/order/${orderId}/cancel`);
      message.success("Order canceled successfully and stock restored");
      fetchOrders();
    } catch (error) {
      message.error("Failed to cancel order");
      console.error("Error canceling order:", error);
    }
  };

  // Enhanced print invoice
  const handlePrintInvoice = async (order) => {
    try {
      const response = await axios.get(`/order/${order._id}`);
      const orderDetails = response?.data?.data?.doc;

      if (!orderDetails) {
        message.error("Failed to fetch order details");
        return;
      }

      const invoiceWindow = window.open("", "_blank");

      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Invoice - ${
              orderDetails.formattedOrderNumber || orderDetails.orderNumber
            }</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6;
                color: #333;
                background: #f8f9fa;
              }
              .invoice-container {
                max-width: 900px;
                margin: 20px auto;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              }
              .invoice-header {
                background: linear-gradient(135deg, #252F3D 0%, #1E2631 100%);
                color: white;
                padding: 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .company-info h1 {
                font-size: 2.8rem;
                font-weight: 300;
                margin-bottom: 5px;
              }
              .company-info p {
                font-size: 1.1rem;
                opacity: 0.9;
              }
              .invoice-meta {
                text-align: right;
              }
              .invoice-meta h2 {
                font-size: 1.8rem;
                margin-bottom: 10px;
              }
              .invoice-meta p {
                font-size: 1rem;
                opacity: 0.9;
              }
              .status-badge {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 25px;
                font-size: 0.9rem;
                font-weight: 600;
                text-transform: uppercase;
                margin-top: 10px;
                color:#fff !important;
              }
              .status-pending { background: rgba(255,193,7,0.2); color: #856404; }
              .status-confirmed { background: rgba(40,167,69,0.2); color: #155724; }
              .status-processing { background: rgba(0,123,255,0.2); color: #004085; }
              .status-shipped { background: rgba(111,66,193,0.2); color: #492268; }
              .status-delivered { background: rgba(23,162,184,0.2); color: #0c5460; }
              .status-canceled { background: rgba(220,53,69,0.2); color: #721c24; }
              .invoice-body {
                padding: 40px;
              }
              .section {
                margin-bottom: 35px;
              }
              .section-title {
                font-size: 1.4rem;
                font-weight: 600;
                color: #495057;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 3px solid #e9ecef;
              }
              .customer-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
              }
              .info-block h3 {
                font-size: 1.2rem;
                font-weight: 600;
                color: #495057;
                margin-bottom: 15px;
              }
              .info-block p {
                margin-bottom: 8px;
                color: #6c757d;
              }
              .info-block .highlight {
                font-weight: 600;
                color: #495057;
              }
              .products-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .products-table thead {
                background: #f8f9fa;
              }
              .products-table th {
                padding: 20px 15px;
                text-align: left;
                font-weight: 600;
                color: #495057;
                border-bottom: 2px solid #dee2e6;
              }
              .products-table td {
                padding: 18px 15px;
                border-bottom: 1px solid #f1f3f4;
              }
              .products-table tbody tr:hover {
                background: #f8f9fa;
              }
              .product-info {
                display: flex;
                align-items: center;
              }
              .product-icon {
                width: 40px;
                height: 40px;
                background: #667eea;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                color: white;
                font-size: 18px;
              }
                .bookworm_title{
                font-weight:700 !important;
                color:#fff !important;
                }
                .bookworm_title_w{
                color:#E83A29 !important;
                }
              .total-section {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 10px;
                margin-top: 30px;
                border: 2px solid #e9ecef;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                font-size: 1.1rem;
              }
              .total-row.final {
                font-size: 1.5rem;
                font-weight: bold;
                color: #495057;
                border-top: 2px solid #dee2e6;
                padding-top: 15px;
                margin-top: 15px;
              }
              .footer {
                text-align: center;
                padding: 30px;
                background: #f8f9fa;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
              }
              @media print {
                body { background: white !important; }
                .invoice-container { 
                  box-shadow: none !important; 
                  margin: 0 !important;
                  border-radius: 0 !important;
                }
              }
              .product_image{
                width:48px !important;
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="invoice-header">
                <div class="company-info">
                  <h1 class="bookworm_title" >Book<span class="bookworm_title_w">W</span>orm</h1>
                  <p>Your Trusted Book Partner</p>
                </div>
                <div class="invoice-meta">
                  <h2>INVOICE</h2>
                  <p><strong>Order #${
                    orderDetails.formattedOrderNumber ||
                    orderDetails.orderNumber
                  }</strong></p>
                  <p>Date: ${new Date(
                    orderDetails.createdAt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</p>
                  <div class="status-badge status-${orderDetails.orderStatus}">
                    ${orderDetails.orderStatus.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div class="invoice-body">
                <div class="section">
                  <div class="customer-info">
                    <div class="info-block">
                      <h3>📋 Bill To</h3>
                      <p class="highlight">${orderDetails.name}</p>
                      <p>📧 ${orderDetails.email}</p>
                      <p>📱 ${orderDetails.phone}</p>
                    </div>
                    <div class="info-block">
                      <h3>🚚 Ship To</h3>
                      <p>${orderDetails.streetAddress}</p>
                      <p>${orderDetails.area?.areaName || "N/A"}</p>
                      <p>${orderDetails.city?.cityName || "N/A"}, ${
        orderDetails.zone?.zoneName || "N/A"
      }</p>
                      <p class="highlight">Delivery: ${
                        orderDetails.deliveryType === "on_demand"
                          ? "Express (24 Hours)"
                          : "Normal (2-3 Days)"
                      }</p>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h2 class="section-title">📚 Order Items</h2>
                  <table class="products-table">
                    <thead>
                      <tr>
                        <th>Book Details</th>
                        <th>Author</th>
                        <th>Format</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Unit Price</th>
                        <th style="text-align: right;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${orderDetails.products
                        ?.map(
                          (product) => `
                        <tr>
                          <td>
                            <div class="product-info">
                              <div class="product-icon">
                              <img class="product_image" src="${product.product.photos[0]}"/>
                              </div>
                              <div>
                                <strong>${product.title || "N/A"}</strong>
                                ${
                                  product.isbn
                                    ? `<br><small>ISBN: ${product.isbn}</small>`
                                    : ""
                                }
                              </div>
                            </div>
                          </td>
                          <td>${product.author || "N/A"}</td>
                          <td>${product.format || "N/A"}</td>
                          <td style="text-align: center;">${
                            product.quantity || "N/A"
                          }</td>
                          <td style="text-align: right;">৳${(
                            product.salePrice ||
                            product.price ||
                            0
                          ).toFixed(2)}</td>
                          <td style="text-align: right;">৳${(
                            (product.salePrice || product.price || 0) *
                            product.quantity
                          ).toFixed(2)}</td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>

                <div class="total-section">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>৳${orderDetails.subtotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div class="total-row">
                    <span>Shipping Cost:</span>
                    <span>৳${
                      orderDetails.shippingCost?.toFixed(2) || "0.00"
                    }</span>
                  </div>
                  ${
                    orderDetails.couponDiscount > 0
                      ? `
                    <div class="total-row" style="color: #dc3545;">
                      <span>Coupon Discount:</span>
                      <span>-৳${orderDetails.couponDiscount.toFixed(2)}</span>
                    </div>
                  `
                      : ""
                  }
                  <div class="total-row final">
                    <span>Grand Total:</span>
                    <span>৳${
                      orderDetails.totalCost?.toFixed(2) || "0.00"
                    }</span>
                  </div>
                  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <div class="total-row" style="font-size: 1rem; margin-bottom: 5px;">
                      <span><strong>Payment Method:</strong></span>
                      <span>${orderDetails.paymentMethod
                        ?.replace("_", " ")
                        .toUpperCase()}</span>
                    </div>
                    <div class="total-row" style="font-size: 1rem;">
                      <span><strong>Payment Status:</strong></span>
                      <span style="color: ${
                        orderDetails.paymentStatus === "paid"
                          ? "#28a745"
                          : "#ffc107"
                      };">
                        ${orderDetails.paymentStatus?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for your business!</p>
                <p>For any queries, contact us at support@bookworm.com</p>
              </div>
            </div>
          </body>
        </html>
      `;

      invoiceWindow.document.write(invoiceHTML);
      invoiceWindow.document.close();

      // Wait for content to load, then print
      setTimeout(() => {
        invoiceWindow.focus();
        invoiceWindow.print();
      }, 1000);
    } catch (error) {
      message.error("Error generating invoice");
      console.error("Error printing invoice:", error);
    }
  };

  // Get order status step
  const getOrderStep = (status) => {
    const statusSteps = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
      canceled: -1,
      returned: -1,
    };
    return statusSteps[status] || 0;
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      pending: "#faad14",
      confirmed: "#52c41a",
      processing: "#1890ff",
      shipped: "#722ed1",
      delivered: "#13c2c2",
      canceled: "#ff4d4f",
      returned: "#fa8c16",
    };
    return colors[status] || "#d9d9d9";
  };

  // Payment status color mapping
  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "#faad14",
      paid: "#52c41a",
      failed: "#ff4d4f",
      refunded: "#722ed1",
      partial: "#fa8c16",
      processing: "#1890ff",
    };
    return colors[status] || "#d9d9d9";
  };

  // Status icon mapping
  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      confirmed: <CheckCircleOutlined />,
      processing: <ShopOutlined />,
      shipped: <TruckOutlined />,
      delivered: <ShoppingOutlined />,
      canceled: <CloseCircleOutlined />,
      returned: <ExclamationCircleOutlined />,
    };
    return icons[status] || <ExclamationCircleOutlined />;
  };

  // Table columns configuration
  const columns = [
    {
      title: "SR",
      dataIndex: "index",
      key: "sr",
      width: 70,
      fixed: "left",
      render: (text, record, index) => (
        <Avatar
          size="small"
          style={{
            backgroundColor: isDarkMode ? "#4b5563" : "#1890ff",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {index + 1}
        </Avatar>
      ),
    },
    {
      title: "Order Details",
      key: "orderInfo",
      width: 200,
      render: (_, record) => (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <ShoppingCartOutlined className="text-blue-500" />
            <Text
              strong
              className={isDarkMode ? "text-white" : "text-gray-900"}
            >
              {record.formattedOrderNumber || record.orderNumber}
            </Text>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarOutlined className="text-gray-400 text-xs" />
            <Text
              className={isDarkMode ? "text-gray-400" : "text-gray-500"}
              style={{ fontSize: "11px" }}
            >
              {new Date(record.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </div>
          <Tag
            color={record.deliveryType === "on_demand" ? "red" : "blue"}
            style={{ fontSize: "10px" }}
            icon={
              record.deliveryType === "on_demand" ? (
                <TruckOutlined />
              ) : (
                <ClockCircleOutlined />
              )
            }
          >
            {record.deliveryType === "on_demand"
              ? "Express 24H"
              : "Standard 2-3 Days"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Books & Items",
      key: "books",
      width: 280,
      render: (_, record) => (
        <div className="space-y-2">
          {record.products?.slice(0, 2).map((product, index) => {

            // console.log(product.product.photos[0])
            return (
              <div key={index} className="flex items-start space-x-2">
                {/* <Avatar
                  size={24}
                  icon={<BookOutlined />}
                  className="bg-blue-100 text-blue-600 flex-shrink-0"
                /> */}
                {/* <div><img alt="product photo" className="w-10 h-10" src={product.product.photos[0]}/></div> */}
                <div className="min-w-0 flex-1">
                  <Text
                    strong
                    className={`${
                      isDarkMode ? "text-white" : "text-gray-900"
                    } block truncate`}
                    style={{ fontSize: "12px" }}
                    title={product.title}
                  >
                    {product.title || "N/A"}
                  </Text>
                  <div className="flex items-center justify-between">
                    <Text
                      className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                      style={{ fontSize: "10px" }}
                    >
                      by {product.author || "Unknown"}
                    </Text>
                    <Badge
                      count={product.quantity}
                      size="small"
                      style={{ backgroundColor: "#52c41a" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {record.products?.length > 2 && (
            <Text
              className={isDarkMode ? "text-gray-400" : "text-gray-500"}
              style={{ fontSize: "10px" }}
            >
              +{record.products.length - 2} more items
            </Text>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-gray-200">
            <Text style={{ fontSize: "10px" }} className="text-gray-500">
              Total Items:{" "}
              {record.products?.reduce((sum, p) => sum + (p.quantity || 0), 0)}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Customer",
      key: "customerInfo",
      width: 240,
      render: (_, record) => (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Avatar
              size={28}
              icon={<UserOutlined />}
              className="bg-green-100 text-green-600"
            />
            <Text
              strong
              className={isDarkMode ? "text-white" : "text-gray-900"}
              style={{ fontSize: "13px" }}
            >
              {record.name}
            </Text>
          </div>
          <div className="space-y-1 ml-8">
            <div className="flex items-center space-x-1">
              <PhoneOutlined className="text-gray-400 text-xs" />
              <Text
                className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                style={{ fontSize: "11px" }}
              >
                {record.phone}
              </Text>
            </div>
            <div className="flex items-center space-x-1">
              <MailOutlined className="text-gray-400 text-xs" />
              <Text
                className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                style={{ fontSize: "10px" }}
              >
                {record.email}
              </Text>
            </div>
            <div className="flex items-center space-x-1">
              <EnvironmentOutlined className="text-gray-400 text-xs" />
              <Text
                className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                style={{ fontSize: "10px" }}
              >
                {record.city?.cityName}, {record.area?.areaName}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      width: 130,
      render: (_, record) => (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <DollarOutlined className="text-green-500 text-sm" />
            <Text
              strong
              className={isDarkMode ? "text-green-400" : "text-green-600"}
              style={{ fontSize: "16px" }}
            >
              ৳{record.totalCost}
            </Text>
          </div>
          <div className="space-y-1 space-x-1">
            <Text
              className={isDarkMode ? "text-gray-400 block" : "text-gray-500 block"}
              style={{ fontSize: "9px" }}
            >
              Subtotal: ৳{record.subtotal}
            </Text>
            <Text
              className={isDarkMode ? "text-gray-400 block" : "text-gray-500 block"}
              style={{ fontSize: "9px" }}
            >
              Shipping: ৳{record.shippingCost}
            </Text>
            {record.couponDiscount > 0 && (
              <Text className="text-red-500 block" style={{ fontSize: "9px" }}>
                Discount: -৳{record.couponDiscount}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 160,
      render: (_, record) => (
        <div className="space-y-2">
          <Select
            value={record.orderStatus}
            onChange={(value) => handleStatusChange(record._id, value)}
            className="w-full"
            size="small"
            suffixIcon={getStatusIcon(record.orderStatus)}
          >
            <Option value="pending">
              <div className="flex items-center space-x-1">
                <ClockCircleOutlined style={{ color: "#faad14" }} />
                <span>Pending</span>
              </div>
            </Option>
            <Option value="confirmed">
              <div className="flex items-center space-x-1">
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <span>Confirmed</span>
              </div>
            </Option>
            <Option value="processing">
              <div className="flex items-center space-x-1">
                <ShopOutlined style={{ color: "#1890ff" }} />
                <span>Processing</span>
              </div>
            </Option>
            <Option value="shipped">
              <div className="flex items-center space-x-1">
                <TruckOutlined style={{ color: "#722ed1" }} />
                <span>Shipped</span>
              </div>
            </Option>
            <Option value="delivered">
              <div className="flex items-center space-x-1">
                <ShoppingOutlined style={{ color: "#13c2c2" }} />
                <span>Delivered</span>
              </div>
            </Option>
            <Option value="canceled">
              <div className="flex items-center space-x-1">
                <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                <span>Canceled</span>
              </div>
            </Option>
            <Option value="returned">
              <div className="flex items-center space-x-1">
                <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
                <span>Returned</span>
              </div>
            </Option>
          </Select>

          <Tag
            color={getStatusColor(record.orderStatus)}
            icon={getStatusIcon(record.orderStatus)}
            style={{ fontSize: "10px", width: "100%", textAlign: "center" }}
          >
            {record.orderStatus.toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: "Payment",
      key: "payment",
      width: 150,
      render: (_, record) => (
        <div className="space-y-2">
          <Select
            value={record.paymentStatus}
            onChange={(value) => handlePaymentStatusChange(record._id, value)}
            className="w-full"
            size="small"
          >
            <Option value="pending">
              <div className="flex items-center space-x-1">
                <ClockCircleOutlined style={{ color: "#faad14" }} />
                <span>Pending</span>
              </div>
            </Option>
            <Option value="paid">
              <div className="flex items-center space-x-1">
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <span>Paid</span>
              </div>
            </Option>
            <Option value="processing">
              <div className="flex items-center space-x-1">
                <ShopOutlined style={{ color: "#1890ff" }} />
                <span>Processing</span>
              </div>
            </Option>
            <Option value="failed">
              <div className="flex items-center space-x-1">
                <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                <span>Failed</span>
              </div>
            </Option>
            <Option value="refunded">
              <div className="flex items-center space-x-1">
                <ExclamationCircleOutlined style={{ color: "#722ed1" }} />
                <span>Refunded</span>
              </div>
            </Option>
            <Option value="partial">
              <div className="flex items-center space-x-1">
                <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
                <span>Partial</span>
              </div>
            </Option>
          </Select>

          <div className="text-center">
            <Tag
              color={getPaymentStatusColor(record.paymentStatus)}
              style={{ fontSize: "9px" }}
            >
              {record.paymentStatus.toUpperCase()}
            </Tag>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <CreditCardOutlined className="text-gray-400 text-xs" />
              <Text
                className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                style={{ fontSize: "9px" }}
              >
                {record.paymentMethod?.replace("_", " ").toUpperCase()}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="View Details">
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              className="bg-blue-500 hover:bg-blue-600 border-blue-500"
            />
          </Tooltip>

          <Tooltip title="Edit Order">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className={`${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-700 border-gray-600 text-white"
                  : "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white"
              }`}
            />
          </Tooltip>

          <Tooltip title="Print Invoice">
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintInvoice(record)}
              className="bg-green-500 hover:bg-green-600 border-green-500 text-white"
            />
          </Tooltip>

          {(record.orderStatus === "pending" ||
            record.orderStatus === "confirmed") && (
            <Tooltip title="Cancel Order">
              <Popconfirm
                title="Cancel Order"
                description="Are you sure you want to cancel this order? Stock will be restored."
                onConfirm={() => handleCancelOrder(record._id)}
                okText="Yes, Cancel"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button
                  size="small"
                  icon={<CloseCircleOutlined />}
                  className="bg-orange-500 hover:bg-orange-600 border-orange-500 text-white"
                />
              </Popconfirm>
            </Tooltip>
          )}

          <Tooltip title="Delete Order">
            <Popconfirm
              title="Delete Order"
              description="Are you sure you want to delete this order? This action cannot be undone."
              onConfirm={() => handleDelete(record._id)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentOrder(null);
    form.resetFields();
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setIsViewDrawerVisible(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <Title
            level={2}
            className={`!mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            📊 Order Management
          </Title>
          <Text className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
            Manage and track all book orders efficiently
          </Text>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
            loading={loading}
            className="flex items-center"
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6} lg={6}>
          <Card
            className="text-center stat-card hover:shadow-lg transition-all duration-300"
            style={{
              background: isDarkMode
                ? "linear-gradient(135deg, #1f2937 0%, #374151 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              color: "white",
            }}
          >
            <Statistic
              title={
                <span className="total_order_color">
                  Total Orders
                </span>
              }
              value={orderStats.total}
              valueStyle={{
                color: "white",
                fontSize: "28px",
                fontWeight: "bold",
              }}
              prefix={<BookOutlined className="total_order_color" style={{ color: "white" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card
            className="text-center stat-card hover:shadow-lg transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
              color: "white",
            }}
          >
            <Statistic
              title={
                <span className="total_order_color">
                  Today's Orders
                </span>
              }
              value={orderStats.todayOrders}
              valueStyle={{
                color: "white",
                fontSize: "28px",
                fontWeight: "bold",
              }}
              prefix={<CalendarOutlined className="total_order_color" style={{ color: "white" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card
            className="text-center stat-card hover:shadow-lg transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              border: "none",
              color: "white",
            }}
          >
            <Statistic
              title={
                <span className="total_order_color">
                  Pending Orders
                </span>
              }
              value={orderStats.pending}
              valueStyle={{
                color: "white",
                fontSize: "28px",
                fontWeight: "bold",
              }}
              prefix={<ClockCircleOutlined className="total_order_color" style={{ color: "white" }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Card
            className="text-center stat-card hover:shadow-lg transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              border: "none",
              color: "white",
            }}
          >
            <Statistic
              title={
                <span className="total_order_color">
                  Total Revenue
                </span>
              }
              value={orderStats.totalRevenue}
              valueStyle={{
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
              }}
              prefix="৳"
              suffix={
                <DollarOutlined className="total_order_color" style={{ color: "white", fontSize: "20px" }} />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Row */}
      <Row gutter={[12, 12]} className="mb-4">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small" className="text-center">
            <Statistic
              title="Confirmed"
              value={orderStats.confirmed}
              valueStyle={{ color: "#52c41a", fontSize: "20px" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small" className="text-center">
            <Statistic
              title="Processing"
              value={orderStats.processing}
              valueStyle={{ color: "#1890ff", fontSize: "20px" }}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small" className="text-center">
            <Statistic
              title="Shipped"
              value={orderStats.shipped}
              valueStyle={{ color: "#722ed1", fontSize: "20px" }}
              prefix={<TruckOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small" className="text-center">
            <Statistic
              title="Delivered"
              value={orderStats.delivered}
              valueStyle={{ color: "#13c2c2", fontSize: "20px" }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small" className="text-center">
            <Statistic
              title="Canceled"
              value={orderStats.canceled}
              valueStyle={{ color: "#ff4d4f", fontSize: "20px" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small" className="text-center">
            <Statistic
              title="Returned"
              value={orderStats.returned}
              valueStyle={{ color: "#fa8c16", fontSize: "20px" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card
        className="mb-4"
        style={{
          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
          borderColor: isDarkMode ? "#374151" : "#e5e7eb",
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Search orders, customers, emails..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Orders</Option>
              <Option value="pending">Pending Orders</Option>
              <Option value="confirmed">Confirmed Orders</Option>
              <Option value="processing">Processing Orders</Option>
              <Option value="shipped">Shipped Orders</Option>
              <Option value="delivered">Delivered Orders</Option>
              <Option value="canceled">Canceled Orders</Option>
              <Option value="returned">Returned Orders</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8} lg={12}>
            <div className="flex justify-end space-x-2">
              <Text className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Showing {filteredData.length} of {data.length} orders
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card
        className="shadow-lg"
        style={{
          backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
          borderColor: isDarkMode ? "#374151" : "#e5e7eb",
        }}
      >
        <Spin spinning={loading} size="large">
          {filteredData.length === 0 && !loading ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span
                  className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                >
                  {searchText || statusFilter !== "all"
                    ? "No orders match your filters"
                    : "No orders found"}
                </span>
              }
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey={(record) => record._id}
              pagination={{
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} orders`,
                pageSizeOptions: ["10", "15", "25", "50"],
              }}
              scroll={{ x: 1800 }}
              size="middle"
              className={`custom-table ${isDarkMode ? "dark-table" : ""}`}
              rowClassName={(record, index) =>
                `custom-row ${isDarkMode ? "dark-row" : ""} ${
                  index % 2 === 0 ? "even-row" : "odd-row"
                }`
              }
            />
          )}
        </Spin>
      </Card>

      {/* View Order Drawer */}
      <Drawer
        title={
          <div className="flex items-center space-x-2">
            <EyeOutlined />
            <span>Order Details</span>
            {selectedOrder && (
              <Tag color="blue" style={{ marginLeft: "auto" }}>
                {selectedOrder.formattedOrderNumber ||
                  selectedOrder.orderNumber}
              </Tag>
            )}
          </div>
        }
        width={720}
        onClose={handleDrawerClose}
        open={isViewDrawerVisible}
        className={isDarkMode ? "dark-drawer" : ""}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Status Progress */}
            <Card title="Order Progress" size="small">
              <Steps
                current={getOrderStep(selectedOrder.orderStatus)}
                status={
                  selectedOrder.orderStatus === "canceled" ||
                  selectedOrder.orderStatus === "returned"
                    ? "error"
                    : "process"
                }
                size="small"
              >
                <Step title="Pending" icon={<ClockCircleOutlined />} />
                <Step title="Confirmed" icon={<CheckCircleOutlined />} />
                <Step title="Processing" icon={<ShopOutlined />} />
                <Step title="Shipped" icon={<TruckOutlined />} />
                <Step title="Delivered" icon={<ShoppingOutlined />} />
              </Steps>
            </Card>

            {/* Customer Information */}
            <Card title="Customer Information" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">
                  {selectedOrder.name}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedOrder.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {selectedOrder.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {selectedOrder.streetAddress}, {selectedOrder.area?.areaName},{" "}
                  {selectedOrder.city?.cityName}, {selectedOrder.zone?.zoneName}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Order Information */}
            <Card title="Order Information" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Order Date">
                  {new Date(selectedOrder.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Delivery Type">
                  <Tag
                    color={
                      selectedOrder.deliveryType === "on_demand"
                        ? "red"
                        : "blue"
                    }
                  >
                    {selectedOrder.deliveryType === "on_demand"
                      ? "Express (24 Hours)"
                      : "Standard (2-3 Days)"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {selectedOrder.paymentMethod?.replace("_", " ").toUpperCase()}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Tag
                    color={getPaymentStatusColor(selectedOrder.paymentStatus)}
                  >
                    {selectedOrder.paymentStatus?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Products */}
            <Card title="Ordered Items" size="small">
              <div className="space-y-3">
                {selectedOrder.products?.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {/* <Avatar
                      icon={<BookOutlined />}
                      className="bg-blue-100 text-blue-600"
                    /> */}
                    <img className="w-12 " src={product.product.photos[0]}/>
                    <div className="flex-1">
                      <Text strong>{product.title || "N/A"}</Text>
                      <div className="text-sm text-gray-500">
                        <div>Author: {product.author || "Unknown"}</div>
                        <div>ISBN: {product.isbn || "N/A"}</div>
                        <div>Format: {product.format || "N/A"}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ৳{(product.salePrice || product.price || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Qty: {product.quantity}
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Total: ৳
                        {(
                          (product.salePrice || product.price || 0) *
                          product.quantity
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Summary */}
            <Card title="Order Summary" size="small">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{selectedOrder.subtotal?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between ">
                  <span>Shipping Cost:</span>
                  <span>
                    ৳{selectedOrder.shippingCost?.toFixed(2) || "0.00"}
                  </span>
                </div>
                {selectedOrder.couponDiscount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Coupon Discount:</span>
                    <span>-৳{selectedOrder.couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <Divider style={{ margin: "12px 0" }} />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">
                    ৳{selectedOrder.totalCost?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Order Timeline */}
            {selectedOrder.orderHistory &&
              selectedOrder.orderHistory.length > 0 && (
                <Card title="Order Timeline" size="small">
                  <Timeline>
                    {selectedOrder.orderHistory.map((history, index) => (
                      <Timeline.Item
                        key={index}
                        color={getStatusColor(history.status)}
                        dot={getStatusIcon(history.status)}
                      >
                        <div>
                          <Text strong>{history.status.toUpperCase()}</Text>
                          <div className="text-sm text-gray-500">
                            {new Date(history.timestamp).toLocaleString()}
                          </div>
                          {history.note && (
                            <div className="text-sm text-gray-600 mt-1">
                              {history.note}
                            </div>
                          )}
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                icon={<PrinterOutlined />}
                onClick={() => handlePrintInvoice(selectedOrder)}
                className="bg-green-500 hover:bg-green-600 border-green-500 text-white"
              >
                Print Invoice
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  handleDrawerClose();
                  handleEdit(selectedOrder);
                }}
                className="bg-blue-500 hover:bg-blue-600 border-blue-500"
              >
                Edit Order
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit Order Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <EditOutlined />
            <span>Edit Order</span>
            {currentOrder && (
              <Tag color="blue" style={{ marginLeft: "8px" }}>
                {currentOrder.formattedOrderNumber || currentOrder.orderNumber}
              </Tag>
            )}
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        width={1000}
        footer={null}
        className={isDarkMode ? "dark-modal" : ""}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          className="space-y-4"
        >
          <Alert
            message="Order Update"
            description="You can update order details, status, and other information below."
            type="info"
            showIcon
            className="mb-4"
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Customer Name
                  </span>
                }
                name="name"
                rules={[
                  { required: true, message: "Please input customer name!" },
                ]}
              >
                <Input
                  placeholder="Enter customer name"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Phone Number
                  </span>
                }
                name="phone"
                rules={[
                  { required: true, message: "Please input phone number!" },
                ]}
              >
                <Input
                  placeholder="Enter phone number"
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Email
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Please input email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  placeholder="Enter email address"
                  prefix={<MailOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Total Cost
                  </span>
                }
                name="totalCost"
                rules={[
                  { required: true, message: "Please input total cost!" },
                ]}
              >
                <Input
                  type="number"
                  placeholder="Enter total cost"
                  prefix="৳"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                Street Address
              </span>
            }
            name="streetAddress"
            rules={[
              { required: true, message: "Please input street address!" },
            ]}
          >
            <TextArea rows={2} placeholder="Enter complete street address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    City
                  </span>
                }
                name="cityName"
              >
                <Input placeholder="City name" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Zone
                  </span>
                }
                name="zoneName"
              >
                <Input placeholder="Zone name" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Area
                  </span>
                }
                name="areaName"
              >
                <Input placeholder="Area name" disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Delivery Type
                  </span>
                }
                name="deliveryType"
              >
                <Select placeholder="Select delivery type">
                  <Option value="normal">
                    <div className="flex items-center space-x-2">
                      <ClockCircleOutlined />
                      <span>Standard (48 Hours)</span>
                    </div>
                  </Option>
                  <Option value="on_demand">
                    <div className="flex items-center space-x-2">
                      <TruckOutlined />
                      <span>Express (24 Hours)</span>
                    </div>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Shipping Cost
                  </span>
                }
                name="shippingCost"
              >
                <Input type="number" placeholder="Shipping cost" prefix="৳" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Payment Method
                  </span>
                }
                name="paymentMethod"
              >
                <Select placeholder="Select payment method">
                  <Option value="cash_on_delivery">
                    <div className="flex items-center space-x-2">
                      <DollarOutlined />
                      <span>Cash on Delivery</span>
                    </div>
                  </Option>
                  <Option value="bkash">
                    <div className="flex items-center space-x-2">
                      <CreditCardOutlined />
                      <span>bKash</span>
                    </div>
                  </Option>
                  <Option value="credit_card">
                    <div className="flex items-center space-x-2">
                      <CreditCardOutlined />
                      <span>Credit Card</span>
                    </div>
                  </Option>
                  <Option value="bank_transfer">
                    <div className="flex items-center space-x-2">
                      <CreditCardOutlined />
                      <span>Bank Transfer</span>
                    </div>
                  </Option>
                  <Option value="sslcommerz">
                    <div className="flex items-center space-x-2">
                      <CreditCardOutlined />
                      <span>SSL Commerz</span>
                    </div>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Order Status
                  </span>
                }
                name="orderStatus"
                rules={[
                  { required: true, message: "Please select order status!" },
                ]}
              >
                <Select placeholder="Select order status">
                  <Option value="pending">
                    <div className="flex items-center space-x-2">
                      <ClockCircleOutlined style={{ color: "#faad14" }} />
                      <span>Pending</span>
                    </div>
                  </Option>
                  <Option value="confirmed">
                    <div className="flex items-center space-x-2">
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      <span>Confirmed</span>
                    </div>
                  </Option>
                  <Option value="processing">
                    <div className="flex items-center space-x-2">
                      <ShopOutlined style={{ color: "#1890ff" }} />
                      <span>Processing</span>
                    </div>
                  </Option>
                  <Option value="shipped">
                    <div className="flex items-center space-x-2">
                      <TruckOutlined style={{ color: "#722ed1" }} />
                      <span>Shipped</span>
                    </div>
                  </Option>
                  <Option value="delivered">
                    <div className="flex items-center space-x-2">
                      <ShoppingOutlined style={{ color: "#13c2c2" }} />
                      <span>Delivered</span>
                    </div>
                  </Option>
                  <Option value="canceled">
                    <div className="flex items-center space-x-2">
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                      <span>Canceled</span>
                    </div>
                  </Option>
                  <Option value="returned">
                    <div className="flex items-center space-x-2">
                      <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
                      <span>Returned</span>
                    </div>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Payment Status
                  </span>
                }
                name="paymentStatus"
              >
                <Select placeholder="Select payment status">
                  <Option value="pending">
                    <div className="flex items-center space-x-2">
                      <ClockCircleOutlined style={{ color: "#faad14" }} />
                      <span>Pending</span>
                    </div>
                  </Option>
                  <Option value="paid">
                    <div className="flex items-center space-x-2">
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      <span>Paid</span>
                    </div>
                  </Option>
                  <Option value="processing">
                    <div className="flex items-center space-x-2">
                      <ShopOutlined style={{ color: "#1890ff" }} />
                      <span>Processing</span>
                    </div>
                  </Option>
                  <Option value="failed">
                    <div className="flex items-center space-x-2">
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                      <span>Failed</span>
                    </div>
                  </Option>
                  <Option value="refunded">
                    <div className="flex items-center space-x-2">
                      <ExclamationCircleOutlined style={{ color: "#722ed1" }} />
                      <span>Refunded</span>
                    </div>
                  </Option>
                  <Option value="partial">
                    <div className="flex items-center space-x-2">
                      <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
                      <span>Partial</span>
                    </div>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Tracking Number
                  </span>
                }
                name="trackingNumber"
              >
                <Input
                  placeholder="Enter tracking number"
                  prefix={<TruckOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Coupon Code
                  </span>
                }
                name="coupon"
              >
                <Input
                  placeholder="Enter coupon code"
                  prefix={<FileTextOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Subtotal
                  </span>
                }
                name="subtotal"
              >
                <Input type="number" placeholder="Subtotal amount" prefix="৳" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Coupon Discount
                  </span>
                }
                name="couponDiscount"
              >
                <Input type="number" placeholder="Discount amount" prefix="৳" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Order Notes
                  </span>
                }
                name="notes"
              >
                <TextArea
                  rows={3}
                  placeholder="Enter order notes (customer notes)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <span
                    className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Admin Notes
                  </span>
                }
                name="adminNotes"
              >
                <TextArea
                  rows={3}
                  placeholder="Enter admin notes (internal use only)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider
            className={isDarkMode ? "border-gray-600" : "border-gray-200"}
          />

          <div className="flex justify-end space-x-3">
            <Button
              onClick={handleCancel}
              size="large"
              className="min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="min-w-[120px] bg-blue-500 hover:bg-blue-600 border-blue-500"
              icon={<CheckCircleOutlined />}
            >
              Update Order
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Custom Styles */}
      {/* Custom Styles */}
      <style jsx>{`
        .stat-card {
          transition: all 0.3s ease;
          border-radius: 12px;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        /* Statistics Card Title Color Fix */
        .stat-card .ant-statistic-title {
          color: rgba(255, 255, 255, 0.9) !important;
        }

        .stat-card .ant-statistic-content {
          color: white !important;
        }

        .stat-card .ant-statistic-content-value {
          color: white !important;
        }

        /* Table Styles */
        .custom-table .ant-table-thead > tr > th {
          background: ${isDarkMode ? "#374151" : "#fafafa"} !important;
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
          border-bottom: 2px solid ${isDarkMode ? "#4b5563" : "#f0f0f0"} !important;
          font-weight: 600;
          padding: 16px 12px;
        }

        .custom-table .ant-table-tbody > tr {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"} !important;
        }

        .custom-table .ant-table-tbody > tr:hover {
          background: ${isDarkMode ? "#374151" : "#f5f5f5"} !important;
        }

        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${isDarkMode ? "#374151" : "#f0f0f0"} !important;
          padding: 16px 12px;
        }

        .custom-table .ant-table-tbody > tr > td * {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        /* Text Color Fixes */
        .ant-typography {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-typography.text-white {
          color: ${isDarkMode ? "#ffffff" : "#111827"} !important;
        }

        .ant-typography.text-gray-900 {
          color: ${isDarkMode ? "#e5e7eb" : "#111827"} !important;
        }

        .ant-typography.text-gray-600 {
          color: ${isDarkMode ? "#d1d5db" : "#4b5563"} !important;
        }

        .ant-typography.text-gray-500 {
          color: ${isDarkMode ? "#9ca3af" : "#6b7280"} !important;
        }

        .ant-typography.text-gray-400 {
          color: ${isDarkMode ? "#9ca3af" : "#9ca3af"} !important;
        }

        .ant-typography.text-gray-300 {
          color: ${isDarkMode ? "#d1d5db" : "#6b7280"} !important;
        }

        /* Custom Text Classes */
        .text-white {
          color: ${isDarkMode ? "#ffffff" : "#111827"} !important;
        }

        .text-gray-900 {
          color: ${isDarkMode ? "#e5e7eb" : "#111827"} !important;
        }

        .text-gray-600 {
          color: ${isDarkMode ? "#d1d5db" : "#4b5563"} !important;
        }

        .text-gray-500 {
          color: ${isDarkMode ? "#9ca3af" : "#6b7280"} !important;
        }

        .text-gray-400 {
          color: ${isDarkMode ? "#9ca3af" : "#9ca3af"} !important;
        }

        .text-gray-300 {
          color: ${isDarkMode ? "#d1d5db" : "#6b7280"} !important;
        }

        .text-green-600 {
          color: ${isDarkMode ? "#10b981" : "#059669"} !important;
        }

        .text-green-400 {
          color: ${isDarkMode ? "#34d399" : "#10b981"} !important;
        }

        .text-blue-500 {
          color: ${isDarkMode ? "#3b82f6" : "#1d4ed8"} !important;
        }

        .text-blue-600 {
          color: ${isDarkMode ? "#2563eb" : "#1d4ed8"} !important;
        }

        .text-red-500 {
          color: ${isDarkMode ? "#ef4444" : "#dc2626"} !important;
        }

        /* Modal Styles */
        .dark-modal .ant-modal-content {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"} !important;
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .dark-modal .ant-modal-header {
          background: ${isDarkMode ? "#374151" : "#ffffff"} !important;
          border-bottom: 1px solid ${isDarkMode ? "#4b5563" : "#f0f0f0"} !important;
        }

        .dark-modal .ant-modal-title {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        /* Drawer Styles */
        .dark-drawer .ant-drawer-content {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"} !important;
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .dark-drawer .ant-drawer-header {
          background: ${isDarkMode ? "#374151" : "#ffffff"} !important;
          border-bottom: 1px solid ${isDarkMode ? "#4b5563" : "#f0f0f0"} !important;
        }

        .dark-drawer .ant-drawer-title {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        /* Form Controls */
        .ant-select-dropdown {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"} !important;
        }

        .ant-select-item {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-select-item:hover {
          background: ${isDarkMode ? "#374151" : "#f5f5f5"} !important;
        }

        .ant-input {
          background: ${isDarkMode ? "#374151" : "#ffffff"} !important;
          border-color: ${isDarkMode ? "#4b5563" : "#d9d9d9"} !important;
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-input:focus {
          border-color: ${isDarkMode ? "#60a5fa" : "#40a9ff"} !important;
          box-shadow: 0 0 0 2px
            ${isDarkMode
              ? "rgba(96, 165, 250, 0.2)"
              : "rgba(24, 144, 255, 0.2)"} !important;
        }

        .ant-input::placeholder {
          color: ${isDarkMode ? "#9ca3af" : "#8c8c8c"} !important;
        }

        .ant-select-selector {
          background: ${isDarkMode ? "#374151" : "#ffffff"} !important;
          border-color: ${isDarkMode ? "#4b5563" : "#d9d9d9"} !important;
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-select-selection-placeholder {
          color: ${isDarkMode ? "#9ca3af" : "#8c8c8c"} !important;
        }

        .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
          border-color: ${isDarkMode ? "#60a5fa" : "#40a9ff"} !important;
        }

        .ant-select-focused .ant-select-selector {
          border-color: ${isDarkMode ? "#60a5fa" : "#40a9ff"} !important;
          box-shadow: 0 0 0 2px
            ${isDarkMode
              ? "rgba(96, 165, 250, 0.2)"
              : "rgba(24, 144, 255, 0.2)"} !important;
        }

        /* Card Styles */
        .ant-card {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"} !important;
          border-color: ${isDarkMode ? "#374151" : "#e8e8e8"} !important;
        }

        .ant-card-head {
          background: ${isDarkMode ? "#374151" : "#fafafa"} !important;
          border-bottom: 1px solid ${isDarkMode ? "#4b5563" : "#f0f0f0"} !important;
        }

        .ant-card-head-title {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-card-body {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        /* Descriptions */
        .ant-descriptions-item-label {
          color: ${isDarkMode ? "#9ca3af" : "#595959"} !important;
        }

        .ant-descriptions-item-content {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        /* Timeline */
        .ant-timeline-item-head {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"} !important;
        }

        .ant-timeline-item-content {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        /* Steps */
        .ant-steps-item-title {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-steps-item-description {
          color: ${isDarkMode ? "#9ca3af" : "#8c8c8c"} !important;
        }

        /* Empty State */
        .ant-empty-description {
          color: ${isDarkMode ? "#9ca3af" : "#8c8c8c"} !important;
        }

        /* Alert */
        .ant-alert {
          background: ${isDarkMode ? "#1e3a8a" : "#e6f7ff"} !important;
          border-color: ${isDarkMode ? "#3b82f6" : "#91d5ff"} !important;
        }

        .ant-alert-message {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-alert-description {
          color: ${isDarkMode ? "#d1d5db" : "#595959"} !important;
        }

        /* Statistics */
        .ant-statistic .ant-statistic-title {
          color: ${isDarkMode ? "#9ca3af" : "#4b5563"} !important;
        }

        .ant-statistic .ant-statistic-content {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-statistic .ant-statistic-content-value {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        /* Form Labels */
        .ant-form-item-label > label {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        /* Pagination */
        .ant-pagination .ant-pagination-item {
          background: ${isDarkMode ? "#374151" : "#ffffff"} !important;
          border-color: ${isDarkMode ? "#4b5563" : "#d9d9d9"} !important;
        }

        .ant-pagination .ant-pagination-item a {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-pagination .ant-pagination-item:hover {
          border-color: ${isDarkMode ? "#60a5fa" : "#40a9ff"} !important;
        }

        .ant-pagination .ant-pagination-item:hover a {
          color: ${isDarkMode ? "#60a5fa" : "#40a9ff"} !important;
        }

        /* Divider */
        .ant-divider {
          border-color: ${isDarkMode ? "#4b5563" : "#f0f0f0"} !important;
        }

        /* Table Pagination Info */
        .ant-pagination-total-text {
          color: ${isDarkMode ? "#9ca3af" : "#8c8c8c"} !important;
        }

        /* Additional Text Fixes */
        .space-y-1 > * {
          color: inherit !important;
        }

        .space-y-2 > * {
          color: inherit !important;
        }

        /* Badge Override */
        .ant-badge .ant-badge-count {
          background: ${isDarkMode ? "#4b5563" : "#f0f0f0"} !important;
          color: ${isDarkMode ? "#e5e7eb" : "#666"} !important;
        }

        /* Text Area */
        .ant-input {
          background: ${isDarkMode ? "#374151" : "#ffffff"} !important;
          border-color: ${isDarkMode ? "#4b5563" : "#d9d9d9"} !important;
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        /* Button Text Fix */
        .ant-btn {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-btn-primary {
          color: #ffffff !important;
        }

        .ant-btn-danger {
          color: #ffffff !important;
        }

        /* Table Cell Text */
        .custom-table td {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .custom-table td .ant-typography {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        /* Specific fixes for table content */
        .custom-table .text-gray-900 {
          color: ${isDarkMode ? "#e5e7eb" : "#111827"} !important;
        }

        .custom-table .text-gray-600 {
          color: ${isDarkMode ? "#d1d5db" : "#4b5563"} !important;
        }

        .custom-table .text-gray-500 {
          color: ${isDarkMode ? "#9ca3af" : "#6b7280"} !important;
        }

        .custom-table .text-gray-400 {
          color: ${isDarkMode ? "#9ca3af" : "#9ca3af"} !important;
        }

        .custom-table .text-gray-300 {
          color: ${isDarkMode ? "#d1d5db" : "#d1d5db"} !important;
        }

        /* Override for header title text */
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          color: ${isDarkMode ? "#e5e7eb" : "#111827"} !important;
        }

        .ant-typography h1,
        .ant-typography h2,
        .ant-typography h3,
        .ant-typography h4,
        .ant-typography h5,
        .ant-typography h6 {
          color: ${isDarkMode ? "#e5e7eb" : "#111827"} !important;
        }

        /* Tooltip */
        .ant-tooltip-inner {
          background: ${isDarkMode ? "#374151" : "#333"} !important;
          color: ${isDarkMode ? "#e5e7eb" : "#fff"} !important;
        }

        /* Popconfirm */
        .ant-popover-inner {
          background: ${isDarkMode ? "#1f2937" : "#fff"} !important;
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-popover-title {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }

        .ant-popover-inner-content {
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }
        .total_order_color{
          color: ${isDarkMode ? "#e5e7eb" : "#262626"} !important;
        }
      `}</style>
    </div>
  );
};

export default Order;
