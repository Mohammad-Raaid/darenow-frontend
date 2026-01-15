import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../components/Toast';
import Sidebar from '../components/Sidebar';

const EditCoupon = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        code: '',
        value: '',
        validFrom: '',
        validTill: '',
        usageLimit: '',
        stepsRequired: '',
        applicableMallIds: [],
        active: true
    });

    const [malls, setMalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMalls, setLoadingMalls] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const fetchMalls = useCallback(async () => {
        try {
            const response = await api.get('/malls');
            const mallData = response.data?.data?.content || response.data?.data || response.data;
            if (Array.isArray(mallData)) {
                setMalls(mallData);
            } else {
                setMalls([]);
            }
        } catch (error) {
            console.error('Error fetching malls:', error);
            showToast('Failed to load malls list', 'error');
            setMalls([]);
        } finally {
            setLoadingMalls(false);
        }
    }, [showToast]);

    const fetchCoupon = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/coupons/${id}`);
            const coupon = response.data?.data || response.data;

            if (coupon) {
                // Formatting dates for datetime-local input (YYYY-MM-DDThh:mm)
                const formatForInput = (dateStr) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    const pad = (num) => String(num).padStart(2, '0');
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                };

                setFormData({
                    code: coupon.code || '',
                    value: coupon.value || '',
                    validFrom: formatForInput(coupon.validFrom),
                    validTill: formatForInput(coupon.validTill),
                    usageLimit: coupon.usageLimit || '',
                    stepsRequired: coupon.stepsRequired || '',
                    applicableMallIds: Array.isArray(coupon.applicableMallIds) ? coupon.applicableMallIds.map(Number) : [],
                    active: coupon.active ?? true
                });
            }
        } catch (error) {
            console.error('Error fetching coupon:', error);
            showToast('Failed to load coupon details', 'error');
            navigate('/coupons');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, showToast]);

    useEffect(() => {
        fetchMalls();
        fetchCoupon();
    }, [fetchMalls, fetchCoupon]);

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

    const handleMallToggle = (mallId) => {
        setFormData(prev => {
            const currentIds = [...prev.applicableMallIds];
            const numericId = Number(mallId);
            if (currentIds.includes(numericId)) {
                return { ...prev, applicableMallIds: currentIds.filter(id => id !== numericId) };
            } else {
                return { ...prev, applicableMallIds: [...currentIds, numericId] };
            }
        });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.code.trim()) errors.code = 'Coupon code is required';
        if (!formData.value || formData.value <= 0) errors.value = 'Valid discount value is required';
        if (!formData.validFrom) errors.validFrom = 'Start date is required';
        if (!formData.validTill) errors.validTill = 'Expiry date is required';
        if (!formData.usageLimit || formData.usageLimit <= 0) errors.usageLimit = 'Usage limit must be at least 1';
        if (formData.stepsRequired === '' || formData.stepsRequired < 0) errors.stepsRequired = 'Steps required is required';

        if (formData.validFrom && formData.validTill) {
            if (new Date(formData.validFrom) >= new Date(formData.validTill)) {
                errors.validTill = 'Expiry date must be after start date';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                value: Number(formData.value),
                usageLimit: Number(formData.usageLimit),
                stepsRequired: Number(formData.stepsRequired),
                applicableMallIds: formData.applicableMallIds.map(Number),
                validFrom: new Date(formData.validFrom).toISOString(),
                validTill: new Date(formData.validTill).toISOString(),
            };

            await api.put(`/admin/coupons/${id}`, payload);
            showToast('Coupon updated successfully!', 'success');
            navigate('/coupons');
        } catch (error) {
            console.error('Update Coupon Error:', error);
            showToast(error.response?.data?.message || 'Failed to update coupon', 'error');
        } finally {
            setSubmitting(false);
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
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <Link to="/coupons" className="text-[#EB422B] hover:underline text-sm font-medium mb-2 inline-block flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Coupons
                            </Link>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Edit Coupon</h1>
                            <p className="text-gray-500 mt-1">Modify the details of your discount coupon.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <span className="w-8 h-8 bg-red-50 text-[#EB422B] rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                </span>
                                Coupon Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Coupon Code *</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.code ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all uppercase`}
                                    />
                                    {fieldErrors.code && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.code}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Discount Value (₹) *</label>
                                    <input
                                        type="number"
                                        name="value"
                                        value={formData.value}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.value ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.value && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.value}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Valid From *</label>
                                    <input
                                        type="datetime-local"
                                        name="validFrom"
                                        value={formData.validFrom}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.validFrom ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.validFrom && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.validFrom}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Valid Till *</label>
                                    <input
                                        type="datetime-local"
                                        name="validTill"
                                        value={formData.validTill}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.validTill ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.validTill && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.validTill}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Usage Limit *</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.usageLimit ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.usageLimit && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.usageLimit}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Steps Required *</label>
                                    <input
                                        type="number"
                                        name="stepsRequired"
                                        value={formData.stepsRequired}
                                        onChange={handleChange}
                                        placeholder="e.g. 200"
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.stepsRequired ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.stepsRequired && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.stepsRequired}</p>}
                                </div>

                                <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                    <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Active Status</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EB422B]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Malls Selection */}
                        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </span>
                                Applicable Malls
                            </h2>

                            {loadingMalls ? (
                                <div className="flex items-center space-x-2 text-gray-500 italic">
                                    <div className="animate-spin h-4 w-4 border-2 border-[#EB422B] border-t-transparent rounded-full"></div>
                                    <span>Loading malls...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {malls.map(mall => (
                                        <button
                                            key={mall.mallId}
                                            type="button"
                                            onClick={() => handleMallToggle(mall.mallId)}
                                            className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${formData.applicableMallIds.map(Number).includes(Number(mall.mallId))
                                                ? 'bg-red-50 border-[#EB422B] text-[#EB422B] shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-[#EB422B]/30 hover:bg-gray-50'
                                                }`}
                                        >
                                            {mall.mallName}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-[#EB422B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#d43b26] shadow-lg hover:shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Updating Coupon...' : 'Update Coupon'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/coupons')}
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

export default EditCoupon;
