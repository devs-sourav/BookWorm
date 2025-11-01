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
import { CiCirclePlus } from "react-icons/ci";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "../Components/Axios";
import { ImCancelCircle } from "react-icons/im";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // import the Quill styling
const { Dragger } = Upload;

const UploadProduct = () => {
  const [brandForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [variantForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variantFileList, setVariantFileList] = useState([]);
  const [brandFileList, setBrandFileList] = useState([]);
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState([]); // State to manage variants
  const [options, setOptions] = useState([]); // State to manage options
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

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
  const handleImagePreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviewUrls((prev) => [...prev, e.target.result]);
    };
    reader.readAsDataURL(file);
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

  // Handle variant addition
  const handleAddVariant = () => {
    setVariants([...variants, { colorName: "", colorCode: "", details: "" }]);
  };

  // Handle option addition
  const handleAddOption = () => {
    setOptions([...options, { sku: "", size: "", price: "", stock: "" }]);
  };

  // Handle variant form submission
  const handleVariantSubmit = async (values) => {
    if (variantFileList.length === 0) {
      message.error("Please upload at least one variant image!");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("subCategory", values.subCategory);
    formData.append("brand", values.brand);
    formData.append("description", values.description);
    formData.append("details", description); // Add the description
    variantFileList.forEach((file) => {
      formData.append("photos", file);
    });

    try {
      // Create product
      const response = await axios.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const productId = response.data.data.product._id;
      const variantIds = [];

      // Create variants
      for (const variant of variants) {
        const variantResponse = await axios.post("/varient", {
          ...variant,
          product: productId,
          category: values.category,
          subCategory: values.subCategory,
          brand: values.brand,
        });
        variantIds.push(variantResponse.data.data.variant._id); // Collect variant ID
      }

      // Create options linked to the correct variant ID
      for (let i = 0; i < options.length; i++) {
        await axios.post("/option", {
          ...options[i],
          product: productId,
          variant: variantIds[i % variantIds.length], // Link to the correct variant ID
          category: values.category,
          subCategory: values.subCategory,
          brand: values.brand,
          freeShipping: values.freeShipping,
        });
      }
      // console.log(values.freeShipping);
      message.success("Product created successfully");
      productForm.resetFields();
      setVariantFileList([]);
      setVariants([]);
      setOptions([]);
      setDescription(""); // Reset description
      setImagePreviewUrls([]);
    } catch (error) {
      // console.error("Error creating product:", error.response || error.message);
      if (error.response) {
        message.error(
          `Error: ${error.response.data.message || "Something went wrong!"}`
        );
      } else {
        message.error("Something went wrong, Try again!");
      }
    }
  };

  const variantUploadProps = {
    fileList: variantFileList,
    multiple: true, // Allow multiple files
    onRemove: (file) => {
      setVariantFileList((prevList) => {
        const index = prevList.indexOf(file);
        const newFileList = prevList.slice();
        newFileList.splice(index, 1);
        setImagePreviewUrls((prevUrls) => {
          const newUrls = prevUrls.slice();
          newUrls.splice(index, 1);
          return newUrls;
        });
        return newFileList;
      });
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error(`${file.name} is not an image file!`);
        return Upload.LIST_IGNORE;
      }

      // Handle image preview
      handleImagePreview(file);

      // Set the selected image to the file list
      setVariantFileList((prevList) => [...prevList, file]);

      // Prevent automatic upload
      return false;
    },
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
  const handleRemoveVariant = (index) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  // Handle removing an option
  const handleRemoveOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  const joditConfig = {
    readonly: false, // allows editing
    toolbarSticky: false,
    uploader: {
      insertImageAsBase64URI: true, // allows image uploads as base64
    },
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "outdent",
      "indent",
      "|",
      "link",
      "image",
      "hr",
      "|",
      "undo",
      "redo",
      "|",
      "fullsize",
      "table", // Add table button for table functionality
      "source", // Add source button for code view
    ], // customized toolbar buttons
  };
  return (
    <>
      <h2 className="text-center font-semibold md:text-2xl text-xl py-10">
        Upload Products
      </h2>
      <Row gutter={16}>
        <Col span={8}>
          {/* Brand Section */}
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
              <p className="py-2">Brand Image size = 400 x 400 px</p>
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

        <Col span={16}>
          <Card title="Add Product" bordered={false}>
            <Form form={productForm} onFinish={handleVariantSubmit}>
              <Form.Item
                label="Title"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please input the product title!",
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
              {/* please add here free shipping functonaliti my end point is {{base_url}}/option */}
              <Form.Item name="freeShipping" valuePropName="checked">
                <Checkbox>Free Shipping</Checkbox>
              </Form.Item>

              {/* Add Variant */}
              <div className="border p-3 rounded-md">
                <h2 className="mb-3 font-medium ">Variants</h2>
                {variants.map((variant, index) => (
                  <div key={index} className="border-b border-[black] mb-5">
                    <ImCancelCircle
                      size={20}
                      className="text-red-600 ml-auto my-2 cursor-pointer"
                      onClick={() => handleRemoveVariant(index)}
                    />

                    <Form.Item
                      label="Color Name"
                      name={`colorName-${index}`}
                      rules={[
                        {
                          required: true,
                          message: "Please input the color name!",
                        },
                      ]}
                    >
                      <Input
                        value={variant.colorName}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].colorName = e.target.value;
                          setVariants(newVariants);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Color Code"
                      name={`colorCode-${index}`}
                      rules={[
                        {
                          required: true,
                          message: "Please input the color code!",
                        },
                      ]}
                    >
                      <Input
                        value={variant.colorCode}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          newVariants[index].colorCode = e.target.value;
                          setVariants(newVariants);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Details"
                      name={`details-${index}`}
                      rules={[
                        {
                          required: true,
                          message: "Please input the variant details!",
                        },
                      ]}
                    >
                      <ReactQuill
                        value={variant.details}
                        onChange={(newContent) => {
                          const newVariants = [...variants];
                          newVariants[index].details = newContent;
                          setVariants(newVariants);
                        }}
                      />
                    </Form.Item>
                  </div>
                ))}

                <div
                  className="flex items-center gap-x-2 cursor-pointer"
                  onClick={handleAddVariant}
                >
                  <CiCirclePlus size={25} />
                  <p>Add another variant</p>
                </div>
              </div>

              {/* Add Option */}
              <div className="border p-3 rounded-md mt-10">
                <h2 className="mb-3 font-medium ">Options</h2>

                {options.map((option, index) => (
                  <div key={index} className="border-b border-[black] mb-5">
                    {/* when i click this cancel icon delete this variants  */}
                    <ImCancelCircle
                      size={20}
                      className="text-red-600 ml-auto my-2 cursor-pointer"
                      onClick={() => handleRemoveOption(index)}
                    />
                    <Form.Item
                      label="SKU"
                      name={`sku-${index}`}
                      rules={[
                        {
                          required: true,
                          message: "Please input the SKU!",
                        },
                      ]}
                    >
                      <Input
                        value={option.sku}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index].sku = e.target.value;
                          setOptions(newOptions);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Size"
                      name={`size-${index}`}
                      rules={[
                        {
                          required: true,
                          message: "Please input the size!",
                        },
                      ]}
                    >
                      <Input
                        value={option.size}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index].size = e.target.value;
                          setOptions(newOptions);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Price"
                      name={`price-${index}`}
                      rules={[
                        {
                          required: true,
                          message: "Please input the price!",
                        },
                      ]}
                    >
                      <Input
                        value={option.price}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index].price = e.target.value;
                          setOptions(newOptions);
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Stock"
                      name={`stock-${index}`}
                      rules={[
                        {
                          required: true,
                          message: "Please input the stock quantity!",
                        },
                      ]}
                    >
                      <Input
                        value={option.stock}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index].stock = e.target.value;
                          setOptions(newOptions);
                        }}
                      />
                    </Form.Item>
                  </div>
                ))}

                <div
                  className="flex items-center gap-x-2 cursor-pointer"
                  onClick={handleAddOption}
                >
                  <CiCirclePlus size={25} />
                  <p>Add another option</p>
                </div>
              </div>

              <Dragger
                {...variantUploadProps}
                style={{
                  marginTop: "30px",
                  borderRadius: "10px",
                  background: "#f2f2f2",
                  padding: "10px",
                  borderStyle: "none",
                }}
                className="rounded-lg mt-4 border"
              >
                <div className="flex flex-col items-center justify-center gap-y-2 ">
                  <UploadOutlined style={{ fontSize: "40px" }} />
                  <h1 className="text-xl">Upload Product Photos</h1>
                </div>
              </Dragger>
              <p className="text-center"> Product photo size 700 x 900 px</p>

              <div className="image-preview-container mt-4 grid grid-cols-2 gap-4">
                <picture className="flex gap-x-5 justify-center">
                  {" "}
                  {imagePreviewUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt="Preview"
                      className="w-[150px] h-[150px] object-cover rounded-md shadow-lg"
                    />
                  ))}
                </picture>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                style={{ marginTop: "20px", width: "100%" }}
              >
                Upload Product
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UploadProduct;
