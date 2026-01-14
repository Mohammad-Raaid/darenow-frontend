import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ConfirmationModal from '../components/ConfirmationModal';
import Sidebar from '../components/Sidebar';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearch, setCurrentSearch] = useState(''); // The actual search term used in API call
  const [error, setError] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, restaurantId: null });

  const fetchRestaurants = useCallback(async (search = '', page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      // Use "Res" for restaurant type when search is empty, otherwise use the search term
      const searchQuery = search.trim();
      const searchParam = searchQuery || 'Res';
      const response = await api.get(
        `/place/search/${encodeURIComponent(searchParam)}/pageNo/${page}/pageSize/${pageSize}`
      );
      
      // Handle different possible response structures
      const restaurantsData = response.data?.data || response.data || [];
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
      
      // Update pagination info if available in response
      if (response.data?.totalPages) {
        setTotalPages(response.data.totalPages);
      } else if (response.data?.total) {
        setTotalPages(Math.ceil(response.data.total / pageSize));
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to fetch restaurants');
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Initial fetch on mount with empty search string
  useEffect(() => {
    fetchRestaurants('', 1);
  }, []); // Only run on mount

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, restaurantId: id });
  };

  const confirmDelete = async () => {
    if (deleteModal.restaurantId) {
      try {
        await api.delete(`/place/${deleteModal.restaurantId}`);
        setDeleteModal({ isOpen: false, restaurantId: null });
        fetchRestaurants(currentSearch, pageNo);
      } catch (error) {
        setError(error.response?.data?.message || error.message || 'Failed to delete restaurant');
        console.error('Error deleting restaurant:', error);
        setDeleteModal({ isOpen: false, restaurantId: null });
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentSearch(searchTerm);
    setPageNo(1); // Reset to first page when searching
    fetchRestaurants(searchTerm, 1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentSearch('');
    setPageNo(1);
    fetchRestaurants('', 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNo(newPage);
      fetchRestaurants(currentSearch, newPage);
    }
  };

  if (loading && restaurants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
              <Link
                to="/restaurants/create"
                className="bg-[#EB422B] text-white px-4 py-2 rounded-md hover:bg-[#EB422B] transition-colors"
              >
                Add New Restaurant
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            {currentSearch && (
              <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm text-blue-800">
                    <span className="font-medium">Active search:</span> "{currentSearch}"
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                >
                  Clear search
                </button>
              </div>
            )}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    currentSearch ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                />
              </div>
              <div className="flex gap-2">
                {currentSearch && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#EB422B] text-white px-4 py-2 rounded-md hover:bg-[#EB422B] transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Restaurants Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant.id || restaurant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {restaurant.image && (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`http://localhost:5001/uploads/${restaurant.image}`}
                              alt={restaurant.name}
                            />
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {restaurant.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {restaurant.description || restaurant.email || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {restaurant.address || restaurant.location || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {restaurant.placeType || 'RESTAURANT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="text-yellow-500">
                            {'★'.repeat(Math.floor(restaurant.ratting || 0))}
                            {'☆'.repeat(5 - Math.floor(restaurant.ratting || 0))}
                          </span>
                          <span className="ml-2 text-gray-500">({restaurant.ratting || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/restaurants/${restaurant.id || restaurant._id || restaurant.placeId}`}
                            className="text-green-600 hover:text-green-900 whitespace-nowrap"
                          >
                            View
                          </Link>
                          <Link
                            to={`/restaurants/edit/${restaurant.id || restaurant._id || restaurant.placeId}`}
                            className="text-blue-600 hover:text-blue-900 whitespace-nowrap"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(restaurant.id || restaurant._id || restaurant.placeId)}
                            className="text-red-600 hover:text-red-900 whitespace-nowrap"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {restaurants.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No restaurants found.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pageNo - 1)}
                  disabled={pageNo === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pageNo + 1)}
                  disabled={pageNo === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pageNo}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pageNo - 1)}
                      disabled={pageNo === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= pageNo - 1 && page <= pageNo + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNo
                                ? 'z-10 bg-[#EB422B] border-[#EB422B] text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === pageNo - 2 || page === pageNo + 2) {
                        return (
                          <span
                            key={page}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() => handlePageChange(pageNo + 1)}
                      disabled={pageNo === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, restaurantId: null })}
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

export default RestaurantList;