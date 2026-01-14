import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all fields');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      setPasswordLoading(false);
      return;
    }

    try {
      const username = encodeURIComponent(user?.username || user?.name || '');
      const currentPassword = encodeURIComponent(passwordForm.currentPassword);
      const newPassword = encodeURIComponent(passwordForm.newPassword);

      await api.put(`/admin/changePassword/username/${username}/currentpassword/${currentPassword}/newPassword/${newPassword}`);

      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const status = error.response?.status;
      
      if (status === 500) {
        setPasswordError('Something went wrong');
      } else if (status === 400) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            'Invalid request. Please check your input.';
        setPasswordError(errorMessage);
      } else {
        setPasswordError(error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to update password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Update Password</h1>
            <p className="mt-2 text-gray-600">
              Change your account password to keep your account secure.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              {passwordError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    required
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    required
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    minLength="6"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters long</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-[#EB422B] text-white px-4 py-2 rounded-md hover:bg-[#EB422B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default UpdatePassword;




