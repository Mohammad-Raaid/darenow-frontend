


import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polygon, Autocomplete, DrawingManager } from '@react-google-maps/api';
import api from '../utils/api';
import { useToast } from './Toast';

const libraries = ['geometry', 'places', 'drawing'];

const center = {
    lat: '', // Default center (India)
    lng: ''
};

const AddGeofenceModal = ({ isOpen, onClose, mallId, mallName }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyDgggmtKCdLrfSGXcRV6TUjV5d-3Oos3Ow",
        libraries: libraries
    });

    const [formData, setFormData] = useState({
        geofenceName: '',
        latitude: '',
        longitude: '',
        polygon: [],
        active: true
    });

    const [map, setMap] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const drawingManagerRef = React.useRef(null);
    const polygonRef = React.useRef(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const onAutocompleteLoad = (autocomplete) => {
        setAutocomplete(autocomplete);
    };

    const onPolygonComplete = (polygon) => {
        if (polygonRef.current) {
            polygonRef.current.setMap(null);
        }

        polygonRef.current = polygon;
        const path = polygon.getPath().getArray().map(latLng => ({
            lat: latLng.lat(),
            lng: latLng.lng()
        }));

        // Calculate center for backend compatibility
        const center = path.reduce((acc, curr) => ({
            lat: acc.lat + curr.lat / path.length,
            lng: acc.lng + curr.lng / path.length
        }), { lat: 0, lng: 0 });

        setFormData(prev => ({
            ...prev,
            polygon: path,
            latitude: center.lat.toFixed(6),
            longitude: center.lng.toFixed(6)
        }));
    };

    const onEditPolygon = useCallback(() => {
        if (polygonRef.current) {
            const path = polygonRef.current.getPath().getArray().map(latLng => ({
                lat: latLng.lat(),
                lng: latLng.lng()
            }));

            const center = path.reduce((acc, curr) => ({
                lat: acc.lat + curr.lat / path.length,
                lng: acc.lng + curr.lng / path.length
            }), { lat: 0, lng: 0 });

            setFormData(prev => ({
                ...prev,
                polygon: path,
                latitude: center.lat.toFixed(6),
                longitude: center.lng.toFixed(6)
            }));
        }
    }, []);

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setFormData(prev => ({
                    ...prev,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6)
                }));
                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(17);
                }
            }
        }
    };

    const onMapClick = useCallback((e) => {
        // Map click logic can be handled by DrawingManager
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Attempt to get user location or use default
            if (navigator.geolocation && !formData.latitude) {
                navigator.geolocation.getCurrentPosition((position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude.toFixed(6),
                        longitude: position.coords.longitude.toFixed(6)
                    }));
                });
            }
        }
    }, [isOpen, formData.latitude]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                mallId: parseInt(mallId),
                geofenceName: formData.geofenceName,
                polygon: formData.polygon,
                active: formData.active
            };

            await api.post('/admin/geofences', payload);
            showToast('Geofence added successfully!', 'success');
            onClose();
            setFormData({
                geofenceName: '',
                latitude: '',
                longitude: '',
                polygon: [],
                active: true
            });
        } catch (error) {
            console.error('Error adding geofence:', error);
            showToast(error.response?.data?.message || 'Failed to add geofence', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const mapCenter = formData.latitude && formData.longitude
        ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
        : center;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl transition-all duration-300 overflow-hidden my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#EB422B] to-[#ff5d47] px-8 py-5">
                    <h3 className="text-xl font-extrabold text-white">Add Geofence</h3>
                    <p className="text-white/80 text-sm mt-0.5 font-medium">Create a virtual perimeter for {mallName}</p>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-6">
                        {/* Geofence Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Geofence Name</label>
                            <input
                                type="text"
                                name="geofenceName"
                                value={formData.geofenceName}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Electronic Gadgets"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#EB422B]/20 focus:border-[#EB422B] transition-all outline-none font-medium text-lg"
                            />
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">Active Status</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EB422B]"></div>
                            </label>
                        </div>

                        {/* Map Selection Area */}
                        <div className={`space-y-3 ${isMaximized ? 'fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300' : ''}`}>
                            <div className={`${isMaximized ? 'bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300' : 'space-y-3'}`}>

                                {/* Header for Maximized Mode */}
                                <div className={`flex justify-between items-center ${isMaximized ? 'bg-gray-50 p-6 border-b border-gray-100' : ''}`}>
                                    <div>
                                        <label className={`block font-bold text-gray-400 uppercase tracking-widest ${isMaximized ? 'text-lg text-gray-900 mb-0.5' : 'text-xs mb-2'}`}>
                                            {isMaximized ? "Precision Map Mode" : "Select Location on Map"}
                                        </label>
                                        {isMaximized && <p className="text-xs text-gray-500 font-medium tracking-tight">Select the exact center-point for your geofence</p>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {formData.latitude && !isMaximized && (
                                            <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase tracking-tight">
                                                Location Selected ✓
                                            </div>
                                        )}
                                        {isMaximized && (
                                            <button
                                                type="button"
                                                onClick={() => setIsMaximized(false)}
                                                className="bg-[#EB422B] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-[#EB422B]/20 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Finish
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className={`${isMaximized ? 'p-6 flex-1 flex flex-col gap-4' : 'space-y-3'}`}>
                                    {isLoaded && !loadError && (
                                        <div>
                                            <Autocomplete
                                                onLoad={onAutocompleteLoad}
                                                onPlaceChanged={onPlaceChanged}
                                            >
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search for a mall, area, or landmark..."
                                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#EB422B]/20 focus:border-[#EB422B] transition-all outline-none font-medium pr-12 shadow-sm"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </Autocomplete>
                                        </div>
                                    )}

                                    <div className={`relative border-4 border-gray-50 ${isMaximized ? 'flex-1 rounded-2xl' : 'rounded-2xl h-[300px]'} overflow-hidden shadow-inner group transition-all duration-300`}>
                                        {!isMaximized && (
                                            <button
                                                type="button"
                                                onClick={() => setIsMaximized(true)}
                                                className="absolute top-4 right-4 z-10 p-2.5 bg-white shadow-lg rounded-xl border border-gray-100 hover:bg-gray-50 transition-all group-hover:scale-110 active:scale-95"
                                                title="Open Map Viewer"
                                            >
                                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                </svg>
                                            </button>
                                        )}

                                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                            <button
                                                type="button"
                                                onClick={() => map?.setZoom((map.getZoom() || 15) + 1)}
                                                className="p-3 bg-white shadow-xl rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all hover:scale-110 active:scale-95 text-[#EB422B]"
                                                title="Zoom In"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Polygon Info Overlay */}
                                        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-xl max-w-[280px]">
                                            <div className="flex justify-between items-center text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                                                <span>Polygon Area</span>
                                                <span className="text-[#EB422B] text-xs px-2 py-0.5 bg-[#EB422B]/10 rounded-full">
                                                    {formData.polygon.length} Points
                                                </span>
                                            </div>
                                            {formData.polygon.length === 0 && (
                                                <p className="text-[10px] text-gray-400 mt-1 font-medium">Use the drawing tool to create a polygon</p>
                                            )}
                                        </div>

                                        {loadError ? (
                                            <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center p-6 text-center">
                                                <svg className="w-12 h-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div className="text-red-800 font-bold text-sm mb-1">Map Loading Failed</div>
                                                <div className="text-red-600 text-[10px] break-all">{loadError.message}</div>
                                            </div>
                                        ) : isLoaded ? (
                                            <GoogleMap
                                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                                center={mapCenter}
                                                zoom={15}
                                                onLoad={onLoad}
                                                onUnmount={onUnmount}
                                                onClick={onMapClick}
                                                options={{
                                                    streetViewControl: false,
                                                    mapTypeControl: false,
                                                    fullscreenControl: false,
                                                    zoomControl: isMaximized
                                                }}
                                            >
                                                <DrawingManager
                                                    onPolygonComplete={onPolygonComplete}
                                                    options={{
                                                        drawingControl: true,
                                                        drawingControlOptions: {
                                                            position: window.google.maps.ControlPosition.TOP_CENTER,
                                                            drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
                                                        },
                                                        polygonOptions: {
                                                            fillColor: '#EB422B',
                                                            fillOpacity: 0.25,
                                                            strokeColor: '#EB422B',
                                                            strokeOpacity: 0.6,
                                                            strokeWeight: 2,
                                                            editable: true,
                                                            draggable: true,
                                                        },
                                                    }}
                                                />
                                                {formData.polygon.length > 0 && (
                                                    <Polygon
                                                        paths={formData.polygon}
                                                        options={{
                                                            fillColor: '#EB422B',
                                                            fillOpacity: 0.25,
                                                            strokeColor: '#EB422B',
                                                            strokeOpacity: 0.6,
                                                            strokeWeight: 2,
                                                            editable: true,
                                                            draggable: true,
                                                        }}
                                                        onMouseUp={onEditPolygon}
                                                        onDragEnd={onEditPolygon}
                                                    />
                                                )}
                                            </GoogleMap>
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                                Loading Maps...
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-[10px] text-gray-400 text-center italic font-medium ${isMaximized ? 'mt-2' : ''}`}>
                                        {isMaximized ? 'Click anywhere on the map to accurately update coordinates.' : 'Click on the map to set location'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] px-6 py-3.5 bg-[#EB422B] text-white font-bold rounded-2xl hover:bg-[#d43b26] transition-all disabled:opacity-50 shadow-xl shadow-[#EB422B]/25 text-sm uppercase tracking-widest"
                        >
                            {loading ? 'Creating...' : 'Create Geofence'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGeofenceModal;
