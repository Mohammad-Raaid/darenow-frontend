import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const RestaurantLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if restaurant is already logged in
    const restaurantToken = localStorage.getItem('restaurantToken');
    const restaurant = localStorage.getItem('restaurant');
    if (restaurantToken && restaurant) {
      navigate('/restaurant/bookings', { replace: true });
      return;
    }
    
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (adminToken && user) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const encodedEmail = encodeURIComponent(formData.email.trim());
      const encodedPassword = encodeURIComponent(formData.password);
      const response = await api.get(
        `/place/login/email/${encodedEmail}/password/${encodedPassword}`
      );

      // API returns { placeData: {...}, token: "..." } or { data: { placeData: {...}, token: "..." } }
      const responseData = response.data?.data || response.data;
      const restaurantData = responseData?.placeData || responseData;
      const token = responseData?.token || response.data?.token;
      
      if (!restaurantData) {
        setError('Invalid response from server. Please try again.');
        return;
      }
      
      // Store restaurant login info separately from admin login
      // If token is returned, use it; otherwise use the admin token if available
      if (token) {
        localStorage.setItem('restaurantToken', token);
      } else {
        // Fall back to admin token if available
        const adminToken = localStorage.getItem('token');
        if (adminToken) {
          localStorage.setItem('restaurantToken', adminToken);
        } else {
          setError('Authentication token not received. Please try again.');
          return;
        }
      }
      
      // Store the entire response structure to preserve placeData structure
      localStorage.setItem('restaurant', JSON.stringify(responseData || response.data));
      
      // Trigger event to update navbar
      window.dispatchEvent(new Event('restaurantLogin'));
      
      navigate('/restaurant/bookings');
    } catch (error) {
      console.error('Restaurant login error:', error);
      if (error.response?.status === 400) {
        setError('Unauthorized user');
        return;
      }

      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.responseMsg || 
                          error.response?.data?.error ||
                          error.message || 
                          'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Restaurant Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your restaurant bookings
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#EB422B] hover:bg-[#EB422B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EB422B] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-900"
            >
              Admin Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantLogin;

