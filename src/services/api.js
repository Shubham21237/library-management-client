import axios from 'axios';

// Create configured Axios instance
const API = axios.create({
  baseURL: '/api',
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
