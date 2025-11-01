import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  message,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Select,
  Switch,
  Spin,
  Alert,
  Divider,
  Tooltip,
  Progress,
  notification,
  Table,
  Tag,
  Modal,
  Popconfirm,
  Avatar,
  Badge,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import axios from "../Components/Axios";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const SubCategoryManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [slugPreview, setSlugPreview] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [currentIsActive, setCurrentIsActive] = useState(true); // Track isActive state separately
  const [tableFilters, setTableFilters] = useState({
    category: null,
    status: null,
    search: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    // Set initial form values
    form.setFieldsValue({ isActive: true });
    setCurrentIsActive(true);
  }, []);

  // Generate slug preview when title changes
  const handleTitleChange = (e) => {
    const title = e.target.value;
    if (title) {
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlugPreview(slug);
    } else {
      setSlugPreview('');
    }
  };

  // Handle switch change
  const handleSwitchChange = (checked) => {
    setCurrentIsActive(checked);
    form.setFieldsValue({ isActive: checked });
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await axios.get('/category');
      
      if (response.data.status === 'success') {
        const categoriesData = response.data.data.doc || response.data.data.categories || [];
        const activeCategories = categoriesData.filter(
          category => category.isActive
        );
        setCategories(activeCategories);
        
        if (activeCategories.length === 0) {
          notification.warning({
            message: 'No Active Categories',
            description: 'No active categories found. Please create and activate categories first.',
            placement: 'topRight',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch categories. Please check your connection and try again.',
        placement: 'topRight',
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchSubCategories = async () => {
    setTableLoading(true);
    try {
      const response = await axios.get('/subCategory');
      
      if (response.data.status === 'success') {
        let subCategoriesData = response.data.data.doc || response.data.data.subCategories || [];
        
        const enrichedSubCategories = await Promise.all(
          subCategoriesData.map(async (subCategory) => {
            if (typeof subCategory.category === 'string') {
              try {
                const categoryResponse = await axios.get(`/category/${subCategory.category}`);
                if (categoryResponse.data.status === 'success') {
                  const categoryData = categoryResponse.data.data.doc || categoryResponse.data.data.category;
                  return {
                    ...subCategory,
                    category: categoryData
                  };
                }
              } catch (error) {
                console.error('Error fetching category for subcategory:', error);
                return {
                  ...subCategory,
                  category: { _id: subCategory.category, title: 'Unknown Category' }
                };
              }
            }
            return subCategory;
          })
        );
        
        setSubCategories(enrichedSubCategories);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      message.error('Failed to fetch subcategories');
    } finally {
      setTableLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      console.log('Form values received:', values);
      console.log('Current isActive state:', currentIsActive);
      
      // Use the currentIsActive state to ensure we get the correct boolean value
      const payload = {
        title: values.title.trim(),
        category: values.category,
        isActive: currentIsActive // Use the tracked state instead of form value
      };

      console.log('Payload being sent:', payload);

      let response;
      if (editingSubCategory) {
        response = await axios.patch(`/subCategory/${editingSubCategory._id}`, payload);
        
        if (response.data.status === 'success') {
          notification.success({
            message: 'Updated Successfully!',
            description: `Sub-category "${values.title}" has been updated successfully.`,
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            placement: 'topRight',
          });
        }
      } else {
        response = await axios.post('/subCategory', payload);
        
        if (response.data.status === 'success') {
          notification.success({
            message: 'Created Successfully!',
            description: `Sub-category "${values.title}" has been created successfully.`,
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            placement: 'topRight',
          });
        }
      }

      handleReset();
      fetchSubCategories();
        
    } catch (error) {
      console.error('Error saving sub-category:', error);
      
      if (error.response?.data?.message) {
        notification.error({
          message: editingSubCategory ? 'Update Failed' : 'Creation Failed',
          description: error.response.data.message,
          placement: 'topRight',
        });
      } else if (error.response?.status === 409) {
        notification.error({
          message: 'Duplicate Entry',
          description: 'A sub-category with this title already exists. Please use a different title.',
          placement: 'topRight',
        });
      } else {
        notification.error({
          message: editingSubCategory ? 'Update Failed' : 'Creation Failed',
          description: 'An unexpected error occurred. Please try again later.',
          placement: 'topRight',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingSubCategory(record);
    
    // Convert isActive to boolean and set both form and state
    const isActiveValue = Boolean(record.isActive);
    setCurrentIsActive(isActiveValue);
    
    const formValues = {
      title: record.title,
      category: typeof record.category === 'object' ? record.category._id : record.category,
      isActive: isActiveValue
    };
    
    console.log('Setting form values for edit:', formValues);
    console.log('Record isActive value:', record.isActive, 'Converted to:', isActiveValue);
    
    form.setFieldsValue(formValues);
    
    setSlugPreview(record.slug);
    setSelectedCategory(typeof record.category === 'object' ? record.category : null);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (record) => {
    try {
      const response = await axios.delete(`/subCategory/${record._id}`);
      
      if (response.status === 204 || response.data.status === 'success') {
        notification.success({
          message: 'Deleted Successfully!',
          description: `Sub-category "${record.title}" and all associated data have been deleted.`,
          placement: 'topRight',
        });
        fetchSubCategories();
      }
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      notification.error({
        message: 'Delete Failed',
        description: error.response?.data?.message || 'Failed to delete sub-category. Please try again.',
        placement: 'topRight',
      });
    }
  };

  const handleReset = () => {
    form.resetFields();
    // Reset both form and state to default values
    form.setFieldsValue({ isActive: true });
    setCurrentIsActive(true);
    setSlugPreview('');
    setSelectedCategory(null);
    setEditingSubCategory(null);
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    setSelectedCategory(category);
  };

  const getFormProgress = () => {
    const values = form.getFieldsValue();
    let filledFields = 0;
    const totalFields = 2;
    
    if (values.title?.trim()) filledFields++;
    if (values.category) filledFields++;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  // Table columns
  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (text, record, index) => (
        <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: '14px' }}>{title}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Slug: {record.slug || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(cat => ({ text: cat.title, value: cat._id })),
      onFilter: (value, record) => {
        const categoryId = typeof record.category === 'object' ? record.category._id : record.category;
        return categoryId === value;
      },
      render: (category) => {
        const categoryTitle = typeof category === 'object' ? category.title : 'Unknown Category';
        return (
          <Tag color="blue" style={{ borderRadius: '12px' }}>
            {categoryTitle}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive) => (
        <Tag 
          color={isActive ? 'success' : 'error'} 
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          style={{ borderRadius: '12px' }}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Brands Count',
      dataIndex: 'brands',
      key: 'brandsCount',
      width: 120,
      sorter: (a, b) => (a.brands?.length || 0) - (b.brands?.length || 0),
      render: (brands) => (
        <Badge 
          count={brands?.length || 0} 
          style={{ backgroundColor: '#52c41a' }}
          showZero
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (createdAt) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            {new Date(createdAt).toLocaleDateString()}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {new Date(createdAt).toLocaleTimeString()}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (text, record) => (
        <Space>
          <Tooltip title="Edit Sub-Category">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ borderRadius: '6px' }}
            />
          </Tooltip>
          <Tooltip title="Delete Sub-Category">
            <Popconfirm
              title="Delete Sub-Category"
              description={
                <div>
                  <p>Are you sure you want to delete "{record.title}"?</p>
                  <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
                    This will also delete all associated brands and products!
                  </p>
                </div>
              }
              onConfirm={() => handleDelete(record)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okType="danger"
              icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                style={{ borderRadius: '6px' }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#2c3e50', marginBottom: '8px' }}>
          Sub-Category Management
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#7f8c8d' }}>
          Create and manage sub-categories for better product organization
        </Paragraph>
      </div>

      {/* Form Section */}
      <Card 
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.95)',
          marginBottom: '32px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            background: editingSubCategory ? 
              'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {editingSubCategory ? 
              <EditOutlined style={{ fontSize: '24px', color: 'white' }} /> :
              <PlusOutlined style={{ fontSize: '24px', color: 'white' }} />
            }
          </div>
          <Title level={3} style={{ marginBottom: '8px', color: '#2c3e50' }}>
            {editingSubCategory ? 'Edit Sub-Category' : 'Create New Sub-Category'}
          </Title>
          {editingSubCategory && (
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Editing: <Text strong>{editingSubCategory.title}</Text>
            </Text>
          )}
        </div>

        {/* Progress Indicator */}
        <div style={{ marginBottom: '24px' }}>
          <Text style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'block' }}>
            Form Completion: {getFormProgress()}%
          </Text>
          <Progress 
            percent={getFormProgress()} 
            size="small" 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
        
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
              requiredMark="optional"
              initialValues={{ isActive: true }}
            >
              <Alert
                message="Sub-Category Information"
                description="Fill in the required fields to create or update a sub-category. The slug will be automatically generated."
                type="info"
                icon={<InfoCircleOutlined />}
                style={{ marginBottom: '24px' }}
                showIcon
                closable
              />

              <Row gutter={[16, 0]}>
                <Col xs={24} md={14}>
                  <Form.Item
                    label={
                      <Space>
                        <Text strong>Parent Category</Text>
                        <Text type="danger">*</Text>
                        <Tooltip title="Select the main category this sub-category belongs to">
                          <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                        </Tooltip>
                      </Space>
                    }
                    name="category"
                    rules={[
                      { required: true, message: 'Please select a parent category!' }
                    ]}
                  >
                    <Select 
                      placeholder="Choose parent category"
                      showSearch
                      loading={categoriesLoading}
                      onChange={handleCategoryChange}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={categoriesLoading ? <Spin size="small" /> : 'No categories found'}
                      style={{ borderRadius: '8px' }}
                    >
                      {categories.map(category => (
                        <Option key={category._id} value={category._id}>
                          <Space>
                            <Text>{category.title}</Text>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={10}>
                  <Form.Item
                    label={
                      <Space>
                        <Text strong>Status</Text>
                        <Tooltip title="Set whether this sub-category should be active or inactive">
                          <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                        </Tooltip>
                      </Space>
                    }
                    name="isActive"
                    valuePropName="checked"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Switch 
                        checked={currentIsActive}
                        onChange={handleSwitchChange}
                        checkedChildren="Active" 
                        unCheckedChildren="Inactive"
                      />
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        {currentIsActive ? 'Visible to users' : 'Hidden from users'}
                      </Text>
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              {selectedCategory && (
                <div style={{ 
                  marginBottom: '16px',
                  padding: '12px',
                  background: '#f0f9ff',
                  border: '1px solid #91d5ff',
                  borderRadius: '8px'
                }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Selected Category: 
                  </Text>
                  <Text strong style={{ marginLeft: '8px', color: '#1890ff' }}>
                    {selectedCategory.title}
                  </Text>
                </div>
              )}

              <Form.Item
                label={
                  <Space>
                    <Text strong>Sub-Category Title</Text>
                    <Text type="danger">*</Text>
                    <Tooltip title="Enter a unique, descriptive name for your sub-category">
                      <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                  </Space>
                }
                name="title"
                rules={[
                  { required: true, message: 'Please enter sub-category title!' },
                  { min: 2, message: 'Title must be at least 2 characters!' },
                  { max: 100, message: 'Title cannot exceed 100 characters!' },
                  {
                    pattern: /^[a-zA-Z0-9\s&\-_.()]+$/,
                    message: 'Title can only contain letters, numbers, spaces, and basic symbols (&-_.())'
                  }
                ]}
                hasFeedback
              >
                <Input 
                  placeholder="Enter sub-category title (e.g., Fiction Books, Electronics)"
                  onChange={handleTitleChange}
                  style={{ borderRadius: '8px' }}
                  showCount
                  maxLength={100}
                />
              </Form.Item>

              {slugPreview && (
                <div style={{ 
                  marginTop: '-16px', 
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                  border: '1px solid #b7eb8f',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <EyeOutlined style={{ color: '#52c41a' }} />
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    URL slug preview: 
                  </Text>
                  <Text code style={{ color: '#52c41a', fontWeight: '500' }}>
                    /{slugPreview}
                  </Text>
                </div>
              )}

              <Divider style={{ margin: '24px 0' }} />

              <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                <Space size="large">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    size="large"
                    icon={<SaveOutlined />}
                    style={{ 
                      minWidth: '160px',
                      height: '48px',
                      borderRadius: '24px',
                      fontWeight: '600',
                      fontSize: '16px',
                      background: editingSubCategory ? 
                        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    {loading ? 
                      (editingSubCategory ? 'Updating...' : 'Creating...') : 
                      (editingSubCategory ? 'Update Sub-Category' : 'Create Sub-Category')
                    }
                  </Button>
                  <Button 
                    onClick={handleReset}
                    size="large"
                    icon={<ReloadOutlined />}
                    style={{ 
                      minWidth: '140px',
                      height: '48px',
                      borderRadius: '24px',
                      fontWeight: '500',
                      fontSize: '16px'
                    }}
                    disabled={loading}
                  >
                    {editingSubCategory ? 'Cancel Edit' : 'Reset Form'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Title level={4} style={{ margin: 0, color: '#2c3e50' }}>
                Sub-Categories List
              </Title>
              <Badge 
                count={subCategories.length} 
                style={{ backgroundColor: '#1890ff' }}
                overflowCount={999}
              />
            </Space>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchSubCategories}
                loading={tableLoading}
                style={{ borderRadius: '6px' }}
                type="default"
              >
                Refresh Data
              </Button>
            </Space>
          </div>
        }
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {subCategories.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <Alert
              message={`Total ${subCategories.length} sub-categories found`}
              description="Click on Edit to modify a sub-category, or Delete to remove it permanently."
              type="info"
              showIcon
              style={{ borderRadius: '8px' }}
              closable
            />
          </div>
        )}

        <Table
          columns={columns}
          dataSource={subCategories}
          rowKey="_id"
          loading={tableLoading}
          scroll={{ x: 1000 }}
          pagination={{
            total: subCategories.length,
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Showing ${range[0]}-${range[1]} of ${total} sub-categories`,
            style: { textAlign: 'center', marginTop: '24px' }
          }}
          locale={{
            emptyText: (
              <Empty
                description={
                  <div>
                    <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                      No sub-categories found
                    </Text>
                    <br />
                    <Text style={{ fontSize: '14px', color: '#bfbfbf' }}>
                      Create your first sub-category using the form above
                    </Text>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '40px 0' }}
              />
            )
          }}
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
          }
          size="middle"
        />
      </Card>

      <style jsx>{`
        .table-row-even {
          background-color: #fafafa;
        }
        .table-row-odd {
          background-color: #ffffff;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f7ff !important;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%);
          font-weight: 600;
          color: #2c3e50;
        }
      `}</style>
    </div>
  );
};

export default SubCategoryManagement;