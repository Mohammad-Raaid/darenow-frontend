import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const MallCoupons = () => {
    const { id: mallId } = useParams();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mallName, setMallName] = useState('');

    const fetchMallData = useCallback(async () => {
        try {
            // First fetch mall details to show the name
            const mallRes = await api.get(`/malls/${mallId}`);
            setMallName(mallRes.data?.data?.mallName || mallRes.data?.mallName || 'Mall');

            // Then fetch coupons for this mall
            setLoading(true);
            setError('');
            const response = await api.get(`/admin/coupons/mall/${mallId}`);

            const couponsData = response.data?.data || response.data || [];
            setCoupons(Array.isArray(couponsData) ? couponsData : []);
        } catch (err) {
            console.error('Error fetching mall coupons:', err);
            setError(err.response?.data?.message || 'Failed to load coupons for this mall');
        } finally {
            setLoading(false);
        }
    }, [mallId]);

    useEffect(() => {
        fetchMallData();
    }, [fetchMallData]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#EB422B]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <Link to="/malls" className="text-[#EB422B] hover:underline text-sm font-medium mb-2 inline-block flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Malls
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mall Coupons</h1>
                        <p className="text-gray-500 mt-1">Available coupons for <span className="text-[#EB422B] font-bold">{mallName}</span></p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mb-6">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl overflow-hidden shadow-premium">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#fdfdfd] border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Code</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Benefit</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Usage</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Validity</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {coupons.length > 0 ? (
                                        coupons.map((coupon) => (
                                            <tr key={coupon.couponId} className="hover:bg-red-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-black text-[#EB422B] bg-red-50/80 px-3 py-1.5 rounded-md border border-red-100/50 inline-block shadow-sm">
                                                        {coupon.code}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-base font-bold text-gray-900">₹{coupon.value} OFF</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-600">{coupon.usedCount} of {coupon.usageLimit} Redeemed</span>
                                                        <div className="w-32 bg-gray-100 rounded-full h-2 mt-2 overflow-hidden border border-gray-100">
                                                            <div
                                                                className="bg-gradient-to-r from-[#EB422B] to-[#ff6a56] h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-gray-500 space-y-1">
                                                        <div className="flex items-center">
                                                            <span className="w-10 text-gray-400 font-semibold uppercase tracking-tighter">Till</span>
                                                            <span className="font-medium text-gray-700">{formatDate(coupon.validTill)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight shadow-sm ${coupon.active && !coupon.deleted
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${coupon.active && !coupon.deleted ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        {coupon.active && !coupon.deleted ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/coupons/${coupon.couponId}`}
                                                        className="text-blue-600 hover:text-blue-900 font-semibold text-sm"
                                                    >
                                                        Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-gray-500 font-medium">No coupons found for this mall.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MallCoupons;
