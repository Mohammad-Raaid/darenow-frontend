import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Sidebar from '../components/Sidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import AddGeofenceModal from '../components/AddGeofenceModal';

const MallList = () => {
    const [malls, setMalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageNo, setPageNo] = useState(0); // API uses 0-based paging based on response
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);
    const { showToast } = useToast();
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, mallId: null });
    const [geofenceModal, setGeofenceModal] = useState({ isOpen: false, mallId: null, mallName: '' });

    const fetchMalls = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            const response = await api.get(`/malls?pageNo=${page}&pageSize=${pageSize}`);

            // Extracting from data.content based on user provided structure
            const mallData = response.data?.data?.content || [];
            const pages = response.data?.data?.totalPages || 0;

            setMalls(mallData);
            setTotalPages(pages);
            setPageNo(page);
        } catch (error) {
            console.error('Error fetching malls:', error);
            showToast('Failed to load malls list', 'error');
        } finally {
            setLoading(false);
        }
    }, [pageSize, showToast]);

    useEffect(() => {
        fetchMalls();
    }, [fetchMalls]);

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, mallId: id });
    };

    const handleAddGeofence = (mall) => {
        setGeofenceModal({
            isOpen: true,
            mallId: mall.mallId,
            mallName: mall.mallName
        });
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/malls/${deleteModal.mallId}`);
            showToast('Mall deleted successfully!', 'success');
            fetchMalls(pageNo);
        } catch (error) {

            showToast(error?.response?.data?.message || 'Failed to delete mall', 'error');
        } finally {
            setDeleteModal({ isOpen: false, mallId: null });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mall Management</h1>
                            <p className="text-gray-500 mt-1">Manage and monitor all available malls in your platform.</p>
                        </div>
                        <Link
                            to="/malls/create"
                            className="bg-[#EB422B] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#d43b26] transition-all shadow-md flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Mall
                        </Link>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Mall Info</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Address</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Operating Hours</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#EB422B] border-t-transparent"></div>
                                            </td>
                                        </tr>
                                    ) : malls.length > 0 ? (
                                        malls.map((mall) => (
                                            <tr key={mall.mallId} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{mall.mallName}</div>
                                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-tighter mt-0.5">{mall.city}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate" title={mall.address}>{mall.address}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-gray-700">{mall.operatingHours || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight shadow-sm ${mall.active
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${mall.active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        {mall.active ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <Link to={`/malls/edit/${mall.mallId}`} className="text-blue-600 hover:text-blue-800 font-bold text-sm">Edit</Link>

                                                        <button
                                                            onClick={() => handleDelete(mall.mallId)}
                                                            className="text-red-500 hover:text-red-700 font-bold text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            onClick={() => handleAddGeofence(mall)}
                                                            className="text-green-600 hover:text-green-800 font-bold text-sm"
                                                        >
                                                            Add Geofences
                                                        </button>
                                                        <Link
                                                            to={`/malls/${mall.mallId}/geofences`}
                                                            className="text-orange-600 hover:text-orange-800 font-bold text-sm"
                                                        >
                                                            View Geofences
                                                        </Link>
                                                        <Link
                                                            to={`/malls/${mall.mallId}/coupons`}
                                                            className="text-cyan-600 hover:text-cyan-800 font-bold text-sm"
                                                        >
                                                            View Coupons
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center text-gray-500 font-medium">No malls found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-sm text-gray-500 font-medium">Page {pageNo + 1} of {totalPages}</span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={pageNo === 0}
                                        onClick={() => fetchMalls(pageNo - 1)}
                                        className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={pageNo === totalPages - 1}
                                        onClick={() => fetchMalls(pageNo + 1)}
                                        className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, mallId: null })}
                onConfirm={confirmDelete}
                title="Delete Mall"
                message="Are you sure you want to delete this mall? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="error"
            />
            <AddGeofenceModal
                isOpen={geofenceModal.isOpen}
                onClose={() => setGeofenceModal({ isOpen: false, mallId: null, mallName: '' })}
                mallId={geofenceModal.mallId}
                mallName={geofenceModal.mallName}
            />
        </div>
    );
};

export default MallList;
