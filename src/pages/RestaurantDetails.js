import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ConfirmationModal from '../components/ConfirmationModal';
import Sidebar from '../components/Sidebar';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchRestaurant = useCallback(async () => {
    try {
      const response = await api.get(`/place/${id}`);
      const restaurantData = response.data?.data || response.data;
      setRestaurant(restaurantData);
    } catch (error) {
      setError('Failed to fetch restaurant details');
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/place/${id}`);
      setDeleteModal(false);
      navigate('/restaurants');
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to delete restaurant');
      console.error('Error deleting restaurant:', error);
      setDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
              <Link
                to="/restaurants"
                className="text-blue-600 hover:text-blue-900"
              >
                ← Back to Restaurants
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <p className="text-gray-500 text-lg">Restaurant not found.</p>
              <Link
                to="/restaurants"
                className="text-blue-600 hover:text-blue-900"
              >
                ← Back to Restaurants
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <Link
              to="/restaurants"
              className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
            >
              ← Back to Restaurants
            </Link>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
              <div className="flex space-x-3">
                <Link
                  to={`/restaurants/edit/${id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Mobile Number</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.mobileNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.description || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Type</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.placeType || 'RESTAURANT'}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-8 border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Location</h2>
                  {restaurant.latitude && restaurant.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-[#EB422B] text-white text-sm font-medium rounded-md hover:bg-[#EB422B] transition-colors"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View on Map
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Latitude</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.latitude || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Longitude</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.longitude || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Operating Hours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Opening Time</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.openingTime || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Closing Time</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.closingTime || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Meal Times */}
              {(restaurant.breakfast || restaurant.lunch || restaurant.dinner) && (
                <div className="mb-8 border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Meal Times</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {restaurant.breakfast && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Breakfast</label>
                        {restaurant.breakfast.available ? (
                          <p className="mt-1 text-sm text-gray-900">
                            {restaurant.breakfast.startTime} - {restaurant.breakfast.endTime}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">Not Serviceable</p>
                        )}
                      </div>
                    )}
                    {restaurant.lunch && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Lunch</label>
                        {restaurant.lunch.available ? (
                          <p className="mt-1 text-sm text-gray-900">
                            {restaurant.lunch.startTime} - {restaurant.lunch.endTime}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">Not Serviceable</p>
                        )}
                      </div>
                    )}
                    {restaurant.dinner && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Dinner</label>
                        {restaurant.dinner.available ? (
                          <p className="mt-1 text-sm text-gray-900">
                            {restaurant.dinner.startTime} - {restaurant.dinner.endTime}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500">Not Serviceable</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Price for Two</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.forTwo || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Rating</label>
                    <div className="mt-1 flex items-center">
                      <span className="text-yellow-500">
                        {'★'.repeat(Math.floor(restaurant.ratting || 0))}
                        {'☆'.repeat(5 - Math.floor(restaurant.ratting || 0))}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">({restaurant.ratting || 0})</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Offer Percentage</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.offerPercentage || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Coupon Percentage</label>
                    <p className="mt-1 text-sm text-gray-900">{restaurant.couponPercentage || 'N/A'}</p>
                  </div>
                  {restaurant.tableBookingTerms && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Table Booking Terms</label>
                      <p className="mt-1 text-sm text-gray-900">{restaurant.tableBookingTerms}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              <div className="mb-8 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
                
                {/* Logo */}
                {restaurant.logo && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Logo</label>
                    <div className="flex flex-wrap gap-4">
                      <img
                        src={restaurant.logo}
                        alt="Restaurant Logo"
                        className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Detail Images */}
                {(() => {
                  const detailImages = Array.isArray(restaurant.detailImage) 
                    ? restaurant.detailImage 
                    : restaurant.detailImage 
                      ? [restaurant.detailImage] 
                      : [];
                  
                  return detailImages.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Detail Images ({detailImages.length})
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {detailImages.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Detail image ${index + 1}`}
                            className="h-48 w-48 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(imageUrl, '_blank')}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Food Menu Images */}
                {restaurant.foodMenuImages && Array.isArray(restaurant.foodMenuImages) && restaurant.foodMenuImages.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Food Menu Images ({restaurant.foodMenuImages.length})
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {restaurant.foodMenuImages.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Food menu image ${index + 1}`}
                          className="h-48 w-48 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(imageUrl, '_blank')}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Beverages Menu Images */}
                {restaurant.beveragesMenuImages && Array.isArray(restaurant.beveragesMenuImages) && restaurant.beveragesMenuImages.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Beverages Menu Images ({restaurant.beveragesMenuImages.length})
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {restaurant.beveragesMenuImages.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Beverages menu image ${index + 1}`}
                          className="h-48 w-48 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(imageUrl, '_blank')}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Show message if no images */}
                {!restaurant.logo && 
                 !restaurant.detailImage && 
                 (!restaurant.foodMenuImages || restaurant.foodMenuImages.length === 0) && 
                 (!restaurant.beveragesMenuImages || restaurant.beveragesMenuImages.length === 0) && (
                  <p className="text-sm text-gray-500">No images uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Restaurant"
        message="Are you sure you want to delete this restaurant? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="warning"
      />
        </div>
    </div>
  );
};

export default RestaurantDetails;






