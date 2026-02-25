// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://bookwormm.netlify.app/api/v1", // Replace with your API base URL
  withCredentials: true, // Optional: if using cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token or other headers here
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handler
    return Promise.reject(error);
  }
);

export default axiosInstance;
