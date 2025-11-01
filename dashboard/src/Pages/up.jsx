import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Input,
  Row,
  Select,
  Form,
  Button,
  message,
  Upload,
  Checkbox,
} from "antd";
import ReactQuill from "react-quill";
import { CiCirclePlus } from "react-icons/ci";
import "react-quill/dist/quill.snow.css";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "../Components/Axios";

const { Dragger } = Upload;

const UploadProduct = () => {
  const [brandForm] = Form.useForm();
  const [variantForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandFileList, setBrandFileList] = useState([]);
  const [variantFileList, setVariantFileList] = useState([]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/category");
      setCategories(response.data.data.doc);
    } catch (error) {
      // console.error("Error fetching categories:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get("/subCategory");
      setSubCategories(response.data.data.doc);
    } catch (error) {
      // console.error("Error fetching subcategories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get("/brand");
      setBrands(response.data.data.doc);
    } catch (error) {
      // console.error("Error fetching brands:", error);
    }
  };

  const handleBrandSubmit = async (values) => {
    if (brandFileList.length === 0) {
      message.error("Please upload a brand image!");
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("category", values.category);
    formData.append("subCategory", values.subCategory);
    formData.append("photo", brandFileList[0]);

    try {
      await axios.post("/brand", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Brand created successfully");
      brandForm.resetFields();
      setBrandFileList([]);
      fetchBrands(); // Refresh the brand list
    } catch (error) {
      message.error("Failed to create brand");
    }
  };

  const handleVariantSubmit = async (values) => {
    if (variantFileList.length === 0) {
      message.error("Please upload at least one variant image!");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("subCategory", values.subCategory);
    variantFileList.forEach((file) => {
      formData.append("photos", file);
    });
    formData.append("brand", values.brand);
    formData.append("description", values.description);

    try {
      const response = await axios.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      0;
      message.success("Variant created successfully");
      variantForm.resetFields();
      setVariantFileList([]);
      setDescription(""); // Reset description
    } catch (error) {
      // console.error("Error creating variant:", error.response || error.message);

      if (error.response) {
        message.error(
          `Error: ${error.response.data.message || "Something went wrong!"}`
        );
      } else {
        message.error("Something went wrong, Try again!");
      }
    }
  };

  const brandUploadProps = {
    fileList: brandFileList,
    onRemove: (file) => {
      setBrandFileList((prevList) => {
        const index = prevList.indexOf(file);
        const newFileList = prevList.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file) => {
      setBrandFileList([file]);
      return false;
    },
  };

  const variantUploadProps = {
    fileList: variantFileList,
    multiple: true, // Allow multiple files
    onRemove: (file) => {
      setVariantFileList((prevList) => {
        const index = prevList.indexOf(file);
        const newFileList = prevList.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
    beforeUpload: (file) => {
      setVariantFileList((prevList) => [...prevList, file]);
      return false;
    },
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  return (
    <>
      <h2 className="text-center font-semibold md:text-2xl text-xl py-10">
        Upload Products
      </h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Add Brand" bordered={false}>
            <Form form={brandForm} onFinish={handleBrandSubmit}>
              <Form.Item
                label="Brand Name"
                name="title"
                rules={[
                  { required: true, message: "Please input the brand name!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Select Category"
                name="category"
                rules={[
                  { required: true, message: "Please select a category!" },
                ]}
              >
                <Select
                  style={{ width: "100%" }}
                  options={categories.map((category) => ({
                    label: category.title,
                    value: category._id,
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Sub Category"
                name="subCategory"
                rules={[
                  { required: true, message: "Please select a sub-category!" },
                ]}
              >
                <Select
                  style={{ width: "100%" }}
                  options={subCategories.map((subCategory) => ({
                    label: subCategory.title,
                    value: subCategory._id,
                  }))}
                />
              </Form.Item>

              <Upload {...brandUploadProps}>
                <Button icon={<UploadOutlined />}>Select Brand Image</Button>
              </Upload>
              <br />
              <Button type="primary" htmlType="submit">
                Add Brand
              </Button>
            </Form>
          </Card>
        </Col>

        {/* ===================Product section ======================*/}

        <Col span={16}>
          <Card title="Add Product" bordered={false}>
            <Form form={variantForm} onFinish={handleVariantSubmit}>
              <Form.Item
                label="Title"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please input the variant title!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Product Description"
                name="description"
                layout="vertical"
              >
                <Input />
              </Form.Item>
              <Form.Item
                className="mt-14"
                label="Select Category"
                name="category"
                rules={[
                  { required: true, message: "Please select a category!" },
                ]}
              >
                <Select
                  style={{ width: "100%" }}
                  options={categories.map((category) => ({
                    label: category.title,
                    value: category._id,
                  }))}
                />
              </Form.Item>
              <Form.Item
                label="Sub Category"
                name="subCategory"
                rules={[
                  { required: true, message: "Please select a sub-category!" },
                ]}
              >
                <Select
                  style={{ width: "100%" }}
                  options={subCategories.map((subCategory) => ({
                    label: subCategory.title,
                    value: subCategory._id,
                  }))}
                />
              </Form.Item>
              <Form.Item
                label="Brand"
                name="brand"
                rules={[{ required: true, message: "Please select a brand!" }]}
              >
                <Select
                  style={{ width: "100%" }}
                  options={brands.map((brand) => ({
                    label: brand.title,
                    value: brand._id,
                  }))}
                />
              </Form.Item>
              {/* Add varient */}
              <div className="border p-3 rounded-md">
                <h2 className="mb-3 font-medium ">Variants</h2>
                <div className="flex items-center gap-x-2 cursor-pointer">
                  <CiCirclePlus size={25} />
                  <p>add options like color Name, color Code or details </p>
                </div>
              </div>
              {/* Add option */}
              <div className="border p-3 rounded-md mt-10">
                <h2 className="mb-3 font-medium ">option</h2>
                <div className="flex items-center gap-x-2 cursor-pointer">
                  <CiCirclePlus size={25} />
                  <p>add options like sku, size, price, stock </p>
                </div>
              </div>
              <div className="mt-10">
                <Dragger {...variantUploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from
                    uploading company data or other band files
                  </p>
                </Dragger>
              </div>
              <Button
                type="primary"
                htmlType="submit"
                className="my-4"
                size="large"
                block
              >
                Save
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UploadProduct;
