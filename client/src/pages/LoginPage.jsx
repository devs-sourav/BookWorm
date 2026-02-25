import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, Mail } from "lucide-react";
import axios from "axios";
import { login } from "../redux/slices/authSlice"; // Updated import
import logo from "../assets/logos/logo.png";
import bg from "../assets/auth/Picture.png";

import { toast } from 'react-toastify';

// API configuration
const API_BASE_URL = "https://bookworm-t3mi.onrender.com/api/v1";

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// API service
const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Check if the response indicates success
      if (response.data.status === 'success' || response.status === 200) {
        return response.data;
      } else {
        // Handle API-level errors (when status is not success)
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login API Error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        
        // Handle your specific error format
        if (errorData.status === 'fail' && errorData.message) {
          throw new Error(errorData.message);
        }
        
        // Fallback error messages
        const message = errorData.message || 
                       errorData.error || 
                       `Server error (${error.response.status})`;
        throw new Error(message);
      } else if (error.request) {
        // Request made but no response received
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else if (error.message) {
        // Error message from our own throw statements or axios
        throw error;
      } else {
        // Something else happened
        throw new Error('An unexpected error occurred. Please try again.');
      }
    }
  },

  resendVerification: async (email) => {
    try {
      const response = await apiClient.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw new Error(error.response?.data?.message || 'Failed to resend verification email');
    }
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth); // Updated selector

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailVerificationError, setEmailVerificationError] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Clear error when component mounts
  useEffect(() => {
    setError(null);
    setEmailVerificationError(false);
    // Removed setShowSuccessMessage(false) - this was causing the error
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Adjust redirect path as needed
    }
  }, [isAuthenticated, navigate]);

  // Show error toast if error exists
  useEffect(() => {
    if (error) {
      if (emailVerificationError) {
        toast.warn(
          <div className="flex flex-col">
            <div className="font-semibold text-amber-800">Email Verification Required</div>
            <div className="text-sm text-amber-700 mt-1">{error}</div>
          </div>,
          {
            position: "bottom-right",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "!bg-amber-50 !border-l-4 !border-l-amber-400",
            bodyClassName: "text-amber-800",
            progressClassName: "!bg-amber-400",
          }
        );
      } else {
        toast.error(
          <div className="flex flex-col">
            <div className="font-semibold">Login Failed</div>
            <div className="text-sm mt-1">{error}</div>
          </div>,
          {
            position: "bottom-right",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "!bg-red-50 !border-l-4 !border-l-red-400",
            bodyClassName: "text-red-800",
            progressClassName: "!bg-red-400",
          }
        );
      }
    }
  }, [error, emailVerificationError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear general error when user makes changes
    if (error) {
      setError(null);
      setEmailVerificationError(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password || !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      await authAPI.resendVerification(userEmail);
      toast.success(
        <div className="flex flex-col">
          <div className="font-semibold">Verification Email Sent!</div>
          <div className="text-sm mt-1">Please check your inbox and spam folder</div>
        </div>,
        {
          position: "bottom-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "!bg-green-50 !border-l-4 !border-l-green-400",
          bodyClassName: "text-green-800",
          progressClassName: "!bg-green-400",
        }
      );
    } catch (error) {
      toast.error(
        <div className="flex flex-col">
          <div className="font-semibold">Failed to Send Email</div>
          <div className="text-sm mt-1">{error.message || "Please try again later"}</div>
        </div>,
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "!bg-red-50 !border-l-4 !border-l-red-400",
          bodyClassName: "text-red-800",
          progressClassName: "!bg-red-400",
        }
      );
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        <div className="flex flex-col">
          <div className="font-semibold">Form Validation Failed</div>
          <div className="text-sm mt-1">Please fix the errors and try again</div>
        </div>,
        {
          position: "bottom-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "!bg-red-50 !border-l-4 !border-l-red-400",
          bodyClassName: "text-red-800",
          progressClassName: "!bg-red-400",
        }
      );
      return;
    }

    setLoading(true);
    setError(null);
    setEmailVerificationError(false);

    try {
      const credentials = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      console.log('Submitting login with credentials:', {
        email: credentials.email,
      });

      // Call your API service
      const result = await authAPI.login(credentials);
      
      console.log('Login successful, result:', result);

      // Check if email is verified
      const user = result.user || result.data?.user || { email: credentials.email };
      
      if (user.emailVerified === false || user.isEmailVerified === false || user.email_verified === false) {
        setEmailVerificationError(true);
        setUserEmail(credentials.email);
        setError("Please verify your email address before logging in. Check your inbox for the verification link.");
        return;
      }

      // Dispatch login action with user and token
      dispatch(login({
        user: user,
        token: result.token || result.data?.token || result.access_token
      }));

      // Show professional success message
      toast.success(
        <div className="flex items-center">
          <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
          <div className="flex flex-col">
            <div className="font-semibold">Welcome Back!</div>
            <div className="text-sm mt-1">Login successful. Redirecting to home...</div>
          </div>
        </div>,
        {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "!bg-green-50 !border-l-4 !border-l-green-400 !min-h-[70px]",
          bodyClassName: "text-green-800",
          progressClassName: "!bg-green-400",
        }
      );

      // Reset form
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
      });

      // Small delay before redirect for better UX
      setTimeout(() => {
        // Navigation will be handled by the useEffect hook above
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);
      
      // Check if the error is related to email verification
      const errorMessage = error.message || "Login failed. Please try again.";
      
      if (errorMessage.toLowerCase().includes('verify') || 
          errorMessage.toLowerCase().includes('email') && 
          errorMessage.toLowerCase().includes('not') && 
          errorMessage.toLowerCase().includes('verified')) {
        setEmailVerificationError(true);
        setUserEmail(formData.email.trim().toLowerCase());
      }
      
      setError(errorMessage);
      
      // Clear password field on error for security
      setFormData(prev => ({
        ...prev,
        password: ""
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-white px-4 sm:px-8 md:px-16 py-10">
        <div className="w-full max-w-md">
          <div className="w-full flex justify-center">
            <div className="max-w-[260px] mb-10">
              <div className="w-full h-20 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                <img src={logo} alt="logo" />
              </div>
            </div>
          </div>

          <p className="text-gray-500 mt-4 mb-5 text-center">Welcome back!</p>
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Login to your account
          </h2>

          <form onSubmit={handleSubmit} className="w-full">
            {/* Email Field */}
            <label className="block text-sm text-gray-700 mb-1">E-mail *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@mail.com"
              className={`w-full p-3 mb-1 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${
                validationErrors.email || (error && error.toLowerCase().includes('email')) 
                  ? "border-red-500 bg-red-50" 
                  : "border-gray-200"
              }`}
              disabled={loading}
              maxLength={100}
              autoComplete="email"
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mb-3 flex items-center">
                <span className="mr-1">⚠</span>
                {validationErrors.email}
              </p>
            )}

            {/* Password Field */}
            <label className="block text-sm text-gray-700 mb-1 mt-4">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full p-3 pr-10 mb-1 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${
                  validationErrors.password || (error && error.toLowerCase().includes('password'))
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
                disabled={loading}
                maxLength={128}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Toggle password visibility"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-500 text-xs mb-3 flex items-center">
                <span className="mr-1">⚠</span>
                {validationErrors.password}
              </p>
            )}

            {/* Email Verification Error with Resend Button */}
            {emailVerificationError && error && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <Mail className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-yellow-800 font-semibold mb-1">Email Verification Required</p>
                    <p className="text-yellow-700 text-sm mb-3">
                      Please verify your email address to continue. Check your inbox for the verification link.
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingVerification}
                      className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
                        resendingVerification
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300"
                      }`}
                    >
                      {resendingVerification ? "Sending..." : "Resend Verification Email"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between mb-6 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="mr-2 accent-blue-600"
                  disabled={loading}
                />
                <label htmlFor="remember" className="text-sm text-blue-600">
                  Remember Me
                </label>
              </div>
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-5 py-3 rounded-md font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Register Button */}
            <Link to="/registration" className="block mt-5">
              <button
                type="button"
                className="w-full border border-blue-600 text-blue-600 py-3 rounded-md font-semibold hover:bg-blue-50 transition"
                disabled={loading}
              >
                Register
              </button>
            </Link>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="w-full md:w-1/2 relative hidden md:block">
        <img className="w-full h-screen object-cover" src={bg} alt="banner" />
      </div>
    </div>
  );
}