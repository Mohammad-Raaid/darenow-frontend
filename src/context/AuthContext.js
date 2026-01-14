import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token,
          user: JSON.parse(user),
        },
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (username, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const encodedUsername = encodeURIComponent(username);
      const encodedPassword = encodeURIComponent(password);
      const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://ec2-3-111-88-208.ap-south-1.compute.amazonaws.com:3000/api';
      const response = await axios.get(`${API_URL}/admin/login/username/${encodedUsername}/password/${encodedPassword}`);

      // API returns JSON with token and adminData
      const token = response.data?.data?.token;
      const adminData = response.data?.data?.adminData;
      const user = {
        username: adminData?.userName || username,
        name: adminData?.userName || username, // Add name field for dashboard display
        isAdmin: true,
        adminData
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAIL' });
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/auth/register', { name, email, password });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAIL' });
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email',
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.post('/auth/reset-password', { token, password });
      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};