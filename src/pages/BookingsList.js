import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import ConfirmationModal from '../components/ConfirmationModal';

const BookingsList = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [restaurant, setRestaurant] = useState(null);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, bookingId: null });

  useEffect(() => {
    // Check if restaurant is logged in
    const restaurantToken = localStorage.getItem('restaurantToken');
    const restaurantData = localStorage.getItem('restaurant');
    
    if (!restaurantToken || !restaurantData) {
      navigate('/restaurant/login', { replace: true });
      return;
    }

    try {
      const parsedData = JSON.parse(restaurantData);
      // Set restaurant to placeData if it exists, otherwise use the whole object
      setRestaurant(parsedData?.placeData || parsedData);
    } catch (e) {
      navigate('/restaurant/login', { replace: true });
    }
  }, [navigate]);

  const fetchBookings = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const restaurantData = JSON.parse(localStorage.getItem('restaurant'));
      // Handle both structures: { placeData: { placeId: ... } } or { placeId: ... }
      const placeId = restaurantData?.placeData?.placeId || restaurantData?.placeId || restaurantData?.id;
      
      if (!placeId) {
        setError('Restaurant ID not found');
        console.error('Restaurant data:', restaurantData);
        return;
      }

      // Ensure page is at least 1
      const safePage = Math.max(1, page);
      // Try 1-based first (most common), API might also use 0-based
      const response = await api.get(
        `/table-booking/place/${placeId}?pageNo=${safePage}&pageSize=${pageSize}`
      );
      
      // Extract bookings from response.data.data.content
      const bookingsData = response.data?.data?.content || response.data?.data || response.data || [];
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      
      console.log('Bookings response:', {
        bookingsData,
        responseData: response.data,
        totalPages: response.data?.data?.totalPages,
        totalElements: response.data?.data?.totalElements
      });
      
      // Extract pagination info from response.data.data
      if (response.data?.data?.totalPages !== undefined) {
        setTotalPages(response.data.data.totalPages);
        setTotalElements(response.data.data.totalElements || 0);
      } else if (response.data?.totalPages) {
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.total || 0);
      } else if (response.data?.total) {
        setTotalPages(Math.ceil(response.data.total / pageSize));
        setTotalElements(response.data.total);
      } else {
        setTotalPages(1);
        setTotalElements(bookingsData.length);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.responseMsg || error.message || 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('Error fetching bookings:', {
        error,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status
      });
      setBookings([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    if (restaurant) {
      fetchBookings(pageNo);
    }
  }, [restaurant, pageNo, fetchBookings]);

  const handleCancel = (bookingId) => {
    setCancelModal({ isOpen: true, bookingId });
  };

  const confirmCancel = async () => {
    if (cancelModal.bookingId) {
      try {
        await api.delete(`/table-booking/${cancelModal.bookingId}`);
        setCancelModal({ isOpen: false, bookingId: null });
        fetchBookings(pageNo);
      } catch (error) {
        setError(error.response?.data?.message || error.message || 'Failed to cancel booking');
        console.error('Error canceling booking:', error);
        setCancelModal({ isOpen: false, bookingId: null });
      }
    }
  };

  const handlePageChange = (newPage) => {
    const safePage = Math.max(1, Math.min(newPage, totalPages || 1));
    if (safePage >= 1) {
      setPageNo(safePage);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Restaurant Bookings</h1>
                {restaurant && (
                  <p className="mt-2 text-gray-600">
                    {restaurant.name || 'Restaurant'}
                  </p>
                )}
              </div>
              <Link
                to="/restaurant/create-booking"
                className="bg-[#EB422B] text-white px-4 py-2 rounded-md hover:bg-[#EB422B] transition-colors"
              >
                Create Booking
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slot Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Meal Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked From
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.tableBookingId || booking.bookingId || booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{booking.tableBookingId || booking.bookingId || booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.bookingDate 
                          ? new Date(booking.bookingDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.slotTime || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {booking.mealType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.guestCount || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.bookedFrom || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleCancel(booking.tableBookingId || booking.bookingId || booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {bookings.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No bookings found.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 0 && (
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
                    {totalElements > 0 && (
                      <span className="ml-2">
                        ({totalElements} total {totalElements === 1 ? 'booking' : 'bookings'})
                      </span>
                    )}
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

      {/* Cancel Booking Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, bookingId: null })}
        onConfirm={confirmCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        type="warning"
      />

    </div>
  );
};

export default BookingsList;

