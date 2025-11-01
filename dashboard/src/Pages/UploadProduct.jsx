import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Upload, 
  Card, 
  Row, 
  Col, 
  InputNumber, 
  Switch, 
  message, 
  Spin,
  Typography,
  Space,
  Alert,
  Divider,
  Tag,
  Tooltip,
  Progress
} from 'antd';
import { 
  SaveOutlined, 
  ReloadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  BookOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Constants
const API_BASE_URL = 'http://localhost:8000/api/v1';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 5;
const TITLE_CHECK_DEBOUNCE_MS = 800;

// Utility functions
const formatCurrency = (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const parseCurrency = (value) => value?.replace(/\$\s?|(,*)/g, '') || '';

// API service
class ProductService {
  static async fetchData(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to fetch ${endpoint}`);
      }
      
      return data.status === 'success' ? data.data.doc : [];
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  static async checkTitleAvailability(title) {
    if (!title?.trim() || title.trim().length < 3) {
      return { available: null, message: '' };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/product/check-title/${encodeURIComponent(title.trim())}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to check title availability');
      }
      
      return data.status === 'success' 
        ? { available: data.data.available, message: data.data.message }
        : { available: null, message: 'Unable to verify title availability' };
    } catch (error) {
      console.error('Title availability check failed:', error);
      return { available: null, message: 'Unable to check title availability' };
    }
  }

  static async createProduct(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/product`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }
      
      return data;
    } catch (error) {
      console.error('Product creation failed:', error);
      throw error;
    }
  }
}

// Custom hooks
const useApiData = () => {
  const [data, setData] = useState({
    categories: [],
    subcategories: [],
    authors: [],
    brands: []
  });
  
  const [loading, setLoading] = useState({
    categories: true,
    authors: true,
    brands: true
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [categories, subcategories, authors, brands] = await Promise.allSettled([
          ProductService.fetchData('category'),
          ProductService.fetchData('subcategory'),
          ProductService.fetchData('author'),
          ProductService.fetchData('brand')
        ]);

        const newData = {
          categories: categories.status === 'fulfilled' ? categories.value : [],
          subcategories: subcategories.status === 'fulfilled' ? subcategories.value : [],
          authors: authors.status === 'fulfilled' ? authors.value : [],
          brands: brands.status === 'fulfilled' ? brands.value : []
        };

        setData(newData);

        const rejectedPromises = [categories, subcategories, authors, brands]
          .filter(result => result.status === 'rejected');

        if (rejectedPromises.length > 0) {
          console.warn('Some API calls failed:', rejectedPromises.map(p => p.reason));
          message.warning('Some data failed to load. Please refresh if needed.');
        }

      } catch (error) {
        setError('Failed to load required data. Please refresh the page.');
        message.error('Failed to load required data. Please refresh the page.');
      } finally {
        setLoading({
          categories: false,
          authors: false,
          brands: false
        });
      }
    };

    fetchAllData();
  }, []);

  return { data, loading, error };
};

const useTitleAvailability = (form) => {
  const [titleAvailability, setTitleAvailability] = useState({
    checking: false,
    available: null,
    message: ''
  });

  const checkTitleAvailability = useCallback(async (title) => {
    setTitleAvailability({ checking: true, available: null, message: '' });
    
    const result = await ProductService.checkTitleAvailability(title);
    setTitleAvailability({
      checking: false,
      ...result
    });
  }, []);

  useEffect(() => {
    const title = form.getFieldValue('title');
    
    if (!title) {
      setTitleAvailability({ checking: false, available: null, message: '' });
      return;
    }

    const timer = setTimeout(() => {
      checkTitleAvailability(title);
    }, TITLE_CHECK_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [form.getFieldValue('title'), checkTitleAvailability]);

  return { titleAvailability, setTitleAvailability };
};

// Form validation rules
const validationRules = {
  title: [
    { required: true, message: 'Please enter book title' },
    { min: 3, message: 'Title must be at least 3 characters' },
    { max: 200, message: 'Title cannot exceed 200 characters' }
  ],
  isbn: [
    { required: true, message: 'Please enter ISBN' },
    { 
      pattern: /^(97[89])?\d{9}[\dX]$/i, 
      message: 'Please enter a valid ISBN-10 or ISBN-13' 
    }
  ],
  description: [
    { required: true, message: 'Please enter book description' },
    { min: 50, message: 'Description should be at least 50 characters' },
    { max: 2000, message: 'Description cannot exceed 2000 characters' }
  ],
  price: [
    { required: true, message: 'Please enter price' },
    { type: 'number', min: 0.01, message: 'Price must be greater than 0' }
  ],
  stock: [
    { required: true, message: 'Please enter stock quantity' },
    { type: 'number', min: 0, message: 'Stock must be non-negative' }
  ],
  pageCount: [
    { required: true, message: 'Please enter page count' },
    { type: 'number', min: 1, message: 'Page count must be at least 1' }
  ],
  publicationYear: [
    { required: true, message: 'Please enter publication year' },
    { type: 'number', min: 1000, message: 'Enter valid year' },
    { type: 'number', max: new Date().getFullYear() + 1, message: 'Year cannot be in future' }
  ],
  discountValue: [
    ({ getFieldValue }) => ({
      validator(_, value) {
        const discountType = getFieldValue('discountType');
        if (discountType === 'none') return Promise.resolve();
        
        if (discountType === 'percent' && (value < 0 || value > 100)) {
          return Promise.reject(new Error('Percentage must be between 0 and 100'));
        }
        
        if (discountType === 'amount' && value < 0) {
          return Promise.reject(new Error('Amount must be positive'));
        }
        
        return Promise.resolve();
      },
    }),
  ],
  language: [
    {
      validator: (_, value) => {
        if (!value) return Promise.resolve();
        if (!LANGUAGE_OPTIONS.includes(value)) {
          return Promise.reject(new Error('Please select a valid language from the list'));
        }
        return Promise.resolve();
      }
    }
  ]
};

// Language and format options - Using only English names for MongoDB compatibility
const LANGUAGE_OPTIONS = [
  'English', 
  'Spanish', 
  'French', 
  'German', 
  'Italian', 
  'Portuguese', 
  'Bengali',     // Use English name only
  'Hindi', 
  'Arabic', 
  'Chinese', 
  'Japanese',
  'Russian',
  'Korean',
  'Dutch',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Turkish',
  'Polish',
  'Czech',
  'Hungarian',
  'Thai',
  'Vietnamese',
  'Indonesian',
  'Malay',
  'Urdu',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Odia',
  'Assamese',
  'Sanskrit'
];

const FORMAT_OPTIONS = [
  'Hardcover', 
  'Paperback', 
  'eBook', 
  'Audiobook', 
  'Mass Market Paperback',
  'Spiral Bound',
  'Board Book',
  'Large Print'
];

const AddProduct = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Custom hooks
  const { data, loading: dataLoading, error: dataError } = useApiData();
  const { titleAvailability, setTitleAvailability } = useTitleAvailability(form);

  // Memoized filtered data
  const filteredSubcategories = useMemo(() => {
    return selectedCategory 
      ? data.subcategories.filter(sub => sub.category === selectedCategory && sub.isActive)
      : [];
  }, [data.subcategories, selectedCategory]);

  const activeCategories = useMemo(() => 
    data.categories.filter(category => category.isActive), 
    [data.categories]
  );

  const activeBrands = useMemo(() => 
    data.brands.filter(brand => brand.isActive), 
    [data.brands]
  );

  // Pricing calculations
  const calculateSalePrice = useCallback(() => {
    const { price = 0, discountType = 'none', discountValue = 0 } = formValues;

    if (!price || discountType === 'none' || !discountValue) return price;

    let salePrice = price;
    if (discountType === 'percent') {
      salePrice = price - (price * discountValue / 100);
    } else if (discountType === 'amount') {
      salePrice = Math.max(0, price - discountValue);
    }
    return Math.round(salePrice * 100) / 100;
  }, [formValues]);

  const calculateSavings = useCallback(() => {
    const originalPrice = formValues.price || 0;
    const salePrice = calculateSalePrice();
    return originalPrice - salePrice;
  }, [formValues.price, calculateSalePrice]);

  // Event handlers
  const handleFormValuesChange = useCallback((changedValues, allValues) => {
    setFormValues(allValues);
    
    // Clear title availability when title changes
    if (changedValues.title !== undefined) {
      setTitleAvailability({ checking: false, available: null, message: '' });
    }
  }, [setTitleAvailability]);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    form.setFieldsValue({ 
      subCategory: undefined,
      brand: undefined 
    });
  }, [form]);

  const handleUploadChange = useCallback(({ fileList: newFileList }) => {
    setFileList(newFileList.slice(0, MAX_IMAGES));
  }, []);

  const beforeUpload = useCallback((file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Please upload only image files (PNG, JPG, JPEG)');
      return false;
    }
    
    const isValidSize = file.size <= MAX_FILE_SIZE;
    if (!isValidSize) {
      message.error('Image size must be smaller than 10MB');
      return false;
    }
    
    return false; // Prevent auto upload
  }, []);

  const handleSubmit = async (values) => {
    console.log('Form values before submission:', values); // Debug log

    // Pre-submission validation
    if (titleAvailability.available === false) {
      message.error('Please choose a different title - this one is already taken');
      return;
    }

    if (fileList.length === 0) {
      message.error('Please upload at least one product image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      // Add form fields with proper boolean and number handling
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Special handling for boolean fields
          if (key === 'isActive' || key === 'freeShipping') {
            // Explicitly convert to boolean and then to string for FormData
            const boolValue = Boolean(value);
            formData.append(key, boolValue.toString());
            console.log(`Setting ${key} to:`, boolValue); // Debug log
          }
          // Special handling for numeric fields
          else if (key === 'price' || key === 'stock' || key === 'pageCount' || 
                   key === 'publicationYear' || key === 'discountValue') {
            formData.append(key, Number(value).toString());
          }
          // Handle string fields (including language)
          else {
            formData.append(key, String(value).trim());
          }
        }
      });
      
      // Add images
      fileList.forEach((file) => {
        formData.append('photos', file.originFileObj);
      });

      // Debug: Log all formData entries
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const result = await ProductService.createProduct(formData);
      console.log('Product creation result:', result); // Debug log
      
      message.success('Book added successfully to the catalog!');
      handleReset();
      
    } catch (error) {
      console.error('Submission error:', error); // Debug log
      message.error(`Failed to add book: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    form.resetFields();
    setFileList([]);
    setSelectedCategory(null);
    setTitleAvailability({ checking: false, available: null, message: '' });
    setFormValues({});
  }, [form, setTitleAvailability]);

  // Render functions
  const renderTitleAvailability = () => {
    if (titleAvailability.checking) {
      return (
        <div style={{ marginTop: 4, marginBottom: 8 }}>
          <Space size="small">
            <Spin size="small" />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Checking availability...
            </Text>
          </Space>
        </div>
      );
    }

    if (titleAvailability.available === true) {
      return (
        <Alert
          message="Title is available"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginTop: 4, marginBottom: 8 }}
          size="small"
        />
      );
    }

    if (titleAvailability.available === false) {
      return (
        <Alert
          message={titleAvailability.message}
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginTop: 4, marginBottom: 8 }}
          size="small"
        />
      );
    }

    return null;
  };

  const renderPricingSummary = () => {
    const originalPrice = formValues.price || 0;
    const salePrice = calculateSalePrice();
    const savings = calculateSavings();
    const hasDiscount = formValues.discountType !== 'none' && formValues.discountValue > 0;

    if (!originalPrice) return null;

    return (
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Original Price:</Text>
            <Text strong>${originalPrice.toFixed(2)}</Text>
          </div>
          
          {hasDiscount && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>Discount:</Text>
                <Tag color="red">
                  {formValues.discountType === 'percent' 
                    ? `${formValues.discountValue}%` 
                    : `$${formValues.discountValue}`
                  }
                </Tag>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>You Save:</Text>
                <Text type="success" strong>${savings.toFixed(2)}</Text>
              </div>
              
              <Divider style={{ margin: '8px 0' }} />
            </>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Final Price:</Text>
            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
              ${salePrice.toFixed(2)}
            </Text>
          </div>
        </Space>
      </div>
    );
  };

  const renderFormProgress = () => {
    const requiredFields = ['title', 'isbn', 'description', 'author', 'category', 'price', 'stock', 'pageCount', 'publicationYear'];
    const completedFields = requiredFields.filter(field => {
      const value = formValues[field];
      return value !== undefined && value !== null && value !== '';
    });
    
    const progress = (completedFields.length / requiredFields.length) * 100;
    const hasImages = fileList.length > 0;
    const titleValid = titleAvailability.available !== false;
    
    return (
      <div style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Form Completion Progress</Text>
            <Text>{Math.round(progress)}%</Text>
          </div>
          <Progress 
            percent={progress} 
            status={progress === 100 && hasImages && titleValid ? 'success' : 'active'}
            showInfo={false}
          />
          <Space>
            <Tag color={hasImages ? 'green' : 'orange'}>
              {hasImages ? 'Images Added' : 'Images Required'}
            </Tag>
            <Tag color={titleValid ? 'green' : 'red'}>
              {titleValid ? 'Title Valid' : 'Title Invalid'}
            </Tag>
          </Space>
        </Space>
      </div>
    );
  };

  // Show error state
  if (dataError) {
    return (
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '24px' }}>
        <Alert
          message="Error Loading Data"
          description={dataError}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '24px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            <Space>
              <BookOutlined style={{ color: '#1890ff' }} />
              Add New Book to Catalog
            </Space>
          </Title>
          <Text type="secondary">
            Fill in the details below to add a new book to your inventory
          </Text>
        </div>

        {renderFormProgress()}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormValuesChange}
          initialValues={{
            language: 'English',
            format: 'Paperback',
            discountType: 'none',
            discountValue: 0,
            freeShipping: false,
            isActive: true
          }}
          scrollToFirstError
        >
          {/* Basic Information */}
          <Card 
            title={
              <Space>
                <InfoCircleOutlined />
                Basic Information
              </Space>
            } 
            style={{ marginBottom: 24 }}
            size="small"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label="Book Title"
                  rules={validationRules.title}
                >
                  <Input 
                    placeholder="Enter the complete book title"
                    showCount
                    maxLength={200}
                  />
                </Form.Item>
                {renderTitleAvailability()}
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="isbn"
                  label={
                    <Space>
                      ISBN
                      <Tooltip title="International Standard Book Number (10 or 13 digits)">
                        <InfoCircleOutlined style={{ color: '#999' }} />
                      </Tooltip>
                    </Space>
                  }
                  rules={validationRules.isbn}
                >
                  <Input placeholder="978-0-7432-7356-5 or 0743273567" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={validationRules.description}
            >
              <TextArea 
                rows={4} 
                placeholder="Provide a detailed description of the book including plot summary, key themes, target audience, etc."
                showCount
                maxLength={2000}
              />
            </Form.Item>
          </Card>

          {/* Categories and References */}
          <Card 
            title={
              <Space>
                <BookOutlined />
                Categories & References
              </Space>
            } 
            style={{ marginBottom: 24 }}
            size="small"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="author"
                  label="Author"
                  rules={[{ required: true, message: 'Please select an author' }]}
                >
                  <Select
                    placeholder="Search and select author"
                    loading={dataLoading.authors}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={dataLoading.authors ? <Spin size="small" /> : 'No authors found'}
                  >
                    {data.authors.map(author => (
                      <Option key={author._id} value={author._id}>
                        {author.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select a category' }]}
                >
                  <Select
                    placeholder="Select book category"
                    loading={dataLoading.categories}
                    onChange={handleCategoryChange}
                    notFoundContent={dataLoading.categories ? <Spin size="small" /> : 'No categories found'}
                  >
                    {activeCategories.map(category => (
                      <Option key={category._id} value={category._id}>
                        {category.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="subCategory"
                  label="Sub Category (Optional)"
                >
                  <Select
                    placeholder={
                      !selectedCategory 
                        ? "Select a category first" 
                        : filteredSubcategories.length === 0 
                          ? "No subcategories available" 
                          : "Select subcategory (optional)"
                    }
                    disabled={!selectedCategory}
                    allowClear
                    notFoundContent="No subcategories available"
                  >
                    {filteredSubcategories.map(subcategory => (
                      <Option key={subcategory._id} value={subcategory._id}>
                        {subcategory.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="brand"
                  label="Publisher/Brand (Optional)"
                >
                  <Select
                    placeholder="Select publisher or brand (optional)"
                    loading={dataLoading.brands}
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={dataLoading.brands ? <Spin size="small" /> : 'No brands found'}
                  >
                    {activeBrands.map(brand => (
                      <Option key={brand._id} value={brand._id}>
                        {brand.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Pricing and Inventory */}
          <Card 
            title={
              <Space>
                <DollarOutlined />
                Pricing & Inventory
              </Space>
            } 
            style={{ marginBottom: 24 }}
            size="small"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="price"
                  label="Regular Price ($)"
                  rules={validationRules.price}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="50.00"
                    min={0.01}
                    step={0.01}
                    precision={2}
                    formatter={formatCurrency}
                    parser={parseCurrency}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="stock"
                  label="Stock Quantity"
                  rules={validationRules.stock}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="100"
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={parseCurrency}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  name="discountType"
                  label="Discount Type"
                >
                  <Select
                    onChange={() => form.setFieldValue('discountValue', 0)}
                  >
                    <Option value="none">No Discount</Option>
                    <Option value="percent">Percentage Off</Option>
                    <Option value="amount">Fixed Amount Off</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="discountValue"
                  label="Discount Value"
                  rules={validationRules.discountValue}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder={formValues.discountType === 'percent' ? '10' : '5.00'}
                    min={0}
                    max={formValues.discountType === 'percent' ? 100 : undefined}
                    step={formValues.discountType === 'percent' ? 1 : 0.01}
                    precision={formValues.discountType === 'percent' ? 0 : 2}
                    disabled={formValues.discountType === 'none'}
                    addonAfter={
                      formValues.discountType === 'percent' ? '%' : 
                      formValues.discountType === 'amount' ? '$' : null
                    }
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item label="Pricing Summary">
                  {renderPricingSummary()}
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Book Details */}
          <Card 
            title={
              <Space>
                <BookOutlined />
                Book Details
              </Space>
            } 
            style={{ marginBottom: 24 }}
            size="small"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <Form.Item
                  name="pageCount"
                  label="Page Count"
                  rules={validationRules.pageCount}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="180"
                    min={1}
                    max={10000}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item 
                  name="language" 
                  label="Language"
                  rules={validationRules.language}
                >
                  <Select 
                    showSearch
                    placeholder="Select language"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                    optionFilterProp="children"
                    notFoundContent="Language not found"
                  >
                    {LANGUAGE_OPTIONS.map(lang => (
                      <Option key={lang} value={lang}>{lang}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item name="format" label="Format">
                  <Select placeholder="Select format">
                    {FORMAT_OPTIONS.map(format => (
                      <Option key={format} value={format}>{format}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={6}>
                <Form.Item
                  name="publicationYear"
                  label="Publication Year"
                  rules={validationRules.publicationYear}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder={new Date().getFullYear()}
                    min={1000}
                    max={new Date().getFullYear() + 1}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Form.Item 
                  name="freeShipping" 
                  valuePropName="checked"
                  label={null}
                >
                  <Space>
                    <Switch 
                      size="small"
                      checked={formValues.freeShipping}
                      onChange={(checked) => {
                        console.log('Free shipping changed to:', checked);
                        form.setFieldValue('freeShipping', checked);
                      }}
                    />
                    <Text>Offer Free Shipping</Text>
                    <Tooltip title="Enable free shipping for this product">
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item 
                  name="isActive" 
                  valuePropName="checked"
                  label={null}
                >
                  <Space>
                    <Switch 
                      size="small"
                      checked={formValues.isActive}
                      onChange={(checked) => {
                        console.log('Is active changed to:', checked);
                        form.setFieldValue('isActive', checked);
                      }}
                    />
                    <Text>Active Product</Text>
                    <Tooltip title="Make this product visible in the store">
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Photo Upload */}
          <Card 
            title={
              <Space>
                <UploadOutlined />
                Product Images
              </Space>
            } 
            style={{ marginBottom: 24 }}
            size="small"
          >
            <Form.Item
              name="photos"
              rules={[{ required: true, message: 'Please upload at least one product image' }]}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                multiple
                accept="image/png,image/jpeg,image/jpg"
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                {fileList.length >= MAX_IMAGES ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Image</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Alert
              message="Image Guidelines"
              description={`Upload high-quality product images (PNG, JPG, JPEG). Maximum ${MAX_FILE_SIZE / 1024 / 1024}MB per image, up to ${MAX_IMAGES} images total. First image will be used as the main product image.`}
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>

          {/* Submit Buttons */}
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size="small">
                  <Text type="secondary">
                    All required fields must be completed
                  </Text>
                  <Space>
                    {titleAvailability.available === false && (
                      <Tag color="red">Title Unavailable</Tag>
                    )}
                    {fileList.length === 0 && (
                      <Tag color="orange">Images Required</Tag>
                    )}
                    <Tag color={formValues.isActive ? 'green' : 'orange'}>
                      {formValues.isActive ? 'Product Active' : 'Product Inactive'}
                    </Tag>
                    <Tag color={formValues.freeShipping ? 'blue' : 'default'}>
                      {formValues.freeShipping ? 'Free Shipping' : 'Standard Shipping'}
                    </Tag>
                  </Space>
                </Space>
              </Col>
              <Col>
                <Space size="middle">
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleReset}
                    disabled={loading}
                    size="large"
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    size="large"
                    disabled={
                      titleAvailability.available === false || 
                      fileList.length === 0 ||
                      Object.values(dataLoading).some(Boolean)
                    }
                  >
                    {loading ? 'Adding Book...' : 'Add Book to Catalog'}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Form>
      </Card>
    </div>
  );
};

export default AddProduct;