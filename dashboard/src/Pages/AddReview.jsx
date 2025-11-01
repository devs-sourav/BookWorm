import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Rate,
  Row,
  Select,
  Space,
  Table,
  Upload,
  message,
} from "antd";
const { Option } = Select;
import { UploadOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import axios from "../Components/Axios"; // Adjust the import path as needed

const AddReview = () => {
  const [brandForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [variants, setVariants] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchVariants();
    fetchReviews();
  }, []);

  const fetchVariants = async () => {
    try {
      const response = await axios.get("/varient");
      const variantOptions = response.data.data.doc.map((variant) => ({
        label: variant.product.name,
        value: variant._id,
      }));
      setVariants(variantOptions);
    } catch (error) {
      // console.error("Error fetching variants:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get("/review");
      // console.log(response);
      setReviews(response.data.data.doc, ...variants);
      // console.log(variants);
    } catch (error) {
      // console.error("Error fetching reviews:", error);
    }
  };

  const handleBrandSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("rating", values.rating);
      formData.append("variant", values.selectVariant);
      if (fileList.length > 0) {
        formData.append("photo", fileList[0]);
      }
      await axios.post("/review", formData);
      message.success("Review added successfully");
      fetchReviews(); // Refresh the reviews list
      brandForm.resetFields();
      setFileList([]);
    } catch (error) {
      message.error("Failed to add review");
      // console.error("Error adding review:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/review/${id}`);
      message.success("Review deleted successfully");
      fetchReviews(); // Refresh the reviews list
    } catch (error) {
      message.error("Failed to delete review");
      // console.error("Error deleting review:", error);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },

    {
      title: "Variant Name",
      dataIndex: ["variant", "title"],
      key: "variant",
      render: (variants) => {
        // console.log(variants);

        return variants ? variants : "Unknown Variant";
      },
    },
    {
      title: "Variant Photo",
      dataIndex: "photo",
      key: "photo",
      render: (photo) => (
        <img src={photo} alt="variant" style={{ width: "50px" }} />
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => <Rate value={rating} disabled />,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleDelete(record._id)}>Delete</Button>
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
      setFileList([file]);
      return false;
    },
  };

  return (
    <>
      <h2 className="text-center font-semibold md:text-2xl text-xl py-10">
        Add Review
      </h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Add Review" className="text-center" bordered={false}>
            <Form
              form={brandForm}
              onFinish={handleBrandSubmit}
              layout="vertical"
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please input the reviewer's name!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                layout="vertical"
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please input the description!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                layout="vertical"
                label="Add Rating"
                name="rating"
                rules={[
                  { required: true, message: "Please input the rating!" },
                ]}
              >
                <Rate />
              </Form.Item>
              <Form.Item
                layout="vertical"
                label="Select Variant"
                name="selectVariant"
                rules={[
                  { required: true, message: "Please select a variant!" },
                ]}
              >
                <Select style={{ width: "100%" }} options={variants} />
              </Form.Item>
              <Form.Item>
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Select Photo</Button>
                </Upload>
              </Form.Item>
              <br />
              <Button type="primary" htmlType="submit">
                Add Review
              </Button>
            </Form>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="All Reviews" bordered={false}>
            <Table columns={columns} dataSource={reviews} rowKey="_id" />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AddReview;
