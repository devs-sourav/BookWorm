import React, { useState, useEffect } from "react";
import {
  Popconfirm,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
} from "antd";
import axios from "../Components/Axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import Quill styling

const AllProduct = () => {
  const [data, setData] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productProduct, setProductProduct] = useState({});
  const [productVariant, setProductVariant] = useState({});
  const [productOptions, setProductOptions] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get("/varient");
      const formattedData = response.data.data.doc.map((variant, index) => ({
        ...variant,
        key: variant._id,
        index: index + 1,
        title: variant.title,
        category: variant?.category?.title || "N/A",
        subCategory: variant?.subCategory?.title || "N/A",
        photo: variant.photo,
      }));
      setData(formattedData.reverse());
    } catch (error) {
      // console.error("Error fetching data:", error);
    }
  };

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

  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchSubCategories();
  }, []);

  const handleDelete = async (key) => {
    try {
      await axios.delete(`/varient/${key}`);
      message.success("Variant deleted successfully");
      setData((prevData) => prevData.filter((item) => item.key !== key));
    } catch (error) {
      message.error("Failed to delete variant");
    }
  };

  const handleEdit = async (record) => {
    try {
      const productResponse = await axios.get(`/product/${record.product._id}`);
      const product = productResponse.data.data.doc;

      const variantResponse = await axios.get(`/varient/${record._id}`);
      const variant = variantResponse.data.data.doc;

      setEditingRecord(record);
      editForm.setFieldsValue({
        title: product.name,
        category: product.category._id,
        subCategory: product.subCategory?._id || null,
        description: product.description,
        colorName: variant.colorName,
        colorCode: variant.colorCode,
      });

      setProductProduct(product);
      setProductVariant(variant);
      setProductOptions(variant.options || []); // Ensure it's an array
      setIsModalVisible(true);
    } catch (error) {
      // console.error("Error fetching data:", error);
      message.error("Failed to fetch variant data.");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      const formData = new FormData();

      formData.append("name", values.title);
      formData.append("category", values.category);
      formData.append("subCategory", values.subCategory);
      formData.append("description", values.description);

      await axios.patch(`/varient/${productVariant._id}`, {
        colorName: values.colorName,
        colorCode: values.colorCode,
      });

      // Ensure values for price, quantity, sku, and size are arrays and have the same length as productOptions
      const updatedOptions = productOptions.map((option, index) => ({
        price: values.price?.[index] || option.price, // Default to existing value
        stock: values.quantity?.[index] || option.stock,
        sku: values.sku?.[index] || option.sku,
        size: values.size?.[index] || option.size,
      }));

      // Update each option
      await Promise.all(
        updatedOptions.map((option, index) => {
          return axios.patch(`/option/${productOptions[index]._id}`, option);
        })
      );

      const productResponse = await axios.patch(
        `/product/${productProduct._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedProduct = productResponse.data.data.doc;

      setData((prevData) =>
        prevData.map((item) =>
          item.key === editingRecord._id
            ? {
                ...item,
                ...values,
                category:
                  categories.find((cat) => cat._id === values.category)
                    ?.title || "N/A",
                subCategory:
                  subCategories.find(
                    (subCat) => subCat._id === values.subCategory
                  )?.title || "N/A",
                photo: updatedProduct?.photos,
              }
            : item
        )
      );

      message.success("Variant updated successfully");
      setEditingRecord(null);
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      // console.error("Failed to update variant", error);
      message.error("Failed to update variant");
    }
  };

  const handleModalCancel = () => {
    setEditingRecord(null);
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "#SL",
      dataIndex: "index",
      key: "index",
      fixed: "left",
      width: "5%",
    },
    {
      width: "8%",
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      width: "8%",
      title: "Sub Category",
      dataIndex: "subCategory",
      key: "subCategory",
    },
    {
      width: "10%",
      title: "Title",
      dataIndex: ["product", "name"],
      key: "title",
    },
    {
      width: "15%",
      title: "Stock",
      dataIndex: "options",
      key: "quantity",
      render: (options) => (
        <>
          {options?.map((option, index) => (
            <div key={index}>
              <span>{`Stock: ${option.stock} = Size: (${option.size})`}</span>
            </div>
          ))}
        </>
      ),
    },
    {
      width: "10%",
      title: "Images",
      dataIndex: ["product", "photos"],
      key: "photos",
      render: (photos) => (
        <>
          {photos?.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Image ${index + 1}`}
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
          ))}
        </>
      ),
    },
    {
      width: "5%",
      title: "Size",
      dataIndex: "options",
      key: "size",
      render: (options) => (
        <>
          {options?.map((option, index) => (
            <div key={index}>
              <span>{option.size}</span>
            </div>
          ))}
        </>
      ),
    },
    {
      width: "5%",
      title: "Color Name", // New column for color name
      dataIndex: "colorName",
      key: "colorName",
      render: (colorName) => <span>{colorName}</span>,
    },
    {
      title: "Price",
      dataIndex: "options",
      key: "price",
      render: (options) => (
        <>
          {Array.isArray(options) &&
            options.map((option, index) => (
              <div key={index}>
                Price:{`${option.price} TK size: (${option.size})`}
              </div>
            ))}
        </>
      ),
    },
    {
      title: "Discount",
      dataIndex: "options",
      key: "discount",
      render: (options) => (
        <>
          {options?.map((option, index) => (
            <div key={index}>
              <span> {option.discountValue}</span>
            </div>
          ))}
        </>
      ),
    },

    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: "10%",
      render: (_, record) => (
        <div className="flex gap-x-2">
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this variant?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger">Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleOptionChange = (index, field, value) => {
    setProductOptions((prevOptions) => {
      const updatedOptions = [...prevOptions];
      updatedOptions[index] = {
        ...updatedOptions[index],
        [field]: value,
      };
      return updatedOptions;
    });
  };

  return (
    <div>
      <Table columns={columns} dataSource={data} scroll={{ x: 1300 }} />
      <Modal
        title="Edit Product"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk}>
            Submit
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Title" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="Category" name="category">
            <Select>
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Sub Category" name="subCategory">
            <Select>
              {subCategories.map((sub) => (
                <Select.Option key={sub._id} value={sub._id}>
                  {sub.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Description" name="description">
            <ReactQuill />
          </Form.Item>
          <Form.Item label="Color Name" name="colorName">
            <Input />
          </Form.Item>
          <Form.Item label="Color Code" name="colorCode">
            <Input />
          </Form.Item>
          <div>
            <h1 className="text-xl font-bold">Options</h1>
            {productOptions.map((option, index) => (
              <div key={index} className="border-b border-black mb-5 list-item">
                <Form.Item label={`Price for Option ${index + 1}`}>
                  <Input
                    value={option.price}
                    onChange={(e) =>
                      handleOptionChange(index, "price", e.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label={`Quantity for Option ${index + 1}`}>
                  <Input
                    value={option.stock}
                    onChange={(e) =>
                      handleOptionChange(index, "stock", e.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label={`SKU for Option ${index + 1}`}>
                  <Input
                    value={option.sku}
                    onChange={(e) =>
                      handleOptionChange(index, "sku", e.target.value)
                    }
                  />
                </Form.Item>
                <Form.Item label={`Size for Option ${index + 1}`}>
                  <Input
                    value={option.size}
                    onChange={(e) =>
                      handleOptionChange(index, "size", e.target.value)
                    }
                  />
                </Form.Item>
              </div>
            ))}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AllProduct;
