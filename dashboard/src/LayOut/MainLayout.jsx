import React, { useEffect, useState, createContext, useContext } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  FileOutlined,
  TagOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { BiSolidCategory } from "react-icons/bi";
import { GiKnightBanner } from "react-icons/gi";
import { MdBrandingWatermark } from "react-icons/md";
import { Button, Layout, Menu, theme, Badge, Avatar, Dropdown, Input, Tooltip, Switch, ConfigProvider } from "antd";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { IoMdLogOut, IoMdMoon, IoMdSunny } from "react-icons/io";
import { BellOutlined, SettingOutlined } from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import { activeUser } from "../Slices/userSlices";
import logoImage from "../../src/assets/logowhite.png";
import logoImage1 from "../../src/assets/logo.png";

// Create Theme Context for child components
const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  const selector = useSelector((state) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Map routes to menu keys for proper selection
  const routeToMenuKey = {
    '/dashboard': '1',
    '/dashboard/order': '2',
    '/dashboard/upload-banner': '3',
    '/dashboard/all-banner': '4',
    '/dashboard/add-category': '5',
    '/dashboard/all-categories': '6',
    '/dashboard/upload-product': '7',
    '/dashboard/all-products': '8',
    '/dashboard/add-discount': '9',
    '/dashboard/add-review': '10',
    '/dashboard/coupon': '11',
    '/dashboard/add-publisher': '12',
    '/dashboard/all-brands': '13',
    '/dashboard/add-subcategory': '14',
    '/dashboard/all-subcategories': '15',
    '/dashboard/add-author': '16',
    '/dashboard/users': '17',
  };

  // Get current selected menu key based on current route
  const getCurrentMenuKey = () => {
    return routeToMenuKey[location.pathname] || '1';
  };
  
  useEffect(() => {
    if (selector?.users?.userValue?.data?.user?.role !== "aklogicAdmin") {
      navigate("/");
    }
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const handleMenuItemClick = ({ key }) => {
    // Map menu keys back to routes
    const menuKeyToRoute = {
      '1': '/dashboard',
      '2': '/dashboard/order',
      '3': '/dashboard/upload-banner',
      '4': '/dashboard/all-banner',
      '5': '/dashboard/add-category',
      '6': '/dashboard/all-categories',
      '7': '/dashboard/upload-product',
      '8': '/dashboard/all-products',
      '9': '/dashboard/add-discount',
      '10': '/dashboard/add-review',
      '11': '/dashboard/coupon',
      '12': '/dashboard/add-publisher',
      '13': '/dashboard/all-brands',
      '14': '/dashboard/add-subcategory',
      '15': '/dashboard/all-subcategories',
      '16': '/dashboard/add-author',
      '17': '/dashboard/users',
    };
    
    const route = menuKeyToRoute[key];
    if (route) {
      navigate(route);
    }
  };
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  function getItem(label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label,
    };
  }

  let items = [
    getItem("Dashboard", "1", <DashboardOutlined />),
    getItem("Orders", "2", <ShoppingCartOutlined />),
    getItem("Users", "17", <UserOutlined />),
    
    // Category Management
    getItem("Categories", "sub_category", <BiSolidCategory />, [
      getItem("Add Category", "5"),
      getItem("All Categories", "6"),
    ]),
    
    // Sub Category Management
    getItem("Sub Categories", "sub_subcategory", <AppstoreOutlined />, [
      getItem("Add Sub Category", "14"),
      // getItem("All Sub Categories", "15"),
    ]),
    
    // Brand Management
    getItem("Publisher", "sub_brand", <MdBrandingWatermark />, [
      getItem("Add Publisher", "12"),
      // getItem("All Publisher", "13"),
    ]),
    
    getItem("Author", "16", <UserOutlined />),
    // Product Management
    getItem("Products", "sub_product", <UploadOutlined />, [
      getItem("Upload Product", "7"),
      getItem("All Products", "8"),
    ]),
    
    getItem("Review", "10", <CommentOutlined />),
    getItem("Banners", "3", <GiKnightBanner />),
    getItem("Discounts", "9", <TagOutlined />),
    getItem("Coupons", "11", <FileOutlined />),
  ];

  // Filter menu items based on search
  const filterMenuItems = (items, search) => {
    if (!search) return items;
    
    return items.filter(item => {
      const matchesLabel = item.label?.toLowerCase().includes(search.toLowerCase());
      const hasMatchingChildren = item.children?.some(child => 
        child.label?.toLowerCase().includes(search.toLowerCase())
      );
      return matchesLabel || hasMatchingChildren;
    }).map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => 
            child.label?.toLowerCase().includes(search.toLowerCase())
          )
        };
      }
      return item;
    });
  };

  const filteredItems = filterMenuItems(items, searchTerm);

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(activeUser(null));
    navigate("/");
  };

  const userMenuItems = [
    // {
    //   key: '1',
    //   label: 'Profile Settings',
    //   icon: <SettingOutlined />,
    // },
    // {
    //   key: '2',
    //   label: 'Help & Support',
    //   icon: <QuestionCircleOutlined />,
    // },
    // {
    //   type: 'divider',
    // },
    {
      key: '1',
      label: 'Logout',
      icon: <IoMdLogOut />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Get page title based on current route
  const getPageTitle = () => {
    const pathMap = {
      '/dashboard': 'Dashboard Overview',
      '/dashboard/order': 'Order Management',
      '/dashboard/upload-banner': 'Upload Banner',
      '/dashboard/all-banner': 'Banner Management',
      '/dashboard/add-category': 'Add Category',
      '/dashboard/all-categories': 'Category Management',
      '/dashboard/upload-product': 'Upload Product',
      '/dashboard/all-products': 'Product Management',
      '/dashboard/add-discount': 'Add Discount',
      '/dashboard/coupon': 'Coupon Management',
      '/dashboard/add-brand': 'Add Brand',
      '/dashboard/add-publisher': 'Publisher Management',
      '/dashboard/add-subcategory': 'Add Sub Category',
      '/dashboard/all-subcategories': 'Sub Category Management',
      '/dashboard/add-author': 'Author Management',
      '/dashboard/users': 'Users Management',
    };
    
    return pathMap[location.pathname] || 'Dashboard';
  };

  // Theme configuration for Ant Design components
  const antdTheme = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#3b82f6',
      colorInfo: '#3b82f6',
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      borderRadius: 8,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    components: {
      Layout: {
        bodyBg: isDarkMode ? '#0f0f0f' : '#f8fafc',
        headerBg: isDarkMode ? '#1f1f1f' : '#ffffff',
        siderBg: isDarkMode ? '#1a1a1a' : '#ffffff',
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: isDarkMode ? '#1e40af' : '#3b82f6',
        itemHoverBg: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
      },
      Button: {
        borderRadius: 8,
      },
      Input: {
        borderRadius: 8,
      },
      Card: {
        borderRadius: 12,
      },
    },
  };

  const siderTheme = isDarkMode ? 'dark' : 'light';
  const contentBg = isDarkMode ? '#0f0f0f' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
  const headerBg = isDarkMode ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)';

  return (
    <ConfigProvider theme={antdTheme}>
      <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
        <Layout hasSider className="min-h-screen">
          <Sider
            style={{
              background: isDarkMode 
                ? 'linear-gradient(180deg, #1f1f1f 0%, #141414 100%)' 
                : 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
              boxShadow: isDarkMode 
                ? '4px 0 24px rgba(0, 0, 0, 0.3)' 
                : '4px 0 24px rgba(0, 0, 0, 0.06)',
              borderRight: isDarkMode ? '1px solid #262626' : '1px solid #f0f0f0',
              overflow: "auto",
              height: "100vh",
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 100,
            }}
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={280}
            collapsedWidth={70}
          >
            {/* Logo Section */}
            <div className="flex items-center justify-center py-6 px-4 border-b border-opacity-20" 
                 style={{ borderColor: isDarkMode ? '#404040' : '#e5e5e5' }}>
              <div className={`transition-all duration-300 ${collapsed ? 'w-10' : 'w-32'}`}>
                {
                  isDarkMode ?                 <img 
                  src={logoImage} 
                  alt="BookWorm Admin" 
                  className="w-full h-auto"
                  style={{ filter: isDarkMode ? 'brightness(1.1)' : 'brightness(0.8) contrast(1.2)' }}
                />:                <img 
                  src={logoImage1} 
                  alt="BookWorm Admin" 
                  className="w-full h-auto"
                  style={{ filter: isDarkMode ? 'brightness(1.1)' : 'brightness(0.8) contrast(1.2)' }}
                />
                }

              </div>
            </div>

            {/* Search Section (when not collapsed) */}
            {!collapsed && (
              <div className="p-4">
                <Input
                  placeholder="Search menu..."
                  prefix={<SearchOutlined style={{ color: isDarkMode ? '#8c8c8c' : '#bfbfbf' }} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg"
                  style={{
                    backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
                    borderColor: isDarkMode ? '#404040' : '#d9d9d9',
                  }}
                />
              </div>
            )}

            {/* Menu Section */}
            <div className="px-2 pb-4">
              <Menu
                theme={siderTheme}
                className="!bg-transparent !border-none"
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                onClick={handleMenuItemClick}
                selectedKeys={[getCurrentMenuKey()]}
                mode="inline"
                items={filteredItems}
                inlineIndent={20}
              />
            </div>

            {/* User Profile Section at Bottom */}
            {!collapsed && (
              <div className="absolute bottom-4 left-4 right-4 rounded-xl p-4 backdrop-blur-sm transition-all duration-300"
                   style={{ 
                     backgroundColor: isDarkMode ? 'rgba(38, 38, 38, 0.8)' : 'rgba(248, 250, 252, 0.8)',
                     border: isDarkMode ? '1px solid #404040' : '1px solid #e2e8f0'
                   }}>
                <div className="flex items-center gap-3">
                  <Avatar 
                    size="default" 
                    style={{ backgroundColor: '#3b82f6', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' }}
                    icon={<UserOutlined />}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selector?.users?.userValue?.data?.user?.name || 'Admin User'}
                    </p>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selector?.users?.userValue?.data?.user?.email || 'admin@bookworm.com'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button for Collapsed State */}
            {collapsed && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Tooltip title="Logout" placement="right">
                  <Button
                    type="text"
                    icon={<IoMdLogOut style={{ color: '#ef4444' }} />}
                    onClick={handleLogout}
                    className="!border-none !bg-transparent hover:!bg-red-50"
                    size="large"
                  />
                </Tooltip>
              </div>
            )}
          </Sider>

          <Layout
            style={{
              marginLeft: collapsed ? 70 : 280,
              transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Header */}
            <Header
              style={{
                padding: '0 24px',
                background: headerBg,
                backdropFilter: 'blur(20px)',
                borderBottom: isDarkMode ? '1px solid #262626' : '1px solid #f0f0f0',
                boxShadow: isDarkMode 
                  ? '0 2px 16px rgba(0, 0, 0, 0.2)' 
                  : '0 2px 16px rgba(0, 0, 0, 0.04)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-4">
                  <Tooltip title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
                    <Button
                      type="text"
                      icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                      onClick={() => setCollapsed(!collapsed)}
                      className="!border-none hover:!bg-gray-100 !text-gray-600 transition-all duration-200"
                      style={{
                        fontSize: "16px",
                        width: 44,
                        height: 44,
                      }}
                    />
                  </Tooltip>
                  
                  {/* Page Title with Breadcrumb */}
                  <div className="flex flex-col">
                    <span className={`text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ${isDarkMode ? 'text-white' : ''}`}>
                      {getPageTitle()}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
                      <Switch
                        checkedChildren={<IoMdMoon />}
                        unCheckedChildren={<IoMdSunny />}
                        checked={isDarkMode}
                        onChange={setIsDarkMode}
                        className="bg-gray-300"
                      />
                    </Tooltip>

                    {/* Fullscreen Toggle */}
                    <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                      <Button
                        type="text"
                        icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                        onClick={toggleFullscreen}
                        className="!border-none hover:!bg-gray-100 !text-gray-600"
                        size="large"
                      />
                    </Tooltip>

                    {/* Help */}
                    {/* <Tooltip title="Help & Documentation">
                      <Button
                        type="text"
                        icon={<QuestionCircleOutlined />}
                        className="!border-none hover:!bg-gray-100 !text-gray-600"
                        size="large"
                      />
                    </Tooltip> */}
                  </div>

                  {/* Notifications */}
                  {/* <Badge count={3} size="small" offset={[-2, 2]}>
                    <Tooltip title="Notifications">
                      <Button
                        type="text"
                        icon={<BellOutlined />}
                        className="!border-none hover:!bg-gray-100 !text-gray-600"
                        size="large"
                      />
                    </Tooltip>
                  </Badge> */}

                  {/* User Profile Dropdown */}
                  <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    arrow={{ pointAtCenter: true }}
                    trigger={['click']}
                  >
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl px-3 py-2 transition-all duration-200">
                      <Avatar 
                        size="small" 
                        style={{ backgroundColor: '#3b82f6', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' }}
                        icon={<UserOutlined />}
                      />
                      <div className="hidden md:block">
                        <p className={`text-sm font-semibold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selector?.users?.userValue?.data?.user?.name || 'Admin'}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Administrator
                        </p>
                      </div>
                    </div>
                  </Dropdown>
                </div>
              </div>
            </Header>

            {/* Content */}
            <Content
              style={{
                background: contentBg,
                minHeight: 'calc(100vh - 64px)',
                overflow: "initial",
              }}
              className="p-6"
            >
              <div 
                className="rounded-2xl shadow-sm border min-h-[calc(100vh-140px)] p-6 transition-all duration-300"
                style={{
                  backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
                  borderColor: isDarkMode ? '#262626' : '#f0f0f0',
                  boxShadow: isDarkMode 
                    ? '0 4px 24px rgba(0, 0, 0, 0.12)' 
                    : '0 4px 24px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* Content outlet with theme context and enhanced styling */}
                <div className="animate-fadeIn" data-theme={isDarkMode ? 'dark' : 'light'}>
                  <style>
                    {`
                      .animate-fadeIn {
                        color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};
                      }
                      
                      /* Global styles for all child components */
                      .animate-fadeIn h1, .animate-fadeIn h2, .animate-fadeIn h3, 
                      .animate-fadeIn h4, .animate-fadeIn h5, .animate-fadeIn h6 {
                        color: ${isDarkMode ? '#f9fafb' : '#111827'} !important;
                      }
                      
                      .animate-fadeIn p, .animate-fadeIn span, .animate-fadeIn div {
                        color: ${isDarkMode ? '#e5e7eb' : '#374151'};
                      }
                      
                      .animate-fadeIn .text-muted {
                        color: ${isDarkMode ? '#9ca3af' : '#6b7280'} !important;
                      }
                      
                      .animate-fadeIn .bg-white {
                        background-color: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
                      }
                      
                      .animate-fadeIn .bg-gray-50 {
                        background-color: ${isDarkMode ? '#111827' : '#f9fafb'} !important;
                      }
                      
                      .animate-fadeIn .bg-gray-100 {
                        background-color: ${isDarkMode ? '#1f2937' : '#f3f4f6'} !important;
                      }
                      
                      .animate-fadeIn .border-gray-200 {
                        border-color: ${isDarkMode ? '#374151' : '#e5e7eb'} !important;
                      }
                      
                      .animate-fadeIn .border-gray-300 {
                        border-color: ${isDarkMode ? '#4b5563' : '#d1d5db'} !important;
                      }
                      
                      /* Table styling */
                      .animate-fadeIn .ant-table {
                        background-color: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
                      }
                      
                      .animate-fadeIn .ant-table-thead > tr > th {
                        background-color: ${isDarkMode ? '#111827' : '#f9fafb'} !important;
                        color: ${isDarkMode ? '#f3f4f6' : '#374151'} !important;
                        border-bottom: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'} !important;
                      }
                      
                      .animate-fadeIn .ant-table-tbody > tr > td {
                        background-color: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
                        color: ${isDarkMode ? '#e5e7eb' : '#374151'} !important;
                        border-bottom: 1px solid ${isDarkMode ? '#374151' : '#f3f4f6'} !important;
                      }
                      
                      .animate-fadeIn .ant-table-tbody > tr:hover > td {
                        background-color: ${isDarkMode ? '#374151' : '#f8fafc'} !important;
                      }
                      
                      /* Form styling */
                      .animate-fadeIn .ant-form-item-label > label {
                        color: ${isDarkMode ? '#f3f4f6' : '#374151'} !important;
                      }
                      
                      .animate-fadeIn .ant-input {
                        background-color: ${isDarkMode ? '#374151' : '#ffffff'} !important;
                        border-color: ${isDarkMode ? '#4b5563' : '#d1d5db'} !important;
                        color: ${isDarkMode ? '#f3f4f6' : '#111827'} !important;
                      }
                      
                      .animate-fadeIn .ant-input:focus,
                      .animate-fadeIn .ant-input-focused {
                        background-color: ${isDarkMode ? '#374151' : '#ffffff'} !important;
                        border-color: #3b82f6 !important;
                      }
                      
                      .animate-fadeIn .ant-select-selector {
                        background-color: ${isDarkMode ? '#374151' : '#ffffff'} !important;
                        border-color: ${isDarkMode ? '#4b5563' : '#d1d5db'} !important;
                        color: ${isDarkMode ? '#f3f4f6' : '#111827'} !important;
                      }
                      
                      /* Card styling */
                      .animate-fadeIn .ant-card {
                        background-color: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
                        border-color: ${isDarkMode ? '#374151' : '#e5e7eb'} !important;
                      }
                      
                      .animate-fadeIn .ant-card-head {
                        background-color: ${isDarkMode ? '#111827' : '#f9fafb'} !important;
                        border-bottom-color: ${isDarkMode ? '#374151' : '#e5e7eb'} !important;
                      }
                      
                      .animate-fadeIn .ant-card-head-title {
                        color: ${isDarkMode ? '#f9fafb' : '#111827'} !important;
                      }
                      
                      /* Modal styling */
                      .animate-fadeIn .ant-modal-content {
                        background-color: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
                      }
                      
                      .animate-fadeIn .ant-modal-header {
                        background-color: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
                        border-bottom-color: ${isDarkMode ? '#374151' : '#f0f0f0'} !important;
                      }
                      
                      .animate-fadeIn .ant-modal-title {
                        color: ${isDarkMode ? '#f9fafb' : '#000000'} !important;
                      }
                      
                      /* Statistics cards */
                      .animate-fadeIn .stat-card {
                        background: ${isDarkMode 
                          ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
                          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'} !important;
                        border: 1px solid ${isDarkMode ? '#374151' : '#e2e8f0'} !important;
                        box-shadow: ${isDarkMode 
                          ? '0 4px 24px rgba(0, 0, 0, 0.2)' 
                          : '0 4px 24px rgba(0, 0, 0, 0.06)'} !important;
                      }
                      
                      /* Custom scrollbar for dark mode */
                      .animate-fadeIn *::-webkit-scrollbar {
                        width: 6px;
                        height: 6px;
                      }
                      
                      .animate-fadeIn *::-webkit-scrollbar-track {
                        background: ${isDarkMode ? '#1f2937' : '#f1f1f1'};
                      }
                      
                      .animate-fadeIn *::-webkit-scrollbar-thumb {
                        background: ${isDarkMode ? '#4b5563' : '#c1c1c1'};
                        border-radius: 3px;
                      }
                      
                      .animate-fadeIn *::-webkit-scrollbar-thumb:hover {
                        background: ${isDarkMode ? '#6b7280' : '#a8a8a8'};
                      }
                    `}
                  </style>
                  <Outlet />
                </div>
              </div>
            </Content>

            {/* Enhanced Footer */}
            <div 
              className="border-t py-4 text-center transition-all duration-300"
              style={{
                backgroundColor: isDarkMode ? '#141414' : '#ffffff',
                borderColor: isDarkMode ? '#262626' : '#f0f0f0',
              }}
            >
              <div className="flex items-center justify-between px-6">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  © 2025 BookWorm Admin Panel. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <Link 
                    className={`text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                    to="https://bookworm.com/support"
                  >
                    Support
                  </Link>
                  <Link 
                    className={`text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                    to="https://bookworm.com/docs"
                  >
                    Documentation
                  </Link>
                </div>
              </div>
            </div>
          </Layout>
        </Layout>

        {/* Enhanced Custom Styles */}
        <style>
          {`
            /* Animation Keyframes */
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes slideInRight {
              from {
                opacity: 0;
                transform: translateX(20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            
            .animate-fadeIn {
              animation: fadeIn 0.4s ease-out;
            }
            
            /* Enhanced Menu Styling */
            .ant-menu-light .ant-menu-item-selected {
              background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%) !important;
              color: white !important;
              border-radius: 12px !important;
              margin: 4px 8px !important;
              box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3) !important;
              font-weight: 600 !important;
            }
            
            .ant-menu-dark .ant-menu-item-selected {
              background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%) !important;
              border-radius: 12px !important;
              margin: 4px 8px !important;
              box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4) !important;
              font-weight: 600 !important;
            }
            
            .ant-menu-light .ant-menu-item,
            .ant-menu-dark .ant-menu-item {
              margin: 2px 8px !important;
              border-radius: 10px !important;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
              font-weight: 500 !important;
            }
            
            .ant-menu-light .ant-menu-item:hover {
              background: rgba(59, 130, 246, 0.08) !important;
              color: #3b82f6 !important;
              transform: translateX(2px);
            }
            
            .ant-menu-dark .ant-menu-item:hover {
              background: rgba(59, 130, 246, 0.15) !important;
              color: #60a5fa !important;
              transform: translateX(2px);
            }
            
            .ant-menu-light .ant-menu-submenu-title,
            .ant-menu-dark .ant-menu-submenu-title {
              margin: 2px 8px !important;
              border-radius: 10px !important;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
              font-weight: 500 !important;
            }
            
            .ant-menu-light .ant-menu-submenu-title:hover,
            .ant-menu-dark .ant-menu-submenu-title:hover {
              background: rgba(59, 130, 246, 0.08) !important;
              color: #3b82f6 !important;
              transform: translateX(2px);
            }
            
            .ant-menu-light .ant-menu-submenu-open > .ant-menu-submenu-title,
            .ant-menu-dark .ant-menu-submenu-open > .ant-menu-submenu-title {
              background: rgba(59, 130, 246, 0.12) !important;
              color: #3b82f6 !important;
            }
            
            /* Sub Menu Items */
            .ant-menu-light .ant-menu-sub .ant-menu-item,
            .ant-menu-dark .ant-menu-sub .ant-menu-item {
              padding-left: 40px !important;
              margin: 1px 12px !important;
            }
            
            /* Enhanced Scrollbar */
            .ant-layout-sider::-webkit-scrollbar {
              width: 6px;
            }
            
            .ant-layout-sider::-webkit-scrollbar-track {
              background: transparent;
              margin: 8px 0;
            }
            
            .ant-layout-sider::-webkit-scrollbar-thumb {
              background: rgba(59, 130, 246, 0.2);
              border-radius: 6px;
              transition: background 0.3s ease;
            }
            
            .ant-layout-sider::-webkit-scrollbar-thumb:hover {
              background: rgba(59, 130, 246, 0.4);
            }
            
            /* Layout Transitions */
            .ant-layout {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .ant-layout-sider {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            
            /* Header Backdrop Blur */
            .ant-layout-header {
              backdrop-filter: blur(20px) saturate(180%);
              -webkit-backdrop-filter: blur(20px) saturate(180%);
            }
            
            /* Button Hover Effects */
            .ant-btn:hover {
              transform: translateY(-1px);
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Input Focus Effects */
            .ant-input:focus,
            .ant-input-focused {
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
              border-color: #3b82f6 !important;
            }
            
            /* Dropdown Animation */
            .ant-dropdown {
              animation: slideInRight 0.2s ease-out;
            }
            
            /* Avatar Hover Effect */
            .ant-avatar {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .ant-avatar:hover {
              transform: scale(1.05);
              box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4) !important;
            }
            
            /* Badge Animation */
            .ant-badge-count {
              animation: fadeIn 0.3s ease-out;
            }
            
            /* Switch Styling */
            .ant-switch-checked {
              background: #3b82f6 !important;
            }
            
            /* Responsive Adjustments */
            @media (max-width: 768px) {
              .ant-layout {
                margin-left: 0 !important;
              }
              
              .ant-layout-sider {
                position: absolute !important;
                z-index: 1000 !important;
              }
            }
          `}
        </style>
      </ThemeContext.Provider>
    </ConfigProvider>
  );
};

export default MainLayout;