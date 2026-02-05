import axios from 'axios';
// test

const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://ec2-3-111-88-208.ap-south-1.compute.amazonaws.com:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if this is a restaurant-specific route
    const isRestaurantRoute = config.url?.includes('/table-booking') ||
      config.url?.includes('/place/login') ||
      config.url?.includes('/place/') && config.url?.includes('/slots');

    // Use restaurant token for restaurant routes, otherwise use regular token
    const token = isRestaurantRoute
      ? (localStorage.getItem('restaurantToken') || localStorage.getItem('token'))
      : localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if this is a public route that doesn't require authentication
      const isPublicRoute = error.config?.url?.includes('/place/search');

      // Don't redirect for public routes, just return the error
      if (isPublicRoute) {
        return Promise.reject(error);
      }

      // Check if this is a restaurant route
      const isRestaurantRoute = error.config?.url?.includes('/table-booking') ||
        error.config?.url?.includes('/place/login') ||
        (error.config?.url?.includes('/place/') && error.config?.url?.includes('/slots'));

      if (isRestaurantRoute) {
        localStorage.removeItem('restaurantToken');
        localStorage.removeItem('restaurant');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/restaurant/login') {
          window.location.href = '/restaurant/login';
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login page or home page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;