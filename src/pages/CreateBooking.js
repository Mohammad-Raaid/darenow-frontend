import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bookingDate: '',
    mealType: '',
    slotTime: '',
    guestCount: 2,
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [availableMealTypes, setAvailableMealTypes] = useState([]);

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
      const restaurantData_parsed = parsedData?.placeData || parsedData;
      setRestaurant(restaurantData_parsed);
      
      // Get available meal types from restaurant data
      const mealTypes = [];
      if (restaurantData_parsed?.breakfast?.available) {
        mealTypes.push({ value: 'breakfast', label: 'Breakfast' });
      }
      if (restaurantData_parsed?.lunch?.available) {
        mealTypes.push({ value: 'lunch', label: 'Lunch' });
      }
      if (restaurantData_parsed?.dinner?.available) {
        mealTypes.push({ value: 'dinner', label: 'Dinner' });
      }
      setAvailableMealTypes(mealTypes);
      
      // Set initial meal type to first available if not set
      if (mealTypes.length > 0) {
        setFormData(prev => {
          if (!prev.mealType) {
            return { ...prev, mealType: mealTypes[0].value };
          }
          return prev;
        });
      }
    } catch (e) {
      navigate('/restaurant/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch slots when date or meal type changes
    if (formData.bookingDate && formData.mealType && restaurant) {
      fetchSlots();
    } else {
      setSlots([]);
      setFormData(prev => ({ ...prev, slotTime: '' }));
    }
  }, [formData.bookingDate, formData.mealType, restaurant]);

  const fetchSlots = async () => {
    if (!formData.bookingDate || !formData.mealType || !restaurant) return;

    setLoadingSlots(true);
    setError('');
    
    try {
      // Handle both structures: { placeData: { placeId: ... } } or { placeId: ... }
      const placeId = restaurant?.placeId || restaurant?.id;
      if (!placeId) {
        setError('Restaurant ID not found');
        console.error('Restaurant data:', restaurant);
        return;
      }

      // Format date as DD-MM-YYYY
      const dateParts = formData.bookingDate.split('-');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      
      const response = await api.get(
        `/place/${placeId}/slots?date=${formattedDate}&meal=${formData.mealType.toLowerCase()}`
      );
      
      // Extract slots from response.data.data array
      // Each slot has { booked: false, slot: "08:32 AM" }
      const slotsData = response.data?.data || [];
      // Filter out booked slots and extract slot time
      const availableSlots = slotsData
        .filter(slotObj => !slotObj.booked)
        .map(slotObj => slotObj.slot);
      setSlots(availableSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
      // Don't show error for slots, just show empty list
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'guestCount' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Handle both structures: { placeData: { placeId: ... } } or { placeId: ... }
      const placeId = restaurant?.placeId || restaurant?.id;
      if (!placeId) {
        setError('Restaurant ID not found');
        console.error('Restaurant data:', restaurant);
        return;
      }

      if (!formData.slotTime) {
        setError('Please select a slot time');
        return;
      }

      // Format booking date as ISO string
      const bookingDate = formData.bookingDate 
        ? new Date(formData.bookingDate + 'T00:00:00').toISOString()
        : new Date().toISOString();

      const payload = {
        placeId: parseInt(placeId),
        bookingDate,
        slotTime: formData.slotTime,
        mealType: formData.mealType,
        guestCount: parseInt(formData.guestCount) || 2,
        bookedFrom: 'DARENOW',
      };

      await api.post('/table-booking', payload);
      navigate('/restaurant/bookings');
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to create booking');
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Booking</h1>
            <p className="mt-2 text-gray-600">
              Create a new table booking for {restaurant?.name || 'restaurant'}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700">
                    Booking Date *
                  </label>
                  <input
                    type="date"
                    name="bookingDate"
                    id="bookingDate"
                    required
                    value={formData.bookingDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="mealType" className="block text-sm font-medium text-gray-700">
                    Meal Type *
                  </label>
                  <select
                    name="mealType"
                    id="mealType"
                    required
                    value={formData.mealType}
                    onChange={handleChange}
                    disabled={availableMealTypes.length === 0}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {availableMealTypes.length === 0 ? (
                      <option value="">No meal types available</option>
                    ) : (
                      <>
                        <option value="">Select meal type</option>
                        {availableMealTypes.map((meal) => (
                          <option key={meal.value} value={meal.value}>
                            {meal.label}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {availableMealTypes.length === 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Please configure meal times in restaurant settings
                    </p>
                  )}
                </div>
              </div>

              {/* Slots Section */}
              {formData.bookingDate && formData.mealType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Slots *
                  </label>
                  {loadingSlots ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading slots...</p>
                    </div>
                  ) : slots.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {slots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({ ...formData, slotTime: slot })}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            formData.slotTime === slot
                              ? 'bg-[#EB422B] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <p className="text-sm text-yellow-800">
                        No slots available for {formData.mealType} on {new Date(formData.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {formData.slotTime && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: <span className="font-medium">{formData.slotTime}</span>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700">
                  Guest Count *
                </label>
                <input
                  type="number"
                  name="guestCount"
                  id="guestCount"
                  required
                  min="1"
                  value={formData.guestCount}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/restaurant/bookings')}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.slotTime}
                  className="bg-[#EB422B] text-white px-4 py-2 rounded-md hover:bg-[#EB422B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;

