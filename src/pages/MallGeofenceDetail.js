import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import EditGeofenceModal from '../components/EditGeofenceModal';
import AddGeofenceModal from '../components/AddGeofenceModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../components/Toast';

const MallGeofenceDetail = () => {
    const { id } = useParams();
    const { showToast } = useToast();
    const [geofences, setGeofences] = useState([]);
    const [mall, setMall] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editModal, setEditModal] = useState({ isOpen: false, geofence: null });
    const [addModal, setAddModal] = useState({ isOpen: false });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, geofenceId: null });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch geofences for this mall
            const geofenceRes = await api.get(`/admin/geofences/mall/${id}`);
            setGeofences(geofenceRes.data?.data || []);

            // Fetch mall details
            const mallRes = await api.get(`/malls/${id}`);
            setMall(mallRes.data?.data || mallRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch geofence details');
            showToast('Failed to load geofences', 'error');
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (geofence) => {
        setEditModal({ isOpen: true, geofence });
    };

    const handleAdd = () => {
        setAddModal({ isOpen: true });
    };

    const handleDelete = (geofenceId) => {
        setDeleteModal({ isOpen: true, geofenceId });
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/admin/geofences/${deleteModal.geofenceId}`);
            showToast('Geofence deleted successfully!', 'success');
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Failed to delete geofence', 'error');
        } finally {
            setDeleteModal({ isOpen: false, geofenceId: null });
        }
    };

    const handleStatusToggle = async (geofenceId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await api.patch(`/admin/geofences/${geofenceId}/status?active=${newStatus}`, {});
            showToast(`Geofence ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
            fetchData();
        } catch (error) {
            console.error('Status toggle error:', error);
            showToast(error.response?.data?.message || 'Failed to update geofence status', 'error');
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
                            <Link to="/malls" className="text-[#EB422B] hover:text-[#d43b26] font-bold text-sm flex items-center gap-2 mb-2 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Malls
                            </Link>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Geofences: {mall?.mallName || 'Loading...'}
                            </h1>
                            <p className="text-gray-500 mt-1">Manage and monitor all virtual perimeters for this location.</p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="bg-[#EB422B] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#d43b26] transition-all shadow-md flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Geofence
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    {/* Table Container */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Geofence Info</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Coverage</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Coordinates</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center">
                                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#EB422B] border-t-transparent"></div>
                                            </td>
                                        </tr>
                                    ) : geofences.length > 0 ? (
                                        geofences.map((gf) => (
                                            <tr key={gf.geofenceId} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 group-hover:text-[#EB422B] transition-colors">{gf.geofenceName}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">ID: #{gf.geofenceId}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${gf.polygon && gf.polygon.length > 0 ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                        {gf.polygon && gf.polygon.length > 0 ? 'Polygon' : 'Circle'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {gf.polygon && gf.polygon.length > 0 ? (
                                                        <div className="text-sm font-bold text-gray-600">{gf.polygon.length} Points</div>
                                                    ) : (
                                                        <div className="text-sm font-bold text-[#EB422B]">{gf.radiusMeters}m <span className="text-[10px] text-gray-400 uppercase">Radius</span></div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[11px] font-mono font-bold text-gray-500">
                                                        {gf.latitude?.toFixed(6)}, {gf.longitude?.toFixed(6)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight shadow-sm ${gf.active
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${gf.active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        {gf.active ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <button
                                                            onClick={() => handleStatusToggle(gf.geofenceId, gf.active)}
                                                            className="font-bold text-sm underline-offset-4 hover:underline"
                                                            style={{ color: '#16A34A' }}
                                                        >
                                                            Change Status
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(gf)}
                                                            className="text-blue-600 hover:text-blue-800 font-bold text-xs transition-all"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(gf.geofenceId)}
                                                            className="text-red-500 hover:text-red-700 font-bold text-xs transition-all"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <p className="font-bold uppercase tracking-widest text-xs">No Geofences Found</p>
                                                    <button onClick={handleAdd} className="mt-4 text-[#EB422B] font-bold text-sm hover:underline">Add your first geofence</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <EditGeofenceModal
                isOpen={editModal.isOpen}
                onClose={() => {
                    setEditModal({ isOpen: false, geofence: null });
                    fetchData();
                }}
                geofenceData={editModal.geofence}
                mallName={mall?.mallName}
            />

            <AddGeofenceModal
                isOpen={addModal.isOpen}
                onClose={() => {
                    setAddModal({ isOpen: false });
                    fetchData();
                }}
                mallId={id}
                mallName={mall?.mallName}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, geofenceId: null })}
                onConfirm={confirmDelete}
                title="Delete Geofence"
                message="Are you sure you want to delete this geofence? This virtual perimeter will be permanently removed."
                confirmText="Delete"
                cancelText="Cancel"
                type="error"
            />
        </div>
    );
};

export default MallGeofenceDetail;
