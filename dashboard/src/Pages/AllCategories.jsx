import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Tag,
  Badge,
  Avatar,
  Typography,
  Button,
  Space,
  Tooltip,
  Empty,
  Spin,
  Statistic,
  Divider,
  Alert,
  message,
  Dropdown,
  Menu,
  Modal,
  Form,
  Switch,
  Popconfirm,
  Drawer,
  Descriptions,
  theme,
} from "antd";
import {
  SearchOutlined,
  BookOutlined,
  TeamOutlined,
  GlobalOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
  BarsOutlined,
  SortAscendingOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  PlusOutlined,
  SettingOutlined,
  DownOutlined,
  CalendarOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null);
  
  // Modal states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const API_URL = "https://bookworm-t3mi.onrender.com/api/v1/category";

  // Modern color palette
  const categoryColors = [
    "#6366f1", "#10b981", "#8b5cf6", "#f59e0b", 
    "#06b6d4", "#ec4899", "#ef4444", "#84cc16"
  ];

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === "success" && result.data && result.data.doc) {
        const transformedCategories = result.data.doc.map((category, index) => ({
          id: category._id,
          title: category.title,
          slug: category.slug,
          isActive: category.isActive,
          subCategories: category.subCategories.map(sub => ({
            id: sub._id,
            title: sub.slug.charAt(0).toUpperCase() + sub.slug.slice(1).replace(/-/g, ' '),
            slug: sub.slug,
            isActive: sub.isActive,
          })),
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          color: categoryColors[index % categoryColors.length]
        }));
        
        setCategories(transformedCategories);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message);
      message.error(`Failed to load categories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/${categoryId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === "success" && result.data) {
        return result.data;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching category:", err);
      message.error(`Failed to load category: ${err.message}`);
      return null;
    }
  };

  const updateCategory = async (categoryId, updateData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === "success") {
        message.success('Category updated successfully!');
        fetchCategories(); // Refresh the list
        setEditModalVisible(false);
        editForm.resetFields();
        return true;
      } else {
        throw new Error(result.message || "Update failed");
      }
    } catch (err) {
      console.error("Error updating category:", err);
      message.error(`Failed to update category: ${err.message}`);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === "success") {
        message.success('Category deleted successfully!');
        fetchCategories(); // Refresh the list
        return true;
      } else {
        throw new Error(result.message || "Delete failed");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      message.error(`Failed to delete category: ${err.message}`);
      return false;
    }
  };

  const handleView = async (category) => {
    const fullCategory = await fetchSingleCategory(category.id);
    if (fullCategory) {
      setSelectedCategory({
        ...category,
        ...fullCategory
      });
      setViewModalVisible(true);
    }
  };

  const handleEdit = async (category) => {
    const fullCategory = await fetchSingleCategory(category.id);
    if (fullCategory) {
      setSelectedCategory({
        ...category,
        ...fullCategory
      });
      editForm.setFieldsValue({
        title: fullCategory.title,
        slug: fullCategory.slug,
        isActive: fullCategory.isActive,
      });
      setEditModalVisible(true);
    }
  };

  const handleDelete = async (category) => {
    await deleteCategory(category.id);
  };

  const handleEditSubmit = async (values) => {
    if (selectedCategory) {
      await updateCategory(selectedCategory.id, values);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories
    .filter((category) => {
      const matchesSearch = category.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           category.slug.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = filterStatus === "all" ||
                           (filterStatus === "active" && category.isActive) ||
                           (filterStatus === "inactive" && !category.isActive);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "subcategories":
          return b.subCategories.length - a.subCategories.length;
        case "recent":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

  const getStats = () => {
    const total = categories.length;
    const active = categories.filter(c => c.isActive).length;
    const inactive = categories.filter(c => !c.isActive).length;
    const totalSubCategories = categories.reduce((sum, c) => sum + c.subCategories.length, 0);
    
    return { total, active, inactive, totalSubCategories };
  };

  const stats = getStats();

  const handleRefresh = () => {
    fetchCategories();
  };

  const getActionMenu = (category) => (
    <Menu className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl shadow-lg">
      <Menu.Item 
        key="view" 
        icon={<EyeOutlined />} 
        onClick={() => handleView(category)}
        className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        View Details
      </Menu.Item>
      <Menu.Item 
        key="edit" 
        icon={<EditOutlined />} 
        onClick={() => handleEdit(category)}
        className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        Edit Category
      </Menu.Item>
      <Menu.Divider className="border-gray-200 dark:border-gray-600" />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
        <Popconfirm
          title="Delete Category"
          description="Are you sure you want to delete this category? This action cannot be undone."
          onConfirm={() => handleDelete(category)}
          okText="Yes, Delete"
          cancelText="Cancel"
          okType="danger"
        >
          Delete Category
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  const CategoryCard = ({ category }) => (
    <Card
      className={`h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:shadow-2xl rounded-xl overflow-hidden relative ${!category.isActive ? 'opacity-70' : ''}`}
      bodyStyle={{ padding: '20px' }}
    >
      {/* Status indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 hover:h-1.5"
        style={{
          background: category.isActive 
            ? `linear-gradient(90deg, ${category.color}, ${category.color}cc)`
            : '#94a3b8',
        }}
      />

      <div className="mb-4">
        <div className="flex items-start gap-3">
          <Avatar
            className="border-2"
            style={{
              backgroundColor: `${category.color}15`,
              color: category.color,
              borderColor: `${category.color}30`,
            }}
            size={44}
            icon={<BookOutlined />}
          />
          <div className="flex-1 min-w-0">
            <Title 
              level={5} 
              className="!m-0 !text-base !font-semibold !leading-5 text-gray-800 dark:text-gray-100"
              ellipsis={{ tooltip: category.title }}
            >
              {category.title}
            </Title>
            <Text className="!text-xs flex items-center gap-1 mt-1 text-gray-500 dark:text-gray-400">
              <GlobalOutlined />
              {category.slug}
            </Text>
          </div>
          <Dropdown overlay={getActionMenu(category)} trigger={['click']} placement="bottomRight">
            <Button 
              type="text" 
              icon={<MoreOutlined />} 
              size="small"
              className="-mt-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            />
          </Dropdown>
        </div>
      </div>

      <div className="mb-4">
        <Badge
          status={category.isActive ? "success" : "error"}
          text={
            <Text className={`!text-xs !font-medium ${
              category.isActive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {category.isActive ? "Active" : "Inactive"}
            </Text>
          }
        />
      </div>

      <div className="mb-4">
        <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700">
          <Statistic
            title={
              <Text className="!text-xs !uppercase !tracking-wider !font-medium text-gray-600 dark:text-gray-400">
                Subcategories
              </Text>
            }
            value={category.subCategories.length}
            valueStyle={{ 
              fontSize: '20px', 
              color: category.color,
              fontWeight: 600,
            }}
            prefix={<TeamOutlined style={{ fontSize: '16px' }} />}
          />
        </div>
      </div>

      {category.subCategories.length > 0 && (
        <div className="mb-4">
          <Text className="!text-xs !font-semibold !uppercase !tracking-wider block mb-2 text-gray-600 dark:text-gray-400">
            Subcategories
          </Text>
          <div className="flex flex-wrap gap-1.5">
            {category.subCategories.slice(0, 3).map((sub) => (
              <Tag
                key={sub.id}
                className="!text-xs !font-medium !px-2 !py-0.5 !rounded-md !border"
                style={{
                  backgroundColor: sub.isActive ? `${category.color}15` : '#f1f5f9',
                  color: sub.isActive ? category.color : '#64748b',
                  borderColor: sub.isActive ? `${category.color}30` : '#e2e8f0',
                }}
              >
                {sub.title}
              </Tag>
            ))}
            {category.subCategories.length > 3 && (
              <Tag className="!text-xs !font-medium !px-2 !py-0.5 !rounded-md !border bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700">
                +{category.subCategories.length - 3}
              </Tag>
            )}
          </div>
        </div>
      )}

      <div className="pt-3 border-t flex items-center justify-between border-gray-100 dark:border-gray-700">
        <Text className="!text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <CalendarOutlined />
          {new Date(category.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </Text>
        <div className="flex gap-1">
          <Button 
            type="text" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleView(category)}
            className="!text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          />
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(category)}
            className="!text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          />
        </div>
      </div>
    </Card>
  );

  const CategoryListItem = ({ category }) => (
    <Card
      className={`mb-3 transition-all duration-300 hover:translate-x-2 hover:shadow-lg cursor-pointer rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:shadow-2xl ${!category.isActive ? 'opacity-70' : ''}`}
      style={{
        borderLeft: `4px solid ${category.color}`,
      }}
      bodyStyle={{ padding: '20px' }}
    >
      <Row align="middle" gutter={[16, 16]}>
        <Col flex="none">
          <Avatar
            className="border-2"
            style={{
              backgroundColor: `${category.color}15`,
              color: category.color,
              borderColor: `${category.color}30`,
            }}
            icon={<BookOutlined />}
            size={40}
          />
        </Col>
        
        <Col flex="auto">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Title 
                level={5} 
                className="!m-0 !text-base !font-semibold text-gray-800 dark:text-gray-100"
              >
                {category.title}
              </Title>
              <Badge
                status={category.isActive ? "success" : "error"}
                text={
                  <Text className={`!text-xs !font-medium ${
                    category.isActive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Text>
                }
              />
            </div>
            
            <Text className="!text-xs flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">
              <GlobalOutlined />
              {category.slug}
            </Text>

            {category.subCategories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {category.subCategories.slice(0, 4).map((sub) => (
                  <Tag
                    key={sub.id}
                    size="small"
                    className="!text-xs !font-medium !rounded"
                    style={{
                      backgroundColor: sub.isActive ? `${category.color}15` : '#f1f5f9',
                      color: sub.isActive ? category.color : '#64748b',
                      borderColor: sub.isActive ? `${category.color}30` : '#e2e8f0',
                    }}
                  >
                    {sub.title}
                  </Tag>
                ))}
                {category.subCategories.length > 4 && (
                  <Tag
                    size="small"
                    className="!text-xs !font-medium !rounded bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700"
                  >
                    +{category.subCategories.length - 4}
                  </Tag>
                )}
              </div>
            )}
          </div>
        </Col>
        
        <Col flex="none">
          <div className="px-4 py-3 rounded-lg text-center min-w-[80px] bg-gray-50 dark:bg-gray-900">
            <Text 
              className="!text-lg !font-semibold block"
              style={{ color: category.color }}
            >
              {category.subCategories.length}
            </Text>
            <Text className="!text-xs !uppercase !tracking-wider !font-medium text-gray-600 dark:text-gray-400">
              Subcategories
            </Text>
          </div>
        </Col>
        
        <Col flex="none">
          <Dropdown overlay={getActionMenu(category)} trigger={['click']} placement="bottomRight">
            <Button 
              icon={<MoreOutlined />}
              className="border rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            />
          </Dropdown>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto bg-white">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 p-6 rounded-2xl border shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600">
          <div className="">
            <Title 
              level={2} 
              className="!m-0 !text-3xl !font-bold flex items-center gap-3 text-gray-800 dark:text-gray-100"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-2 flex items-center justify-center">
                <BookOutlined className="text-white text-xl" />
              </div>
              Category Management
            </Title>
            <Paragraph className="!mt-2 !mb-0 !text-base text-gray-600 dark:text-gray-400">
              Organize and manage your content categories efficiently
            </Paragraph>
          </div>
          
          <div className="flex gap-3 items-center mt-4 lg:mt-0">
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600"
            >
              Add Category
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
              size="large"
              className="rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Failed to Load Categories"
            description={error}
            type="error"
            icon={<ExclamationCircleOutlined />}
            showIcon
            closable
            onClose={() => setError(null)}
            action={
              <Button size="small" onClick={handleRefresh} type="primary" ghost>
                Try Again
              </Button>
            }
            className="mb-6 rounded-xl border-red-200"
          />
        )}

        {/* Stats Overview */}
        <Row gutter={[20, 20]} className="mb-8">
          {[
            { title: 'Total Categories', value: stats.total, icon: BookOutlined, color: '#6366f1' },
            { title: 'Active', value: stats.active, icon: CheckCircleOutlined, color: '#10b981' },
            { title: 'Inactive', value: stats.inactive, icon: CloseCircleOutlined, color: '#ef4444' },
            { title: 'SubCategories', value: stats.totalSubCategories, icon: TeamOutlined, color: '#f59e0b' },
          ].map((stat, index) => (
            <Col className="" key={index} xs={24} sm={12} lg={6}>
              <Card
                className="text-center relative overflow-hidden border rounded-2xl  bg-white  border-gray-200 dark:border-gray-600"
                bodyStyle={{ padding: '24px' }}
              >
                <div 
                  className="absolute !bg-white top-0 left-0 right-0 h-1"
                  style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
                />
                <div className="mb-2">
                  <stat.icon style={{ fontSize: '24px', color: stat.color }} />
                </div>
                <Statistic
                  title={
                    <Text className="!text-xs !font-medium !uppercase !tracking-wider text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </Text>
                  }
                  value={stat.value}
                  valueStyle={{ 
                    color: stat.color,
                    fontSize: '32px',
                    fontWeight: 700,
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Controls */}
        <Card 
          className="mb-6 border rounded-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
          bodyStyle={{ padding: '20px' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={10}>
              <Input
                placeholder="Search categories by name or slug..."
                prefix={<SearchOutlined className="text-gray-500 dark:text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                size="large"
                className="rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </Col>
            
            <Col xs={24} md={14}>
              <Row gutter={12} justify="end">
                <Col>
                  <Select
                    placeholder="Sort By"
                    value={sortBy}
                    onChange={setSortBy}
                    className="w-40"
                    size="large"
                    suffixIcon={<SortAscendingOutlined />}
                  >
                    <Option value="name">Name (A-Z)</Option>
                    <Option value="subcategories">Most SubCategories</Option>
                    <Option value="recent">Recently Updated</Option>
                    <Option value="oldest">Oldest First</Option>
                  </Select>
                </Col>
                
                <Col>
                  <Button.Group size="large">
                    <Button
                      type={viewMode === 'grid' ? 'primary' : 'default'}
                      icon={<AppstoreOutlined />}
                      onClick={() => setViewMode('grid')}
                      className={`rounded-l-lg ${
                        viewMode === 'grid' 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-500' 
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      Grid
                    </Button>
                    <Button
                      type={viewMode === 'list' ? 'primary' : 'default'}
                      icon={<BarsOutlined />}
                      onClick={() => setViewMode('list')}
                      className={`rounded-r-lg ${
                        viewMode === 'list' 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-500' 
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      List
                    </Button>
                  </Button.Group>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Results Info */}
        {(searchText || filterStatus !== 'all') && (
          <Alert
            message={
              <div className="flex items-center gap-2">
                <FilterOutlined />
                <span>
                  Showing <strong>{filteredCategories.length}</strong> of <strong>{categories.length}</strong> categories
                  {searchText && ` matching "${searchText}"`}
                  {filterStatus !== 'all' && ` with status "${filterStatus}"`}
                </span>
              </div>
            }
            type="info"
            showIcon={false}
            className="mb-5 rounded-xl bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-600 text-blue-800 dark:text-blue-300"
          />
        )}

        {/* Content */}
        <Spin spinning={loading} size="large">
          {filteredCategories.length === 0 && !loading && !error ? (
            <Card className="text-center py-16 rounded-2xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                imageStyle={{
                  height: 100,
                }}
                description={
                  <div>
                    <Title level={4} className="text-gray-600 dark:text-gray-400">
                      No categories found
                    </Title>
                    <Paragraph className="!mb-5 text-gray-500 dark:text-gray-500">
                      {searchText || filterStatus !== 'all' 
                        ? "Try adjusting your search or filter criteria"
                        : "Get started by adding your first category"
                      }
                    </Paragraph>
                    {!searchText && filterStatus === 'all' && (
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<PlusOutlined />}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none rounded-lg font-medium"
                      >
                        Add Your First Category
                      </Button>
                    )}
                  </div>
                }
              />
            </Card>
          ) : (
            <div className="animate-fadeIn">
              {viewMode === 'grid' ? (
                <Row gutter={[20, 20]}>
                  {filteredCategories.map((category) => (
                    <Col key={category.id} xs={24} sm={12} lg={8} xl={6}>
                      <CategoryCard category={category} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="space-y-3">
                  {filteredCategories.map((category) => (
                    <CategoryListItem key={category.id} category={category} />
                  ))}
                </div>
              )}
            </div>
          )}
        </Spin>

        {/* View Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <Avatar
                style={{
                  backgroundColor: `${selectedCategory?.color}15`,
                  color: selectedCategory?.color,
                  borderColor: `${selectedCategory?.color}30`,
                }}
                icon={<InfoCircleOutlined />}
              />
              <span>Category Details</span>
            </div>
          }
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>,
            <Button 
              key="edit" 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => {
                setViewModalVisible(false);
                handleEdit(selectedCategory);
              }}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none"
            >
              Edit Category
            </Button>,
          ]}
          width={600}
          className="dark:bg-gray-800"
        >
          {selectedCategory && (
            <div className="py-4">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Title">
                  <Text strong className="">
                    {selectedCategory.title}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Slug">
                  <Text code className="">
                    {selectedCategory.slug}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Badge
                    status={selectedCategory.isActive ? "success" : "error"}
                    text={
                      <Text className={`font-medium ${
                        selectedCategory.isActive 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {selectedCategory.isActive ? "Active" : "Inactive"}
                      </Text>
                    }
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {new Date(selectedCategory.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {new Date(selectedCategory.updatedAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Subcategories">
                  <Text strong>{selectedCategory.subCategories.length} subcategories</Text>
                </Descriptions.Item>
              </Descriptions>

              {selectedCategory.subCategories.length > 0 && (
                <div className="mt-4">
                  <Title level={5} className="!text-gray-800 dark:text-gray-200">
                    Subcategories
                  </Title>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.subCategories.map((sub) => (
                      <Tag
                        key={sub.id}
                        className="px-3 py-1 rounded-lg font-medium"
                        style={{
                          backgroundColor: sub.isActive ? `${selectedCategory.color}15` : '#f1f5f9',
                          color: sub.isActive ? selectedCategory.color : '#64748b',
                          borderColor: sub.isActive ? `${selectedCategory.color}30` : '#e2e8f0',
                        }}
                      >
                        <Badge
                          status={sub.isActive ? "success" : "error"}
                          className="mr-2"
                        />
                        {sub.title}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Edit Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <Avatar
                style={{
                  backgroundColor: `${selectedCategory?.color}15`,
                  color: selectedCategory?.color,
                  borderColor: `${selectedCategory?.color}30`,
                }}
                icon={<EditOutlined />}
              />
              <span>Edit Category</span>
            </div>
          }
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            editForm.resetFields();
          }}
          footer={null}
          width={500}
          className="dark:bg-gray-800"
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            className="py-4"
          >
            <Form.Item
              name="title"
              label={<Text className="!text-gray-800 dark:text-gray-200">Title</Text>}
              rules={[
                { required: true, message: 'Please input category title!' },
                { min: 2, message: 'Title must be at least 2 characters!' }
              ]}
            >
              <Input 
                placeholder="Enter category title"
                size="large"
                className="rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </Form.Item>

            <Form.Item
              name="slug"
              label={<Text className="text-gray-800 dark:text-gray-200">Slug</Text>}
              rules={[
                { required: true, message: 'Please input category slug!' },
                { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens!' }
              ]}
            >
              <Input 
                placeholder="enter-category-slug"
                size="large"
                className="rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </Form.Item>

            <Form.Item
              name="isActive"
              label={<Text className="text-gray-800 dark:text-gray-200">Status</Text>}
              valuePropName="checked"
            >
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                className="bg-gray-300"
              />
            </Form.Item>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button 
                onClick={() => {
                  setEditModalVisible(false);
                  editForm.resetFields();
                }}
                icon={<CloseOutlined />}
                className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={submitting}
                icon={<SaveOutlined />}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none"
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
      
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
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
        
        .ant-card-hoverable:hover {
          transform: translateY(-4px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .ant-btn-group > .ant-btn:not(:last-child) {
          border-right: 1px solid;
        }
        
        .ant-switch-checked {
          background-color: #4338ca !important;
        }
        
        .ant-message {
          z-index: 9999 !important;
        }

        /* Dark mode support for Ant Design components */
        .dark .ant-select-selector {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: #f9fafb !important;
        }
        
        .dark .ant-select-arrow {
          color: #9ca3af !important;
        }
        
        .dark .ant-select-dropdown {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        
        .dark .ant-select-item {
          color: #e5e7eb !important;
        }
        
        .dark .ant-select-item:hover {
          background-color: #374151 !important;
        }
        
        .dark .ant-select-item-option-selected {
          background-color: #4338ca !important;
          color: white !important;
        }
        
        .dark .ant-modal-content {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        
        .dark .ant-modal-header {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        
        .dark .ant-modal-title {
          color: #e5e7eb !important;
        }
        
        .dark .ant-descriptions-bordered .ant-descriptions-item-label {
          background-color: #374151 !important;
          color: #e5e7eb !important;
          border-color: #4b5563 !important;
        }
        
        .dark .ant-descriptions-bordered .ant-descriptions-item-content {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
          border-color: #4b5563 !important;
        }
        
        .dark .ant-form-item-label > label {
          color: #e5e7eb !important;
        }
        
        .dark .ant-input {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: #f9fafb !important;
        }
        
        .dark .ant-input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
        }
        
        .dark .ant-menu {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        
        .dark .ant-menu-item {
          color: #e5e7eb !important;
        }
        
        .dark .ant-menu-item:hover {
          background-color: #374151 !important;
          color: #818cf8 !important;
        }
        
        .dark .ant-menu-divider {
          border-color: #4b5563 !important;
        }.categories-header {
  color: #333333; /* Dark gray for good contrast */
  background-color: #ffffff; /* White background */
}

      `}</style>
    </div>
  );
};

export default AllCategories;