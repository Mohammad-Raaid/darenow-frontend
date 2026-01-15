import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import Sidebar from '../components/Sidebar';

const CouponList = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSearch, setCurrentSearch] = useState('');
    const [error, setError] = useState('');
    const [pageNo, setPageNo] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const { showToast } = useToast();
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, couponId: null });

    const fetchCoupons = useCallback(async (search = '', page = 1) => {
        try {
            setLoading(true);
            setError('');

            // Pattern from RestaurantList: /place/search/{searchParam}/pageNo/{page}/pageSize/{pageSize}
            // Applying to coupons: /admin/coupons/search/{searchParam}/pageNo/{page}/pageSize/{pageSize}

            const searchParam = search.trim() || 'all';

            // We'll try the plural "coupons" first as per your instruction  search/${encodeURIComponent(searchParam)}/pageNo/${page}/pageSize/${pageSize}
            // If you still get a Network Error, it might be the singular "coupon"
            const endpoint = `/admin/coupons`;

            console.log('Attempting to fetch coupons from:', endpoint);

            const response = await api.get(endpoint);

            console.log('Coupon API Response:', response.data);

            // Handle response structure: { data: [...], message: "...", status: 0 }
            const couponsData = response.data?.data || [];
            setCoupons(Array.isArray(couponsData) ? couponsData : []);

            // Update pagination info
            if (response.data?.totalPages) {
                setTotalPages(response.data.totalPages);
            } else if (response.data?.total) {
                setTotalPages(Math.ceil(response.data.total / pageSize));
            }
        } catch (err) {
            console.error('Coupon Fetch Error:', err);

            // Comprehensive error message for debugging
            let msg = 'Network Error: Could not connect to API.';
            if (err.response) {
                msg = `Error ${err.response.status}: ${err.response.data?.message || err.message}`;
            } else if (err.request) {
                msg = 'Network Error: No response from server. Check CORS or URL.';
            } else {
                msg = err.message;
            }

            setError(msg);
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await api.put(`/admin/coupons/${id}/status?active=${newStatus}`, {});
            showToast(`Coupon ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
            fetchCoupons(currentSearch, pageNo);
        } catch (err) {
            console.error('Status Toggle Error:', err);
            showToast(err.response?.data?.message || 'Failed to update coupon status', 'error');
        }
    };

    useEffect(() => {
        fetchCoupons('', 1);
    }, [fetchCoupons]);

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, couponId: id });
    };

    const confirmDelete = async () => {
        if (deleteModal.couponId) {
            try {
                await api.delete(`/admin/coupons/${deleteModal.couponId}`);
                setDeleteModal({ isOpen: false, couponId: null });
                fetchCoupons(currentSearch, pageNo);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to delete coupon');
                console.error('Delete Error:', err);
                setDeleteModal({ isOpen: false, couponId: null });
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentSearch(searchTerm);
        setPageNo(1);
        fetchCoupons(searchTerm, 1);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentSearch('');
        setPageNo(1);
        fetchCoupons('', 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPageNo(newPage);
            fetchCoupons(currentSearch, newPage);
        }
    };

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

    if (loading && coupons.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EB422B]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="ml-64">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="mb-8 font-sans">
                            <div className="flex justify-between items-center">
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coupon Management</h1>
                                <div className="flex gap-3">
                                    <Link
                                        to="/coupons/create"
                                        className="bg-[#EB422B] text-white px-4 py-2 rounded-md hover:bg-[#d43b26] transition-colors shadow-sm font-medium"
                                    >
                                        Add New Coupon
                                    </Link>
                                    <button
                                        onClick={() => fetchCoupons(currentSearch, pageNo)}
                                        className="text-sm border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-md hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mb-6 flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Search Bar */}
                        {/* <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl p-6 mb-8 transition-all hover:shadow-md">
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by coupon code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB422B] transition-all bg-gray-50/50"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {(currentSearch || searchTerm) && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Reset
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="px-8 py-2.5 text-sm font-semibold text-white bg-[#EB422B] rounded-lg hover:bg-[#d43b26] shadow-sm hover:shadow transition-all"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                            {currentSearch && (
                                <div className="mt-3 flex items-center text-sm text-gray-500">
                                    <span>Active filter: </span>
                                    <span className="ml-1.5 px-2 py-0.5 bg-red-50 text-[#EB422B] rounded-md font-medium">"{currentSearch}"</span>
                                </div>
                            )}
                        </div> */}

                        {/* Coupons Table */}
                        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-xl overflow-hidden shadow-premium">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="bg-[#fdfdfd]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Code</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Steps</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Benefit</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Usage Details</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Duration</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4  text-xs font-bold text-gray-500 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-50">
                                        {coupons.map((coupon, idx) => (
                                            <tr key={coupon.couponId || idx} className="hover:bg-red-50/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-black text-[#EB422B] bg-red-50/80 px-3 py-1.5 rounded-md border border-red-100/50 inline-block shadow-sm">
                                                        {coupon.code}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-700">{coupon.stepsRequired || 0} Steps</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-base font-bold text-gray-900">₹{coupon.value} OFF</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-600">{coupon.usedCount} of {coupon.usageLimit} Redeemed</span>
                                                        <div className="w-32 bg-gray-100 rounded-full h-2 mt-2 group-hover:bg-white transition-colors overflow-hidden border border-gray-100">
                                                            <div
                                                                className="bg-gradient-to-r from-[#EB422B] to-[#ff6a56] h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 space-y-1">
                                                    <div className="flex items-center">
                                                        <span className="w-10 text-gray-400 font-semibold uppercase tracking-tighter">Start</span>
                                                        <span className="font-medium text-gray-700">{formatDate(coupon.validFrom)}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="w-10 text-gray-400 font-semibold uppercase tracking-tighter">End</span>
                                                        <span className="font-medium text-gray-700">{formatDate(coupon.validTill)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight shadow-sm ${coupon.active && !coupon.deleted
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${coupon.active && !coupon.deleted ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        {coupon.active && !coupon.deleted ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Link
                                                            to={`/coupons/${coupon.couponId}`}
                                                            className="text-green-600 hover:text-green-900 font-semibold"
                                                        >
                                                            View
                                                        </Link>
                                                        <button
                                                            onClick={() => handleStatusToggle(coupon.couponId, coupon.active)}
                                                            className="text-orange-600 hover:text-orange-800 font-semibold"
                                                        >
                                                            Change Status
                                                        </button>
                                                        {coupon.usedCount === 0 && new Date(coupon.validFrom) > new Date() && (
                                                            <>
                                                                <Link
                                                                    to={`/coupons/edit/${coupon.couponId}`}
                                                                    className="text-blue-600 hover:text-blue-900 font-semibold"
                                                                >
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(coupon.couponId)}
                                                                    className="text-red-600 hover:text-red-900 font-semibold"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}

                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {coupons.map((c, i) => i === 0 && !c.couponId && (
                                    <div key="warn" className="p-3 text-xs bg-yellow-50 text-yellow-800 border-t border-yellow-100 italic">
                                        Note: Some items might be missing unique IDs. Rendering using array index.
                                    </div>
                                ))}
                            </div>

                            {coupons.length === 0 && !loading && (
                                <div className="text-center py-20 bg-gray-50/50">
                                    <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                        <svg className="h-8 w-8 text-[#EB422B] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium text-lg">No coupons available at the moment.</p>
                                    <p className="text-gray-400 text-sm mt-1">Try searching for a different code or refresh the list.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="bg-white px-6 py-4 flex items-center justify-between border ring-1 ring-gray-200 mt-6 rounded-xl shadow-sm">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(pageNo - 1)}
                                        disabled={pageNo === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pageNo + 1)}
                                        disabled={pageNo === totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">
                                            Page <span className="text-[#EB422B] font-bold">{pageNo}</span> of{' '}
                                            <span className="text-gray-900 font-bold">{totalPages}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => handlePageChange(pageNo - 1)}
                                                disabled={pageNo === 1}
                                                className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all"
                                            >
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            </button>

                                            {[...Array(totalPages)].map((_, index) => {
                                                const page = index + 1;
                                                // Simplified pagination for premium feel
                                                if (page === 1 || page === totalPages || (page >= pageNo - 1 && page <= pageNo + 1)) {
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => handlePageChange(page)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-bold transition-all ${page === pageNo
                                                                ? 'z-10 bg-[#EB422B] border-[#EB422B] text-white shadow-md'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:text-[#EB422B]'
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                } else if (page === pageNo - 2 || page === pageNo + 2) {
                                                    return (
                                                        <span key={page} className="relative inline-flex items-center px-3 py-2 border border-gray-200 bg-gray-50 text-gray-400 text-xs font-bold">...</span>
                                                    );
                                                }
                                                return null;
                                            })}

                                            <button
                                                onClick={() => handlePageChange(pageNo + 1)}
                                                disabled={pageNo === totalPages}
                                                className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all"
                                            >
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, couponId: null })}
                onConfirm={confirmDelete}
                title="Permanently Delete Coupon?"
                message="You are about to remove this coupon from the system. This action is irreversible and will prevent users from redeeming it."
                confirmText="Yes, Delete Coupon"
                cancelText="Keep for Now"
                type="warning"
            />
        </div>
    );
};

export default CouponList;
