import React, { useState, useRef } from 'react';

// SVG Icon Components
const UploadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const XIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ImageIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

/**
 * ImageUpload Component
 * 
 * A reusable component for uploading single or multiple images with preview functionality
 * 
 * @param {Object} props
 * @param {boolean} props.multiple - Whether to allow multiple image uploads
 * @param {Array|File|null} props.value - Current image(s) value
 * @param {Function} props.onChange - Callback when images change
 * @param {string} props.label - Label for the upload field
 * @param {string} props.error - Error message to display
 * @param {number} props.maxSize - Maximum file size in MB (default: 2)
 * @param {number} props.maxFiles - Maximum number of files (default: 10)
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.accept - Accepted file types (default: image/*)
 */
const ImageUpload = ({
    multiple = false,
    value = null,
    onChange,
    label = 'Upload Image',
    error = '',
    maxSize = 2,
    maxFiles = 10,
    required = false,
    accept = 'image/*',
    id = 'image-upload'
}) => {
    const [previews, setPreviews] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const MAX_FILE_SIZE = maxSize * 1024 * 1024; // Convert MB to bytes

    // Generate previews when value changes
    React.useEffect(() => {
        if (!value) {
            setPreviews([]);
            return;
        }

        const files = multiple ? (Array.isArray(value) ? value : []) : [value];

        const generatePreviews = async () => {
            const previewPromises = files.map((file) => {
                return new Promise((resolve) => {
                    if (file instanceof File) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            resolve({
                                url: reader.result,
                                name: file.name,
                                size: file.size
                            });
                        };
                        reader.onerror = () => {
                            resolve(null);
                        };
                        reader.readAsDataURL(file);
                    } else if (typeof file === 'string') {
                        // If it's already a URL
                        resolve({
                            url: file,
                            name: 'Image',
                            size: 0
                        });
                    } else {
                        resolve(null);
                    }
                });
            });

            const results = await Promise.all(previewPromises);
            setPreviews(results.filter(Boolean));
        };

        generatePreviews();
    }, [value, multiple]);

    const validateFile = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            return `File size must be less than ${maxSize} MB`;
        }
        if (!file.type.startsWith('image/')) {
            return 'Only image files are allowed';
        }
        return null;
    };

    const handleFileChange = (files) => {
        if (!files || files.length === 0) {
            // Only clear if explicitly cleared (e.g. cancel in dialect NOT triggering this usually, but empty input)
            // But standard input behavior: cancel doesn't trigger change if value was same, but here we reset?
            // Actually if files empty, it means user cleared input?
            // Input file value is not retained by browser if you click and cancel usually.
            // But if we receive empty list, we probably shouldn't clear everything if we are in "append" mode?
            // Actually, if files are empty, it's safer to do nothing or handle based on intent.
            // But let's stick to simple safety: if no files, do nothing or clear if it was intended.
            // Original code cleared. Let's keep it safe:
            if (!multiple) {
                onChange(null);
            }
            return;
        }

        const fileArray = Array.from(files);
        const currentFiles = (multiple && Array.isArray(value)) ? value : [];
        const combinedFiles = multiple ? [...currentFiles, ...fileArray] : fileArray;

        // Validate file count for multiple uploads
        if (multiple && combinedFiles.length > maxFiles) {
            onChange(null, `Maximum ${maxFiles} images allowed. You have ${currentFiles.length} images and selected ${fileArray.length} more.`);
            return;
        }

        // Validate each NEW file
        for (const file of fileArray) {
            const error = validateFile(file);
            if (error) {
                onChange(null, error);
                return;
            }
        }

        // Call onChange with files
        if (multiple) {
            onChange(combinedFiles, null);
        } else {
            onChange(combinedFiles[0], null);
        }
    };

    const handleInputChange = (e) => {
        handleFileChange(e.target.files);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    const handleRemove = (index) => {
        if (multiple) {
            const files = Array.isArray(value) ? value : [];
            const newFiles = files.filter((_, i) => i !== index);
            onChange(newFiles.length > 0 ? newFiles : [], null);
        } else {
            onChange(null, null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : error
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    id={id}
                    accept={accept}
                    multiple={multiple}
                    onChange={handleInputChange}
                    className="hidden"
                />

                {previews.length === 0 ? (
                    // Empty state - show upload prompt
                    <div
                        onClick={handleClick}
                        className="flex flex-col items-center justify-center py-12 px-4 cursor-pointer"
                    >
                        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <UploadIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                            {multiple ? `Up to ${maxFiles} images` : 'Single image'} (Max {maxSize}MB each)
                        </p>
                    </div>
                ) : (
                    // Preview state - show uploaded images
                    <div className="p-4">
                        <div className={`grid gap-4 ${multiple ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6' : 'grid-cols-1'}`}>
                            {previews.map((preview, index) => (
                                <div
                                    key={index}
                                    className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Image Preview */}
                                    <div className="aspect-square relative bg-gray-100">
                                        <img
                                            src={preview.url}
                                            alt={preview.name}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemove(index);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transform hover:scale-110"
                                                title="Remove image"
                                            >
                                                <XIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Info */}
                                    <div className="p-2 bg-white">
                                        <p className="text-xs text-gray-600 truncate" title={preview.name}>
                                            {preview.name}
                                        </p>
                                        {preview.size > 0 && (
                                            <p className="text-xs text-gray-400">
                                                {formatFileSize(preview.size)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add more button for multiple uploads */}
                            {multiple && previews.length < maxFiles && (
                                <div
                                    onClick={handleClick}
                                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer flex flex-col items-center justify-center transition-all duration-200"
                                >
                                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500 font-medium">Add More</p>
                                    <p className="text-xs text-gray-400">
                                        {previews.length}/{maxFiles}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Replace button for single upload */}
                        {!multiple && previews.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClick}
                                className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Replace Image
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {/* Help Text */}
            {!error && (
                <p className="mt-2 text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF, WebP. Max size: {maxSize}MB per image.
                </p>
            )}
        </div>
    );
};

export default ImageUpload;
