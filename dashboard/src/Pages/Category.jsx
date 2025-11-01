import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Form,
  Popconfirm,
  Table,
  Modal,
  message,
  Tag,
  Space,
  Tooltip,
  Typography,
  Statistic,
  Switch,
  Select,
  Divider,
  Alert,
  Badge,
  Descriptions,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  GlobalOutlined,
  PlusOutlined,
  EyeOutlined,
  UserOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import axios from "../Components/Axios";
import { useTheme } from "../LayOut/MainLayout";

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

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

const CategoryManagement = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [selectedCategoryStats, setSelectedCategoryStats] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const { isDarkMode } = useTheme();
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/category");

      const formattedData = response.data.data.doc.map((category, index) => ({
        key: category._id,
        index: index + 1,
        categoryId: category._id,
        title: category.title,
        slug: category.slug,
        isActive: category.isActive,
        subCategories: category.subCategories || [],
        subCategoryCount: category.subCategories?.length || 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        date: new Date(category.updatedAt).toLocaleDateString("en-GB"),
      }));

      setDataSource(formattedData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    setLoading(true);
    try {
      const response = await axios.delete(`/category/${categoryId}`);

      if (response.data.status === "success") {
        setDataSource(dataSource.filter((item) => item.key !== categoryId));
        message.success(
          response.data.message || "Category deleted successfully"
        );
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      message.error("Failed to delete category");
      fetchCategories(); // Refresh data on error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (row) => {
    try {
      const updatedData = {
        title: row.title,
        isActive: row.isActive,
      };

      const response = await axios.patch(`/category/${row.key}`, updatedData);

      if (response.data.status === "success") {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...row,
            slug: response.data.data.category.slug,
          });
          setDataSource(newData);
          message.success("Category updated successfully");
        }
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      message.error("Failed to update category");
    }
  };

  const handleStatusToggle = async (record, checked) => {
    try {
      const response = await axios.patch(`/category/${record.key}`, {
        isActive: checked,
      });

      if (response.data.status === "success") {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => item.key === record.key);
        if (index > -1) {
          newData[index].isActive = checked;
          setDataSource(newData);
          message.success(
            `Category ${checked ? "activated" : "deactivated"} successfully`
          );
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      message.error("Failed to update category status");
    }
  };

  const handleViewStats = async (record) => {
    setDetailsLoading(true);
    try {
      const [productsRes, formatsRes] = await Promise.all([
        axios.get(`/category/${record.categoryId}/products`),
        axios.get(`/category/${record.categoryId}/formats`),
      ]);

      setSelectedCategoryStats({
        ...record,
        totalProducts: productsRes.data.results || 0,
        products: productsRes.data.data.products || [],
        formats: formatsRes.data.data.formats || [],
      });
      setStatsModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch category stats:", error);
      message.error("Failed to load category statistics");
    } finally {
      setDetailsLoading(false);
    }
  };

  const onFinish = async (values) => {
    const { title, isActive = true } = values;

    if (!title?.trim()) {
      message.error("Please enter a category title");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/category", {
        title: title.trim(),
        isActive,
      });

      if (response.data.status === "success") {
        form.resetFields();
        fetchCategories();
        message.success("Category added successfully");
      }
    } catch (error) {
      console.error("Failed to add category:", error);
      message.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search data
  const filteredData = dataSource.filter((item) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && item.isActive) ||
      (filterStatus === "inactive" && !item.isActive);

    const matchesSearch =
      !searchText ||
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchText.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getActiveStats = () => {
    const activeCount = dataSource.filter((item) => item.isActive).length;
    const inactiveCount = dataSource.length - activeCount;
    const totalSubCategories = dataSource.reduce(
      (sum, item) => sum + item.subCategoryCount,
      0
    );

    return { activeCount, inactiveCount, totalSubCategories };
  };

  const { activeCount, inactiveCount, totalSubCategories } = getActiveStats();

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      width: "60px",
      align: "center",
      render: (text, record, index) => (
        <Badge
          count={index + 1}
          style={{
            backgroundColor: record.isActive ? "#52c41a" : "#d9d9d9",
            color: record.isActive ? "white" : "#666",
          }}
        />
      ),
    },
    {
      title: "Category Information",
      dataIndex: "title",
      width: "35%",
      editable: true,
      render: (text, record) => (
        <div className="category-info">
          <div className="category-header">
            <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
              <BookOutlined style={{ marginRight: 8 }} />
              {text}
            </Text>
            <div
              className="category-status"
              style={{ marginLeft: "20px" }}
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
          <div className="category-details">
            <Text type="secondary" style={{ fontSize: "12px" }}>
              <GlobalOutlined style={{ marginRight: 4 }} />
              Slug: <Text code>{record.slug}</Text>
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Updated: {record.date}
            </Text>
          </div>
        </div>
      ),
    },

    {
      title: "SubCategories",
      dataIndex: "subCategories",
      width: "30%",
      render: (subCategories, record) => (
        <div className="subcategory-section">
          <div className="subcategory-header">
            <Badge count={record.subCategoryCount} showZero color="#1890ff">
              <TeamOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
            </Badge>
            <Text style={{ marginLeft: 8, fontWeight: 500 }}>
              {record.subCategoryCount === 0
                ? "No subcategories"
                : record.subCategoryCount === 1
                ? "1 subcategory"
                : `${record.subCategoryCount} subcategories`}
            </Text>
          </div>

          {subCategories && subCategories.length > 0 && (
            <div className="subcategory-tags" style={{ marginTop: "8px" }}>
              {subCategories.slice(0, 4).map((sub) => (
                <Tag
                  key={sub._id}
                  color={sub.isActive ? "blue" : "default"}
                  size="small"
                  style={{
                    marginBottom: 4,
                    fontSize: "11px",
                    borderRadius: "12px",
                  }}
                  icon={
                    sub.isActive ? (
                      <CheckCircleOutlined />
                    ) : (
                      <CloseCircleOutlined />
                    )
                  }
                >
                  {sub?.slug
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Unnamed"}
                </Tag>
              ))}
              {subCategories.length > 4 && (
                <Tag
                  color="purple"
                  size="small"
                  style={{
                    marginBottom: 4,
                    fontSize: "11px",
                    borderRadius: "12px",
                  }}
                >
                  +{subCategories.length - 4} more
                </Tag>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      width: "15%",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Analytics">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<BarChartOutlined />}
              onClick={() => handleViewStats(record)}
              loading={detailsLoading}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewStats(record)}
              loading={detailsLoading}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Category"
            description={
              <div style={{ maxWidth: 280 }}>
                <Alert
                  message="Permanent Action"
                  description={`This will delete "${record.title}" and all its ${record.subCategoryCount} subcategories, along with associated products and data.`}
                  type="error"
                  showIcon
                  size="small"
                />
                <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
                  <Text strong>This action cannot be undone!</Text>
                </Paragraph>
              </div>
            }
            onConfirm={() => handleDelete(record.key)}
            okText="Delete Permanently"
            cancelText="Cancel"
            okType="danger"
            placement="topRight"
            icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
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

  return (
    <div className="category-management-container">
      <div className="content-wrapper">
        {/* Header Section */}
        <div className="header-section">
          <Title level={2} className="page-title">
            <BookOutlined className="title-icon" />
            Category Management System
          </Title>
          <Paragraph type="secondary" className="page-description">
            Manage your product categories, subcategories, and their
            relationships efficiently
          </Paragraph>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="stats-section">
          <Col xs={24} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Total Categories"
                value={dataSource.length}
                prefix={<BookOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Active Categories"
                value={activeCount}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Inactive Categories"
                value={inactiveCount}
                prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                valueStyle={{ color: "#ff4d4f", fontSize: "24px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Total SubCategories"
                value={totalSubCategories}
                prefix={<TeamOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1", fontSize: "24px" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Add Category Form */}
        <Card
          title={
            <Space>
              <PlusOutlined />
              Add New Category
            </Space>
          }
          className="form-card"
        >
          <Form
            form={form}
            layout="inline"
            onFinish={onFinish}
            autoComplete="off"
            className="add-category-form"
          >
            <Form.Item
              name="title"
              rules={[
                { required: true, message: "Please enter category name" },
                {
                  min: 2,
                  message: "Category name must be at least 2 characters",
                },
                {
                  max: 50,
                  message: "Category name cannot exceed 50 characters",
                },
              ]}
            >
              <Input
                placeholder="Enter category name (e.g., Fiction, Non-Fiction)"
                showCount
                maxLength={50}
                size="large"
                style={{ width: 300 }}
              />
            </Form.Item>

            <Form.Item name="isActive" initialValue={true}>
              <Select size="large" style={{ width: 120 }}>
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<PlusOutlined />}
              >
                Add Category
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Categories Table */}
        <Card
          title={
            <Space>
              <BookOutlined />
              Categories Overview
              <Badge count={filteredData.length} showZero color="#1890ff" />
            </Space>
          }
          extra={
            <Space>
              <Input.Search
                placeholder="Search categories..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
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
              `editable-row ${record.isActive ? "active-row" : "inactive-row"}`
            }
            bordered
            dataSource={filteredData}
            columns={editableColumns}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total} categories`,
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            scroll={{ x: 800 }}
            size="middle"
            rowKey="key"
          />
        </Card>

        {/* Category Statistics Modal */}
        <Modal
          title={
            <Space>
              <BarChartOutlined />
              Category Analytics
              {selectedCategoryStats && (
                <Tag color={selectedCategoryStats.isActive ? "green" : "red"}>
                  {selectedCategoryStats.title}
                </Tag>
              )}
            </Space>
          }
          open={statsModalVisible}
          onCancel={() => {
            setStatsModalVisible(false);
            setSelectedCategoryStats(null);
          }}
          footer={[
            <Button key="close" onClick={() => setStatsModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={1000}
          className="analytics-modal"
        >
          {selectedCategoryStats && (
            <div>
              {/* Overview Statistics */}
              <Row gutter={[24, 16]} style={{ marginBottom: "24px" }}>
                <Col span={6}>
                  <Card className="mini-stat-card">
                    <Statistic
                      title="Total Products"
                      value={selectedCategoryStats.totalProducts}
                      prefix={<BookOutlined style={{ color: "#1890ff" }} />}
                      valueStyle={{ color: "#1890ff" }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card className="mini-stat-card">
                    <Statistic
                      title="SubCategories"
                      value={selectedCategoryStats.subCategoryCount}
                      prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card className="mini-stat-card">
                    <Statistic
                      title="Available Formats"
                      value={selectedCategoryStats.formats?.length || 0}
                      prefix={<FileTextOutlined style={{ color: "#722ed1" }} />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card className="mini-stat-card">
                    <Statistic
                      title="Status"
                      value={
                        selectedCategoryStats.isActive ? "Active" : "Inactive"
                      }
                      prefix={
                        <GlobalOutlined
                          style={{
                            color: selectedCategoryStats.isActive
                              ? "#52c41a"
                              : "#ff4d4f",
                          }}
                        />
                      }
                      valueStyle={{
                        color: selectedCategoryStats.isActive
                          ? "#52c41a"
                          : "#ff4d4f",
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
                    title="Category Details"
                    bordered
                    column={3}
                    size="small"
                  >
                    <Descriptions.Item label="Name" span={1}>
                      <Text strong>{selectedCategoryStats.title}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Slug" span={1}>
                      <Text code>{selectedCategoryStats.slug}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status" span={1}>
                      <Badge
                        status={
                          selectedCategoryStats.isActive ? "success" : "error"
                        }
                        text={
                          selectedCategoryStats.isActive ? "Active" : "Inactive"
                        }
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Created Date" span={1}>
                      {new Date(
                        selectedCategoryStats.createdAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Updated" span={1}>
                      {new Date(
                        selectedCategoryStats.updatedAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Descriptions.Item>
                    <Descriptions.Item label="SubCategory Count" span={1}>
                      <Badge
                        count={selectedCategoryStats.subCategoryCount}
                        showZero
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[24, 16]}>
                {/* Available Formats */}
                <Col span={12}>
                  <Card
                    title={
                      <Space>
                        <FileTextOutlined style={{ color: "#722ed1" }} />
                        Available Formats
                      </Space>
                    }
                    size="small"
                  >
                    <div style={{ minHeight: "100px" }}>
                      {selectedCategoryStats.formats?.length > 0 ? (
                        <Space wrap>
                          {selectedCategoryStats.formats.map(
                            (format, index) => (
                              <Tag
                                key={index}
                                color="purple"
                                icon={<FileTextOutlined />}
                              >
                                {format}
                              </Tag>
                            )
                          )}
                        </Space>
                      ) : (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                          <FileTextOutlined
                            style={{ fontSize: "24px", color: "#d9d9d9" }}
                          />
                          <br />
                          <Text type="secondary">No formats available</Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>

                {/* SubCategories */}
                <Col span={12}>
                  <Card
                    title={
                      <Space>
                        <TeamOutlined style={{ color: "#52c41a" }} />
                        SubCategories
                      </Space>
                    }
                    size="small"
                  >
                    <div
                      style={{
                        minHeight: "100px",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {selectedCategoryStats.subCategories?.length > 0 ? (
                        <Space direction="vertical" style={{ width: "100%" }}>
                          {selectedCategoryStats.subCategories.map((sub) => (
                            <div
                              key={sub._id}
                              style={{
                                padding: "8px",
                                border: "1px solid #f0f0f0",
                                borderRadius: "6px",
                                backgroundColor: sub.isActive
                                  ? "#f6ffed"
                                  : "#fff2e8",
                              }}
                            >
                              <Space>
                                <Badge
                                  status={sub.isActive ? "success" : "warning"}
                                />
                                <Text strong={sub.isActive}>
                                  {sub.slug
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (c) => c.toUpperCase()) ||
                                    "Unnamed"}
                                </Text>
                                {!sub.isActive && (
                                  <Tag size="small" color="orange">
                                    Inactive
                                  </Tag>
                                )}
                              </Space>
                            </div>
                          ))}
                        </Space>
                      ) : (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                          <TeamOutlined
                            style={{ fontSize: "24px", color: "#d9d9d9" }}
                          />
                          <br />
                          <Text type="secondary">
                            No subcategories available
                          </Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </div>

      <style>{`
        .category-management-container {
          padding: 24px;
          background-color: ${isDarkMode ? "#0f0f0f" : "#f5f7fa"};
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
          color: ${isDarkMode ? "#60a5fa" : "#1890ff"};
          margin-bottom: 8px;
        }
        
        .title-icon {
          margin-right: 12px;
        }
        
        .page-description {
          font-size: 16px;
          max-width: 600px;
          margin: 0 auto;
          color: ${isDarkMode ? "#9ca3af" : "rgba(0, 0, 0, 0.65)"};
        }
        
        .stats-section {
          margin-bottom: 24px;
        }
        
        .stat-card {
          text-align: center;
          border-radius: 8px;
          background: ${
            isDarkMode
              ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
          };
          border: 1px solid ${isDarkMode ? "#374151" : "#e2e8f0"};
          box-shadow: ${
            isDarkMode
              ? "0 4px 24px rgba(0, 0, 0, 0.2)"
              : "0 2px 8px rgba(0,0,0,0.1)"
          };
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: ${
            isDarkMode
              ? "0 8px 32px rgba(0, 0, 0, 0.3)"
              : "0 4px 16px rgba(0,0,0,0.15)"
          };
        }
        
        .form-card {
          margin-bottom: 24px;
          border-radius: 8px;
          background: ${isDarkMode ? "#1f2937" : "#ffffff"};
          border-color: ${isDarkMode ? "#374151" : "#d9d9d9"};
          box-shadow: ${
            isDarkMode
              ? "0 4px 24px rgba(0, 0, 0, 0.15)"
              : "0 2px 8px rgba(0,0,0,0.1)"
          };
        }
        
        .form-card .ant-card-head {
          background: ${isDarkMode ? "#111827" : "#fafafa"};
          border-bottom-color: ${isDarkMode ? "#374151" : "#f0f0f0"};
        }
        
        .form-card .ant-card-head-title {
          color: ${isDarkMode ? "#f9fafb" : "#000000d9"};
        }
        
        .add-category-form {
          gap: 16px;
        }
        
        .table-card {
          border-radius: 8px;
          background: ${isDarkMode ? "#1f2937" : "#ffffff"};
          border-color: ${isDarkMode ? "#374151" : "#d9d9d9"};
          box-shadow: ${
            isDarkMode
              ? "0 4px 24px rgba(0, 0, 0, 0.15)"
              : "0 2px 8px rgba(0,0,0,0.1)"
          };
        }
        
        .table-card .ant-card-head {
          background: ${isDarkMode ? "#111827" : "#fafafa"};
          border-bottom-color: ${isDarkMode ? "#374151" : "#f0f0f0"};
        }
        
        .table-card .ant-card-head-title {
          color: ${isDarkMode ? "#f9fafb" : "#000000d9"};
        }
        
        .category-info {
          padding: 8px 0;
        }
        
        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .category-details {
          margin-top: 8px;
        }
        
        .subcategory-section {
          padding: 8px 0;
        }
        
        .subcategory-header {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
        }
        
        .subcategory-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .editable-row {
          transition: all 0.3s ease;
        }
        
        .editable-row:hover {
          background-color: ${isDarkMode ? "#374151" : "#fafafa"};
        }
        
        .active-row {
          background-color: ${
            isDarkMode ? "rgba(34, 197, 94, 0.08)" : "rgba(82, 196, 26, 0.02)"
          };
        }
        
        .inactive-row {
          background-color: ${
            isDarkMode ? "rgba(239, 68, 68, 0.08)" : "rgba(255, 77, 79, 0.02)"
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
            isDarkMode ? "rgba(59, 130, 246, 0.15)" : "#e6f7ff"
          };
          border: 1px dashed ${isDarkMode ? "#60a5fa" : "#1890ff"};
        }
        
        .analytics-modal .ant-modal-content {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"};
          border: 1px solid ${isDarkMode ? "#374151" : "#d9d9d9"};
        }
        
        .analytics-modal .ant-modal-header {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"};
          border-bottom-color: ${isDarkMode ? "#374151" : "#f0f0f0"};
        }
        
        .analytics-modal .ant-modal-title {
          color: ${isDarkMode ? "#f9fafb" : "#000000d9"};
        }
        
        .analytics-modal .ant-modal-body {
          padding: 24px;
          background: ${isDarkMode ? "#1f2937" : "#ffffff"};
        }
        
        .mini-stat-card {
          text-align: center;
          border-radius: 6px;
          background: ${isDarkMode ? "#111827" : "#ffffff"};
          border-color: ${isDarkMode ? "#374151" : "#d9d9d9"};
          box-shadow: ${
            isDarkMode
              ? "0 2px 8px rgba(0, 0, 0, 0.15)"
              : "0 1px 4px rgba(0,0,0,0.1)"
          };
        }
        
        .mini-stat-card .ant-statistic-title {
          font-size: 12px;
          margin-bottom: 4px;
          color: ${isDarkMode ? "#9ca3af" : "rgba(0, 0, 0, 0.45)"};
        }
        
        .mini-stat-card .ant-statistic-content {
          font-size: 18px;
        }
        
        /* Input and Select styling for dark mode */
        .form-card .ant-input,
        .form-card .ant-select-selector {
          background-color: ${isDarkMode ? "#374151" : "#ffffff"};
          border-color: ${isDarkMode ? "#4b5563" : "#d9d9d9"};
          color: ${isDarkMode ? "#f3f4f6" : "#000000d9"};
        }
        
        .form-card .ant-input:focus,
        .form-card .ant-input-focused,
        .form-card .ant-select-focused .ant-select-selector {
          background-color: ${isDarkMode ? "#374151" : "#ffffff"};
          border-color: #1890ff;
          box-shadow: 0 0 0 2px ${
            isDarkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(24, 144, 255, 0.2)"
          };
        }
        
        .form-card .ant-select-arrow {
          color: ${isDarkMode ? "#9ca3af" : "rgba(0, 0, 0, 0.25)"};
        }
        
        /* Search input in table card */
        .table-card .ant-input-search input {
          background-color: ${isDarkMode ? "#374151" : "#ffffff"};
          border-color: ${isDarkMode ? "#4b5563" : "#d9d9d9"};
          color: ${isDarkMode ? "#f3f4f6" : "#000000d9"};
        }
        
        .table-card .ant-select-selector {
          background-color: ${isDarkMode ? "#374151" : "#ffffff"};
          border-color: ${isDarkMode ? "#4b5563" : "#d9d9d9"};
          color: ${isDarkMode ? "#f3f4f6" : "#000000d9"};
        }
        
        /* Badge and Tag styling */
        .ant-badge-count {
          background-color: ${isDarkMode ? "#3b82f6" : "#1890ff"};
        }
        
        .ant-tag {
          border-radius: 12px;
          font-size: 11px;
          line-height: 18px;
          padding: 2px 8px;
          background: ${isDarkMode ? "#374151" : "#fafafa"};
          border-color: ${isDarkMode ? "#4b5563" : "#d9d9d9"};
          color: ${isDarkMode ? "#e5e7eb" : "rgba(0, 0, 0, 0.65)"};
        }
        
        .ant-tag-blue {
          background: ${isDarkMode ? "rgba(59, 130, 246, 0.15)" : "#e6f7ff"};
          border-color: ${isDarkMode ? "#3b82f6" : "#91d5ff"};
          color: ${isDarkMode ? "#60a5fa" : "#1890ff"};
        }
        
        .ant-tag-purple {
          background: ${isDarkMode ? "rgba(147, 51, 234, 0.15)" : "#f9f0ff"};
          border-color: ${isDarkMode ? "#9333ea" : "#d3adf7"};
          color: ${isDarkMode ? "#a855f7" : "#722ed1"};
        }
        
        /* Alert styling in popconfirm */
        .ant-alert-error {
          background: ${isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#fff2f0"};
          border-color: ${isDarkMode ? "#ef4444" : "#ffccc7"};
        }
        
        .ant-alert-error .ant-alert-message {
          color: ${isDarkMode ? "#fca5a5" : "#cf1322"};
        }
        
        .ant-alert-error .ant-alert-description {
          color: ${isDarkMode ? "#fecaca" : "#cf1322"};
        }
        
        /* Descriptions component */
        .ant-descriptions-bordered .ant-descriptions-item-label {
          background: ${isDarkMode ? "#111827" : "#fafafa"};
          color: ${isDarkMode ? "#f3f4f6" : "rgba(0, 0, 0, 0.85)"};
          border-color: ${isDarkMode ? "#374151" : "#f0f0f0"};
        }
        
        .ant-descriptions-bordered .ant-descriptions-item-content {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"};
          color: ${isDarkMode ? "#e5e7eb" : "rgba(0, 0, 0, 0.65)"};
          border-color: ${isDarkMode ? "#374151" : "#f0f0f0"};
        }
        
        /* Switch styling */
        .ant-switch-checked {
          background-color: #52c41a;
        }
        
        .ant-switch-checked .ant-switch-handle::before {
          background-color: #fff;
        }
        
        /* Card hover effects */
        .ant-card {
          transition: all 0.3s ease;
          background: ${isDarkMode ? "#1f2937" : "#ffffff"};
          border-color: ${isDarkMode ? "#374151" : "#d9d9d9"};
        }
        
        .ant-card:hover {
          box-shadow: ${
            isDarkMode
              ? "0 8px 32px rgba(0, 0, 0, 0.2)"
              : "0 4px 16px rgba(0,0,0,0.1)"
          };
        }
        
        /* Text colors */
        .ant-typography {
          color: ${isDarkMode ? "#e5e7eb" : "rgba(0, 0, 0, 0.85)"};
        }
        
        .ant-typography-caption {
          color: ${isDarkMode ? "#9ca3af" : "rgba(0, 0, 0, 0.45)"};
        }
        
        /* Divider */
        .ant-divider {
          border-color: ${isDarkMode ? "#374151" : "#f0f0f0"};
        }
        
        @media (max-width: 768px) {
          .category-management-container {
            padding: 16px;
          }
          
          .add-category-form {
            flex-direction: column;
            align-items: stretch;
          }
          
          .add-category-form .ant-form-item {
            margin-bottom: 16px;
          }
          
          .category-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .stats-section .ant-col {
            margin-bottom: 16px;
          }
        }
        
        /* Custom scrollbar for subcategories */
        .subcategory-tags::-webkit-scrollbar {
          width: 4px;
        }
        
        .subcategory-tags::-webkit-scrollbar-track {
          background: ${isDarkMode ? "#374151" : "#f1f1f1"};
          border-radius: 2px;
        }
        
        .subcategory-tags::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "#6b7280" : "#c1c1c1"};
          border-radius: 2px;
        }
        
        .subcategory-tags::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "#9ca3af" : "#a8a8a8"};
        }
        
        /* Enhanced table styling */
        .ant-table-thead > tr > th {
          background-color: ${isDarkMode ? "#111827" : "#fafafa"};
          font-weight: 600;
          color: ${isDarkMode ? "#f3f4f6" : "#262626"};
          border-bottom-color: ${isDarkMode ? "#374151" : "#f0f0f0"};
        }
        
        .ant-table-tbody > tr > td {
          padding: 16px;
          background-color: ${isDarkMode ? "#1f2937" : "#ffffff"};
          color: ${isDarkMode ? "#e5e7eb" : "rgba(0, 0, 0, 0.85)"};
          border-bottom-color: ${isDarkMode ? "#374151" : "#f5f5f5"};
        }
        
        .ant-table-tbody > tr:hover > td {
          background-color: ${isDarkMode ? "#374151" : "#f5f5f5"};
        }
        
        .ant-table {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"};
        }
        
        /* Pagination */
        .ant-pagination .ant-pagination-item {
          background: ${isDarkMode ? "#374151" : "#ffffff"};
          border-color: ${isDarkMode ? "#4b5563" : "#d9d9d9"};
        }
        
        .ant-pagination .ant-pagination-item a {
          color: ${isDarkMode ? "#e5e7eb" : "rgba(0, 0, 0, 0.65)"};
        }
        
        .ant-pagination .ant-pagination-item-active {
          background: #1890ff;
          border-color: #1890ff;
        }
        
        .ant-pagination .ant-pagination-item-active a {
          color: #ffffff;
        }
        
        /* Form validation colors */
        .ant-form-item-has-error .ant-input {
          border-color: #ff4d4f;
        }
        
        .ant-form-item-explain-error {
          color: #ff4d4f;
        }
        
        /* Loading state improvements */
        .ant-spin-container {
          position: relative;
        }
        
        .ant-table-loading .ant-spin-nested-loading > div > .ant-spin {
          max-height: none;
        }
        
        /* Button group styling */
        .ant-space-item .ant-btn-sm {
          height: 28px;
          padding: 0 8px;
          font-size: 12px;
          background: ${isDarkMode ? "#374151" : "#ffffff"};
          border-color: ${isDarkMode ? "#4b5563" : "#d9d9d9"};
          color: ${isDarkMode ? "#e5e7eb" : "rgba(0, 0, 0, 0.65)"};
        }
        
        .ant-btn-primary {
          background: #1890ff;
          border-color: #1890ff;
        }
        
        .ant-btn-danger {
          background: ${isDarkMode ? "transparent" : "#ffffff"};
          border-color: #ff4d4f;
          color: #ff4d4f;
        }
        
        .ant-btn-danger:hover {
          background: #ff4d4f;
          color: #ffffff;
        }
        
        /* Popconfirm styling */
        .ant-popconfirm-inner-content {
          max-width: 300px;
        }
        
        .ant-popover-inner {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"};
          border: 1px solid ${isDarkMode ? "#374151" : "#f0f0f0"};
        }
        
        .ant-popover-title {
          color: ${isDarkMode ? "#f3f4f6" : "rgba(0, 0, 0, 0.85)"};
          border-bottom-color: ${isDarkMode ? "#374151" : "#f0f0f0"};
        }
        
        .ant-popover-inner-content {
          color: ${isDarkMode ? "#e5e7eb" : "rgba(0, 0, 0, 0.65)"};
        }
        
        /* Responsive improvements */
        @media (max-width: 576px) {
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
        }
      `}</style>
    </div>
  );
};

export default CategoryManagement;
