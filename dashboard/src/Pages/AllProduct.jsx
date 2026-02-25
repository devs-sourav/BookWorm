import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Typography,
  Tooltip,
  InputNumber,
  Switch,
  Alert,
  Badge,
  Image,
  Spin,
  Empty,
  Drawer,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  PlusOutlined,
  BookOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  DollarOutlined,
  StockOutlined,
  CalendarOutlined,
  UserOutlined,
  TagOutlined,
  ExportOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Search } = Input;

// Constants
const API_BASE_URL = "https://bookwormm.netlify.app/api/v1";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 5;

// Utility functions
const formatCurrency = (value) => `$${value?.toFixed(2) || "0.00"}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
const getStatusColor = (isActive) => (isActive ? "success" : "default");
const getStockStatus = (stock) => {
  if (stock === 0) return { color: "red", text: "Out of Stock" };
  if (stock <= 5) return { color: "orange", text: "Low Stock" };
  return { color: "green", text: "In Stock" };
};

// API Service
class ProductApiService {
  static async fetchProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/product`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      return data.status === "success" ? data.data.doc : [];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  static async updateProduct(productId, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      return data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  static async deleteProduct(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete product");
      }

      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  static async fetchCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/category`);
      const data = await response.json();
      return data.status === "success" ? data.data.doc : [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  static async fetchAuthors() {
    try {
      const response = await fetch(`${API_BASE_URL}/author`);
      const data = await response.json();
      return data.status === "success" ? data.data.doc : [];
    } catch (error) {
      console.error("Error fetching authors:", error);
      return [];
    }
  }

  static async fetchBrands() {
    try {
      const response = await fetch(`${API_BASE_URL}/brand`);
      const data = await response.json();
      return data.status === "success" ? data.data.doc : [];
    } catch (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
  }
}

// Custom Hooks
const useProductData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductApiService.fetchProducts();
      setProducts(
        data.map((product, index) => ({
          ...product,
          key: product._id,
          serialNumber: index + 1,
        }))
      );
    } catch (error) {
      setError(error.message);
      message.error(`Failed to load products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts, setProducts };
};

const useReferenceData = () => {
  const [referenceData, setReferenceData] = useState({
    categories: [],
    authors: [],
    brands: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [categories, authors, brands] = await Promise.allSettled([
          ProductApiService.fetchCategories(),
          ProductApiService.fetchAuthors(),
          ProductApiService.fetchBrands(),
        ]);

        setReferenceData({
          categories: categories.status === "fulfilled" ? categories.value : [],
          authors: authors.status === "fulfilled" ? authors.value : [],
          brands: brands.status === "fulfilled" ? brands.value : [],
        });
      } catch (error) {
        console.error("Error fetching reference data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferenceData();
  }, []);

  return { referenceData, loading };
};

// Main Component
const AllProducts = () => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Filters and Search
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStock, setFilterStock] = useState("");

  // Custom hooks
  const { products, loading, error, refetch, setProducts } = useProductData();
  const { referenceData, loading: refDataLoading } = useReferenceData();

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchText ||
        product.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.author?.name
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        product.isbn?.toLowerCase().includes(searchText.toLowerCase());

      const matchesCategory =
        !filterCategory || product.category?._id === filterCategory;
      const matchesStatus =
        !filterStatus ||
        (filterStatus === "active" && product.isActive) ||
        (filterStatus === "inactive" && !product.isActive);

      const matchesStock =
        !filterStock ||
        (filterStock === "inStock" && product.stock > 5) ||
        (filterStock === "lowStock" &&
          product.stock > 0 &&
          product.stock <= 5) ||
        (filterStock === "outOfStock" && product.stock === 0);

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [products, searchText, filterCategory, filterStatus, filterStock]);

  // Event Handlers
  const handleEdit = useCallback(
    (product) => {
      setEditingProduct(product);
      setExistingImages(product.photos || []);
      setFileList([]);

      editForm.setFieldsValue({
        title: product.title,
        isbn: product.isbn,
        description: product.description,
        category: product.category?._id,
        author: product.author?._id,
        brand: product.brand?._id,
        price: product.price,
        stock: product.stock,
        discountType: product.discountType,
        discountValue: product.discountValue,
        pageCount: product.pageCount,
        language: product.language,
        format: product.format,
        publicationYear: product.publicationYear,
        freeShipping: product.freeShipping,
        isActive: product.isActive,
      });

      setIsEditModalVisible(true);
    },
    [editForm]
  );

  const handleView = useCallback((product) => {
    setViewingProduct(product);
    setIsViewModalVisible(true);
  }, []);

  const handleDelete = useCallback(
    async (productId) => {
      try {
        await ProductApiService.deleteProduct(productId);
        setProducts((prev) =>
          prev.filter((product) => product._id !== productId)
        );
        message.success("Product deleted successfully");
      } catch (error) {
        message.error(`Failed to delete product: ${error.message}`);
      }
    },
    [setProducts]
  );

  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const values = await editForm.validateFields();
      const formData = new FormData();

      // Add form fields
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      // Add existing images
      existingImages.forEach((image, index) => {
        formData.append(`existingPhotos[${index}]`, image);
      });

      // Add new images
      fileList.forEach((file) => {
        formData.append("photos", file.originFileObj);
      });

      await ProductApiService.updateProduct(editingProduct._id, formData);

      message.success("Product updated successfully");
      setIsEditModalVisible(false);
      setEditingProduct(null);
      refetch();
    } catch (error) {
      message.error(`Failed to update product: ${error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleImageUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(0, MAX_IMAGES));
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Please upload only image files");
      return false;
    }
    const isLt10M = file.size < MAX_FILE_SIZE;
    if (!isLt10M) {
      message.error("Image must be smaller than 10MB");
      return false;
    }
    return false;
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterCategory("");
    setFilterStatus("");
    setFilterStock("");
  };

  // Table columns
  const columns = [
    {
      title: "#",
      dataIndex: "serialNumber",
      key: "serialNumber",
      width: 60,
      fixed: "left",
    },
    {
      title: "Book Details",
      key: "bookDetails",
      width: 300,
      render: (_, record) => (
        <div>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            {record.title}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>
            <UserOutlined /> {record.author?.name}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>
            ISBN: {record.isbn}
          </Text>
          <Space size="small" style={{ marginTop: 4 }}>
            <Tag size="small">{record.format}</Tag>
            <Tag size="small">{record.language}</Tag>
            <Tag size="small">{record.publicationYear}</Tag>
          </Space>
        </div>
      ),
    },
    {
      title: "Images",
      dataIndex: "photos",
      key: "photos",
      width: 120,
      render: (photos) => (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {photos?.slice(0, 2).map((photo, index) => (
            <Image
              key={index}
              src={photo}
              alt={`Product ${index + 1}`}
              width={40}
              height={40}
              style={{ objectFit: "cover", borderRadius: 4 }}
              preview={{
                mask: <EyeOutlined />,
              }}
            />
          ))}
          {photos?.length > 2 && (
            <div
              style={{
                width: 40,
                height: 40,
                background: "#f0f0f0",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              +{photos.length - 2}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Category",
      key: "category",
      width: 120,
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.category?.title}</Tag>
          {record.brand && (
            <Tag
              color="purple"
              style={{ marginTop: 4, display: "block", width: "fit-content" }}
            >
              {record.brand?.title}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Pricing",
      key: "pricing",
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <DollarOutlined style={{ color: "#52c41a" }} />
            <Text strong>{formatCurrency(record.salePrice)}</Text>
          </div>
          {record.price !== record.salePrice && (
            <div>
              <Text delete type="secondary" style={{ fontSize: "12px" }}>
                {formatCurrency(record.price)}
              </Text>
              <Tag color="red" size="small" style={{ marginLeft: 4 }}>
                {record.discountType === "percent"
                  ? `${record.discountValue}%`
                  : `$${record.discountValue}`}{" "}
                OFF
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 100,
      render: (stock) => {
        const status = getStockStatus(stock);
        return (
          <div>
            <Badge color={status.color} text={stock} />
            <Text
              type="secondary"
              style={{ fontSize: "12px", display: "block" }}
            >
              {status.text}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <Tag color={getStatusColor(isActive)}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Stats",
      key: "stats",
      width: 100,
      render: (_, record) => (
        <div style={{ fontSize: "12px" }}>
          <div>Views: {record.visitCount || 0}</div>
          <div>Sales: {record.saleNumber || 0}</div>
          <div>Pages: {record.pageCount}</div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Product">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Product"
            description="Are you sure you want to delete this product? This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Tooltip title="Delete Product">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Error Loading Products"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={refetch}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title
              level={2}
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <BookOutlined style={{ color: "#1890ff" }} />
              Product Management
            </Title>
            <Text type="secondary">
              Manage your book inventory and product details
            </Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={refetch}
              loading={loading}
            >
              Refresh
            </Button>
            <Link to="/dashboard/upload-product">
              <Button type="primary" icon={<PlusOutlined />}>
                Add New Product
              </Button>
            </Link>
          </Space>
        </div>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="Search by title, author, or ISBN..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Category"
              value={filterCategory}
              onChange={setFilterCategory}
              allowClear
              style={{ width: "100%" }}
              loading={refDataLoading}
            >
              {referenceData.categories.map((category) => (
                <Option key={category._id} value={category._id}>
                  {category.title}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Stock Level"
              value={filterStock}
              onChange={setFilterStock}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="inStock">In Stock</Option>
              <Option value="lowStock">Low Stock</Option>
              <Option value="outOfStock">Out of Stock</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space>
              <Button onClick={clearFilters}>Clear Filters</Button>
              <Badge count={filteredProducts.length} showZero>
                <Text type="secondary">Total Products</Text>
              </Badge>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          loading={loading}
          scroll={{ x: 1400, y: 600 }}
          pagination={{
            total: filteredProducts.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} products`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          locale={{
            emptyText: loading ? (
              <Spin />
            ) : (
              <Empty description="No products found" />
            ),
          }}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Edit Product: {editingProduct?.title}
          </Space>
        }
        open={isEditModalVisible}
        onOk={handleUpdate}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingProduct(null);
        }}
        width={800}
        confirmLoading={updateLoading}
        okText="Update Product"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" scrollToFirstError>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Book Title"
                rules={[{ required: true, message: "Please enter book title" }]}
              >
                <Input placeholder="Enter book title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isbn"
                label="ISBN"
                rules={[{ required: true, message: "Please enter ISBN" }]}
              >
                <Input placeholder="Enter ISBN" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={3} placeholder="Enter book description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="category" label="Category">
                <Select placeholder="Select category" loading={refDataLoading}>
                  {referenceData.categories.map((category) => (
                    <Option key={category._id} value={category._id}>
                      {category.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="author" label="Author">
                <Select placeholder="Select author" loading={refDataLoading}>
                  {referenceData.authors.map((author) => (
                    <Option key={author._id} value={author._id}>
                      {author.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="brand" label="Publisher/Brand">
                <Select
                  placeholder="Select brand"
                  loading={refDataLoading}
                  allowClear
                >
                  {referenceData.brands.map((brand) => (
                    <Option key={brand._id} value={brand._id}>
                      {brand.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price ($)"
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  precision={2}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="Stock Quantity"
                rules={[
                  { required: true, message: "Please enter stock quantity" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="discountType" label="Discount Type">
                <Select placeholder="Select discount type">
                  <Option value="none">No Discount</Option>
                  <Option value="percent">Percentage</Option>
                  <Option value="amount">Fixed Amount</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="discountValue" label="Discount Value">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="pageCount" label="Pages">
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="language" label="Language">
                <Select placeholder="Select language">
                  <Option value="English">English</Option>
                  <Option value="Spanish">Spanish</Option>
                  <Option value="French">French</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="publicationYear" label="Year">
                <InputNumber
                  style={{ width: "100%" }}
                  min={1000}
                  max={new Date().getFullYear() + 1}
                  placeholder="2024"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="format" label="Format">
                <Select placeholder="Select format">
                  <Option value="Paperback">Paperback</Option>
                  <Option value="Hardcover">Hardcover</Option>
                  <Option value="eBook">eBook</Option>
                  <Option value="Audiobook">Audiobook</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="freeShipping" valuePropName="checked">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Switch size="small" />
                  <Text>Free Shipping</Text>
                </div>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isActive" valuePropName="checked">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Switch size="small" />
                  <Text>Active Product</Text>
                </div>
              </Form.Item>
            </Col>
          </Row>

          {/* Current Images */}
          {existingImages.length > 0 && (
            <Form.Item label="Current Images">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {existingImages.map((image, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <Image
                      src={image}
                      alt={`Current ${index + 1}`}
                      width={80}
                      height={80}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeExistingImage(index)}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        width: 20,
                        height: 20,
                        minWidth: 20,
                      }}
                    />
                  </div>
                ))}
              </div>
            </Form.Item>
          )}

          {/* Upload New Images */}
          <Form.Item label="Upload New Images (Optional)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageUpload}
              beforeUpload={beforeUpload}
              multiple
              accept="image/*"
            >
              {fileList.length >= MAX_IMAGES ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Drawer
        title={
          <Space>
            <EyeOutlined />
            Product Details
          </Space>
        }
        open={isViewModalVisible}
        onClose={() => setIsViewModalVisible(false)}
        width={600}
      >
        {viewingProduct && (
          <div style={{ padding: "0 8px" }}>
            {/* Product Images */}
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Product Images</Title>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {viewingProduct.photos?.map((photo, index) => (
                  <Image
                    key={index}
                    src={photo}
                    alt={`Product ${index + 1}`}
                    width={120}
                    height={120}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <Card
              title="Basic Information"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Title:</Text>
                  <br />
                  <Text>{viewingProduct.title}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>ISBN:</Text>
                  <br />
                  <Text>{viewingProduct.isbn}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Author:</Text>
                  <br />
                  <Text>{viewingProduct.author?.name}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Category:</Text>
                  <br />
                  <Tag color="blue">{viewingProduct.category?.title}</Tag>
                </Col>
                {viewingProduct.brand && (
                  <Col span={12}>
                    <Text strong>Publisher/Brand:</Text>
                    <br />
                    <Tag color="purple">{viewingProduct.brand?.title}</Tag>
                  </Col>
                )}
                <Col span={12}>
                  <Text strong>Status:</Text>
                  <br />
                  <Tag color={getStatusColor(viewingProduct.isActive)}>
                    {viewingProduct.isActive ? "Active" : "Inactive"}
                  </Tag>
                </Col>
              </Row>
            </Card>

            {/* Description */}
            <Card title="Description" size="small" style={{ marginBottom: 16 }}>
              <Paragraph>{viewingProduct.description}</Paragraph>
            </Card>

            {/* Pricing & Stock */}
            <Card
              title="Pricing & Inventory"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Original Price:</Text>
                  <br />
                  <Text style={{ fontSize: "16px" }}>
                    {formatCurrency(viewingProduct.price)}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Sale Price:</Text>
                  <br />
                  <Text strong style={{ fontSize: "16px", color: "#52c41a" }}>
                    {formatCurrency(viewingProduct.salePrice)}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Discount:</Text>
                  <br />
                  {viewingProduct.discountType !== "none" &&
                  viewingProduct.discountValue > 0 ? (
                    <Tag color="red">
                      {viewingProduct.discountType === "percent"
                        ? `${viewingProduct.discountValue}%`
                        : `${viewingProduct.discountValue}`}{" "}
                      OFF
                    </Tag>
                  ) : (
                    <Text type="secondary">No discount</Text>
                  )}
                </Col>
                <Col span={12}>
                  <Text strong>Stock Quantity:</Text>
                  <br />
                  <Badge
                    color={getStockStatus(viewingProduct.stock).color}
                    text={`${viewingProduct.stock} units`}
                  />
                </Col>
                <Col span={12}>
                  <Text strong>Free Shipping:</Text>
                  <br />
                  <Tag
                    color={viewingProduct.freeShipping ? "green" : "default"}
                  >
                    {viewingProduct.freeShipping ? "Yes" : "No"}
                  </Tag>
                </Col>
              </Row>
            </Card>

            {/* Book Details */}
            <Card
              title="Book Details"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Format:</Text>
                  <br />
                  <Tag>{viewingProduct.format}</Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Language:</Text>
                  <br />
                  <Tag>{viewingProduct.language}</Tag>
                </Col>
                <Col span={12}>
                  <Text strong>Page Count:</Text>
                  <br />
                  <Text>{viewingProduct.pageCount} pages</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Publication Year:</Text>
                  <br />
                  <Text>{viewingProduct.publicationYear}</Text>
                </Col>
              </Row>
            </Card>

            {/* Statistics */}
            <Card title="Statistics" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text strong>Total Views:</Text>
                  <br />
                  <Text>{viewingProduct.visitCount || 0}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Total Sales:</Text>
                  <br />
                  <Text>{viewingProduct.saleNumber || 0}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Created Date:</Text>
                  <br />
                  <Text>{formatDate(viewingProduct.createdAt)}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Last Updated:</Text>
                  <br />
                  <Text>{formatDate(viewingProduct.updatedAt)}</Text>
                </Col>
              </Row>
            </Card>

            {/* SEO Information */}
            <Card title="SEO Information" size="small">
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Text strong>URL Slug:</Text>
                  <br />
                  <Text code>{viewingProduct.slug}</Text>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AllProducts;
