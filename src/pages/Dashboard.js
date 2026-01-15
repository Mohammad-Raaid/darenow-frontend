import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRestaurants: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mall Analytics States
  const [malls, setMalls] = useState([]);
  const [selectedMallId, setSelectedMallId] = useState('695e4e0cb54d9221f894eef2');
  const [dateRange, setDateRange] = useState({
    from: '2026-01-01',
    to: '2027-01-31'
  });
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const restaurantsRes = await api.get('/restaurants');
      const restaurants = restaurantsRes.data.restaurants || [];

      setStats({
        totalRestaurants: restaurants.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMalls = async () => {
    try {
      const response = await api.get('/malls?pageSize=100');
      const mallData = response.data?.data?.content || [];
      setMalls(mallData);

      // If the default ID is not in the list and we have malls, 
      // maybe we should keep the default or pick the first one. 
      // Given the user request, I'll keep the default ID if it's there.
    } catch (error) {
      console.error('Error fetching malls:', error);
    }
  };

  const fetchAnalytics = useCallback(async () => {
    if (!selectedMallId) return;
    setAnalyticsLoading(true);
    try {
      const from = `${dateRange.from}T00:00:00Z`;
      const to = `${dateRange.to}T23:59:59Z`;
      const response = await api.get(`/admin/analytics/mall/${selectedMallId}?from=${from}&to=${to}`);
      setAnalytics(response.data?.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [selectedMallId, dateRange]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchMalls()]);
      await fetchAnalytics();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAnalytics();
    }
  }, [selectedMallId, dateRange, fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.name || 'Admin'}! Here's an overview of your platform.
            </p>
          </div>

          {/* Mall Analytics Section */}
          <div className="mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Mall Analytics</h2>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Mall Selector */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Select Mall</label>
                    <select
                      value={selectedMallId}
                      onChange={(e) => setSelectedMallId(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                      <option value="695e4e0cb54d9221f894eef2">Default Mall</option>
                      {malls.map((mall) => (
                        <option key={mall.mallId} value={mall.mallId}>
                          {mall.mallName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date From */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">From</label>
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    />
                  </div>

                  {/* Date To */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">To</label>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    />
                  </div>
                </div>
              </div>

              {analyticsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EB422B]"></div>
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Users Entered */}
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center gap-4">
                    <div className="bg-blue-500 p-3 rounded-lg text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600">Users Entered</p>
                      <h3 className="text-2xl font-bold text-gray-900">{analytics.usersEntered}</h3>
                    </div>
                  </div>

                  {/* Average Steps */}
                  <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-center gap-4">
                    <div className="bg-green-500 p-3 rounded-lg text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600">Avg Steps</p>
                      <h3 className="text-2xl font-bold text-gray-900">{analytics.averageSteps}</h3>
                    </div>
                  </div>

                  {/* Coupons Issued */}
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex items-center gap-4">
                    <div className="bg-purple-500 p-3 rounded-lg text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-600">Coupons Issued</p>
                      <h3 className="text-2xl font-bold text-gray-900">{analytics.couponsIssued}</h3>
                    </div>
                  </div>

                  {/* Coupons Redeemed */}
                  <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-center gap-4">
                    <div className="bg-orange-500 p-3 rounded-lg text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-600">Coupons Redeemed</p>
                      <h3 className="text-2xl font-bold text-gray-900">{analytics.couponsRedeemed}</h3>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No analytics data available for the selected range.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stats Card */}
            <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5">
                    <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Restaurants</dt>
                    <dd className="text-3xl font-extrabold text-gray-900">{stats.totalRestaurants}</dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/restaurants"
                    className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className="bg-blue-100 group-hover:bg-blue-500 p-3 rounded-lg text-blue-600 group-hover:text-white transition-colors">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900">View Restaurants</h4>
                      <p className="text-xs text-gray-500">Manage all restaurants</p>
                    </div>
                  </Link>

                  <Link
                    to="/restaurants/create"
                    className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50 transition-all group"
                  >
                    <div className="bg-green-100 group-hover:bg-green-500 p-3 rounded-lg text-green-600 group-hover:text-white transition-colors">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900">Add Restaurant</h4>
                      <p className="text-xs text-gray-500">Create new entry</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;