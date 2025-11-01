import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bg from "../assets/auth/Picture.png";
import logo from "../assets/logos/logo.png";
import axiosInstance from "../utils/axiosInstance";
// Import your auth actions - adjust the path as needed
// import { setCredentials } from "../store/slices/authSlice";

export default function RegistrationPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    label: "Very Weak",
    color: "bg-red-500",
  });
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    noSpaces: false,
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Password strength checker
  useEffect(() => {
    const checkPasswordStrength = (password) => {
      if (!password) {
        setPasswordStrength({
          strength: 0,
          label: "Very Weak",
          color: "bg-red-500",
        });
        return;
      }

      const validation = {
        minLength: password.length >= 6,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        noSpaces: !/\s/.test(password),
      };

      setPasswordValidation(validation);

      // Calculate strength based on criteria met
      let strengthScore = 0;

      // Base strength on required criteria
      if (validation.minLength) strengthScore += 20;
      if (validation.hasUppercase) strengthScore += 15;
      if (validation.hasLowercase) strengthScore += 15;
      if (validation.hasNumber) strengthScore += 15;
      if (validation.hasSpecialChar) strengthScore += 15;
      if (validation.noSpaces) strengthScore += 10;

      // Bonus for longer passwords
      if (password.length >= 8) strengthScore += 5;
      if (password.length >= 12) strengthScore += 5;

      // Determine label and color
      let label, color;
      if (strengthScore >= 90) {
        label = "Very Strong";
        color = "bg-green-600";
      } else if (strengthScore >= 75) {
        label = "Strong";
        color = "bg-green-500";
      } else if (strengthScore >= 50) {
        label = "Medium";
        color = "bg-yellow-500";
      } else if (strengthScore >= 25) {
        label = "Weak";
        color = "bg-orange-500";
      } else {
        label = "Very Weak";
        color = "bg-red-500";
      }

      setPasswordStrength({
        strength: Math.min(strengthScore, 100),
        label,
        color,
      });
    };

    checkPasswordStrength(formData.password);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const isPasswordValid = () => {
    return (
      passwordValidation.minLength &&
      passwordValidation.hasUppercase &&
      passwordValidation.hasLowercase &&
      passwordValidation.hasNumber &&
      passwordValidation.hasSpecialChar &&
      passwordValidation.noSpaces
    );
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.trim().length > 100) {
      newErrors.email = "Email must be less than 100 characters";
    }

    // Password validation
    if (!formData.password || !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (formData.password.length > 25) {
      newErrors.password = "Password must be less than 25 characters";
    } else if (/\s/.test(formData.password)) {
      newErrors.password = "Password cannot contain spaces";
    } else if (!isPasswordValid()) {
      newErrors.password =
        "Password must contain at least 6 characters with one uppercase letter, one lowercase letter, one number, one special character, and no spaces";
    }

    // Confirm password validation
    if (!formData.confirmPassword || !formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Remember Me functionality - store credentials securely
  const handleTokenStorage = (token, userData) => {
    // Store token in localStorage for persistent login
    localStorage.setItem("token", token);
    localStorage.setItem(
      "authData",
      JSON.stringify({
        token,
        user: userData,
        timestamp: new Date().getTime(),
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await axiosInstance.post("/auth/signup", userData);
      const data = response.data;

      toast.success(
        "Registration successful! Please check your email to verify your account.",
        {
          position: "bottom-right",
          autoClose: 7000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Handle token storage if token is returned
      if (data.token) {
        handleTokenStorage(
          data.token,
          data.user || {
            name: userData.name,
            email: userData.email,
          }
        );

        // Update Redux store with auth data
        // Uncomment and adjust based on your auth slice structure
        // dispatch(setCredentials({
        //   user: data.user || { name: userData.name, email: userData.email },
        //   token: data.token
        // }));
      }

      // Reset form on success
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect based on response or to dashboard
      setTimeout(() => {
        if (data.redirectUrl) {
          navigate(data.redirectUrl);
        } else if (data.token) {
          navigate("/dashboard"); // or wherever authenticated users should go
        } else {
          navigate("/login"); // if email verification is required
        }
      }, 2000); // Give time to show success message
    } catch (error) {
      console.error("Registration error:", error);

      // Handle different types of errors
      let errorMessage = "Registration failed. Please try again.";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          errorMessage = data.message || "Invalid input data.";
        } else if (status === 409) {
          errorMessage = "Email already exists. Please use a different email.";
        } else if (status === 422) {
          errorMessage = "Validation failed. Please check your input.";
        } else if (status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data.message || errorMessage;
        }

        // Handle field-specific errors if your API returns them
        if (data.errors) {
          setValidationErrors(data.errors);
          toast.error("Please check the highlighted fields", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          return; // Don't show additional error toast
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row">
        {/* Left Side */}
        <div className="w-full md:w-1/2 relative hidden md:block">
          <img src={bg} alt="BookWorm" className="w-full h-full object-cover" />
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex justify-center items-center bg-white px-4 sm:px-8 md:px-16 py-10">
          <div className="w-full max-w-md">
            <a className="w-full flex justify-center" href="/">
              <div className="max-w-[260px] mb-4">
                <img src={logo} alt="logo" className="w-full h-auto" />
              </div>
            </a>

            <p className="text-gray-500 mt-4 mb-5 text-center">Welcome here!</p>
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Register to your account
            </h2>

            <form className="w-full" onSubmit={handleSubmit}>
              {/* Name Field */}
              <label className="block text-sm text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full p-3 mb-1 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  validationErrors.name ? "border-red-500" : "border-gray-200"
                }`}
                disabled={loading}
                maxLength={50}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs mb-3">
                  {validationErrors.name}
                </p>
              )}

              {/* Email Field */}
              <label className="block text-sm text-gray-700 mb-1 mt-4">
                E-mail *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@mail.com"
                className={`w-full p-3 mb-1 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  validationErrors.email ? "border-red-500" : "border-gray-200"
                }`}
                disabled={loading}
                maxLength={100}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mb-3">
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
                  className={`w-full p-3 pr-10 mb-1 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    validationErrors.password
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  disabled={loading}
                  maxLength={25}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  aria-label="Toggle password visibility"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-xs mb-3">
                  {validationErrors.password}
                </p>
              )}

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">
                      Password strength
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.strength >= 75
                          ? "text-green-600"
                          : passwordStrength.strength >= 50
                          ? "text-yellow-600"
                          : passwordStrength.strength >= 25
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <div
                      className={`flex items-center ${
                        passwordValidation.minLength
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span className="mr-1">
                        {passwordValidation.minLength ? "✓" : "✗"}
                      </span>
                      At least 6 characters
                    </div>
                    <div
                      className={`flex items-center ${
                        passwordValidation.hasUppercase
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span className="mr-1">
                        {passwordValidation.hasUppercase ? "✓" : "✗"}
                      </span>
                      One uppercase letter
                    </div>
                    <div
                      className={`flex items-center ${
                        passwordValidation.hasLowercase
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span className="mr-1">
                        {passwordValidation.hasLowercase ? "✓" : "✗"}
                      </span>
                      One lowercase letter
                    </div>
                    <div
                      className={`flex items-center ${
                        passwordValidation.hasNumber
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span className="mr-1">
                        {passwordValidation.hasNumber ? "✓" : "✗"}
                      </span>
                      One number
                    </div>
                    <div
                      className={`flex items-center ${
                        passwordValidation.hasSpecialChar
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span className="mr-1">
                        {passwordValidation.hasSpecialChar ? "✓" : "✗"}
                      </span>
                      One special character
                    </div>
                    <div
                      className={`flex items-center ${
                        passwordValidation.noSpaces
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      <span className="mr-1">
                        {passwordValidation.noSpaces ? "✓" : "✗"}
                      </span>
                      No spaces
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              <label className="block text-sm text-gray-700 mb-1 mt-4">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full p-3 pr-10 mb-1 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    validationErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  disabled={loading}
                  maxLength={25}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  aria-label="Toggle confirm password visibility"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mb-3">
                  {validationErrors.confirmPassword}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !isPasswordValid() ||
                  formData.password !== formData.confirmPassword
                }
                className={`w-full mt-5 py-3 rounded-md font-semibold transition ${
                  loading ||
                  !isPasswordValid() ||
                  formData.password !== formData.confirmPassword
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {loading ? "Registering..." : "Register"}
              </button>

              {/* Login Button */}
              <Link to="/login" className="block mt-5">
                <button
                  type="button"
                  className="w-full border border-blue-600 text-blue-600 py-3 rounded-md font-semibold hover:bg-blue-50 transition"
                  disabled={loading}
                >
                  Already have an account? Login
                </button>
              </Link>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Container positioned at bottom-right */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="toast-custom"
        bodyClassName="toast-body"
        style={{
          fontSize: "14px",
        }}
      />
    </>
  );
}
