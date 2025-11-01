import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Upload,
  message,
  Modal,
  Switch,
  Tag,
  Tooltip,
  Statistic,
  Image,
  Typography,
  Badge,
  Popconfirm,
  Alert,
  Divider,
  Progress,
  Empty,
  Spin,
} from "antd";
import React, { useState, useEffect } from "react";
import axios from "../Components/Axios";
import {
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
  LinkOutlined,
  PictureOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const UploadBanner = () => {
  const [bannerForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [banners, setBanners] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [editingBanner, setEditingBanner] = useState(null);
  const [statistics, setStatistics] = useState({
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
  });
  const [selectedType, setSelectedType] = useState("all");

  const bannerTypes = [
    { label: "Main Banner", value: "Main Banner", color: "blue", description: "Primary homepage banner" },
    { label: "Deals of the Week", value: "Deals of the Week", color: "green", description: "Weekly promotional banner" },
    { label: "New Release", value: "New Release", color: "orange", description: "Latest product showcase" },
    { label: "Top Banner", value: "top banner", color: "purple", description: "Header promotional banner" },
    { label: "Bottom Banner", value: "bottom banner", color: "cyan", description: "Footer promotional banner" },
  ];

  const bannerDimensions = {
    "Main Banner": "690 x 360px",
    "Deals of the Week": "402 x 706px",
    "New Release": "468 x 752px",
    "top banner": "1200 x 300px",
    "bottom banner": "1200 x 200px",
  };

  const fetchBanners = async () => {
    try {
      setTableLoading(true);
      const endpoint = selectedType === "all" ? "/banner" : `/banner/type/${selectedType}`;
      const response = await axios.get(endpoint);
      setBanners(response.data.data.doc || response.data.data.banners || []);
    } catch (error) {
      message.error("Failed to fetch banners");
    } finally {
      setTableLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get("/banner/statistics");
      setStatistics(response.data.data.statistics);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchStatistics();
  }, [selectedType]);

  const handleBannerSubmit = async (values) => {
    if (fileList.length === 0) {
      message.error("Please upload a banner image");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("subTitle", values.subTitle);
      formData.append("link", values.link);
      formData.append("bannerType", values.bannerType);
      formData.append("photo", fileList[0]);

      const response = await axios.post("/banner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Banner created successfully!");
      fetchBanners();
      fetchStatistics();
      bannerForm.resetFields();
      setFileList([]);
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Failed to create banner");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingBanner(record);
    editForm.setFieldsValue({
      title: record.title,
      subTitle: record.subTitle,
      link: record.link,
      bannerType: record.bannerType,
    });
    setEditFileList([]);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("subTitle", values.subTitle);
      formData.append("link", values.link);
      formData.append("bannerType", values.bannerType);
      
      if (editFileList.length > 0) {
        formData.append("photo", editFileList[0]);
      }

      const response = await axios.patch(`/banner/${editingBanner._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Banner updated successfully!");
      fetchBanners();
      fetchStatistics();
      setEditModalVisible(false);
      setEditingBanner(null);
      setEditFileList([]);
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Failed to update banner");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/banner/${id}`);
      message.success("Banner deleted successfully");
      fetchBanners();
      fetchStatistics();
    } catch (error) {
      message.error("Failed to delete banner");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`/banner/${id}/toggle-status`);
      message.success(response.data.message);
      fetchBanners();
      fetchStatistics();
    } catch (error) {
      message.error("Failed to toggle banner status");
    }
  };

  const handleRefresh = () => {
    fetchBanners();
    fetchStatistics();
    message.success("Data refreshed successfully");
  };

  const columns = [
    {
      title: "Preview",
      dataIndex: "photo",
      key: "photo",
      width: 120,
      render: (imageUrl) => (
        <div style={{ textAlign: "center" }}>
          <Image
            src={imageUrl}
            alt="banner"
            width={80}
            height={50}
            style={{ 
              objectFit: "cover", 
              borderRadius: 6,
              border: "1px solid #f0f0f0"
            }}
            preview={{
              mask: <div style={{ color: "#fff" }}><EyeOutlined /> Preview</div>,
            }}
          />
        </div>
      ),
    },
    {
      title: "Banner Details",
      key: "details",
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{record.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.subTitle}
          </Text>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "bannerType",
      key: "bannerType",
      width: 140,
      render: (type) => {
        const typeConfig = bannerTypes.find(t => t.value === type);
        return (
          <Tooltip title={typeConfig?.description || type}>
            <Tag color={typeConfig?.color || "default"} style={{ fontSize: 12 }}>
              {type}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive, record) => (
        <div style={{ textAlign: "center" }}>
          <Switch
            checked={isActive}
            onChange={() => handleToggleStatus(record._id, isActive)}
            size="small"
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
          />
          <br />
          <Text style={{ fontSize: 11 }} type={isActive ? "success" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Text>
        </div>
      ),
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      width: 200,
      render: (link) => (
        <Tooltip title="Click to open link">
          <Button
            type="link"
            size="small"
            icon={<LinkOutlined />}
            onClick={() => window.open(link, "_blank")}
            style={{ 
              padding: 0, 
              height: "auto",
              maxWidth: 180,
              textAlign: "left"
            }}
          >
            <Text ellipsis style={{ maxWidth: 150 }}>
              {link}
            </Text>
          </Button>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Banner">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Banner"
            description="This action cannot be undone. Are you sure?"
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Banner">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    fileList,
    onRemove: (file) => {
      setFileList((prevList) => {
        const index = prevList.indexOf(file);
        const newFileList = prevList.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
      if (!isJpgOrPng) {
        message.error("Only JPG, PNG, and WebP files are supported!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return false;
      }
      setFileList([file]);
      return false;
    },
  };

  const editUploadProps = {
    fileList: editFileList,
    onRemove: (file) => {
      setEditFileList([]);
    },
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp";
      if (!isJpgOrPng) {
        message.error("Only JPG, PNG, and WebP files are supported!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return false;
      }
      setEditFileList([file]);
      return false;
    },
  };

  const watchedBannerType = Form.useWatch("bannerType", bannerForm);
  const watchedEditBannerType = Form.useWatch("bannerType", editForm);

  const getActiveBannersPercentage = () => {
    if (statistics.totalBanners === 0) return 0;
    return Math.round((statistics.activeBanners / statistics.totalBanners) * 100);
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          <BarChartOutlined /> Banner Management System
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8 }}>
          Create, manage, and organize your promotional banners
        </Paragraph>
      </div>

      {/* Upload Form */}
      <Card 
        title={
          <Space>
            <PlusOutlined />
            Create New Banner
          </Space>
        }
        style={{ marginBottom: 24 }}
        headStyle={{ backgroundColor: "#fafafa", borderBottom: "2px solid #1890ff" }}
      >
        <Form
          form={bannerForm}
          onFinish={handleBannerSubmit}
          layout="vertical"
          scrollToFirstError
        >
          {/* Banner Title - Full Width Row */}
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Banner Title"
                name="title"
                rules={[
                  { required: true, message: "Please input the banner title!" },
                  { min: 3, message: "Title must be at least 3 characters!" },
                  { max: 100, message: "Title must not exceed 100 characters!" },
                ]}
              >
                <Input 
                  placeholder="Enter compelling title" 
                  size="large"
                  style={{ fontSize: 16 }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Sub Title - Full Width Row */}
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Sub Title"
                name="subTitle"
                rules={[
                  { required: true, message: "Please input the sub title!" },
                  { min: 3, message: "Sub title must be at least 3 characters!" },
                  { max: 200, message: "Sub title must not exceed 200 characters!" },
                ]}
              >
                <Input 
                  placeholder="Enter descriptive subtitle" 
                  size="large"
                  style={{ fontSize: 16 }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Product Link - Full Width Row */}
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Product Link"
                name="link"
                rules={[
                  { required: true, message: "Please input the product link!" },
                  { type: "url", message: "Please enter a valid URL!" },
                ]}
              >
                <Input 
                  placeholder="https://example.com/product" 
                  size="large"
                  prefix={<LinkOutlined style={{ color: "#1890ff" }} />}
                  style={{ fontSize: 16 }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Banner Type - Full Width Row */}
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Banner Type"
                name="bannerType"
                rules={[
                  { required: true, message: "Please select a banner type!" },
                ]}
              >
                <Select
                  placeholder="Choose banner type"
                  size="large"
                  style={{ fontSize: 16 }}
                  options={bannerTypes.map(type => ({
                    ...type,
                    label: (
                      <Space>
                        <Tag color={type.color} style={{ margin: 0 }}>
                          {type.label}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {type.description}
                        </Text>
                      </Space>
                    )
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Dimension Alert */}
          {watchedBannerType && (
            <Row gutter={24}>
              <Col span={24}>
                <Alert
                  message={`Recommended dimensions: ${bannerDimensions[watchedBannerType]}`}
                  description="For best results, please use images with the recommended dimensions"
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              </Col>
            </Row>
          )}

          {/* Upload Section and Submit Button */}
          <Row gutter={24} align="middle">
            <Col xs={24} lg={16}>
              <Form.Item
                label="Banner Image"
                rules={[
                  { required: true, message: "Please upload a banner image!" },
                ]}
                style={{ marginBottom: 0 }}
              >
                <div style={{
                  border: "2px dashed #d9d9d9",
                  borderRadius: 8,
                  padding: "24px",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}>
                  <Upload 
                    {...uploadProps} 
                    listType="picture-card"
                    className="banner-upload flex justify-center items-center"
                    showUploadList={{
                      showPreviewIcon: true,
                      showRemoveIcon: true,
                    }}
                  >
                    {fileList.length >= 1 ? null : (
                      <div  style={{ 
                        padding: "40px 20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 180
                      }}>
                        <PictureOutlined  className="ml-16"
                          style={{ 
                            fontSize: 48, 
                            color: "#1890ff",
                          }} 
                        />
                        {/* <Title level={4} style={{ 
                          margin: 0, 
                          marginBottom: 8,
                          color: "#333",
                          fontWeight: 600
                        }}>
                          Click or drag to upload
                        </Title>
                        <Text style={{ 
                          fontSize: 14, 
                          color: "#666",
                          lineHeight: 1.5
                        }}>
                          Support JPG, PNG, WebP formats
                        </Text>
                        <Text style={{ 
                          fontSize: 13, 
                          color: "#999",
                          marginTop: 4
                        }}>
                          Maximum file size: 5MB
                        </Text> */}
                      </div>
                    )}
                  </Upload>
                </div>
              </Form.Item>
            </Col>

            <Col xs={24} lg={8}>
              <div style={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "stretch",
                minHeight: 180
              }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  style={{ 
                    height: 60, 
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)"
                  }}
                  icon={<PlusOutlined style={{ fontSize: 18 }} />}
                >
                  {loading ? "Creating Banner..." : "Create Banner"}
                </Button>
                
                <div style={{ 
                  marginTop: 16, 
                  textAlign: "center",
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid #e6f7ff"
                }}>
                  <Text strong style={{ display: "block", marginBottom: 4 }}>
                    Quick Tips:
                  </Text>
                  <Text style={{ fontSize: 12, color: "#666" }}>
                    • Use high-quality images<br />
                    • Follow recommended dimensions<br />
                    • Ensure text is readable
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Banners"
              value={statistics.totalBanners}
              valueStyle={{ color: "#1890ff", fontSize: 24 }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Banners"
              value={statistics.activeBanners}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
              prefix={<CheckCircleOutlined />}
            />
            <Progress 
              percent={getActiveBannersPercentage()} 
              size="small" 
              strokeColor="#52c41a"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Inactive Banners"
              value={statistics.inactiveBanners}
              valueStyle={{ color: "#ff4d4f", fontSize: 24 }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Banner List */}
      <Card
        title={
          <Space>
            <BarChartOutlined />
            All Banners
            <Badge count={banners.length} style={{ backgroundColor: "#1890ff" }} />
          </Space>
        }
        extra={
          <Space>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: 180 }}
              placeholder="Filter by type"
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value="all">
                <Space>
                  <Tag>All Types</Tag>
                </Space>
              </Select.Option>
              {bannerTypes.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  <Space>
                    <Tag color={type.color}>{type.label}</Tag>
                  </Space>
                </Select.Option>
              ))}
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              type="default"
            >
              Refresh
            </Button>
          </Space>
        }
        headStyle={{ backgroundColor: "#fafafa", borderBottom: "2px solid #1890ff" }}
      >
        <Table
          columns={columns}
          dataSource={banners}
          rowKey="_id"
          loading={tableLoading}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No banners found"
              >
                <Button type="primary" onClick={() => bannerForm.scrollToField("title")}>
                  Create Your First Banner
                </Button>
              </Empty>
            ),
          }}
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} banners`,
            size: "default",
          }}
          rowClassName={(record, index) => 
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Edit Banner
          </Space>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingBanner(null);
          setEditFileList([]);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={editForm}
          onFinish={handleEditSubmit}
          layout="vertical"
          scrollToFirstError
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Banner Title"
                name="title"
                rules={[
                  { required: true, message: "Please input the banner title!" },
                  { min: 3, message: "Title must be at least 3 characters!" },
                  { max: 100, message: "Title must not exceed 100 characters!" },
                ]}
              >
                <Input placeholder="Enter banner title" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Sub Title"
                name="subTitle"
                rules={[
                  { required: true, message: "Please input the sub title!" },
                  { min: 3, message: "Sub title must be at least 3 characters!" },
                  { max: 200, message: "Sub title must not exceed 200 characters!" },
                ]}
              >
                <Input placeholder="Enter sub title" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Product Link"
            name="link"
            rules={[
              { required: true, message: "Please input the product link!" },
              { type: "url", message: "Please enter a valid URL!" },
            ]}
          >
            <Input placeholder="https://example.com/product" prefix={<LinkOutlined />} />
          </Form.Item>

          <Form.Item
            label="Banner Type"
            name="bannerType"
            rules={[
              { required: true, message: "Please select a banner type!" },
            ]}
          >
            <Select
              placeholder="Select banner type"
              options={bannerTypes}
            />
          </Form.Item>

          {watchedEditBannerType && (
            <Alert
              message={`Recommended dimensions: ${bannerDimensions[watchedEditBannerType]}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Current Image">
                {editingBanner && (
                  <div style={{ textAlign: "center", padding: 16, border: "1px dashed #d9d9d9", borderRadius: 6 }}>
                    <Image
                      src={editingBanner.photo}
                      alt="current banner"
                      width={150}
                      height={100}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Current Banner</Text>
                    </div>
                  </div>
                )}
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="New Banner Image (Optional)">
                <Upload {...editUploadProps} listType="picture-card">
                  {editFileList.length >= 1 ? null : (
                    <div style={{
                      padding: "20px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 100
                    }}>
                      <UploadOutlined style={{ fontSize: 24, color: "#1890ff", marginBottom: 6 }} />
                      <div style={{ 
                        fontSize: 13, 
                        fontWeight: 500,
                        marginBottom: 2 
                      }}>
                        Replace Image
                      </div>
                      <div style={{ 
                        fontSize: 11, 
                        color: "#666" 
                      }}>
                        JPG, PNG, WebP
                      </div>
                    </div>
                  )}
                </Upload>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Leave empty to keep current image
                </Text>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                size="large"
                onClick={() => {
                  setEditModalVisible(false);
                  setEditingBanner(null);
                  setEditFileList([]);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
                icon={<EditOutlined />}
              >
                {loading ? "Updating..." : "Update Banner"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
        .banner-upload .ant-upload-select {
          width: 100% !important;
          height: auto !important;
          border: none !important;
          background: transparent !important;
        }
        .banner-upload .ant-upload-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }
        .banner-upload .ant-upload-list-picture-card-container {
          width: auto;
        }
        .banner-upload .ant-upload-list-picture-card {
          width: 120px;
          height: 120px;
        }
        .ant-form-item-label > label {
          font-weight: 600;
          font-size: 15px;
        }
        .ant-input-lg, .ant-select-lg .ant-select-selector {
          border-radius: 8px;
        }
        .ant-card-head-title {
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .banner-upload .ant-upload-list-picture-card {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default UploadBanner;