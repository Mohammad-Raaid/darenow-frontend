import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Sidebar from '../components/Sidebar';
import ConfirmationModal from '../components/ConfirmationModal';

const RewardList = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, rewardId: null });

    const fetchRewards = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/reward-configs');
            // Extracting data based on typical structures
            const rewardData = response.data?.data || response.data || [];
            if (Array.isArray(rewardData)) {
                setRewards(rewardData);
            } else if (rewardData.content) {
                setRewards(rewardData.content);
            }
        } catch (error) {
            console.error('Error fetching rewards:', error);
            showToast('Failed to load reward configurations', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchRewards();
    }, [fetchRewards]);

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, rewardId: id });
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/admin/reward-configs/${deleteModal.rewardId}`);
            showToast('Reward config deleted successfully!', 'success');
            fetchRewards();
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Failed to delete reward config', 'error');
        } finally {
            setDeleteModal({ isOpen: false, rewardId: null });
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            // Explicitly convert to string and add empty body for PATCH request
            const newStatus = !currentStatus;
            await api.patch(`/admin/reward-configs/${id}/status?enabled=${newStatus}`, {});

            showToast(`Reward config ${newStatus ? 'enabled' : 'disabled'} successfully!`, 'success');
            fetchRewards();
        } catch (error) {
            console.error('Status toggle error:', error);
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
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
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reward Configurations</h1>
                            <p className="text-gray-500 mt-1">Manage step-based rewards and coupon limits for malls.</p>
                        </div>
                        <Link
                            to="/rewards/create"
                            className="bg-[#EB422B] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#d43b26] transition-all shadow-md flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Reward
                        </Link>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Mall Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Steps / Coupon</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Min Steps</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Daily Limit</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center">
                                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#EB422B] border-t-transparent"></div>
                                            </td>
                                        </tr>
                                    ) : rewards.length > 0 ? (
                                        rewards.map((reward) => (
                                            <tr key={reward.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-black text-gray-900 group-hover:text-[#EB422B] transition-colors truncate max-w-[200px]" title={reward.mallName}>
                                                        {reward.mallName}
                                                    </div>
                                                    {/* <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5 flex items-center">
                                                        <span className="bg-gray-100 px-1 rounded mr-1">ID: {reward.mallId}</span>
                                                        <span className="bg-red-50 text-[#EB422B]/70 px-1 rounded">REF: #{reward.id}</span>
                                                    </div> */}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-sm font-bold text-gray-700">{reward.stepsPerCoupon}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Steps</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-sm font-bold text-gray-700">{reward.minStepsRequired}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Required</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="text-sm font-bold text-gray-700">{reward.maxCouponsPerDay}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Coupons/Day</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight shadow-sm ${reward.enabled
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${reward.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                        {reward.enabled ? 'ENABLED' : 'DISABLED'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <button
                                                            onClick={() => handleStatusToggle(reward.id, reward.enabled)}
                                                            className="font-bold text-sm underline-offset-4 hover:underline"
                                                            style={{ color: '#16A34A' }}
                                                        >
                                                            Change Status
                                                        </button>
                                                        <Link
                                                            to={`/malls/${reward.mallId}/coupons`}
                                                            className="text-cyan-600 hover:text-cyan-800 font-bold text-sm"
                                                        >
                                                            View Coupons
                                                        </Link>

                                                        <button
                                                            onClick={() => handleDelete(reward.id)}
                                                            className="text-red-500 hover:text-red-700 font-bold text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-20 text-center text-gray-500 font-medium font-bold uppercase tracking-widest text-xs">No reward configurations found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, rewardId: null })}
                onConfirm={confirmDelete}
                title="Delete Reward Configuration"
                message="Are you sure you want to delete this reward configuration? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="error"
            />
        </div>
    );
};

export default RewardList;
