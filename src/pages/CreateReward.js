import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Sidebar from '../components/Sidebar';

const CreateReward = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        mallId: '',
        stepsPerCoupon: 0,
        minStepsRequired: 0,
        maxCouponsPerVisit: 0,
        maxCouponsPerDay: 0,
        enabled: true
    });

    const [malls, setMalls] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loadingMalls, setLoadingMalls] = useState(true);
    const [loadingCoupons, setLoadingCoupons] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        const fetchMalls = async () => {
            try {
                const response = await api.get('/malls');
                const mallData = response.data?.data?.content || response.data?.data || response.data;

                if (Array.isArray(mallData)) {
                    setMalls(mallData);
                } else {
                    console.error('Malls API returned non-array data:', mallData);
                    setMalls([]);
                }
            } catch (error) {
                console.error('Error fetching malls:', error);
                showToast('Failed to load malls list', 'error');
                setMalls([]);
            } finally {
                setLoadingMalls(false);
            }
        };

        fetchMalls();
    }, [showToast]);

    useEffect(() => {
        const fetchCoupons = async () => {
            if (!formData.mallId) {
                setCoupons([]);
                return;
            }

            try {
                setLoadingCoupons(true);
                const response = await api.get(`/admin/coupons/mall/${formData.mallId}`);
                const couponData = response.data?.data || response.data || [];

                if (Array.isArray(couponData)) {
                    setCoupons(couponData);
                } else {
                    setCoupons([]);
                }
            } catch (error) {
                console.error('Error fetching terminal coupons:', error);
                showToast('Failed to load coupons for selected mall', 'error');
                setCoupons([]);
            } finally {
                setLoadingCoupons(false);
            }
        };

        fetchCoupons();
    }, [formData.mallId, showToast]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.mallId) errors.mallId = 'Mall selection is required';
        // if (!formData.couponId) errors.couponId = 'Coupon selection is required';
        if (!formData.stepsPerCoupon || formData.stepsPerCoupon <= 0) errors.stepsPerCoupon = 'Steps per coupon must be greater than 0';
        if (!formData.minStepsRequired || formData.minStepsRequired < 0) errors.minStepsRequired = 'Min steps required cannot be negative';
        if (!formData.maxCouponsPerVisit || formData.maxCouponsPerVisit <= 0) errors.maxCouponsPerVisit = 'Max coupons per visit must be at least 1';
        if (!formData.maxCouponsPerDay || formData.maxCouponsPerDay <= 0) errors.maxCouponsPerDay = 'Max coupons per day must be at least 1';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                mallId: formData.mallId,
                stepsPerCoupon: Number(formData.stepsPerCoupon),
                minStepsRequired: Number(formData.minStepsRequired),
                maxCouponsPerVisit: Number(formData.maxCouponsPerVisit),
                maxCouponsPerDay: Number(formData.maxCouponsPerDay),
                enabled: formData.enabled
            };

            await api.post('/admin/reward-configs', payload);
            showToast('Reward configuration created successfully!', 'success');
            navigate('/rewards');
        } catch (error) {
            console.error('Create Reward Error:', error);
            showToast(error.response?.data?.message || 'Failed to create reward configuration', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <Link to="/rewards" className="text-[#EB422B] hover:underline text-sm font-medium mb-2 inline-block flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Rewards
                            </Link>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Reward Configuration</h1>
                            <p className="text-gray-500 mt-1">Setup step-based reward rules for your malls.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <span className="w-8 h-8 bg-red-50 text-[#EB422B] rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                Reward Configuration Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Mall Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Target Mall *</label>
                                    <select
                                        name="mallId"
                                        value={formData.mallId}
                                        onChange={handleChange}
                                        disabled={loadingMalls}
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.mallId ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    >
                                        <option value="">Select a Mall</option>
                                        {malls.map(mall => (
                                            <option key={mall.mallId} value={mall.mallId}>
                                                {mall.mallName} ({mall.city})
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.mallId && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.mallId}</p>}
                                </div>

                                {/* Enabled Switch */}
                                <div className="flex items-center pt-8">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="enabled"
                                            checked={formData.enabled}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EB422B]"></div>
                                        <span className="ml-3 text-sm font-bold text-gray-900">Config Enabled</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Coupon Details Display */}
                        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                </span>
                                Available Coupons for Reference
                            </h2>

                            {loadingCoupons ? (
                                <div className="flex items-center space-x-2 text-gray-500 italic">
                                    <div className="animate-spin h-4 w-4 border-2 border-[#EB422B] border-t-transparent rounded-full"></div>
                                    <span>Loading coupons...</span>
                                </div>
                            ) : !formData.mallId ? (
                                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                                    <p className="text-gray-500">Select a mall above to see its available coupons.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {coupons.map(coupon => (
                                        <div
                                            key={coupon.couponId}
                                            className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-600 shadow-sm"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#EB422B]">{coupon.code}</span>
                                                <span className="text-[10px] opacity-70 font-semibold">₹{coupon.value} OFF</span>
                                            </div>
                                        </div>
                                    ))}
                                    {coupons.length === 0 && (
                                        <p className="col-span-full text-gray-500 text-sm">No coupons found for this mall.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <span className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </span>
                                Threshold & Limits
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Steps Per Coupon */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Steps Per Coupon *</label>
                                    <input
                                        type="number"
                                        name="stepsPerCoupon"
                                        value={formData.stepsPerCoupon}
                                        onChange={handleChange}
                                        placeholder="e.g. 1000"
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.stepsPerCoupon ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.stepsPerCoupon && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.stepsPerCoupon}</p>}
                                </div>

                                {/* Min Steps Required */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Min Steps Required *</label>
                                    <input
                                        type="number"
                                        name="minStepsRequired"
                                        value={formData.minStepsRequired}
                                        onChange={handleChange}
                                        placeholder="e.g. 500"
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.minStepsRequired ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.minStepsRequired && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.minStepsRequired}</p>}
                                </div>

                                {/* Max Coupons Per Visit */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Max Coupons Per Visit *</label>
                                    <input
                                        type="number"
                                        name="maxCouponsPerVisit"
                                        value={formData.maxCouponsPerVisit}
                                        onChange={handleChange}
                                        placeholder="e.g. 5"
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.maxCouponsPerVisit ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.maxCouponsPerVisit && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.maxCouponsPerVisit}</p>}
                                </div>

                                {/* Max Coupons Per Day */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Max Coupons Per Day *</label>
                                    <input
                                        type="number"
                                        name="maxCouponsPerDay"
                                        value={formData.maxCouponsPerDay}
                                        onChange={handleChange}
                                        placeholder="e.g. 10"
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.maxCouponsPerDay ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.maxCouponsPerDay && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.maxCouponsPerDay}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-[#EB422B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#d43b26] shadow-lg hover:shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Creating Reward Config...' : 'Create Reward Configuration'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/rewards')}
                                className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateReward;
