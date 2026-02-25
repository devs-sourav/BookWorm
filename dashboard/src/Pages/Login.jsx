import React, { useEffect, useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "../Components/Axios";
import { useDispatch, useSelector } from "react-redux";
import { activeUser } from "../Slices/userSlices";

/* ─── Inline styles (no Tailwind dependency beyond what you already have) ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Animated background blobs */
  .login-root::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
    top: -150px; left: -150px;
    border-radius: 50%;
    animation: blobDrift 12s ease-in-out infinite alternate;
  }
  .login-root::after {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(236,72,153,0.13) 0%, transparent 70%);
    bottom: -100px; right: -100px;
    border-radius: 50%;
    animation: blobDrift 15s ease-in-out infinite alternate-reverse;
  }
  @keyframes blobDrift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(40px, 30px) scale(1.08); }
  }

  /* Grid lines */
  .login-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  /* Card */
  .login-card {
    position: relative; z-index: 10;
    width: 100%; max-width: 460px;
    margin: 20px;
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 48px 44px 40px;
    box-shadow:
      0 0 0 1px rgba(99,102,241,0.1),
      0 32px 64px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.06);
    animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform: translateY(30px) scale(0.97); }
    to   { opacity:1; transform: translateY(0)    scale(1); }
  }

  /* Badge */
  .login-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 100px;
    padding: 4px 12px;
    font-size: 11px;
    color: #a5b4fc;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 20px;
  }
  .login-badge-dot {
    width: 6px; height: 6px;
    background: #6366f1;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%,100% { opacity:1; }
    50%      { opacity:0.4; }
  }

  /* Heading */
  .login-title {
    font-family: 'Syne', sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    margin: 0 0 6px;
  }
  .login-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.38);
    margin: 0 0 36px;
    font-weight: 300;
  }

  /* Demo credentials box */
  .demo-box {
    background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(236,72,153,0.08));
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
  }
  .demo-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, rgba(99,102,241,0.5), rgba(236,72,153,0.4), transparent);
  }
  .demo-label {
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6366f1;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex; align-items: center; gap: 5px;
  }
  .demo-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 4px;
  }
  .demo-row:last-child { margin-bottom: 0; }
  .demo-key {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    font-weight: 500;
  }
  .demo-val {
    font-size: 12px;
    color: rgba(255,255,255,0.85);
    font-family: 'DM Mono', monospace;
    background: rgba(255,255,255,0.06);
    border-radius: 6px;
    padding: 2px 8px;
    letter-spacing: 0.02em;
    cursor: pointer;
    border: 1px solid transparent;
    transition: border-color 0.2s, background 0.2s;
  }
  .demo-val:hover {
    border-color: rgba(99,102,241,0.4);
    background: rgba(99,102,241,0.12);
  }
  .demo-hint {
    font-size: 10px;
    color: rgba(255,255,255,0.25);
    margin-top: 8px;
  }

  /* Ant Design overrides */
  .login-card .ant-form-item { margin-bottom: 16px; }
  .login-card .ant-input-affix-wrapper {
    background: rgba(255,255,255,0.05) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 12px !important;
    padding: 12px 16px !important;
    transition: border-color 0.2s, box-shadow 0.2s !important;
  }
  .login-card .ant-input-affix-wrapper:hover {
    border-color: rgba(99,102,241,0.4) !important;
  }
  .login-card .ant-input-affix-wrapper-focused,
  .login-card .ant-input-affix-wrapper:focus-within {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
  }
  .login-card .ant-input {
    background: transparent !important;
    color: rgba(255,255,255,0.9) !important;
    font-size: 14px !important;
  }
  .login-card .ant-input::placeholder { color: rgba(255,255,255,0.2) !important; }
  .login-card .anticon { color: rgba(255,255,255,0.3) !important; }
  .login-card .ant-input-suffix .anticon:hover { color: rgba(255,255,255,0.7) !important; }

  .login-card .ant-form-item-explain-error {
    font-size: 11px;
    color: #f87171;
    padding-left: 4px;
  }

  .login-card .ant-checkbox-wrapper { color: rgba(255,255,255,0.45); font-size: 13px; }
  .login-card .ant-checkbox-inner {
    background: rgba(255,255,255,0.05) !important;
    border-color: rgba(255,255,255,0.15) !important;
    border-radius: 5px !important;
  }
  .login-card .ant-checkbox-checked .ant-checkbox-inner {
    background: #6366f1 !important;
    border-color: #6366f1 !important;
  }

  /* Forgot link */
  .forgot-link {
    font-size: 13px;
    color: #6366f1;
    text-decoration: none;
    transition: color 0.2s;
  }
  .forgot-link:hover { color: #a5b4fc; }

  /* Submit button */
  .login-btn {
    width: 100% !important;
    height: 48px !important;
    border-radius: 12px !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    font-family: 'DM Sans', sans-serif !important;
    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
    border: none !important;
    color: #fff !important;
    letter-spacing: 0.02em !important;
    position: relative !important;
    overflow: hidden !important;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s !important;
    box-shadow: 0 4px 24px rgba(99,102,241,0.35) !important;
  }
  .login-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    pointer-events: none;
  }
  .login-btn:hover:not(:disabled) {
    opacity: 0.92 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 8px 32px rgba(99,102,241,0.5) !important;
  }
  .login-btn:active:not(:disabled) { transform: translateY(0) !important; }
  .login-btn:disabled { opacity: 0.5 !important; }

  /* Divider */
  .login-or {
    text-align: center;
    color: rgba(255,255,255,0.2);
    font-size: 12px;
    margin: 20px 0 18px;
    position: relative;
  }
  .login-or::before, .login-or::after {
    content: '';
    position: absolute; top: 50%;
    width: calc(50% - 24px);
    height: 1px;
    background: rgba(255,255,255,0.08);
  }
  .login-or::before { left: 0; }
  .login-or::after  { right: 0; }

  /* Register link */
  .register-link {
    display: block;
    text-align: center;
    font-size: 13px;
    color: rgba(255,255,255,0.35);
  }
  .register-link a {
    color: #a5b4fc;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  .register-link a:hover { color: #fff; }

  /* Footer */
  .login-footer {
    position: relative; z-index: 10;
    text-align: center;
    margin-top: 28px;
    font-size: 12px;
    color: rgba(255,255,255,0.18);
  }
  .login-footer a {
    color: rgba(255,255,255,0.35);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }
  .login-footer a:hover { color: rgba(255,255,255,0.7); }

  /* Spinner override */
  .login-btn .anticon-loading { color: #fff !important; }
`;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectore = useSelector((state) => state);

  useEffect(() => {
    if (selectore?.users?.status === "You are logged in successfully") {
      return navigate("/dashboard");
    }
    if (
      selectore?.users?.userValue?.data?.user?.email == null ||
      selectore?.users?.userValue?.data?.user?.email === undefined
    ) {
      return navigate("/");
    }
  }, []);

  const fillDemo = () => {
    form.setFieldsValue({
      email: "admin@gmail.com",
      password: "admin12345@",
    });
    message.info("Demo credentials filled — click Log In!");
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post("/auth/login", values);
      localStorage.setItem("user", JSON.stringify(response.data));
      dispatch(activeUser(response?.data));
      message.success("Login successful!");
      setTimeout(() => {
        if (response?.data?.data?.user?.role === "aklogicAdmin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error) {
      message.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="login-grid" />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Card */}
          <div className="login-card">
            {/* Badge */}
            <div className="login-badge">
              <span className="login-badge-dot" />
              Admin Portal
            </div>

            <h1 className="login-title">Welcome back</h1>
            <p className="login-sub">Sign in to your account to continue</p>

            {/* Demo Credentials Box */}
            <div className="demo-box">
              <div className="demo-label">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4" stroke="#6366f1" strokeWidth="1.5"/>
                  <path d="M5 4v3M5 3h.01" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Demo Credentials
              </div>
              <div className="demo-row">
                <span className="demo-key">Email</span>
                <span className="demo-val" title="Click to auto-fill" onClick={fillDemo}>
                  admin@gmail.com
                </span>
              </div>
              <div className="demo-row">
                <span className="demo-key">Password</span>
                <span className="demo-val" title="Click to auto-fill" onClick={fillDemo}>
                  admin12345@
                </span>
              </div>
              <p className="demo-hint">↑ Click any value above to auto-fill the form</p>
            </div>

            {/* Form */}
            <Form
              form={form}
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="email"
                rules={[{ required: true, message: "Please enter your email" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email address"
                  size="large"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please enter your password" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                  <a className="forgot-link" href="#">Forgot password?</a>
                </div>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  htmlType="submit"
                  loading={loading}
                  className="login-btn"
                >
                  {loading ? "Signing in…" : "Log In"}
                </Button>
              </Form.Item>
            </Form>

            <div className="login-or">or</div>
            <p className="register-link">
              Don't have an account? <a href="#">Create one free</a>
            </p>
          </div>

          {/* Footer */}
          <div className="login-footer">
            Crafted by{" "}
            <Link to="https://bookwormm.netlify.com" target="_blank">
              Bookworm
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;