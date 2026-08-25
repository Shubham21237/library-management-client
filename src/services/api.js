import axios from 'axios';

// Dynamically target production Render API URL or local proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://library-management-server-dzx8.onrender.com/api' 
    : '/api');

// Create configured Axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * @desc Request Interceptor: Automatically inject Bearer Token into headers
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('library_user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * @desc Response Interceptor: Handle global API errors (e.g. Token Expiration)
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired auth session
      localStorage.removeItem('library_user_token');
      localStorage.removeItem('library_user_data');
    }
    return Promise.reject(error);
  }
);

export default API;
