import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Avatar,
  Switch,
  Space,
  Popconfirm,
  message,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Image
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    admins: 0
  });

  const API_BASE = 'https://bookwormm.netlify.app/api/v1/auth';

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [users]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      // Since your backend doesn't have a direct "get all users" endpoint,
      // you'll need to add this endpoint or modify this based on your needs
      const response = await fetch(`${API_BASE}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setUsers(data.data.users || []);
        message.success('Users loaded successfully');
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      message.error(`Failed to fetch users: ${error.message}`);
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = users.length;
    const verified = users.filter(user => user.emailVerified).length;
    const unverified = total - verified;
    const admins = users.filter(user => user.role === 'aklogicAdmin').length;
    
    setStats({ total, verified, unverified, admins });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateUser = async (values) => {
    if (!editingUser) return;

    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Add text fields
      if (values.name) formData.append('name', values.name);
      if (values.email) formData.append('email', values.email);
      if (values.phone) formData.append('phone', values.phone);
      
      // Handle photo upload
      if (values.photo && values.photo.file) {
        formData.append('photo', values.photo.file);
      }

      const response = await fetch(`${API_BASE}/update-profile/${editingUser._id}`, {
        method: 'PATCH',
        body: formData
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        message.success(data.message);
        setIsEditModalVisible(false);
        form.resetFields();
        fetchAllUsers(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      message.error(`Failed to update user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      // Using deactivate account endpoint since there's no direct delete
      const response = await fetch(`${API_BASE}/deactivate-account/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: 'admin-override' // You might need to handle this differently
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        message.success('User account deactivated successfully');
        fetchAllUsers(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      message.error(`Failed to deactivate user: ${error.message}`);
    }
  };

  const handleToggleEmailVerification = async (user) => {
    try {
      const response = await fetch(`${API_BASE}/admin/update-email-verification/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailVerified: !user.emailVerified
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        message.success(data.message);
        fetchAllUsers(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      message.error(`Failed to update email verification: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'photo',
      key: 'photo',
      width: 80,
      render: (photo, record) => (
        <Avatar 
          src={photo && photo !== 'default.jpg' ? photo : null}
          icon={<UserOutlined />}
          size={50}
        />
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone ? (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ) : '-'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'aklogicAdmin' ? 'red' : 'blue'}>
          {role === 'aklogicAdmin' ? 'Admin' : 'User'}
        </Tag>
      )
    },
    {
      title: 'Email Verified',
      dataIndex: 'emailVerified',
      key: 'emailVerified',
      render: (verified, record) => (
        <Switch
          checked={verified}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<CloseCircleOutlined />}
          onChange={() => handleToggleEmailVerification(record)}
        />
      )
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to deactivate this user?"
            description="This will deactivate the user account."
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            {/* <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={record.role === 'aklogicAdmin'} // Prevent deleting admins
            >
              Deactivate
            </Button> */}
          </Popconfirm>
        </Space>
      )
    }
  ];

  const uploadProps = {
    name: 'photo',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
      }
      return false; // Don't upload immediately
    },
    maxCount: 1,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={2} className="mb-4">User Management</Title>
        
        {/* Stats Cards */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={stats.total}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Verified Users"
                value={stats.verified}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Unverified Users"
                value={stats.unverified}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Admins"
                value={stats.admins}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchAllUsers}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} users`
          }}
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateUser}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              <Option value="user">User</Option>
              <Option value="aklogicAdmin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="photo"
            label="Profile Photo"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Upload Photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsEditModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update User
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;