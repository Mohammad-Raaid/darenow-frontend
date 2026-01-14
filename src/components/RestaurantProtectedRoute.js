import React from 'react';
import { Navigate } from 'react-router-dom';

const RestaurantProtectedRoute = ({ children }) => {
  const restaurantToken = localStorage.getItem('restaurantToken');
  const restaurant = localStorage.getItem('restaurant');

  if (!restaurantToken || !restaurant) {
    return <Navigate to="/restaurant/login" replace />;
  }

  return children;
};

export default RestaurantProtectedRoute;






