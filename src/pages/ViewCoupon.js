import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Sidebar from '../components/Sidebar';

const ViewCoupon = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [coupon, setCoupon] = useState(null);
    const [malls, setMalls] = useState([]);
    const [usageData, setUsageData] = useState({ claimedUsers: [], redeemedUsers: [] });
    const [loading, setLoading] = useState(true);
    const [loadingUsage, setLoadingUsage] = useState(false);

    const fetchMalls = useCallback(async () => {
        try {
            const response = await api.get('/malls');
            const mallData = response.data?.data?.content || response.data?.data || response.data;
            if (Array.isArray(mallData)) {
                setMalls(mallData);
            }
        } catch (error) {
            console.error('Error fetching malls:', error);
        }
    }, []);

    const fetchCoupon = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/coupons/${id}`);
            setCoupon(response.data?.data || response.data);
        } catch (error) {
            console.error('Error fetching coupon:', error);
            showToast('Failed to load coupon details', 'error');
            navigate('/coupons');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, showToast]);

    const fetchUsage = useCallback(async () => {
        try {
            setLoadingUsage(true);
            const response = await api.get(`/admin/coupons/usage/${id}`);
            setUsageData(response.data?.data || { claimedUsers: [], redeemedUsers: [] });
        } catch (error) {
            console.error('Error fetching coupon usage:', error);
        } finally {
            setLoadingUsage(false);
        }
    }, [id]);

    useEffect(() => {
        fetchMalls();
        fetchCoupon();
        fetchUsage();
    }, [fetchMalls, fetchCoupon, fetchUsage]);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMallNames = () => {
        if (!coupon?.applicableMallIds || coupon.applicableMallIds.length === 0) return 'All Malls';
        return malls
            .filter(m => coupon.applicableMallIds.map(Number).includes(Number(m.mallId)))
            .map(m => m.mallName)
            .join(', ') || 'Global';
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

    const usagePercentage = Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100) || 0;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <Link to="/coupons" className="text-[#EB422B] hover:underline text-sm font-medium mb-2 inline-block flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Coupons
                            </Link>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coupon Details</h1>
                            <p className="text-gray-500 mt-1">Viewing information for coupon code: <span className="text-[#EB422B] font-bold">{coupon.code}</span></p>
                        </div>
                        {coupon.usedCount === 0 && new Date(coupon.validFrom) > new Date() && (
                            <div className="flex gap-3">
                                <Link
                                    to={`/coupons/edit/${id}`}
                                    className="bg-[#EB422B] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#d43b26] transition-all shadow-md"
                                >
                                    Edit Coupon
                                </Link>
                            </div>
                        )}

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Stats Card */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-8">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Usage Performance</h3>
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <p className="text-4xl font-black text-gray-900">{coupon.usedCount || 0}</p>
                                        <p className="text-sm text-gray-500 font-medium">Redemptions used out of {coupon.usageLimit}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-[#EB422B]">{Math.round(usagePercentage)}%</p>
                                        <p className="text-sm text-gray-400 font-medium">Limit Reached</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                                    <div
                                        className="bg-[#EB422B] h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${usagePercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-8">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">General Information</h3>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Coupon Code</p>
                                        <p className="text-lg font-bold text-gray-900 tracking-tight">{coupon.code}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Discount Value</p>
                                        <p className="text-lg font-bold text-[#EB422B]">₹{coupon.value}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Start Date</p>
                                        <p className="text-sm font-medium text-gray-700">{formatDate(coupon.validFrom)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Expiry Date</p>
                                        <p className="text-sm font-medium text-gray-700">{formatDate(coupon.validTill)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Steps Required</p>
                                        <p className="text-sm font-bold text-gray-900">{coupon.stepsRequired || 0} Steps</p>
                                    </div>
                                </div>
                            </div>

                            {/* Coupon Image Card */}
                            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-8">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Coupon Image</h3>
                                {coupon.CouponsImage ? (
                                    <div className="max-w-xs">
                                        <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="aspect-square relative bg-gray-100">
                                                <img
                                                    src={coupon.CouponsImage}
                                                    alt="Coupon Image"
                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => window.open(coupon.CouponsImage, '_blank')}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-400 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Click to view full size
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                        <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm text-gray-500 font-medium">No image uploaded</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Info Card */}
                        <div className="space-y-6">
                            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Status</h3>
                                <div className="flex items-center">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-tight shadow-sm ${coupon.active
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                        }`}>
                                        <span className={`h-2 w-2 rounded-full mr-2 ${coupon.active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {coupon.active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                                <div className="mt-6">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">Applicable Malls</p>
                                    <div className="flex flex-wrap gap-2">
                                        {coupon.applicableMallIds && coupon.applicableMallIds.length > 0 ? (
                                            malls.filter(m => coupon.applicableMallIds.map(Number).includes(Number(m.mallId))).map(m => (
                                                <span key={m.mallId} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                                                    {m.mallName}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold border border-gray-100">
                                                Global / All Malls
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-4">Quick Summary</p>
                                <p className="text-sm leading-relaxed text-gray-300">
                                    This coupon <span className="text-white font-bold">{coupon.code}</span> offers a flat discount of <span className="text-[#EB422B] font-bold">₹{coupon.value}</span>.
                                    It is currently <span className={coupon.active ? "text-green-400 font-bold" : "text-gray-400 font-bold"}>{coupon.active ? 'live' : 'disabled'}</span> and has been redeemed by <span className="text-white font-bold">{coupon.usedCount || 0}</span> users.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Usage Table Section */}
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
                                <span className="w-10 h-10 bg-[#EB422B]/10 text-[#EB422B] rounded-xl flex items-center justify-center mr-3 shadow-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </span>
                                User Redemptions
                            </h2>
                            <div className="flex gap-2 text-xs font-bold uppercase tracking-tight">
                                <div className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                    Claimed: {usageData.claimedUsers?.length || 0}
                                </div>
                                <div className="text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                    Redeemed: {usageData.redeemedUsers?.length || 0}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl overflow-hidden shadow-premium">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-[#fdfdfd]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">User Details</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Dates</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-50">
                                        {loadingUsage ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">Exploring data...</td>
                                            </tr>
                                        ) : (usageData.claimedUsers?.length > 0 || usageData.redeemedUsers?.length > 0) ? (
                                            (() => {
                                                // Create a map to de-duplicate users, prioritizing redeemed data
                                                const uniqueUsers = new Map();

                                                // Process claimed users first
                                                (usageData.claimedUsers || []).forEach(u => {
                                                    if (u.userId) uniqueUsers.set(u.userId, { ...u, source: 'CLAIMED' });
                                                });

                                                // Process redeemed users - these will overwrite claimed entries if ID matches
                                                (usageData.redeemedUsers || []).forEach(u => {
                                                    if (u.userId) uniqueUsers.set(u.userId, { ...u, source: 'REDEEMED' });
                                                });

                                                return Array.from(uniqueUsers.values());
                                            })().map((usage, idx) => (
                                                <tr key={usage.userId || idx} className="hover:bg-red-50/30 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black text-sm mr-4 border border-gray-100 group-hover:border-[#EB422B]/20 transition-colors">
                                                                {usage.username?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-gray-900 leading-none mb-1">{usage.username || 'System User'}</div>
                                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Reference #{usage.userId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${usage.redeemedAt ? 'text-green-600 bg-green-50 border-green-100' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                                            {usage.redeemedAt ? 'REDEEMED' : 'CLAIMED'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black tracking-widest shadow-sm ${usage.status === 'REDEEMED'
                                                            ? 'bg-green-100 text-green-700'
                                                            : usage.status === 'ASSIGNED'
                                                                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                                                                : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {usage.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs space-y-1">
                                                        <div className="flex items-center text-gray-500">
                                                            <span className="w-16 font-bold uppercase tracking-tighter opacity-50">Earned</span>
                                                            <span className="font-bold text-gray-700">{formatDate(usage.earnedAt)}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-500">
                                                            <span className="w-16 font-bold uppercase tracking-tighter opacity-50">Saved</span>
                                                            <span className="font-bold text-gray-700">{usage.redeemedAt ? formatDate(usage.redeemedAt) : 'Pending...'}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-24 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-200">
                                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-gray-900 font-black text-lg">No Redemptions Found</p>
                                                        <p className="text-sm text-gray-400 font-medium">This coupon hasn't been earned or used by any users yet.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ViewCoupon;
