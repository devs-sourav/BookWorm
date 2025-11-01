import React, { useEffect, useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "../Components/Axios";
import { useDispatch, useSelector } from "react-redux";
import { activeUser } from "../Slices/userSlices";
const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectore = useSelector((state) => state);
  useEffect(() => {
    // console.log(selectore?.users?.userValue?.data?.user?.email);
    if (selectore?.users?.status == "You are logged in successfully") {
      return navigate("/dashboard");
    }
    if (
      selectore?.users?.userValue?.data?.user?.email == undefined ||
      selectore?.users?.userValue?.data?.user?.email == null
    ) {
      return navigate("/");
    }
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post("/auth/login", values);

      localStorage.setItem("user", JSON.stringify(response.data));
      dispatch(activeUser(response?.data));
      // console.log(response?.data?.data?.user?.role);

      setTimeout(() => {
        if (response?.data?.data?.user?.role === "aklogicAdmin") {
          return navigate("/dashboard");
        } else {
          navigate("/");
        }
      }, 1000);

      message.success("Login successfully");
    } catch (error) {
      message.error("Auth Error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center flex-col items-center h-screen">
      <div className="md:w-[500px] mx-auto border p-10 mb-16 rounded-md">
        <h1 className="text-2xl my-2 mb-5">Login</h1>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <a className="login-form-forgot text-primary" href="">
              Forgot password
            </a>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button w-full bg-primary"
            >
              Log in
            </Button>
            Or{" "}
            <a className="text-primary" href="">
              register now!
            </a>
          </Form.Item>
        </Form>
      </div>
      <h1>
        Developed by{" "}
        <Link
          className="font-bold text-black mt-10"
          target="_blanck"
          to={"https://bookworm.com"}
        >
          bookworm
        </Link>
      </h1>
    </div>
  );
};
export default Login;
