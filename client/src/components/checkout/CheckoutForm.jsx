import React, { useEffect, useState } from "react";
import {
  FaMinus,
  FaCheck,
  FaExclamationTriangle,
  FaMobileAlt,
  FaCreditCard,
} from "react-icons/fa";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import Containar from "../../layouts/Containar";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TiArrowBackOutline } from "react-icons/ti";
import { deleteFromCart, resetCart } from "../../redux/slices/cartSlices";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import axios from "axios";
import {
  MdOutlineDeleteForever,
  MdSecurity,
  MdLocalShipping,
} from "react-icons/md";
import { city } from "../constants";

const CheckoutForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  // const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCity, setLoadingCity] = useState(true);
  const [loadingZone, setLoadingZone] = useState(true);

  // Location data
  const [zonelist, setZoneList] = useState([]);
  const [arealist, setAreaList] = useState([]);
  const [cityKey, setCityKey] = useState(0);
  const [zoneKey, setZoneKey] = useState(0);

  // Coupon data
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});

  // User data (you might get this from auth context)
  const user = useSelector((state) => state.auth?.user); // Adjust based on your auth structure

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phoneNumber: user?.phone || "",
    email: user?.email || "",
    district: {},
    streetAddress: "",
    area: {},
    zone: {},
    deliveryType: "normal", // normal or express (UI) -> maps to on_demand (DB)
    paymentMethod: "cash_on_delivery",
    couponCode: "",
    notes: "",
  });

  // Check for free shipping
  const hasFreeShipping = cartItems.some((item) => item.freeShipping);

  // Location handling effects
  useEffect(() => {
    setLoadingCity(true);
    if (cityKey !== 0) {
      getCZone(cityKey);
    }
  }, [cityKey]);

  useEffect(() => {
    setLoadingZone(true);
    getCArea(zoneKey);
  }, [zoneKey]);

  // Fetch zones based on city
  const getCZone = async (id) => {
    try {
      const response = await axios.post(
        `https://bookworm-t3mi.onrender.com/api/v1/pathaoLocation/city/${id}/zones`
      );
      setZoneList(response.data.data.data);
      if (response.data.data.data.length > 0) {
        setLoadingCity(false);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      setLoadingCity(false);
    }
  };

  // Fetch areas based on zone
  const getCArea = async (id) => {
    if (id === 0) {
      return;
    }
    try {
      const res = await axios.post(
        `https://bookworm-t3mi.onrender.com/api/v1/pathaoLocation/zone/${id}/area-list`
      );
      setAreaList(res?.data?.data.data);
      if (res?.data?.data.data.length > 0) {
        setLoadingZone(false);
      }
    } catch (error) {
      console.error(error);
      setLoadingZone(false);
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) =>
        total +
        (item?.discountValue > 0
          ? Math.ceil(item?.salePrice)
          : Math.ceil(item?.price)) *
          item.quantity,
      0
    );
  };

  // Updated calculateCouponDiscount with proper ceiling
  const calculateCouponDiscount = () => {
    if (!couponData) return 0;

    const subtotal = calculateSubtotal();

    if (couponData.discountType === "percentage") {
      const discount = (couponData.discountPercent / 100) * subtotal;
      return Math.ceil(Math.min(discount, subtotal));
    } else if (couponData.discountType === "amount") {
      return Math.ceil(Math.min(couponData.discountAmount, subtotal));
    }

    return 0;
  };

  // Calculate shipping cost based on delivery type
  const getShippingCost = () => {
    console.log("Calculating shipping cost...", {
      hasFreeShipping,
      deliveryType: formData.deliveryType,
    });

    // Free shipping only applies to normal delivery AND only for eligible items
    if (hasFreeShipping && formData.deliveryType === "normal") {
      console.log("Free shipping applied");
      return 0;
    }

    // Express delivery: ৳160 for 24 hours (no free shipping)
    if (formData.deliveryType === "express") {
      console.log("Express delivery cost: 160");
      return 160;
    }

    // Normal delivery: ৳80 for 2-3 days (unless free shipping applies)
    console.log("Normal delivery cost: 80");
    return 80;
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateCouponDiscount();
    const shippingCost = getShippingCost();
    const total = subtotal - discount + shippingCost;
    return Math.ceil(Math.max(0, total));
  };

  // Handle coupon validation
  const handleCouponCode = async () => {
    if (formData.couponCode.trim() === "") {
      setCouponError("Coupon code cannot be empty");
      setCouponData(null);
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const response = await axios.get(
        `https://bookworm-t3mi.onrender.com/api/v1/coupon/${formData.couponCode}`
      );

      if (response.data.status === "success" && response.data.data.isValid) {
        setCouponData(response.data.data.coupon);
        setCouponError("");
      } else {
        setCouponError("Invalid coupon code");
        setCouponData(null);
      }
    } catch (error) {
      console.error("Error fetching coupon", error);
      setCouponError(error.response?.data?.message || "Coupon code not found");
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setCouponData(null);
    setCouponError("");
    setFormData((prev) => ({ ...prev, couponCode: "" }));
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Parse JSON values for location fields
    if (name === "area" || name === "district" || name === "zone") {
      try {
        updatedValue = value ? JSON.parse(value) : {};
      } catch (error) {
        console.error("Error parsing JSON:", error);
        updatedValue = {};
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    // Update location keys
    if (name === "district") {
      setCityKey(updatedValue?.city_id || 0);
      setFormData((prev) => ({ ...prev, zone: {}, area: {} })); // Reset dependent fields
    }
    if (name === "zone") {
      setZoneKey(updatedValue?.zone_id || 0);
      setFormData((prev) => ({ ...prev, area: {} })); // Reset dependent field
    }

    // Clear specific error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!/^\d{11,}$/.test(formData.phoneNumber.replace(/\s+/g, ""))) {
      newErrors.phoneNumber = "Phone Number must be at least 11 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required for invoice";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Street Address is required";
    }

    if (!formData.area || !formData.area.area_id) {
      newErrors.area = "Area is required";
    }

    if (!formData.district || !formData.district.city_id) {
      newErrors.district = "City is required";
    }

    if (!formData.zone || !formData.zone.zone_id) {
      newErrors.zone = "Zone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll to first error
      const firstErrorField = document.querySelector(".border-red-500");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsLoading(true);

    try {
      // Calculate shipping cost BEFORE preparing order data
      const calculatedShippingCost = getShippingCost();

      console.log("Order submission:", {
        deliveryType: formData.deliveryType,
        calculatedShippingCost,
        totalCost: calculateTotalCost(),
      });

      // Prepare order data according to backend schema
      const orderData = {
        user: user?.id || user?._id,
        name: formData.fullName.trim(),
        phone: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        city: {
          cityID: formData.district.city_id,
          cityName: formData.district.city_name,
        },
        zone: {
          zoneID: formData.zone.zone_id,
          zoneName: formData.zone.zone_name,
        },
        area: {
          areaID: formData.area.area_id,
          areaName: formData.area.area_name,
        },
        streetAddress: formData.streetAddress.trim(),
        deliveryType:
          formData.deliveryType === "express" ? "on_demand" : "normal",
        shippingCost: calculatedShippingCost, // Use calculated shipping cost
        products: cartItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim(),
      };

      console.log("Final Order Data:", orderData);

      let response;

      // Determine endpoint based on payment method and coupon
      if (formData.paymentMethod === "sslcommerz") {
        // First create order, then initiate SSL Commerz
        const endpoint = couponData
          ? "https://bookworm-t3mi.onrender.com/api/v1/order/withCoupon"
          : "https://bookworm-t3mi.onrender.com/api/v1/order";

        if (couponData) {
          orderData.coupon = formData.couponCode.trim();
        }

        console.log("Creating SSL Commerz order with data:", orderData);

        const orderResponse = await axios.post(endpoint, orderData);
        const orderId = orderResponse.data.data.order._id;

        console.log(
          "Order created, initiating SSL Commerz payment for order:",
          orderId
        );

        // Initiate SSL Commerz payment
        const sslResponse = await axios.post(
          "https://bookworm-t3mi.onrender.com/api/v1/order/payment/sslcommerz/initiate",
          { orderId }
        );

        if (sslResponse.data.data.paymentUrl) {
          // Redirect to SSL Commerz payment page
          window.location.href = sslResponse.data.data.paymentUrl;
          return;
        }
      } else if (formData.paymentMethod === "bkash") {
        // First create order, then initiate bKash
        const endpoint = couponData
          ? "https://bookworm-t3mi.onrender.com/api/v1/order/withCoupon"
          : "https://bookworm-t3mi.onrender.com/api/v1/order";

        if (couponData) {
          orderData.coupon = formData.couponCode.trim();
        }

        const orderResponse = await axios.post(endpoint, orderData);
        const orderId = orderResponse.data.data.order._id;
        const totalAmount = orderResponse.data.data.order.totalCost;

        // Initiate bKash payment
        const bkashResponse = await axios.post(
          "https://bookworm-t3mi.onrender.com/api/v1/order/payment/bkash/initiate",
          { orderId, amount: totalAmount }
        );

        if (bkashResponse.data.data.paymentURL) {
          // Redirect to bKash payment page
          window.location.href = bkashResponse.data.data.paymentURL;
          return;
        }
      } else {
        // Cash on delivery or other payment methods
        const endpoint = couponData
          ? "https://bookworm-t3mi.onrender.com/api/v1/order/withCoupon"
          : "https://bookworm-t3mi.onrender.com/api/v1/order";

        if (couponData) {
          orderData.coupon = formData.couponCode.trim();
        }

        response = await axios.post(endpoint, orderData);
      }

      // Clear cart and redirect to success page
      dispatch(resetCart());
      navigate("/thankyou", {
        state: {
          orderId: response.data.data.order._id,
          orderNumber: response.data.data.order.orderNumber,
        },
      });
    } catch (error) {
      console.error("Error submitting order:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "An error occurred while placing the order";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setCouponError(errorMessage);

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      fullName: user?.name || "",
      phoneNumber: user?.phone || "",
      email: user?.email || "",
      district: {},
      streetAddress: "",
      area: {},
      zone: {},
      deliveryType: "normal",
      paymentMethod: "cash_on_delivery",
      couponCode: "",
      notes: "",
    });
    setErrors({});
    setCouponData(null);
    setCouponError("");
    setCityKey(0);
    setZoneKey(0);
    setZoneList([]);
    setAreaList([]);
  };

  // Show empty cart state
  if (cartItems.length === 0) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#FEF6F6]">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <HiOutlineShoppingBag className="text-6xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-texthead mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-texthead text-white font-medium rounded-md hover:bg-green-600 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-20 font-inter bg-[#FEF6F6]">
      <Containar>
        <div className="grid grid-cols-12 md:gap-x-8">
          {/* Main Form */}
          <div className="col-span-12 order-2 lg:order-1 lg:col-span-8">
            <div className="bg-white pt-8 pb-12 px-6 shadow-md rounded-lg">
              {/* Error Alert */}
              {couponError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Error</h4>
                    <p className="text-red-700 text-sm">{couponError}</p>
                  </div>
                </div>
              )}

              <h2 className="text-texthead text-xl font-semibold mb-6 flex items-center gap-2">
                <MdLocalShipping className="text-blue-600" />
                Shipping Information
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full h-12 px-4 border rounded-lg transition-colors ${
                        errors.fullName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-blue-500"
                      } focus:outline-none`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <FaExclamationTriangle className="text-xs" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone and Email */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className={`w-full h-12 px-4 border rounded-lg transition-colors ${
                          errors.phoneNumber
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-blue-500"
                        } focus:outline-none`}
                        placeholder="01XXXXXXXXX"
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaExclamationTriangle className="text-xs" />
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          (for invoice)
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full h-12 px-4 border rounded-lg transition-colors ${
                          errors.email
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-blue-500"
                        } focus:outline-none`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaExclamationTriangle className="text-xs" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <select
                        name="district"
                        value={
                          formData.district.city_id
                            ? JSON.stringify(formData.district)
                            : ""
                        }
                        onChange={handleChange}
                        className={`w-full h-12 px-4 border rounded-lg transition-colors ${
                          errors.district
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-blue-500"
                        } focus:outline-none`}
                      >
                        <option value="">Select City</option>
                        {city?.map((cityInfo) => (
                          <option
                            key={cityInfo?.city_id}
                            value={JSON.stringify(cityInfo)}
                          >
                            {cityInfo?.city_name}
                          </option>
                        ))}
                      </select>
                      {errors.district && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaExclamationTriangle className="text-xs" />
                          {errors.district}
                        </p>
                      )}
                    </div>

                    {/* Zone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zone *
                      </label>
                      <select
                        name="zone"
                        value={
                          formData.zone.zone_id
                            ? JSON.stringify(formData.zone)
                            : ""
                        }
                        onChange={handleChange}
                        disabled={loadingCity}
                        className={`w-full h-12 px-4 border rounded-lg transition-colors ${
                          errors.zone
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-blue-500"
                        } focus:outline-none disabled:bg-gray-100`}
                      >
                        <option value="">
                          {loadingCity ? "Loading zones..." : "Select Zone"}
                        </option>
                        {zonelist?.map((zoneInfo) => (
                          <option
                            key={zoneInfo?.zone_id}
                            value={JSON.stringify(zoneInfo)}
                          >
                            {zoneInfo?.zone_name}
                          </option>
                        ))}
                      </select>
                      {errors.zone && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaExclamationTriangle className="text-xs" />
                          {errors.zone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Area and Street Address */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area *
                      </label>
                      <select
                        name="area"
                        value={
                          formData.area.area_id
                            ? JSON.stringify(formData.area)
                            : ""
                        }
                        onChange={handleChange}
                        disabled={loadingZone}
                        className={`w-full h-12 px-4 border rounded-lg transition-colors ${
                          errors.area
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-blue-500"
                        } focus:outline-none disabled:bg-gray-100`}
                      >
                        <option value="">
                          {loadingZone ? "Loading areas..." : "Select Area"}
                        </option>
                        {arealist?.map((areaInfo) => (
                          <option
                            key={areaInfo?.area_id}
                            value={JSON.stringify(areaInfo)}
                          >
                            {areaInfo?.area_name}
                          </option>
                        ))}
                      </select>
                      {errors.area && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaExclamationTriangle className="text-xs" />
                          {errors.area}
                        </p>
                      )}
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleChange}
                        className={`w-full h-12 px-4 border rounded-lg transition-colors ${
                          errors.streetAddress
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-blue-500"
                        } focus:outline-none`}
                        placeholder="House number and street name"
                      />
                      {errors.streetAddress && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaExclamationTriangle className="text-xs" />
                          {errors.streetAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Delivery Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="normal"
                          checked={formData.deliveryType === "normal"}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div>
                          <h4 className="font-medium">Normal Delivery</h4>
                          <p className="text-sm text-gray-600">2-3 Days</p>
                          <p className="text-xs text-blue-600">৳80</p>
                        </div>
                      </label>

                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="express"
                          checked={formData.deliveryType === "express"}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">Express Delivery</h4>
                          <p className="text-sm text-gray-600">24 Hours</p>
                          <p className="text-xs text-blue-600">৳160</p>
                          {hasFreeShipping && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ Free shipping not available for express
                              delivery
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coupon Code (Optional)
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        name="couponCode"
                        value={formData.couponCode}
                        onChange={handleChange}
                        disabled={couponLoading}
                        className="flex-1 h-12 px-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                        placeholder="Enter coupon code"
                      />
                      <button
                        type="button"
                        onClick={handleCouponCode}
                        disabled={couponLoading || !formData.couponCode.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {couponLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>

                    {couponData && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaCheck className="text-green-600" />
                          <span className="text-green-800 text-sm">
                            Coupon applied! Discount:{" "}
                            {couponData.discountType === "percentage"
                              ? `${couponData.discountPercent}%`
                              : `৳${couponData.discountAmount}`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="px-8 py-3 rounded-lg bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 flex items-center justify-center text-white font-medium hover:bg-green-600 transition-all ease-linear duration-200 bg-texthead cursor-pointer rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Order...
                      </span>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="col-span-12 order-1 lg:order-2 mt-5 lg:mt-0 lg:col-span-4">
            <div className="bg-white shadow-lg rounded-lg border border-gray-200 sticky top-4">
              {/* Cart Items */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-texthead mb-4 flex items-center gap-2">
                  <HiOutlineShoppingBag className="text-blue-600" />
                  Your Order ({cartItems.length} items)
                </h2>

                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item?._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <Link
                          to={`/productdetail/${item?._id}`}
                          className="text-sm inline-block font-medium text-texthead hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {item?.title}
                        </Link>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">
                            Qty: {item?.quantity}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-texthead flex items-center gap-1">
                              <FaBangladeshiTakaSign className="text-xs" />
                              {Math.ceil(
                                (item?.discountValue > 0
                                  ? item?.salePrice
                                  : item?.price) * item?.quantity
                              )}
                            </span>
                            {item?.discountValue > 0 && (
                              <span className="text-xs text-red-500 line-through">
                                ৳{Math.ceil(item?.price * item?.quantity)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          dispatch(deleteFromCart({ _id: item._id }))
                        }
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                        title="Remove item"
                      >
                        <MdOutlineDeleteForever className="text-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-texthead mb-4 flex items-center gap-2">
                  <MdSecurity className="text-green-600" />
                  Payment Method
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === "cash_on_delivery"}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-2">
                      <FaMobileAlt className="text-green-600" />
                      <div>
                        <h4 className="font-medium">Cash on Delivery</h4>
                        <p className="text-xs text-gray-600">
                          Pay when you receive
                        </p>
                      </div>
                    </div>
                  </label>
                  {/* 
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={formData.paymentMethod === "bkash"}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-2">
                      <FaMobileAlt className="text-pink-600" />
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <span className="text-pink-600 font-bold">bKash</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Instant</span>
                        </h4>
                        <p className="text-xs text-gray-600">Mobile banking payment</p>
                      </div>
                    </div>
                  </label> */}

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="sslcommerz"
                      checked={formData.paymentMethod === "sslcommerz"}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-2">
                      <FaCreditCard className="text-blue-600" />
                      <div>
                        <h4 className="font-medium">Online Payment</h4>
                        <p className="text-xs text-gray-600">
                          Secure online payment
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold flex items-center gap-1">
                    <FaBangladeshiTakaSign className="text-sm" />
                    {calculateSubtotal()}
                  </span>
                </div>

                {/* Coupon Discount */}
                {couponData && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Coupon Discount ({couponData.coupon})</span>
                    <span className="font-semibold flex items-center gap-1">
                      <FaMinus className="text-xs" />
                      <FaBangladeshiTakaSign className="text-sm" />
                      {Math.ceil(calculateCouponDiscount())}
                    </span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-700">Shipping</span>
                    {formData.deliveryType === "express" && (
                      <span className="block text-xs text-blue-600">
                        Express Delivery (24 Hours)
                      </span>
                    )}
                    {formData.deliveryType === "normal" && (
                      <span className="block text-xs text-blue-600">
                        Normal Delivery (2-3 Days)
                      </span>
                    )}
                    {hasFreeShipping && formData.deliveryType === "normal" && (
                      <span className="block text-xs text-green-600">
                        Free shipping applied
                      </span>
                    )}
                    {hasFreeShipping && formData.deliveryType === "express" && (
                      <span className="block text-xs text-orange-600">
                        Free shipping not available for express
                      </span>
                    )}
                  </div>
                  <span className="font-semibold flex items-center gap-1">
                    {hasFreeShipping && formData.deliveryType === "normal" ? (
                      <span className="text-green-600 font-bold">FREE</span>
                    ) : (
                      <>
                        <FaBangladeshiTakaSign className="text-sm" />
                        {getShippingCost()}
                      </>
                    )}
                  </span>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-texthead">Total</span>
                    <span className="text-green-600 flex items-center gap-1">
                      <FaBangladeshiTakaSign />
                      {calculateTotalCost()}
                    </span>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <MdLocalShipping className="text-blue-600" />
                    <span className="text-blue-800">
                      Estimated delivery:{" "}
                      {formData.deliveryType === "express"
                        ? "24 hours"
                        : "2-3 days"}
                    </span>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <MdSecurity className="inline mr-1" />
                    Your personal data will be used to process your order and
                    support your experience. Read our{" "}
                    <Link
                      to="/privacy-policy"
                      className="text-blue-600 hover:underline"
                    >
                      privacy policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {/* Back to Cart Button */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => navigate("/cart")}
                  className="w-full py-3 flex items-center justify-center bg-gray-100 text-texthead font-medium hover:bg-gray-200 transition-colors rounded-lg"
                >
                  <TiArrowBackOutline className="mr-2" />
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </Containar>
    </section>
  );
};

export default CheckoutForm;
