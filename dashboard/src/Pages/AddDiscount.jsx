import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Space,
  Button,
  message,
  Select,
  Col,
  InputNumber,
  Row,
  Spin,
  Alert,
  Tag,
  Typography,
  Modal,
  Form,
  Avatar,
  Image,
} from "antd";
import {
  PercentageOutlined,
  DollarOutlined,
  StopOutlined,
  ShoppingOutlined,
  TagsOutlined,
  BookOutlined,
  UserOutlined,
  AppstoreOutlined,
  BranchesOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  FileImageOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;
const { confirm } = Modal;

const AddDiscount = () => {
  const [brandData, setBrandData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [authorData, setAuthorData] = useState([]);
  const [selectedType, setSelectedType] = useState("brand");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({});
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkForm] = Form.useForm();

  // API Base URL - adjust according to your backend
  const API_BASE_URL = "http://localhost:8000/api/v1";

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchTableData();
  }, [
    selectedType,
    brandData,
    categoryData,
    subCategoryData,
    productData,
    authorData,
  ]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBrands(),
        fetchCategories(),
        fetchSubCategories(),
        fetchProducts(),
        fetchAuthors(),
      ]);
    } catch (error) {
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/brand`);
      if (!response.ok) throw new Error("Failed to fetch brands");
      const data = await response.json();
      setBrandData(data.data?.doc || data.data || data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      message.error("Failed to fetch brands");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/category`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategoryData(data.data?.doc || data.data || data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories");
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subCategory`);
      if (!response.ok) throw new Error("Failed to fetch subcategories");
      const data = await response.json();
      setSubCategoryData(data.data?.doc || data.data || data || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      message.error("Failed to fetch subcategories");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProductData(data.data?.doc || data.data || data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Failed to fetch products");
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/author`);
      if (!response.ok) throw new Error("Failed to fetch authors");
      const data = await response.json();
      setAuthorData(data.data?.doc || data.data || data || []);
    } catch (error) {
      console.error("Error fetching authors:", error);
      message.error("Failed to fetch authors");
    }
  };

  const fetchTableData = () => {
    let data = [];
    switch (selectedType) {
      case "brand":
        data = brandData.map((item) => ({
          ...item,
          name: item.name || item.title,
          Type: "brand",
          discountType: item.discountType || "none",
          discountValue: item.discountValue || 0,
        }));
        break;
      case "category":
        data = categoryData.map((item) => ({
          ...item,
          name: item.title || item.name,
          Type: "category",
          discountType: item.discountType || "none",
          discountValue: item.discountValue || 0,
        }));
        break;
      case "subCategory":
        data = subCategoryData.map((item) => ({
          ...item,
          name: item.title || item.name,
          Type: "subCategory",
          discountType: item.discountType || "none",
          discountValue: item.discountValue || 0,
        }));
        break;
      case "product":
        data = productData.map((item) => ({
          ...item,
          photo: item.photos?.[0], // Safely access first photo
          name: item.title || item.name,
          authorName: typeof item.author === 'object' ? item.author?.name : item.author,
          categoryName: typeof item.category === 'object' ? item.category?.title : item.category,
          subCategoryName: typeof item.subCategory === 'object' ? item.subCategory?.title : item.subCategory,
          brandName: typeof item.brand === 'object' ? item.brand?.title : item.brand,
          Type: "product",
          discountType: item.discountType || "none",
          discountValue: item.discountValue || 0,
        }));
        break;
      case "author":
        data = authorData.map((item) => ({
          ...item,
          name: item.name || item.title,
          Type: "author",
          discountType: item.discountType || "none",
          discountValue: item.discountValue || 0,
        }));
        break;
      default:
        break;
    }
    setTableData(data);
  };

  const handleUpdateDiscount = async (record) => {
    if (!record.discountType) {
      message.warning("Please select a discount type");
      return;
    }

    if (
      record.discountType !== "none" &&
      (!record.discountValue || record.discountValue <= 0)
    ) {
      message.warning("Please enter a valid discount value");
      return;
    }

    if (record.discountType === "percent" && record.discountValue > 100) {
      message.warning("Percentage discount cannot exceed 100%");
      return;
    }

    setUpdating((prev) => ({ ...prev, [record._id]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/discount/apply`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedType,
          id: record._id,
          discountType: record.discountType,
          discountValue: record.discountValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update discount");
      }

      message.success(`Discount applied successfully to ${record.name}`);

      // Update local data to reflect changes
      const updatedData = tableData.map((item) =>
        item._id === record._id ? { ...item, ...record } : item
      );
      setTableData(updatedData);

      // Refresh data from backend
      await fetchAllData();
    } catch (error) {
      message.error("Failed to update discount");
      console.error("Error updating discount:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [record._id]: false }));
    }
  };

  const handleRemoveDiscount = (record) => {
    confirm({
      title: "Remove Discount",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to remove discount from "${record.name}"?`,
      onOk: async () => {
        setUpdating((prev) => ({ ...prev, [record._id]: true }));

        try {
          const response = await fetch(`${API_BASE_URL}/discount/remove`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: selectedType,
              id: record._id,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to remove discount");
          }

          message.success(`Discount removed from ${record.name}`);

          // Update local data
          const updatedData = tableData.map((item) =>
            item._id === record._id
              ? { ...item, discountType: "none", discountValue: 0 }
              : item
          );
          setTableData(updatedData);

          // Refresh data from backend
          await fetchAllData();
        } catch (error) {
          message.error("Failed to remove discount");
          console.error("Error removing discount:", error);
        } finally {
          setUpdating((prev) => ({ ...prev, [record._id]: false }));
        }
      },
    });
  };

  const handleBulkDiscount = async (values) => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select items to apply bulk discount");
      return;
    }

    if (selectedType !== "product") {
      message.warning("Bulk discount is only available for products");
      return;
    }

    if (!values.discountType) {
      message.warning("Please select a discount type");
      return;
    }

    if (
      values.discountType !== "none" &&
      (!values.discountValue || values.discountValue <= 0)
    ) {
      message.warning("Please enter a valid discount value");
      return;
    }

    if (values.discountType === "percent" && values.discountValue > 100) {
      message.warning("Percentage discount cannot exceed 100%");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/discount/bulk`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds: selectedRowKeys,
          discountType: values.discountType,
          discountValue: values.discountValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply bulk discount");
      }

      message.success(
        `Bulk discount applied to ${selectedRowKeys.length} products`
      );
      setBulkModalVisible(false);
      setSelectedRowKeys([]);
      bulkForm.resetFields();

      // Refresh data
      await fetchProducts();
    } catch (error) {
      message.error("Failed to apply bulk discount");
      console.error("Error applying bulk discount:", error);
    }
  };

  const handleSelectChange = (value, record, key) => {
    const newData = tableData.map((item) => {
      if (item._id === record._id) {
        const updatedItem = { ...item, [key]: value };

        // Reset discount value when changing to "none"
        if (key === "discountType" && value === "none") {
          updatedItem.discountValue = 0;
        }

        return updatedItem;
      }
      return item;
    });
    setTableData(newData);
  };

  const getDiscountTag = (discountType, discountValue) => {
    if (discountType === "none" || discountValue === 0) {
      return (
        <Tag color="default" icon={<StopOutlined />}>
          No Discount
        </Tag>
      );
    }

    if (discountType === "percent") {
      return (
        <Tag color="green" icon={<PercentageOutlined />}>
          {discountValue}% Off
        </Tag>
      );
    }

    if (discountType === "amount") {
      return (
        <Tag color="blue" icon={<DollarOutlined />}>
          ${discountValue} Off
        </Tag>
      );
    }

    return <Tag color="default">Unknown</Tag>;
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      brand: <TagsOutlined />,
      category: <AppstoreOutlined />,
      subCategory: <BranchesOutlined />,
      product: <BookOutlined />,
      author: <UserOutlined />,
    };
    return iconMap[type] || <ShoppingOutlined />;
  };

  const renderProductImage = (photo, record) => {
    if (!photo) {
      return (
        <Avatar
          size={48}
          icon={<FileImageOutlined />}
          className="bg-gray-200 text-gray-500"
        />
      );
    }

    return (
      <Image
        width={48}
        height={48}
        src={photo}
        alt={record.name}
        className="rounded-md object-cover"
        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN4BMghE+gg4jNhFip2aLFiusr4iHETMo9A3ETLhhHBhw5LNhQo8Hi2OxH+xWGzSoWOOY73TPN"
        preview={{
          mask: false,
        }}
      />
    );
  };

  const rowSelection =
    selectedType === "product"
      ? {
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }
      : null;

  const columns = [
    {
      title: "Photo",
      key: "photo",
      width: 80,
      render: (_, record) => {
        if (selectedType === "product") {
          return renderProductImage(record.photo, record);
        }
        return getTypeIcon(selectedType);
      },
    },
    {
      title: "Name/Title",
      key: "nameOrTitle",
      render: (text, record) => (
        <div className="flex flex-col">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {record.name}
          </div>
          {selectedType === "product" && record.price && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Price: ${record.price}
              {record.salePrice && record.salePrice !== record.price && (
                <> | Sale: ${record.salePrice}</>
              )}
            </div>
          )}
          {selectedType === "product" && record.authorName && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Author: {record.authorName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Current Discount",
      key: "currentDiscount",
      render: (_, record) =>
        getDiscountTag(record.discountType, record.discountValue),
    },
    {
      title: "Discount Type",
      dataIndex: "discountType",
      key: "discountType",
      render: (value, record) => (
        <Select
          style={{ width: "140px" }}
          value={value}
          onChange={(val) => handleSelectChange(val, record, "discountType")}
        >
          <Option value="none">
            <div className="flex items-center gap-2">
              <StopOutlined />
              No Discount
            </div>
          </Option>
          <Option value="percent">
            <div className="flex items-center gap-2">
              <PercentageOutlined />
              Percentage
            </div>
          </Option>
          <Option value="amount">
            <div className="flex items-center gap-2">
              <DollarOutlined />
              Fixed Amount
            </div>
          </Option>
        </Select>
      ),
    },
    {
      title: "Discount Value",
      dataIndex: "discountValue",
      key: "discountValue",
      render: (value, record) => (
        <InputNumber
          style={{ width: "120px" }}
          value={value}
          onChange={(val) =>
            handleSelectChange(val || 0, record, "discountValue")
          }
          min={0}
          max={record.discountType === "percent" ? 100 : undefined}
          precision={2}
          disabled={record.discountType === "none"}
          addonAfter={record.discountType === "percent" ? "%" : "$"}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            loading={updating[record._id]}
            onClick={() => handleUpdateDiscount(record)}
            size="small"
          >
            Apply
          </Button>

          {record.discountType !== "none" && record.discountValue > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={updating[record._id]}
              onClick={() => handleRemoveDiscount(record)}
              size="small"
            >
              Remove
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const typeOptions = [
    {
      label: (
        <div className="flex items-center gap-2">
          <TagsOutlined />
          Brands
        </div>
      ),
      value: "brand",
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <AppstoreOutlined />
          Categories
        </div>
      ),
      value: "category",
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <BranchesOutlined />
          Sub-Categories
        </div>
      ),
      value: "subCategory",
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <BookOutlined />
          Products
        </div>
      ),
      value: "product",
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <UserOutlined />
          Authors
        </div>
      ),
      value: "author",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2 !text-gray-900 dark:!text-white">
            Discount Management System
          </Title>
          <div className="text-base text-gray-600 dark:text-gray-300">
            Manage discounts across your entire BookWorm inventory
          </div>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(selectedType)}
                    <span className="text-gray-900 dark:text-white">
                      Apply Discount to{" "}
                      {selectedType.charAt(0).toUpperCase() +
                        selectedType.slice(1)}
                      s
                    </span>
                  </div>

                  <Space>
                    {selectedType === "product" &&
                      selectedRowKeys.length > 0 && (
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setBulkModalVisible(true)}
                        >
                          Bulk Discount ({selectedRowKeys.length})
                        </Button>
                      )}

                    <Select
                      style={{ width: "200px" }}
                      value={selectedType}
                      onChange={(value) => {
                        setSelectedType(value);
                        setSelectedRowKeys([]);
                      }}
                      options={typeOptions}
                    />
                  </Space>
                </div>
              }
              bordered={false}
              className="shadow-sm bg-white dark:bg-gray-800"
            >
              {selectedType === "product" && (
                <Alert
                  message="Product Discount Information"
                  description="You can select multiple products to apply bulk discounts. Individual product discounts will override category/brand level discounts. Product photos are displayed for easy identification."
                  type="info"
                  showIcon
                  style={{ marginBottom: "16px" }}
                />
              )}

              <Spin spinning={loading}>
                <Table
                  dataSource={tableData}
                  columns={columns}
                  rowKey="_id"
                  rowSelection={rowSelection}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} items`,
                  }}
                  scroll={{ x: 1000 }}
                />
              </Spin>
            </Card>
          </Col>
        </Row>

        {/* Bulk Discount Modal */}
        <Modal
          title={
            <span className="text-gray-900 dark:text-white">
              Apply Bulk Discount
            </span>
          }
          open={bulkModalVisible}
          onCancel={() => {
            setBulkModalVisible(false);
            bulkForm.resetFields();
          }}
          onOk={() => bulkForm.submit()}
          okText="Apply Bulk Discount"
          width={500}
        >
          <Alert
            message={`Applying discount to ${selectedRowKeys.length} selected products`}
            type="info"
            style={{ marginBottom: "16px" }}
          />

          <Form
            form={bulkForm}
            layout="vertical"
            onFinish={handleBulkDiscount}
          >
            <Form.Item
              name="discountType"
              label="Discount Type"
              rules={[
                { required: true, message: "Please select a discount type" },
              ]}
            >
              <Select placeholder="Select discount type">
                <Option value="percent">Percentage Discount</Option>
                <Option value="amount">Fixed Amount Discount</Option>
                <Option value="none">Remove Discount</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="discountValue"
              label="Discount Value"
              rules={[
                { required: true, message: "Please enter discount value" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const discountType = getFieldValue("discountType");
                    if (discountType === "none") return Promise.resolve();
                    if (!value || value <= 0) {
                      return Promise.reject(
                        new Error("Please enter a valid discount value")
                      );
                    }
                    if (discountType === "percent" && value > 100) {
                      return Promise.reject(
                        new Error("Percentage cannot exceed 100%")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter discount value"
                min={0}
                precision={2}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AddDiscount;