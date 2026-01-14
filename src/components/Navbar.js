import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [isRestaurantLoggedIn, setIsRestaurantLoggedIn] = useState(false);
  const [logoutModal, setLogoutModal] = useState({ isOpen: false, type: 'admin' }); // 'admin' or 'restaurant'

  useEffect(() => {
    // Check if restaurant is logged in
    const checkRestaurantLogin = () => {
      const restaurantToken = localStorage.getItem('restaurantToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (restaurantToken && restaurantData) {
        try {
          const parsedData = JSON.parse(restaurantData);
          const restaurantInfo = parsedData?.placeData || parsedData;
          setRestaurant(restaurantInfo);
          setIsRestaurantLoggedIn(true);
        } catch (e) {
          setIsRestaurantLoggedIn(false);
        }
      } else {
        setIsRestaurantLoggedIn(false);
      }
    };

    checkRestaurantLogin();

    // Listen for storage changes (when restaurant logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'restaurantToken' || e.key === 'restaurant') {
        checkRestaurantLogin();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus (when user switches back to tab)
    window.addEventListener('focus', checkRestaurantLogin);
    
    // Listen for custom logout and login events
    window.addEventListener('restaurantLogout', checkRestaurantLogin);
    window.addEventListener('restaurantLogin', checkRestaurantLogin);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkRestaurantLogin);
      window.removeEventListener('restaurantLogout', checkRestaurantLogin);
      window.removeEventListener('restaurantLogin', checkRestaurantLogin);
    };
  }, [location.pathname]); // Re-check when route changes

  const handleLogout = () => {
    setLogoutModal({ isOpen: true, type: 'admin' });
  };

  const handleRestaurantLogout = () => {
    setLogoutModal({ isOpen: true, type: 'restaurant' });
  };

  const confirmLogout = () => {
    if (logoutModal.type === 'restaurant') {
      localStorage.removeItem('restaurantToken');
      localStorage.removeItem('restaurant');
      setRestaurant(null);
      setIsRestaurantLoggedIn(false);
      // Trigger a custom event to update navbar in other components if needed
      window.dispatchEvent(new Event('restaurantLogout'));
      setLogoutModal({ isOpen: false, type: 'restaurant' });
      navigate('/restaurant/login');
    } else {
      logout();
      setLogoutModal({ isOpen: false, type: 'admin' });
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="w-full">
        <div className="flex justify-between h-16">
          <div className="flex items-center pl-4">
            <Link to="/login" className="flex-shrink-0 flex items-center">
              <img 
                src="/darenow-logo.png" 
                alt="DareNow Logo" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4 pr-4">
            {isRestaurantLoggedIn ? (
              <>
                <Link
                  to="/restaurant/bookings"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Bookings
                </Link>
                <Link
                  to="/restaurant/create-booking"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Create Booking
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 text-sm">Welcome, {restaurant?.name || 'Restaurant'}</span>
                  <button
                    onClick={handleRestaurantLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : isAuthenticated ? (
              <div className="flex items-center pr-4">
                <span className="text-gray-700 text-sm">Welcome, {user?.name || 'User'}</span>
              </div>
            ) : (
              <>
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contact
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center pr-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isRestaurantLoggedIn ? (
                <>
                  <Link
                    to="/restaurant/bookings"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Bookings
                  </Link>
                  <Link
                    to="/restaurant/create-booking"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Booking
                  </Link>
                  <div className="px-3 py-2">
                    <span className="text-gray-700 text-sm">Welcome, {restaurant?.name || 'Restaurant'}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleRestaurantLogout();
                      setIsMenuOpen(false);
                    }}
                    className="bg-red-600 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : isAuthenticated ? (
                null
              ) : (
                <>
                  <Link
                    to="/contact"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={logoutModal.isOpen}
        onClose={() => setLogoutModal({ isOpen: false, type: logoutModal.type })}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="info"
      />
    </nav>
  );
};

export default Navbar;