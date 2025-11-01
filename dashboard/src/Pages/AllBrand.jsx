import React, { useState, useEffect } from 'react';
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
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const AllBrand = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Sample data - replace with actual API call
  const sampleBrands = [
    {
      id: 1,
      brandName: 'Nike',
      description: 'Just Do It - Leading sports brand',
      website: 'https://nike.com',
      logo: 'https://via.placeholder.com/100x100?text=Nike',
      status: 'active',
      createdAt: '2024-01-15',
      productsCount: 45,
    },
    {
      id: 2,
      brandName: 'Adidas',
      description: 'Impossible is Nothing - Sports and lifestyle brand',
      website: 'https://adidas.com',
      logo: 'https://via.placeholder.com/100x100?text=Adidas',
      status: 'active',
      createdAt: '2024-01-10',
      productsCount: 32,
    },
    {
      id: 3,
      brandName: 'Apple',
      description: 'Think Different - Technology and innovation',
      website: 'https://apple.com',
      logo: 'https://via.placeholder.com/100x100?text=Apple',
      status: 'inactive',
      createdAt: '2024-01-08',
      productsCount: 28,
    },
  ];

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      setTimeout(() => {
        setBrands(sampleBrands);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Failed to fetch brands');
      setLoading(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setEditModalVisible(true);
    form.setFieldsValue(brand);
    setFileList([]);
  };

  const handleDelete = async (id) => {
    try {
      // Add your delete API call here
      setBrands(brands.filter(brand => brand.id !== id));
      message.success('Brand deleted successfully!');
    } catch (error) {
      message.error('Failed to delete brand');
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      // Add your update API call here
      const updatedBrands = brands.map(brand =>
        brand.id === editingBrand.id ? { ...brand, ...values } : brand
      );
      setBrands(updatedBrands);
      message.success('Brand updated successfully!');
      setEditModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('Failed to update brand');
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.brandName.toLowerCase().includes(searchText.toLowerCase()) ||
    brand.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo, record) => (
        <Image
          src={logo}
          alt={record.brandName}
          width={50}
          height={50}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8O+L0v7+n+VdvLd2p7+tM7tTd7u7i+d9vXaM7+FN/DK1I+hLgJf3Z9f+vPGn2T6+z+t/qn5+8+5+96v3+kH3U9/v/v6vf/LzrWHJz/cz3m2Rq+Vx7Y3W+GfZX9+2LXYf26at4Z59Z/3tNn3btl1V7bf9+8kPlvL8r/Dl5/Ib2v/9f5av3ddc9n2kOb3d5Nz3O7Y3M0v+wr+fLvjO0rYY7f/r8oW/+vS/32ouf5xDe2/zYf5v9RG5/2LlzZ+9vfe/X/n8fVPLZYfN3++7p7i9mfPm1d8P7dZevEeu7n8YG2n3e5P+5bJTv6u/O6a9l+fPXNz+6N4PAAD//2Q=="
        />
      ),
    },
    {
      title: 'Brand Name',
      dataIndex: 'brandName',
      key: 'brandName',
      sorter: (a, b) => a.brandName.localeCompare(b.brandName),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (website) =>
        website ? (
          <a href={website} target="_blank" rel="noopener noreferrer">
            {website}
          </a>
        ) : (
          'N/A'
        ),
    },
    {
      title: 'Products',
      dataIndex: 'productsCount',
      key: 'productsCount',
      sorter: (a, b) => a.productsCount - b.productsCount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => message.info(`Viewing ${record.brandName}`)}
          />
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this brand?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            All Brands ({filteredBrands.length})
          </Title>
          <Search
            placeholder="Search brands..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredBrands}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} brands`,
          }}
          scroll={{ x: 1000 }}
        />

        <Modal
          title="Edit Brand"
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            form.resetFields();
            setFileList([]);
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditSubmit}
            size="large"
          >
            <Form.Item
              label="Brand Name"
              name="brandName"
              rules={[
                { required: true, message: 'Please enter brand name!' },
                { min: 2, message: 'Brand name must be at least 2 characters!' }
              ]}
            >
              <Input placeholder="Enter brand name" />
            </Form.Item>

            <Form.Item
              label="Brand Description"
              name="description"
              rules={[
                { required: true, message: 'Please enter brand description!' }
              ]}
            >
              <TextArea rows={4} placeholder="Enter brand description" />
            </Form.Item>

            <Form.Item
              label="Brand Website (Optional)"
              name="website"
              rules={[
                { type: 'url', message: 'Please enter a valid URL!' }
              ]}
            >
              <Input placeholder="https://example.com" />
            </Form.Item>

            <Form.Item label="Brand Logo" name="logo">
              <Upload {...uploadProps}>
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Logo</div>
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
                  Update Brand
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default AllBrand;