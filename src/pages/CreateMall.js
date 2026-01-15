import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import TimePicker from '../components/TimePicker';
import { useToast } from '../components/Toast';
import Sidebar from '../components/Sidebar';

const CreateMall = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        mallName: '',
        address: '',
        city: '',
        openingTime: '10:00',
        closingTime: '22:00',
        active: true
    });

    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.mallName.trim()) errors.mallName = 'Mall name is required';
        if (!formData.address.trim()) errors.address = 'Address is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.openingTime) errors.openingTime = 'Opening time is required';
        if (!formData.closingTime) errors.closingTime = 'Closing time is required';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const formatTime = (time) => {
                if (!time) return '';
                const [h, m] = time.split(':').map(Number);
                const period = h >= 12 ? 'pm' : 'am';
                const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                const minStr = m > 0 ? `:${m.toString().padStart(2, '0')}` : '';
                return `${hour12}${minStr}${period}`;
            };

            const operatingHours = `${formatTime(formData.openingTime)}-${formatTime(formData.closingTime)}`;

            const payload = {
                mallName: formData.mallName,
                address: formData.address,
                city: formData.city,
                operatingHours: operatingHours,
                active: String(formData.active)
            };

            await api.post('/malls', payload);
            showToast('Mall created successfully!', 'success');
            navigate('/malls');
        } catch (error) {
            console.error('Create Mall Error:', error);
            showToast(error.response?.data?.message || 'Failed to create mall', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <Link to="/malls" className="text-[#EB422B] hover:underline text-sm font-medium mb-2 inline-block flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Malls
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Register New Mall</h1>
                        <p className="text-gray-500 mt-1">Add a new location to your network.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mall Name *</label>
                                    <input
                                        type="text"
                                        name="mallName"
                                        value={formData.mallName}
                                        onChange={handleChange}
                                        placeholder="e.g. Ashima Mall"
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.mallName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.mallName && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.mallName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Address *</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter full address"
                                        rows="3"
                                        className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.address ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                    />
                                    {fieldErrors.address && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.address}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="e.g. Bhopal"
                                            className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.city ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#EB422B] focus:border-transparent outline-none transition-all`}
                                        />
                                        {fieldErrors.city && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.city}</p>}
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Opening Time *</label>
                                            <TimePicker
                                                name="openingTime"
                                                value={formData.openingTime}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border bg-white"
                                                error={fieldErrors.openingTime}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Closing Time *</label>
                                            <TimePicker
                                                name="closingTime"
                                                value={formData.closingTime}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border bg-white"
                                                error={fieldErrors.closingTime}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                    <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Active Status</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EB422B]"></div>
                                    </label>
                                </div>
                                {/* <div className="flex items-center pt-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            checked={formData.active}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#EB422B]"></div>
                                        <span className="ml-3 text-sm font-bold text-gray-900">Active Status</span>
                                    </label>
                                </div> */}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-[#EB422B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#d43b26] shadow-lg hover:shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Creating Mall...' : 'Create Mall'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/malls')}
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

export default CreateMall;
