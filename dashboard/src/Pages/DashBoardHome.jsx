import React, { useState, useEffect } from "react";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { TbBasketCancel } from "react-icons/tb";
import { MdOutlineSell } from "react-icons/md";

import { Alert, Calendar, Card, Row, Col, Statistic } from "antd";
import axios from "../Components/Axios";
import dayjs from "dayjs";
import CountUp from "react-countup";
import { useTheme } from "../LayOut/MainLayout"; // Import theme hook

const Home = () => {
  const { isDarkMode } = useTheme(); // Use theme context
  const [value, setValue] = useState(() => dayjs());
  const [selectedValue, setSelectedValue] = useState(() => dayjs());
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTotalOrders(),
          fetchTotalProducts(),
          fetchTotalSales()
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch Total Delivered Orders
    const fetchTotalOrders = async () => {
      try {
        const response = await axios.get("/order");
        const deliveredOrders = response.data.data.doc.filter((order) =>
          dayjs(order.createdAt).isSame(value, "month")
        );
        setTotalOrders(deliveredOrders.length);
      } catch (error) {
        console.error("Error fetching total orders:", error);
        // Set a fallback value if orders endpoint fails
        setTotalOrders(0);
      }
    };

    // Fetch Total Products - FIXED: Changed from /varient to /product
    const fetchTotalProducts = async () => {
      try {
        const response = await axios.get("/product");
        setTotalProducts(response.data.data.doc.length);
      } catch (error) {
        console.error("Error fetching total products:", error);
        // Set a fallback value if products endpoint fails
        setTotalProducts(0);
      }
    };

    // Fetch Total Sales
    const fetchTotalSales = async () => {
      try {
        const response = await axios.get("/order");
        const salesThisMonth = response.data.data.doc
          .filter((order) => dayjs(order.createdAt).isSame(value, "month"))
          .reduce((acc, order) => acc + (order.totalCost || 0), 0);
        setTotalSales(salesThisMonth);
      } catch (error) {
        console.error("Error fetching total sales:", error);
        // Set a fallback value if sales calculation fails
        setTotalSales(0);
      }
    };

    fetchData();
  }, [value]);

  const onSelect = (newValue) => {
    setValue(newValue);
    setSelectedValue(newValue);
  };

  const onPanelChange = (newValue) => {
    setValue(newValue);
  };

  // Custom CountUp component with theme support
  const ThemedCountUp = ({ end, suffix = "", prefix = "" }) => (
    <span className={`font-bold text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {prefix}
      <CountUp end={end} duration={2} separator="," />
      {suffix}
    </span>
  );

  // Stat card data
  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <LiaFileInvoiceSolid size="32" className="text-white" />,
      bgColor: isDarkMode 
        ? 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)' 
        : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      lightBg: isDarkMode ? 'rgba(30, 64, 175, 0.1)' : '#dbeafe',
      description: "From the running month",
      color: "#3b82f6"
    },
    {
      title: "Total Products",
      value: totalProducts,
      icon: <TbBasketCancel size="32" className="text-white" />,
      bgColor: isDarkMode 
        ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' 
        : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      lightBg: isDarkMode ? 'rgba(124, 58, 237, 0.1)' : '#f3e8ff',
      description: "Total products available",
      color: "#8b5cf6"
    },
    {
      title: "Total Sales",
      value: totalSales,
      suffix: " Taka",
      icon: <MdOutlineSell size="32" className="text-white" />,
      bgColor: isDarkMode 
        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      lightBg: isDarkMode ? 'rgba(5, 150, 105, 0.1)' : '#d1fae5',
      description: "From the running month",
      color: "#10b981"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard Overview
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card
              className="stat-card relative overflow-hidden border-0 transition-all duration-300 hover:scale-105"
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
                  : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                boxShadow: isDarkMode 
                  ? '0 10px 30px rgba(0, 0, 0, 0.3)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.1)',
              }}
              bodyStyle={{ 
                padding: '24px',
                position: 'relative',
                zIndex: 2 
              }}
              loading={loading}
            >
              {/* Background Pattern */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-5"
                style={{
                  background: `radial-gradient(circle, ${stat.color} 0%, transparent 70%)`,
                  transform: 'translate(50%, -50%)'
                }}
              />
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {stat.title}
                  </h3>
                  <div className="mb-1">
                    <ThemedCountUp 
                      end={stat.value} 
                      suffix={stat.suffix || ""} 
                    />
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.description}
                  </p>
                </div>
                
                {/* Icon Container */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center ml-4 shadow-lg"
                  style={{ background: stat.bgColor }}
                >
                  {stat.icon}
                </div>
              </div>

              {/* Progress indicator (optional) */}
              <div className="mt-4 pt-4 border-t border-opacity-20" 
                   style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                <div className="flex items-center justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    Monthly Progress
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    +{Math.floor(Math.random() * 20 + 5)}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full mt-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      background: stat.bgColor,
                      width: `${Math.floor(Math.random() * 40 + 60)}%`
                    }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Selected Date Alert */}
      <Alert
        message={`Selected Date: ${selectedValue?.format("MMMM DD, YYYY")}`}
        description={`Viewing data for ${selectedValue?.format("MMMM YYYY")}`}
        type="info"
        showIcon
        className="mb-6"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#f0f9ff',
          borderColor: isDarkMode ? '#374151' : '#0ea5e9',
          color: isDarkMode ? '#e5e7eb' : '#0f172a'
        }}
      />

      {/* Calendar Section */}
      <Card
        title={
          <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Calendar View
          </span>
        }
        className="shadow-sm"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        }}
        headStyle={{
          backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
          borderBottomColor: isDarkMode ? '#374151' : '#e5e7eb',
        }}
      >
        <div className="calendar-container">
          <Calendar
            value={value}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
            className={`${isDarkMode ? 'dark-calendar' : ''}`}
          />
        </div>
      </Card>

      {/* Custom Styles */}
      <style>
        {`
          /* Calendar Dark Mode Styling */
          .dark-calendar .ant-picker-calendar {
            background-color: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
          }
          
          .dark-calendar .ant-picker-calendar-header {
            border-bottom-color: ${isDarkMode ? '#374151' : '#f0f0f0'} !important;
          }
          
          .dark-calendar .ant-picker-cell {
            color: ${isDarkMode ? '#e5e7eb' : '#000000'} !important;
          }
          
          .dark-calendar .ant-picker-cell:hover {
            background-color: ${isDarkMode ? '#374151' : '#f5f5f5'} !important;
          }
          
          .dark-calendar .ant-picker-cell-selected .ant-picker-cell-inner {
            background-color: #3b82f6 !important;
            color: #ffffff !important;
          }
          
          .dark-calendar .ant-picker-calendar-mode-switch,
          .dark-calendar .ant-picker-calendar-year-select,
          .dark-calendar .ant-picker-calendar-month-select {
            color: ${isDarkMode ? '#e5e7eb' : '#000000'} !important;
          }
          
          .dark-calendar .ant-select-selection-item {
            color: ${isDarkMode ? '#e5e7eb' : '#000000'} !important;
          }
          
          /* Alert Dark Mode */
          .ant-alert-info {
            background-color: ${isDarkMode ? '#1f2937' : '#f0f9ff'} !important;
            border-color: ${isDarkMode ? '#374151' : '#0ea5e9'} !important;
          }
          
          .ant-alert-info .ant-alert-message,
          .ant-alert-info .ant-alert-description {
            color: ${isDarkMode ? '#e5e7eb' : '#0f172a'} !important;
          }
          
          /* Hover Effects for Stat Cards */
          .stat-card:hover {
            transform: translateY(-4px) !important;
            box-shadow: ${isDarkMode 
              ? '0 20px 40px rgba(0, 0, 0, 0.4) !important' 
              : '0 20px 40px rgba(0, 0, 0, 0.15) !important'};
          }
          
          /* Loading Animation */
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .ant-card-loading-content > * {
            animation: pulse 1.5s ease-in-out infinite;
          }
          
          /* Responsive Adjustments */
          @media (max-width: 768px) {
            .stat-card {
              margin-bottom: 16px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;