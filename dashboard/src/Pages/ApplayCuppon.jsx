import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Table,
  message,
  Select,
  Switch,
  InputNumber,
  Tag,
  Popconfirm,
  Typography,
  Tooltip,
  Alert,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "../Components/Axios";

const { Option } = Select;
const { Title } = Typography;

const ApplayCoupon = () => {
  // Form and state management
  const [couponForm] = Form.useForm();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  // Form control
  const [discountType, setDiscountType] = useState("percentage");

  // Fetch all coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Fetch coupons from API
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/coupon");
      if (response.data && response.data.status === "success" && response.data.data) {
        // Handle both possible response structures
        const couponData = response.data.data.doc || response.data.data;
        setCoupons(Array.isArray(couponData) ? couponData : []);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      message.error("Failed to fetch coupons. Please try again.");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for creating/updating coupons
  const handleCouponSubmit = async (values) => {
    setSubmitLoading(true);
    
    try {
      let couponData;
      
      if (isEditing && editingCoupon) {
        // For updates, exclude date fields and only include editable fields
        couponData = {
          coupon: values.coupon.toUpperCase().trim(),
          discountType: values.discountType,
          isActive: values.isActive !== undefined ? values.isActive : true,
        };

        // Add discount value based on type - backend expects the appropriate field
        if (values.discountType === "percentage") {
          couponData.discountPercent = Number(values.discountPercent);
          // Don't send discountAmount at all for percentage type
        } else {
          couponData.discountAmount = Number(values.discountAmount);
          // Don't send discountPercent at all for amount type
        }
      } else {
        // For new coupons, include all fields including dates
        const { validFrom, validUntil } = values;
        
        // Validate dates for new coupons
        if (!validFrom || !validUntil) {
          message.error("Please select both start and end dates");
          setSubmitLoading(false);
          return;
        }
        
        // Client-side date validation
        const fromDate = new Date(validFrom);
        const untilDate = new Date(validUntil);
        
        if (untilDate <= fromDate) {
          message.error("End date must be after start date");
          setSubmitLoading(false);
          return;
        }

        couponData = {
          coupon: values.coupon.toUpperCase().trim(),
          discountType: values.discountType,
          validFrom: new Date(validFrom).toISOString(),
          validUntil: new Date(validUntil + 'T23:59:59.999Z').toISOString(),
          isActive: values.isActive !== undefined ? values.isActive : true,
        };

        // Add discount value based on type - backend expects the appropriate field
        if (values.discountType === "percentage") {
          couponData.discountPercent = Number(values.discountPercent);
          // Don't send discountAmount at all for percentage type
        } else {
          couponData.discountAmount = Number(values.discountAmount);
          // Don't send discountPercent at all for amount type
        }
      }

      let response;
      let successMessage;

      if (isEditing && editingCoupon) {
        // Update existing coupon - use coupon code as parameter
        response = await axios.patch(`/coupon/${editingCoupon.coupon}`, couponData);
        successMessage = "Coupon updated successfully!";
        
        // Update local state with returned data
        if (response.data && response.data.status === "success" && response.data.data && response.data.data.coupon) {
          setCoupons((prevCoupons) =>
            prevCoupons.map((c) =>
              c.coupon === editingCoupon.coupon ? response.data.data.coupon : c
            )
          );
        }
      } else {
        // Create new coupon
        response = await axios.post("/coupon", couponData);
        successMessage = "Coupon created successfully!";
        
        // Add to local state with returned data
        if (response.data && response.data.status === "success" && response.data.data && response.data.data.coupon) {
          setCoupons((prevCoupons) => [...prevCoupons, response.data.data.coupon]);
        }
      }

      // Success feedback and reset
      message.success(successMessage);
      handleFormReset();
      
    } catch (error) {
      console.error("Error submitting coupon:", error);
      
      // Handle specific error messages from backend
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else if (error.response && error.response.status === 400) {
        message.error("Invalid data provided. Please check your inputs.");
      } else if (error.response && error.response.status === 409) {
        message.error("Coupon code already exists. Please use a different code.");
      } else if (error.response && error.response.status === 404) {
        message.error("Coupon not found. Please refresh and try again.");
      } else {
        const action = isEditing ? "update" : "create";
        message.error(`Failed to ${action} coupon. Please try again.`);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle edit coupon
  const handleEdit = (coupon) => {
    setIsEditing(true);
    setEditingCoupon(coupon);
    setDiscountType(coupon.discountType);

    // Populate form with existing data (excluding dates for editing)
    couponForm.setFieldsValue({
      coupon: coupon.coupon,
      discountType: coupon.discountType,
      discountPercent: coupon.discountPercent,
      discountAmount: coupon.discountAmount,
      isActive: coupon.isActive,
    });

    // Scroll to form
    document.querySelector('.coupon-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle delete coupon
  const handleDelete = async (couponCode) => {
    try {
      const response = await axios.delete(`/coupon/${couponCode}`);
      
      if (response.data && response.data.status === "success") {
        setCoupons((prevCoupons) =>
          prevCoupons.filter((coupon) => coupon.coupon !== couponCode)
        );
        message.success(response.data.message || "Coupon deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else if (error.response && error.response.status === 404) {
        message.error("Coupon not found. It may have been already deleted.");
        // Remove from local state anyway
        setCoupons((prevCoupons) =>
          prevCoupons.filter((coupon) => coupon.coupon !== couponCode)
        );
      } else {
        message.error("Failed to delete coupon. Please try again.");
      }
    }
  };

  // Handle active status toggle
  const handleToggleActive = async (coupon, isActive) => {
    try {
      const response = await axios.patch(`/coupon/${coupon.coupon}`, { isActive });
      
      if (response.data && response.data.status === "success" && response.data.data && response.data.data.coupon) {
        setCoupons((prevCoupons) =>
          prevCoupons.map((c) =>
            c.coupon === coupon.coupon ? response.data.data.coupon : c
          )
        );
        message.success(
          `Coupon ${isActive ? "activated" : "deactivated"} successfully!`
        );
      }
    } catch (error) {
      console.error("Error updating coupon status:", error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Failed to update coupon status. Please try again.");
      }
    }
  };

  // Handle discount type change
  const handleDiscountTypeChange = (value) => {
    setDiscountType(value);
    // Clear opposite field when changing type to match backend validation
    if (value === "percentage") {
      couponForm.setFieldValue("discountAmount", undefined);
    } else {
      couponForm.setFieldValue("discountPercent", undefined);
    }
  };

  // Reset form and editing state
  const handleFormReset = () => {
    couponForm.resetFields();
    setDiscountType("percentage");
    setIsEditing(false);
    setEditingCoupon(null);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    handleFormReset();
    message.info("Edit cancelled");
  };

  // Check if coupon is expired
  const isCouponExpired = (coupon) => {
    return dayjs().isAfter(dayjs(coupon.validUntil));
  };

  // Check if coupon is not yet valid
  const isCouponNotYetValid = (coupon) => {
    return dayjs().isBefore(dayjs(coupon.validFrom));
  };

  // Get coupon status with enhanced logic
  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) return { status: 'inactive', color: 'default', text: 'Inactive' };
    if (isCouponExpired(coupon)) return { status: 'expired', color: 'red', text: 'Expired' };
    if (isCouponNotYetValid(coupon)) return { status: 'pending', color: 'orange', text: 'Pending' };
    return { status: 'active', color: 'green', text: 'Active' };
  };

  // Custom date validation function
  const validateEndDate = (_, value) => {
    if (!value) {
      return Promise.resolve();
    }
    const validFrom = couponForm.getFieldValue('validFrom');
    if (validFrom && dayjs(value).isSameOrBefore(dayjs(validFrom), "day")) {
      return Promise.reject(new Error("End date must be after start date"));
    }
    return Promise.resolve();
  };

  // Handle date change to trigger revalidation (not needed for HTML5 date inputs)
  const handleValidFromChange = (value) => {
    // HTML5 date inputs handle validation automatically
  };

  // Table columns configuration
  const columns = [
    {
      title: "Coupon Code",
      dataIndex: "coupon",
      key: "coupon",
      render: (text, record) => {
        const status = getCouponStatus(record);
        return (
          <Space direction="vertical" size="small">
            <Tag color="blue" style={{ fontSize: "12px", fontWeight: "bold" }}>
              {text}
            </Tag>
            <Tag color={status.color} size="small">
              {status.text}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Discount",
      key: "discount",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={record.discountType === "percentage" ? "green" : "orange"}>
            {record.discountType.toUpperCase()}
          </Tag>
          <strong>
            {record.discountType === "percentage"
              ? `${record.discountPercent}%`
              : `$${record.discountAmount}`}
          </strong>
        </Space>
      ),
    },
    {
      title: "Valid Period",
      key: "validPeriod",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <strong>From:</strong> {dayjs(record.validFrom).format("MMM DD, YYYY")}
          </div>
          <div>
            <strong>Until:</strong> {dayjs(record.validUntil).format("MMM DD, YYYY")}
          </div>
        </Space>
      ),
    },
    {
      title: "Status Control",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Tooltip title={`Click to ${isActive ? 'deactivate' : 'activate'} coupon`}>
          <Switch
            checked={isActive}
            onChange={(checked) => handleToggleActive(record, checked)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseOutlined />}
            disabled={isEditing}
          />
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit coupon">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              disabled={isEditing && editingCoupon?.coupon !== record.coupon}
            >
              Edit
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete Coupon"
            description={`Are you sure you want to delete coupon "${record.coupon}"?`}
            onConfirm={() => handleDelete(record.coupon)}
            okText="Yes, Delete"
            cancelText="Cancel"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            disabled={isEditing}
          >
            <Tooltip title="Delete coupon">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                disabled={isEditing}
              >
                Delete
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="coupon-management">
      {/* Header */}
      <div className="text-center mb-8">
        <Title level={2} className="mb-2">
          Coupon Management System
        </Title>
        <p className="text-gray-600">
          Create, edit, and manage discount coupons for your store
        </p>
      </div>

      {/* Alert for editing mode */}
      {isEditing && (
        <Alert
          message="Edit Mode Active"
          description={`You are currently editing coupon "${editingCoupon?.coupon}". Note: Coupon code and dates cannot be modified during editing - only discount details and status can be updated.`}
          type="info"
          showIcon
          closable={false}
          className="mb-4"
          action={
            <Button size="small" onClick={handleCancelEdit}>
              Cancel Edit
            </Button>
          }
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Form Section */}
        <Col xs={24} lg={8}>
          <Card
            className="coupon-form"
            title={
              <Space>
                {isEditing ? <EditOutlined /> : <PlusOutlined />}
                {isEditing ? "Edit Coupon" : "Create New Coupon"}
              </Space>
            }
            extra={
              isEditing && (
                <Button 
                  size="small" 
                  icon={<CloseOutlined />} 
                  onClick={handleCancelEdit}
                  type="text"
                >
                  Cancel
                </Button>
              )
            }
            bordered={false}
            style={{ height: 'fit-content' }}
          >
            <Form
              form={couponForm}
              onFinish={handleCouponSubmit}
              layout="vertical"
              initialValues={{
                discountType: "percentage",
                isActive: true,
              }}
              scrollToFirstError
            >
              {/* Coupon Code */}
              <Form.Item
                label="Coupon Code"
                name="coupon"
                rules={[
                  { required: true, message: "Please enter coupon code" },
                  { min: 3, message: "Code must be at least 3 characters" },
                  { max: 20, message: "Code cannot exceed 20 characters" },
                  {
                    pattern: /^[A-Za-z0-9]+$/,
                    message: "Code can only contain letters and numbers",
                  },
                ]}
              >
                <Input
                  placeholder="e.g., SAVE20, NEWUSER"
                  disabled={isEditing}
                  style={{ textTransform: 'uppercase' }}
                  maxLength={20}
                />
              </Form.Item>

              {/* Discount Type */}
              <Form.Item
                label="Discount Type"
                name="discountType"
                rules={[{ required: true, message: "Please select discount type" }]}
              >
                <Select 
                  onChange={handleDiscountTypeChange} 
                  placeholder="Select discount type"
                >
                  <Option value="percentage">Percentage Discount</Option>
                  <Option value="amount">Fixed Amount Discount</Option>
                </Select>
              </Form.Item>

              {/* Conditional Discount Fields */}
              {discountType === "percentage" ? (
                <Form.Item
                  label="Discount Percentage"
                  name="discountPercent"
                  rules={[
                    { required: true, message: "Please enter discount percentage" },
                    { type: 'number', min: 0, max: 100, message: "Percentage must be between 0 and 100" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    step={0.01}
                    style={{ width: "100%" }}
                    placeholder="Enter percentage"
                    addonAfter="%"
                    precision={2}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  label="Discount Amount"
                  name="discountAmount"
                  rules={[
                    { required: true, message: "Please enter discount amount" },
                    { type: 'number', min: 0, message: "Amount must be at least 0" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: "100%" }}
                    placeholder="Enter amount"
                    addonBefore="$"
                    precision={2}
                  />
                </Form.Item>
              )}

              {/* Date Fields for new coupons only */}
              {!isEditing && (
                <>
                  <Form.Item
                    label="Valid From"
                    name="validFrom"
                    rules={[{ required: true, message: "Please select start date" }]}
                  >
                    <Input
                      type="date"
                      style={{ width: "100%" }}
                      min={new Date().toISOString().split('T')[0]}
                      placeholder="Select start date"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Valid Until"
                    name="validUntil"
                    rules={[
                      { required: true, message: "Please select end date" },
                    ]}
                  >
                    <Input
                      type="date"
                      style={{ width: "100%" }}
                      min={new Date().toISOString().split('T')[0]}
                      placeholder="Select end date"
                    />
                  </Form.Item>
                </>
              )}

              {/* Show read-only date info during edit */}
              {isEditing && editingCoupon && (
                <Alert
                  message="Date Range Information"
                  description={
                    <div>
                      <strong>Valid From:</strong> {dayjs(editingCoupon.validFrom).format("MMM DD, YYYY")}
                      <br />
                      <strong>Valid Until:</strong> {dayjs(editingCoupon.validUntil).format("MMM DD, YYYY")}
                      <br />
                      <em>Coupon code and dates cannot be modified after creation.</em>
                    </div>
                  }
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )}

              {/* Active Status */}
              <Form.Item
                label="Status"
                name="isActive"
                valuePropName="checked"
                extra="Enable or disable this coupon"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitLoading}
                  icon={isEditing ? <EditOutlined /> : <PlusOutlined />}
                  style={{ width: "100%" }}
                  size="large"
                >
                  {isEditing ? "Update Coupon" : "Create Coupon"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Table Section */}
        <Col xs={24} lg={16}>
          <Card
            title={`All Coupons (${coupons.length})`}
            bordered={false}
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCoupons}
                loading={loading}
                type="text"
              >
                Refresh
              </Button>
            }
          >
            <Spin spinning={loading} tip="Loading coupons...">
              <Table
                columns={columns}
                dataSource={coupons}
                rowKey="coupon"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} coupons`,
                }}
                scroll={{ x: 800 }}
                locale={{ emptyText: "No coupons found. Create your first coupon!" }}
                size="middle"
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ApplayCoupon;