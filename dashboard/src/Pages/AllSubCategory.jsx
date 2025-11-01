import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Table,
  Button,
  Space,
  Image,
  Typography,
  Card,
  Input,
  message,
  Popconfirm,
  Tag,
  Modal,
  Form,
  Upload,
  Select,
  Row,
  Col,
  Statistic,
  Badge,
  Switch,
  Tooltip,
  Descriptions,
  Divider,
  Alert,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
  FileImageOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

// Editable components
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
          {
            min: 2,
            message: `${title} must be at least 2 characters.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingInlineEnd: 24,
          cursor: "pointer",
          minHeight: "32px",
          display: "flex",
          alignItems: "center",
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const AllSubCategory = ({ isDarkMode = false }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Enhanced sample data
  const sampleCategories = [
    { id: 1, name: 'Electronics', _id: '1' },
    { id: 2, name: 'Clothing', _id: '2' },
    { id: 3, name: 'Sports', _id: '3' },
    { id: 4, name: 'Books', _id: '4' },
    { id: 5, name: 'Home & Garden', _id: '5' },
  ];

  const sampleSubCategories = [
    {
      id: 1,
      _id: '1',
      subCategoryName: 'Smartphones',
      title: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest mobile phones and smartphone accessories for all your communication needs',
      parentCategoryId: 1,
      parentCategoryName: 'Electronics',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop',
      metaKeywords: 'mobile, phone, smartphone, android, ios',
      displayOrder: 1,
      status: 'active',
      isActive: true,
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
      productsCount: 25,
      totalViews: 1250,
      totalSales: 150,
    },
    {
      id: 2,
      _id: '2',
      subCategoryName: 'Laptops & Computers',
      title: 'Laptops & Computers',
      slug: 'laptops-computers',
      description: 'High-performance computers, laptops, and related accessories for work and gaming',
      parentCategoryId: 1,
      parentCategoryName: 'Electronics',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&fit=crop',
      metaKeywords: 'computer, laptop, notebook, desktop, gaming',
      displayOrder: 2,
      status: 'active',
      isActive: true,
      createdAt: '2024-01-14T08:00:00Z',
      updatedAt: '2024-01-14T08:00:00Z',
      productsCount: 18,
      totalViews: 890,
      totalSales: 89,
    },
    {
      id: 3,
      _id: '3',
      subCategoryName: "Men's Fashion",
      title: "Men's Fashion",
      slug: 'mens-fashion',
      description: 'Stylish clothing and accessories for the modern man',
      parentCategoryId: 2,
      parentCategoryName: 'Clothing',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
      metaKeywords: 'mens, fashion, clothing, shirts, pants',
      displayOrder: 1,
      status: 'active',
      isActive: true,
      createdAt: '2024-01-13T08:00:00Z',
      updatedAt: '2024-01-13T08:00:00Z',
      productsCount: 42,
      totalViews: 2100,
      totalSales: 280,
    },
    {
      id: 4,
      _id: '4',
      subCategoryName: 'Football Equipment',
      title: 'Football Equipment',
      slug: 'football-equipment',
      description: 'Professional football equipment and gear for players of all levels',
      parentCategoryId: 3,
      parentCategoryName: 'Sports',
      image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=100&h=100&fit=crop',
      metaKeywords: 'football, sports, equipment, gear, soccer',
      displayOrder: 1,
      status: 'inactive',
      isActive: false,
      createdAt: '2024-01-12T08:00:00Z',
      updatedAt: '2024-01-12T08:00:00Z',
      productsCount: 15,
      totalViews: 350,
      totalSales: 45,
    },
    {
      id: 5,
      _id: '5',
      subCategoryName: 'Fiction Books',
      title: 'Fiction Books',
      slug: 'fiction-books',
      description: 'Bestselling fiction books from renowned authors worldwide',
      parentCategoryId: 4,
      parentCategoryName: 'Books',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&h=100&fit=crop',
      metaKeywords: 'books, fiction, novels, literature, reading',
      displayOrder: 1,
      status: 'active',
      isActive: true,
      createdAt: '2024-01-11T08:00:00Z',
      updatedAt: '2024-01-11T08:00:00Z',
      productsCount: 67,
      totalViews: 1800,
      totalSales: 220,
    },
  ];

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      setTimeout(() => {
        setSubCategories(sampleSubCategories);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Failed to fetch sub categories');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Replace with actual API call
      setCategories(sampleCategories);
    } catch (error) {
      message.error('Failed to fetch categories');
    }
  };

  const handleEdit = (subCategory) => {
    setEditingSubCategory(subCategory);
    setEditModalVisible(true);
    form.setFieldsValue(subCategory);
    setFileList([]);
  };

  const handleDelete = async (id) => {
    try {
      // Add your delete API call here
      setSubCategories(subCategories.filter(subCategory => subCategory.id !== id));
      message.success('Sub Category deleted successfully!');
    } catch (error) {
      message.error('Failed to delete sub category');
    }
  };

  const handleSave = async (row) => {
    try {
      const updatedSubCategories = subCategories.map(subCategory =>
        subCategory.id === row.id 
          ? { ...subCategory, ...row } 
          : subCategory
      );
      setSubCategories(updatedSubCategories);
      message.success('Sub Category updated successfully!');
    } catch (error) {
      message.error('Failed to update sub category');
    }
  };

  const handleStatusToggle = async (record, checked) => {
    try {
      const updatedSubCategories = subCategories.map(subCategory =>
        subCategory.id === record.id 
          ? { ...subCategory, isActive: checked, status: checked ? 'active' : 'inactive' } 
          : subCategory
      );
      setSubCategories(updatedSubCategories);
      message.success(
        `Sub Category ${checked ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      message.error("Failed to update sub category status");
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      const updatedSubCategories = subCategories.map(subCategory =>
        subCategory.id === editingSubCategory.id 
          ? { 
              ...subCategory, 
              ...values,
              parentCategoryName: categories.find(cat => cat.id === values.parentCategoryId)?.name || '',
              updatedAt: new Date().toISOString()
            } 
          : subCategory
      );
      setSubCategories(updatedSubCategories);
      message.success('Sub Category updated successfully!');
      setEditModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('Failed to update sub category');
    }
  };

  const handleAddSubmit = async (values) => {
    try {
      const newSubCategory = {
        id: Date.now(),
        _id: Date.now().toString(),
        ...values,
        parentCategoryName: categories.find(cat => cat.id === values.parentCategoryId)?.name || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productsCount: 0,
        totalViews: 0,
        totalSales: 0,
        slug: values.subCategoryName.toLowerCase().replace(/\s+/g, '-'),
        title: values.subCategoryName,
      };
      
      setSubCategories([...subCategories, newSubCategory]);
      message.success('Sub Category added successfully!');
      setAddModalVisible(false);
      addForm.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('Failed to add sub category');
    }
  };

  const handleViewStats = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setStatsModalVisible(true);
  };

  const filteredSubCategories = subCategories.filter(subCategory => {
    const matchesSearch = 
      subCategory.subCategoryName.toLowerCase().includes(searchText.toLowerCase()) ||
      subCategory.description.toLowerCase().includes(searchText.toLowerCase()) ||
      subCategory.parentCategoryName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && subCategory.isActive) ||
      (filterStatus === 'inactive' && !subCategory.isActive);
    
    const matchesCategory = 
      filterCategory === 'all' || 
      subCategory.parentCategoryId.toString() === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStats = () => {
    const activeCount = subCategories.filter(item => item.isActive).length;
    const inactiveCount = subCategories.length - activeCount;
    const totalProducts = subCategories.reduce((sum, item) => sum + item.productsCount, 0);
    const totalCategories = [...new Set(subCategories.map(item => item.parentCategoryId))].length;

    return { activeCount, inactiveCount, totalProducts, totalCategories };
  };

  const { activeCount, inactiveCount, totalProducts, totalCategories } = getStats();

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      width: '60px',
      align: 'center',
      render: (text, record, index) => (
        <Badge
          count={index + 1}
          style={{
            backgroundColor: record.isActive ? '#52c41a' : '#d9d9d9',
            color: record.isActive ? 'white' : '#666',
          }}
        />
      ),
    },
    {
      title: 'SubCategory Information',
      dataIndex: 'subCategoryName',
      width: '35%',
      editable: true,
      render: (text, record) => (
        <div className="subcategory-info">
          <div className="subcategory-header">
            <div className="subcategory-main">
              <Image
                src={record.image}
                alt={record.subCategoryName}
                width={40}
                height={40}
                style={{ 
                  objectFit: 'cover', 
                  borderRadius: '6px',
                  marginRight: '12px',
                  border: `2px solid ${record.isActive ? '#52c41a' : '#d9d9d9'}`
                }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8O+L0v7+n+VdvLd2p7+tM7tTd7u7i+d9vXaM7+FN/DK1I+hLgJf3Z9f+vPGn2T6+z+t/qn5+8+5+96v3+kH3U9/v/v6vf/LzrWHJz/cz3m2Rq+Vx7Y3W+GfZX9+2LXYf26at4Z59Z/3tNn3btl1V7bf9+8kPlvL8r/Dl5/Ib2v/9f5av3ddc9n2kOb3d5Nz3O7Y3M0v+wr+fLvjO0rYY7f/r8oW/+vS/32ouf5xDe2/zYf5v9RG5/2LlzZ+9vfe/X/n8fVPLZYfN3++7p7i9mfPm1d8P7dZevEeu7n8YG2n3e5P+5bJTv6u/O6a9l+fPXNz+6N4PAAD//2Q=="
              />
              <div className="subcategory-content">
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  {text}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <GlobalOutlined style={{ marginRight: 4 }} />
                  Slug: <Text code>{record.slug}</Text>
                </Text>
              </div>
            </div>
            <div
              className="subcategory-status"
              style={{ marginLeft: '20px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                size="small"
                checked={record.isActive}
                onChange={(checked) => handleStatusToggle(record, checked)}
                checkedChildren={<CheckCircleOutlined />}
                unCheckedChildren={<CloseCircleOutlined />}
              />
            </div>
          </div>
          <div className="subcategory-details">
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <BookOutlined style={{ marginRight: 4, color: '#1890ff' }} />
              Category: <Text strong>{record.parentCategoryName}</Text>
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '11px', marginTop: '4px' }}>
              Updated: {new Date(record.updatedAt).toLocaleDateString('en-GB')}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      render: (text) => (
        <Paragraph
          ellipsis={{ rows: 2, expandable: false }}
          style={{ margin: 0, fontSize: '13px' }}
        >
          {text}
        </Paragraph>
      ),
    },
    {
      title: 'Analytics',
      key: 'analytics',
      width: '15%',
      render: (_, record) => (
        <div className="analytics-section">
          <Space direction="vertical" size={4}>
            <div className="analytic-item">
              <Badge count={record.productsCount} showZero color="#1890ff">
                <AppstoreOutlined style={{ fontSize: '14px', marginRight: '8px' }} />
              </Badge>
              <Text style={{ fontSize: '12px' }}>Products</Text>
            </div>
            <div className="analytic-item">
              <Badge count={record.totalViews} showZero color="#52c41a">
                <EyeOutlined style={{ fontSize: '14px', marginRight: '8px' }} />
              </Badge>
              <Text style={{ fontSize: '12px' }}>Views</Text>
            </div>
            <div className="analytic-item">
              <Text style={{ fontSize: '11px', color: '#666' }}>
                Order: #{record.displayOrder}
              </Text>
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Analytics">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<BarChartOutlined />}
              onClick={() => handleViewStats(record)}
            />
          </Tooltip>
          <Tooltip title="Edit SubCategory">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete SubCategory"
            description={
              <div style={{ maxWidth: 280 }}>
                <Alert
                  message="Permanent Action"
                  description={`This will delete "${record.subCategoryName}" and all its ${record.productsCount} products.`}
                  type="error"
                  showIcon
                  size="small"
                />
                <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                  <Text strong>This action cannot be undone!</Text>
                </Paragraph>
              </div>
            }
            onConfirm={() => handleDelete(record.id)}
            okText="Delete Permanently"
            cancelText="Cancel"
            okType="danger"
            placement="topRight"
            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const editableColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return false;
      }
      return false;
    },
    fileList,
    onChange: ({ fileList: newFileList }) => setFileList(newFileList),
    multiple: false,
    listType: 'picture-card',
    maxCount: 1,
  };

  return (
    <div className="subcategory-management-container">
      <div className="content-wrapper">
        {/* Header Section */}
        <div className="header-section">
          <Title level={2} className="page-title">
            <TeamOutlined className="title-icon" />
            SubCategory Management System
          </Title>
          <Paragraph type="secondary" className="page-description">
            Manage your product subcategories efficiently with advanced analytics and controls
          </Paragraph>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="stats-section">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Total SubCategories"
                value={subCategories.length}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Active SubCategories"
                value={activeCount}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Total Products"
                value={totalProducts}
                prefix={<AppstoreOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Parent Categories"
                value={totalCategories}
                prefix={<BookOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16', fontSize: '24px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Add SubCategory Form */}
        <Card
          title={
            <Space>
              <PlusOutlined />
              Add New SubCategory
            </Space>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
            >
              Quick Add
            </Button>
          }
          className="form-card"
        >
          <Alert
            message="Pro Tip"
            description="Click 'Quick Add' to open the advanced form with image upload and detailed options, or use the filters below to find specific subcategories."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Card>

        {/* SubCategories Table */}
        <Card
          title={
            <Space>
              <TeamOutlined />
              SubCategories Overview
              <Badge count={filteredSubCategories.length} showZero color="#1890ff" />
            </Space>
          }
          extra={
            <Space wrap>
              <Search
                placeholder="Search subcategories..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
              <Select
                value={filterCategory}
                onChange={setFilterCategory}
                style={{ width: 150 }}
                placeholder="Filter by Category"
              >
                <Option value="all">All Categories</Option>
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id.toString()}>{cat.name}</Option>
                ))}
              </Select>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 120 }}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active Only</Option>
                <Option value="inactive">Inactive Only</Option>
              </Select>
            </Space>
          }
          className="table-card"
        >
          <Table
            components={components}
            rowClassName={(record) =>
              `editable-row ${record.isActive ? 'active-row' : 'inactive-row'}`
            }
            bordered
            dataSource={filteredSubCategories}
            columns={editableColumns}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} subcategories`,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            scroll={{ x: 1000 }}
            size="middle"
            rowKey="id"
          />
        </Card>

        {/* Add SubCategory Modal */}
        <Modal
          title={
            <Space>
              <PlusOutlined />
              Add New SubCategory
            </Space>
          }
          open={addModalVisible}
          onCancel={() => {
            setAddModalVisible(false);
            addForm.resetFields();
            setFileList([]);
          }}
          footer={null}
          width={800}
          className="add-modal"
        >
          <Form
            form={addForm}
            layout="vertical"
            onFinish={handleAddSubmit}
            size="large"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Parent Category"
                  name="parentCategoryId"
                  rules={[
                    { required: true, message: 'Please select a parent category!' }
                  ]}
                >
                  <Select 
                    placeholder="Select parent category"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="SubCategory Name"
                  name="subCategoryName"
                  rules={[
                    { required: true, message: 'Please enter subcategory name!' },
                    { min: 2, message: 'Subcategory name must be at least 2 characters!' }
                  ]}
                >
                  <Input placeholder="Enter subcategory name" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: 'Please enter description!' }
              ]}
            >
              <TextArea rows={3} placeholder="Enter detailed description" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Meta Keywords (Optional)"
                  name="metaKeywords"
                >
                  <Input placeholder="SEO keywords separated by commas" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Display Order"
                  name="displayOrder"
                  initialValue={1}
                >
                  <Input 
                    type="number" 
                    placeholder="Order"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Status"
                  name="isActive"
                  initialValue={true}
                >
                  <Select>
                    <Option value={true}>Active</Option>
                    <Option value={false}>Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="SubCategory Image (Optional)" name="image">
              <Upload {...uploadProps}>
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Image</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => {
                  setAddModalVisible(false);
                  addForm.resetFields();
                  setFileList([]);
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Add SubCategory
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit SubCategory Modal */}
        <Modal
          title={
            <Space>
              <EditOutlined />
              Edit SubCategory
            </Space>
          }
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            form.resetFields();
            setFileList([]);
          }}
          footer={null}
          width={800}
          className="edit-modal"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditSubmit}
            size="large"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Parent Category"
                  name="parentCategoryId"
                  rules={[
                    { required: true, message: 'Please select a parent category!' }
                  ]}
                >
                  <Select 
                    placeholder="Select parent category"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="SubCategory Name"
                  name="subCategoryName"
                  rules={[
                    { required: true, message: 'Please enter subcategory name!' },
                    { min: 2, message: 'Subcategory name must be at least 2 characters!' }
                  ]}
                >
                  <Input placeholder="Enter subcategory name" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: 'Please enter description!' }
              ]}
            >
              <TextArea rows={3} placeholder="Enter detailed description" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Meta Keywords (Optional)"
                  name="metaKeywords"
                >
                  <Input placeholder="SEO keywords separated by commas" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Display Order"
                  name="displayOrder"
                >
                  <Input 
                    type="number" 
                    placeholder="Order"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Status"
                  name="isActive"
                >
                  <Select>
                    <Option value={true}>Active</Option>
                    <Option value={false}>Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="SubCategory Image (Optional)" name="image">
              <Upload {...uploadProps}>
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Image</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => {
                  setEditModalVisible(false);
                  form.resetFields();
                  setFileList([]);
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Update SubCategory
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Stats Modal */}
        <Modal
          title={
            <Space>
              <BarChartOutlined />
              SubCategory Analytics
              {selectedSubCategory && (
                <Tag color={selectedSubCategory.isActive ? 'green' : 'red'}>
                  {selectedSubCategory.subCategoryName}
                </Tag>
              )}
            </Space>
          }
          open={statsModalVisible}
          onCancel={() => {
            setStatsModalVisible(false);
            setSelectedSubCategory(null);
          }}
          footer={[
            <Button key="close" onClick={() => setStatsModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={1000}
          className="analytics-modal"
        >
          {selectedSubCategory && (
            <div>
              {/* Overview Statistics */}
              <Row gutter={[24, 16]} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                  <Card className="mini-stat-card">
                    <Statistic
                      title="Total Products"
                      value={selectedSubCategory.productsCount}
                      prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card className="mini-stat-card">
                    <Statistic
                      title="Total Views"
                      value={selectedSubCategory.totalViews}
                      prefix={<EyeOutlined style={{ color: '#52c41a' }} />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card className="mini-stat-card">
                    <Statistic
                      title="Total Sales"
                      value={selectedSubCategory.totalSales}
                      prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card className="mini-stat-card">
                    <Statistic
                      title="Status"
                      value={selectedSubCategory.isActive ? 'Active' : 'Inactive'}
                      prefix={
                        <GlobalOutlined
                          style={{
                            color: selectedSubCategory.isActive ? '#52c41a' : '#ff4d4f',
                          }}
                        />
                      }
                      valueStyle={{
                        color: selectedSubCategory.isActive ? '#52c41a' : '#ff4d4f',
                      }}
                    />
                  </Card>
                </Col>
              </Row>

              <Divider />

              {/* Detailed Information */}
              <Row gutter={[24, 16]}>
                <Col span={24}>
                  <Descriptions
                    title="SubCategory Details"
                    bordered
                    column={3}
                    size="small"
                  >
                    <Descriptions.Item label="Name" span={1}>
                      <Text strong>{selectedSubCategory.subCategoryName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Slug" span={1}>
                      <Text code>{selectedSubCategory.slug}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Parent Category" span={1}>
                      <Tag color="blue">{selectedSubCategory.parentCategoryName}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created Date" span={1}>
                      {new Date(selectedSubCategory.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated" span={1}>
                      {new Date(selectedSubCategory.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Descriptions.Item>
                    <Descriptions.Item label="Display Order" span={1}>
                      <Badge count={selectedSubCategory.displayOrder} showZero />
                    </Descriptions.Item>
                    <Descriptions.Item label="Description" span={3}>
                      <Paragraph>{selectedSubCategory.description}</Paragraph>
                    </Descriptions.Item>
                    <Descriptions.Item label="Meta Keywords" span={3}>
                      <Space wrap>
                        {selectedSubCategory.metaKeywords?.split(',').map((keyword, index) => (
                          <Tag key={index} color="purple">
                            {keyword.trim()}
                          </Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>

              <Divider />

              {/* Image Preview */}
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Card
                    title={
                      <Space>
                        <FileImageOutlined style={{ color: '#722ed1' }} />
                        SubCategory Image
                      </Space>
                    }
                    size="small"
                  >
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Image
                        src={selectedSubCategory.image}
                        alt={selectedSubCategory.subCategoryName}
                        width={200}
                        height={200}
                        style={{ 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          border: '2px solid #f0f0f0'
                        }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8O+L0v7+n+VdvLd2p7+tM7tTd7u7i+d9vXaM7+FN/DK1I+hLgJf3Z9f+vPGn2T6+z+t/qn5+8+5+96v3+kH3U9/v/v6vf/LzrWHJz/cz3m2Rq+Vx7Y3W+GfZX9+2LXYf26at4Z59Z/3tNn3btl1V7bf9+8kPlvL8r/Dl5/Ib2v/9f5av3ddc9n2kOb3d5Nz3O7Y3M0v+wr+fLvjO0rYY7f/r8oW/+vS/32ouf5xDe2/zYf5v9RG5/2LlzZ+9vfe/X/n8fVPLZYfN3++7p7i9mfPm1d8P7dZevEeu7n8YG2n3e5P+5bJTv6u/O6a9l+fPXNz+6N4PAAD//2Q="
                      />
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    title={
                      <Space>
                        <InfoCircleOutlined style={{ color: '#52c41a' }} />
                        Performance Summary
                      </Space>
                    }
                    size="small"
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ padding: '12px', background: '#f0f9ff', borderRadius: '6px' }}>
                        <Text strong>Conversion Rate</Text>
                        <br />
                        <Text type="secondary">
                          {((selectedSubCategory.totalSales / selectedSubCategory.totalViews) * 100).toFixed(2)}%
                        </Text>
                      </div>
                      <div style={{ padding: '12px', background: '#f6ffed', borderRadius: '6px' }}>
                        <Text strong>Products per View</Text>
                        <br />
                        <Text type="secondary">
                          {(selectedSubCategory.productsCount / selectedSubCategory.totalViews).toFixed(2)}
                        </Text>
                      </div>
                      <div style={{ padding: '12px', background: '#fff2e8', borderRadius: '6px' }}>
                        <Text strong>Avg Sales per Product</Text>
                        <br />
                        <Text type="secondary">
                          {(selectedSubCategory.totalSales / selectedSubCategory.productsCount).toFixed(2)}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </div>

      <style>{`
        .subcategory-management-container {
          padding: 24px;
          background-color: ${isDarkMode ? '#0f0f0f' : '#f5f7fa'};
          min-height: 100vh;
        }
        
        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .header-section {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .page-title {
          color: ${isDarkMode ? '#60a5fa' : '#1890ff'};
          margin-bottom: 8px;
        }
        
        .title-icon {
          margin-right: 12px;
        }
        
        .page-description {
          font-size: 16px;
          max-width: 600px;
          margin: 0 auto;
          color: ${isDarkMode ? '#9ca3af' : 'rgba(0, 0, 0, 0.65)'};
        }
        
        .stats-section {
          margin-bottom: 24px;
        }
        
        .stat-card {
          text-align: center;
          border-radius: 8px;
          background: ${
            isDarkMode
              ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          };
          border: 1px solid ${isDarkMode ? '#374151' : '#e2e8f0'};
          box-shadow: ${
            isDarkMode
              ? '0 4px 24px rgba(0, 0, 0, 0.2)'
              : '0 2px 8px rgba(0,0,0,0.1)'
          };
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: ${
            isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 4px 16px rgba(0,0,0,0.15)'
          };
        }
        
        .form-card, .table-card {
          margin-bottom: 24px;
          border-radius: 8px;
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
          border-color: ${isDarkMode ? '#374151' : '#d9d9d9'};
          box-shadow: ${
            isDarkMode
              ? '0 4px 24px rgba(0, 0, 0, 0.15)'
              : '0 2px 8px rgba(0,0,0,0.1)'
          };
        }
        
        .form-card .ant-card-head, .table-card .ant-card-head {
          background: ${isDarkMode ? '#111827' : '#fafafa'};
          border-bottom-color: ${isDarkMode ? '#374151' : '#f0f0f0'};
        }
        
        .form-card .ant-card-head-title, .table-card .ant-card-head-title {
          color: ${isDarkMode ? '#f9fafb' : '#000000d9'};
        }
        
        .subcategory-info {
          padding: 8px 0;
        }
        
        .subcategory-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        
        .subcategory-main {
          display: flex;
          align-items: flex-start;
          flex: 1;
        }
        
        .subcategory-content {
          flex: 1;
        }
        
        .subcategory-details {
          margin-top: 8px;
          margin-left: 52px;
        }
        
        .analytics-section {
          padding: 8px 0;
        }
        
        .analytic-item {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        }
        
        .editable-row {
          transition: all 0.3s ease;
        }
        
        .editable-row:hover {
          background-color: ${isDarkMode ? '#374151' : '#fafafa'};
        }
        
        .active-row {
          background-color: ${
            isDarkMode ? 'rgba(34, 197, 94, 0.08)' : 'rgba(82, 196, 26, 0.02)'
          };
        }
        
        .inactive-row {
          background-color: ${
            isDarkMode ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 77, 79, 0.02)'
          };
          opacity: 0.8;
        }
        
        .editable-cell-value-wrap {
          border-radius: 4px;
          transition: all 0.3s;
          padding: 8px;
        }
        
        .editable-cell-value-wrap:hover {
          background-color: ${
            isDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#e6f7ff'
          };
          border: 1px dashed ${isDarkMode ? '#60a5fa' : '#1890ff'};
        }
        
        .add-modal .ant-modal-content,
        .edit-modal .ant-modal-content,
        .analytics-modal .ant-modal-content {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
          border: 1px solid ${isDarkMode ? '#374151' : '#d9d9d9'};
        }
        
        .add-modal .ant-modal-header,
        .edit-modal .ant-modal-header,
        .analytics-modal .ant-modal-header {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
          border-bottom-color: ${isDarkMode ? '#374151' : '#f0f0f0'};
        }
        
        .add-modal .ant-modal-title,
        .edit-modal .ant-modal-title,
        .analytics-modal .ant-modal-title {
          color: ${isDarkMode ? '#f9fafb' : '#000000d9'};
        }
        
        .add-modal .ant-modal-body,
        .edit-modal .ant-modal-body,
        .analytics-modal .ant-modal-body {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
        }
        
        .mini-stat-card {
          text-align: center;
          border-radius: 6px;
          background: ${isDarkMode ? '#111827' : '#ffffff'};
          border-color: ${isDarkMode ? '#374151' : '#d9d9d9'};
          box-shadow: ${
            isDarkMode
              ? '0 2px 8px rgba(0, 0, 0, 0.15)'
              : '0 1px 4px rgba(0,0,0,0.1)'
          };
        }
        
        .mini-stat-card .ant-statistic-title {
          font-size: 12px;
          margin-bottom: 4px;
          color: ${isDarkMode ? '#9ca3af' : 'rgba(0, 0, 0, 0.45)'};
        }
        
        .mini-stat-card .ant-statistic-content {
          font-size: 18px;
        }
        
        /* Dark mode form controls */
        .ant-input,
        .ant-select-selector,
        .ant-input-search input {
          background-color: ${isDarkMode ? '#374151' : '#ffffff'};
          border-color: ${isDarkMode ? '#4b5563' : '#d9d9d9'};
          color: ${isDarkMode ? '#f3f4f6' : '#000000d9'};
        }
        
        .ant-input:focus,
        .ant-input-focused,
        .ant-select-focused .ant-select-selector {
          background-color: ${isDarkMode ? '#374151' : '#ffffff'};
          border-color: #1890ff;
          box-shadow: 0 0 0 2px ${
            isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(24, 144, 255, 0.2)'
          };
        }
        
        .ant-select-arrow {
          color: ${isDarkMode ? '#9ca3af' : 'rgba(0, 0, 0, 0.25)'};
        }
        
        /* Table styling */
        .ant-table-thead > tr > th {
          background-color: ${isDarkMode ? '#111827' : '#fafafa'};
          font-weight: 600;
          color: ${isDarkMode ? '#f3f4f6' : '#262626'};
          border-bottom-color: ${isDarkMode ? '#374151' : '#f0f0f0'};
        }
        
        .ant-table-tbody > tr > td {
          padding: 16px;
          background-color: ${isDarkMode ? '#1f2937' : '#ffffff'};
          color: ${isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.85)'};
          border-bottom-color: ${isDarkMode ? '#374151' : '#f5f5f5'};
        }
        
        .ant-table-tbody > tr:hover > td {
          background-color: ${isDarkMode ? '#374151' : '#f5f5f5'};
        }
        
        .ant-table {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
        }
        
        /* Typography */
        .ant-typography {
          color: ${isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.85)'};
        }
        
        .ant-typography-caption {
          color: ${isDarkMode ? '#9ca3af' : 'rgba(0, 0, 0, 0.45)'};
        }
        
        /* Tags and badges */
        .ant-badge-count {
          background-color: ${isDarkMode ? '#3b82f6' : '#1890ff'};
        }
        
        .ant-tag {
          border-radius: 12px;
          font-size: 11px;
          line-height: 18px;
          padding: 2px 8px;
          background: ${isDarkMode ? '#374151' : '#fafafa'};
          border-color: ${isDarkMode ? '#4b5563' : '#d9d9d9'};
          color: ${isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.65)'};
        }
        
        .ant-tag-blue {
          background: ${isDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#e6f7ff'};
          border-color: ${isDarkMode ? '#3b82f6' : '#91d5ff'};
          color: ${isDarkMode ? '#60a5fa' : '#1890ff'};
        }
        
        .ant-tag-purple {
          background: ${isDarkMode ? 'rgba(147, 51, 234, 0.15)' : '#f9f0ff'};
          border-color: ${isDarkMode ? '#9333ea' : '#d3adf7'};
          color: ${isDarkMode ? '#a855f7' : '#722ed1'};
        }
        
        /* Buttons */
        .ant-btn {
          background: ${isDarkMode ? '#374151' : '#ffffff'};
          border-color: ${isDarkMode ? '#4b5563' : '#d9d9d9'};
          color: ${isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.65)'};
        }
        
        .ant-btn-primary {
          background: #1890ff;
          border-color: #1890ff;
          color: #ffffff;
        }
        
        .ant-btn-danger {
          background: ${isDarkMode ? 'transparent' : '#ffffff'};
          border-color: #ff4d4f;
          color: #ff4d4f;
        }
        
        .ant-btn-danger:hover {
          background: #ff4d4f;
          color: #ffffff;
        }
        
        /* Alert styling */
        .ant-alert-info {
          background: ${isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#e6f7ff'};
          border-color: ${isDarkMode ? '#3b82f6' : '#91d5ff'};
        }
        
        .ant-alert-info .ant-alert-message {
          color: ${isDarkMode ? '#60a5fa' : '#1890ff'};
        }
        
        .ant-alert-info .ant-alert-description {
          color: ${isDarkMode ? '#93c5fd' : '#1890ff'};
        }

        .ant-alert-error {
          background: ${isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fff2f0'};
          border-color: ${isDarkMode ? '#ef4444' : '#ffccc7'};
        }
        
        .ant-alert-error .ant-alert-message {
          color: ${isDarkMode ? '#fca5a5' : '#cf1322'};
        }
        
        .ant-alert-error .ant-alert-description {
          color: ${isDarkMode ? '#fecaca' : '#cf1322'};
        }
        
        /* Descriptions component */
        .ant-descriptions-bordered .ant-descriptions-item-label {
          background: ${isDarkMode ? '#111827' : '#fafafa'};
          color: ${isDarkMode ? '#f3f4f6' : 'rgba(0, 0, 0, 0.85)'};
          border-color: ${isDarkMode ? '#374151' : '#f0f0f0'};
        }
        
        .ant-descriptions-bordered .ant-descriptions-item-content {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
          color: ${isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.65)'};
          border-color: ${isDarkMode ? '#374151' : '#f0f0f0'};
        }
        
        /* Switch styling */
        .ant-switch-checked {
          background-color: #52c41a;
        }
        
        .ant-switch-checked .ant-switch-handle::before {
          background-color: #fff;
        }
        
        /* Upload styling */
        .ant-upload-list-picture-card .ant-upload-list-item {
          background: ${isDarkMode ? '#374151' : '#ffffff'};
          border-color: ${isDarkMode ? '#4b5563' : '#d9d9d9'};
        }
        
        .ant-upload-select-picture-card {
          background: ${isDarkMode ? '#374151' : '#fafafa'};
          border-color: ${isDarkMode ? '#4b5563' : '#d9d9d9'};
          color: ${isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.65)'};
        }
        
        .ant-upload-select-picture-card:hover {
          border-color: #1890ff;
        }
        
        /* Pagination */
        .ant-pagination .ant-pagination-item {
          background: ${isDarkMode ? '#374151' : '#ffffff'};
          border-color: ${isDarkMode ? '#4b5563' : '#d9d9d9'};
        }
        
        .ant-pagination .ant-pagination-item a {
          color: ${isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.65)'};
        }
        
        .ant-pagination .ant-pagination-item-active {
          background: #1890ff;
          border-color: #1890ff;
        }
        
        .ant-pagination .ant-pagination-item-active a {
          color: #ffffff;
        }
        
        .ant-pagination .ant-pagination-prev,
        .ant-pagination .ant-pagination-next {
          background: ${isDarkMode ? '#374151' : '#ffffff'};
          border-color: ${isDarkMode ? '#4b5563' : '#d9d9d9'};
        }
        
        .ant-pagination .ant-pagination-prev a,
        .ant-pagination .ant-pagination-next a {
          color: ${isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.65)'};
        }
        
        /* Popover styling for popconfirm */
        .ant-popover-inner {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
          border: 1px solid ${isDarkMode ? '#374151' : '#f0f0f0'};
        }
        
        .ant-popover-title {
          color: ${isDarkMode ? '#f3f4f6' : 'rgba(0, 0, 0, 0.85)'};
          border-bottom-color: ${isDarkMode ? '#374151' : '#f0f0f0'};
        }
        
        .ant-popover-inner-content {
          color: ${isDarkMode ? '#e5e7eb' : 'rgba(0, 0, 0, 0.65)'};
        }
        
        /* Divider */
        .ant-divider {
          border-color: ${isDarkMode ? '#374151' : '#f0f0f0'};
        }
        
        /* Form validation */
        .ant-form-item-has-error .ant-input,
        .ant-form-item-has-error .ant-select-selector {
          border-color: #ff4d4f;
        }
        
        .ant-form-item-explain-error {
          color: #ff4d4f;
        }
        
        /* Loading overlay */
        .ant-spin-container {
          position: relative;
        }
        
        .ant-table-loading .ant-spin-nested-loading > div > .ant-spin {
          max-height: none;
        }
        
        /* Image fallback styling */
        .ant-image-img {
          transition: all 0.3s ease;
        }
        
        .ant-image-img:hover {
          transform: scale(1.05);
        }
        
        /* Card hover effects */
        .ant-card {
          transition: all 0.3s ease;
          background: ${isDarkMode ? '#1f2937' : '#ffffff'};
          border-color: ${isDarkMode ? '#374151' : '#d9d9d9'};
        }
        
        .ant-card:hover {
          box-shadow: ${
            isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.2)'
              : '0 4px 16px rgba(0,0,0,0.1)'
          };
        }
        
        /* Performance summary cards styling */
        .performance-summary-card {
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }
        
        .performance-summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .subcategory-management-container {
            padding: 16px;
          }
          
          .page-title {
            font-size: 24px;
          }
          
          .stats-section .ant-statistic-content-value {
            font-size: 20px;
          }
          
          .table-card .ant-card-extra {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          
          .table-card .ant-input-search {
            width: 100% !important;
          }
          
          .subcategory-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .subcategory-main {
            width: 100%;
          }
          
          .subcategory-details {
            margin-left: 0;
            margin-top: 12px;
          }
          
          .stats-section .ant-col {
            margin-bottom: 16px;
          }
          
          .analytics-section {
            padding: 4px 0;
          }
          
          .analytic-item {
            font-size: 11px;
          }
        }
        
        @media (max-width: 576px) {
          .subcategory-management-container {
            padding: 12px;
          }
          
          .add-modal,
          .edit-modal,
          .analytics-modal {
            width: 95% !important;
          }
          
          .mini-stat-card .ant-statistic-content {
            font-size: 16px;
          }
          
          .subcategory-info {
            padding: 4px 0;
          }
          
          .subcategory-main .ant-image {
            width: 32px !important;
            height: 32px !important;
            margin-right: 8px;
          }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f1f1f1'};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#6b7280' : '#c1c1c1'};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#9ca3af' : '#a8a8a8'};
        }
        
        /* Enhanced focus states */
        .ant-btn:focus,
        .ant-input:focus,
        .ant-select-selector:focus {
          outline: 2px solid ${isDarkMode ? '#60a5fa' : '#1890ff'};
          outline-offset: 2px;
        }
        
        /* Loading states */
        .ant-btn-loading {
          pointer-events: none;
          opacity: 0.7;
        }
        
        /* Success states */
        .ant-message-success {
          background: ${isDarkMode ? '#064e3b' : '#f6ffed'};
          border: 1px solid ${isDarkMode ? '#059669' : '#b7eb8f'};
        }
        
        /* Error states */
        .ant-message-error {
          background: ${isDarkMode ? '#7f1d1d' : '#fff2f0'};
          border: 1px solid ${isDarkMode ? '#dc2626' : '#ffccc7'};
        }
      `}</style>
    </div>
  );
};

export default AllSubCategory;