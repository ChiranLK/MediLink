import axios from "axios";

// All requests go through API Gateway on port 5001 (Docker mapping: 5001:5000)
const API_GATEWAY_URL = "http://localhost:5001";

const customFetch = axios.create({
  baseURL: API_GATEWAY_URL,
});

// Add request interceptor to include token
customFetch.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
customFetch.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if user was actually on a protected page (not on sign-in page)
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/signin') && !currentPath.includes('/signup') && sessionStorage.getItem('token')) {
        // Clear token and redirect to signin if unauthorized on a protected page
        sessionStorage.removeItem("token");
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default customFetch;
