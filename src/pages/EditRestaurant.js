import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import TimePicker from '../components/TimePicker';
import { useToast } from '../components/Toast';
import Sidebar from '../components/Sidebar';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const LAT_REGEX = /^-?(90(\.0+)?|[0-8]?\d(\.\d+)?)$/;
const LONG_REGEX = /^-?(180(\.0+)?|1[0-7]\d(\.\d+)?|[0-9]?\d(\.\d+)?)$/;
const PHONE_REGEX = /^\d{10}$/;

const EditRestaurant = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    email: '',
    mobileNumber: '',
    password: '',
    latitude: '',
    longitude: '',
    openingTime: '',
    closingTime: '',
    forTwo: '',
    offerPercentage: '',
    couponPercentage: '',
    interestId: 0,
    ratting: 0,
    placeType: 'RESTAURANT',
    tableBookingTerms: '',
    breakfast: {
      available: false,
      startTime: '',
      endTime: '',
    },
    lunch: {
      available: false,
      startTime: '',
      endTime: '',
    },
    dinner: {
      available: false,
      startTime: '',
      endTime: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { showToast } = useToast();
  const [interests, setInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(true);
  
  // Image uploads
  const [logoImage, setLogoImage] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [existingLogo, setExistingLogo] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [detailPreviews, setDetailPreviews] = useState([]);
  const [existingDetailImages, setExistingDetailImages] = useState([]);
  const [foodMenuImages, setFoodMenuImages] = useState([]);
  const [foodMenuPreviews, setFoodMenuPreviews] = useState([]);
  const [existingFoodMenuImages, setExistingFoodMenuImages] = useState([]);
  const [beveragesMenuImages, setBeveragesMenuImages] = useState([]);
  const [beveragesMenuPreviews, setBeveragesMenuPreviews] = useState([]);
  const [existingBeveragesMenuImages, setExistingBeveragesMenuImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await api.get('/interest');
        setInterests(response.data || []);
      } catch (error) {
        console.error('Error fetching interests:', error);
      } finally {
        setLoadingInterests(false);
      }
    };
    fetchInterests();
  }, []);

  const fetchRestaurant = useCallback(async () => {
    try {
      const response = await api.get(`/place/${id}`);
      const restaurant = response.data?.data || response.data;
      
      setFormData({
        name: restaurant.name || '',
        address: restaurant.address || '',
        description: restaurant.description || '',
        email: restaurant.email || '',
        mobileNumber: restaurant.mobileNumber || '',
        latitude: restaurant.latitude || '',
        longitude: restaurant.longitude || '',
        openingTime: restaurant.openingTime || '',
        closingTime: restaurant.closingTime || '',
        forTwo: restaurant.forTwo || '',
        offerPercentage: restaurant.offerPercentage || '',
        couponPercentage: restaurant.couponPercentage || '',
        interestId: restaurant.interestId || 0,
        ratting: restaurant.ratting || 0,
        placeType: restaurant.placeType || 'RESTAURANT',
        tableBookingTerms: restaurant.tableBookingTerms || '',
        breakfast: restaurant.breakfast || {
          available: false,
          startTime: '',
          endTime: '',
        },
        lunch: restaurant.lunch || {
          available: false,
          startTime: '',
          endTime: '',
        },
        dinner: restaurant.dinner || {
          available: false,
          startTime: '',
          endTime: '',
        },
      });

      // Set existing images
      if (restaurant.logo) {
        setExistingLogo(restaurant.logo);
      }
      if (restaurant.detailImage) {
        setExistingDetailImages(Array.isArray(restaurant.detailImage) ? restaurant.detailImage : [restaurant.detailImage]);
      }
      if (restaurant.foodMenuImages) {
        setExistingFoodMenuImages(Array.isArray(restaurant.foodMenuImages) ? restaurant.foodMenuImages : [restaurant.foodMenuImages]);
      }
      if (restaurant.beveragesMenuImages) {
        setExistingBeveragesMenuImages(Array.isArray(restaurant.beveragesMenuImages) ? restaurant.beveragesMenuImages : [restaurant.beveragesMenuImages]);
      }
    } catch (error) {
      showToast('Failed to fetch restaurant details', 'error');
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  // Helper function to convert time string (HH:MM) to minutes for comparison
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to check if two time ranges overlap
  const doTimesOverlap = (start1, end1, start2, end2) => {
    if (!start1 || !end1 || !start2 || !end2) return false;
    
    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);
    
    // Check if ranges overlap: start1 < end2 && start2 < end1
    return start1Min < end2Min && start2Min < end1Min;
  };

  // Helper function to check if a time is within a range (handles midnight crossover)
  const isTimeInRange = (time, rangeStart, rangeEnd) => {
    if (!time || !rangeStart || !rangeEnd) return false;
    
    const timeMin = timeToMinutes(time);
    const rangeStartMin = timeToMinutes(rangeStart);
    const rangeEndMin = timeToMinutes(rangeEnd);
    
    // Handle case where closing time is next day (e.g., 22:00 to 02:00)
    if (rangeEndMin < rangeStartMin) {
      // Range crosses midnight
      return timeMin >= rangeStartMin || timeMin <= rangeEndMin;
    } else {
      // Normal range within same day
      return timeMin >= rangeStartMin && timeMin <= rangeEndMin;
    }
  };

  const validateForm = () => {
    const errors = {};
    let hasErrors = false;

    // Validate email (only if provided)
    const trimmedEmail = formData.email?.toString().trim();
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    // Validate latitude (only if provided)
    const trimmedLatitude = formData.latitude?.toString().trim();
    if (trimmedLatitude && !LAT_REGEX.test(trimmedLatitude)) {
      errors.latitude = 'Please enter a valid latitude (-90 to 90)';
      hasErrors = true;
    }

    // Validate longitude (only if provided)
    const trimmedLongitude = formData.longitude?.toString().trim();
    if (trimmedLongitude && !LONG_REGEX.test(trimmedLongitude)) {
      errors.longitude = 'Please enter a valid longitude (-180 to 180)';
      hasErrors = true;
    }

    // Validate mobile number (only if provided)
    const trimmedMobileNumber = formData.mobileNumber?.toString().trim();
    if (trimmedMobileNumber && !PHONE_REGEX.test(trimmedMobileNumber)) {
      errors.mobileNumber = 'Mobile number must be exactly 10 digits';
      hasErrors = true;
    }

    // Validate opening time is required
    if (!formData.openingTime) {
      errors.openingTime = 'Opening time is required';
      hasErrors = true;
    }

    // Validate closing time is required
    if (!formData.closingTime) {
      errors.closingTime = 'Closing time is required';
      hasErrors = true;
    }

    // Validate opening and closing time cannot be the same
    if (formData.openingTime && formData.closingTime) {
      if (formData.openingTime === formData.closingTime) {
        errors.openingTime = 'Opening time and closing time cannot be the same';
        errors.closingTime = 'Opening time and closing time cannot be the same';
        hasErrors = true;
      }
    }

    // Validate meal timings - start time and end time cannot be the same
    if (formData.breakfast.available) {
      if (formData.breakfast.startTime && formData.breakfast.endTime) {
        if (formData.breakfast.startTime === formData.breakfast.endTime) {
          errors['breakfast.startTime'] = 'Breakfast start time and end time cannot be the same';
          errors['breakfast.endTime'] = 'Breakfast start time and end time cannot be the same';
          hasErrors = true;
        }
      }
    }

    if (formData.lunch.available) {
      if (formData.lunch.startTime && formData.lunch.endTime) {
        if (formData.lunch.startTime === formData.lunch.endTime) {
          errors['lunch.startTime'] = 'Lunch start time and end time cannot be the same';
          errors['lunch.endTime'] = 'Lunch start time and end time cannot be the same';
          hasErrors = true;
        }
      }
    }

    if (formData.dinner.available) {
      if (formData.dinner.startTime && formData.dinner.endTime) {
        if (formData.dinner.startTime === formData.dinner.endTime) {
          errors['dinner.startTime'] = 'Dinner start time and end time cannot be the same';
          errors['dinner.endTime'] = 'Dinner start time and end time cannot be the same';
          hasErrors = true;
        }
      }
    }

    // Validate meal timings - check for overlaps between different meals
    if (formData.breakfast.available && formData.breakfast.startTime && formData.breakfast.endTime) {
      if (formData.lunch.available && formData.lunch.startTime && formData.lunch.endTime) {
        if (doTimesOverlap(
          formData.breakfast.startTime,
          formData.breakfast.endTime,
          formData.lunch.startTime,
          formData.lunch.endTime
        )) {
          errors['breakfast.startTime'] = 'Breakfast and Lunch times cannot overlap';
          errors['lunch.startTime'] = 'Breakfast and Lunch times cannot overlap';
          hasErrors = true;
        }
      }
      if (formData.dinner.available && formData.dinner.startTime && formData.dinner.endTime) {
        if (doTimesOverlap(
          formData.breakfast.startTime,
          formData.breakfast.endTime,
          formData.dinner.startTime,
          formData.dinner.endTime
        )) {
          errors['breakfast.startTime'] = 'Breakfast and Dinner times cannot overlap';
          errors['dinner.startTime'] = 'Breakfast and Dinner times cannot overlap';
          hasErrors = true;
        }
      }
    }

    if (formData.lunch.available && formData.lunch.startTime && formData.lunch.endTime) {
      if (formData.dinner.available && formData.dinner.startTime && formData.dinner.endTime) {
        if (doTimesOverlap(
          formData.lunch.startTime,
          formData.lunch.endTime,
          formData.dinner.startTime,
          formData.dinner.endTime
        )) {
          errors['lunch.startTime'] = 'Lunch and Dinner times cannot overlap';
          errors['dinner.startTime'] = 'Lunch and Dinner times cannot overlap';
          hasErrors = true;
        }
      }
    }

    // Validate meal times must be within opening and closing time
    if (formData.openingTime && formData.closingTime) {
      // Validate breakfast times
      if (formData.breakfast.available) {
        if (formData.breakfast.startTime && !isTimeInRange(formData.breakfast.startTime, formData.openingTime, formData.closingTime)) {
          errors['breakfast.startTime'] = 'Breakfast start time must be between opening and closing time';
          hasErrors = true;
        }
        if (formData.breakfast.endTime && !isTimeInRange(formData.breakfast.endTime, formData.openingTime, formData.closingTime)) {
          errors['breakfast.endTime'] = 'Breakfast end time must be between opening and closing time';
          hasErrors = true;
        }
      }

      // Validate lunch times
      if (formData.lunch.available) {
        if (formData.lunch.startTime && !isTimeInRange(formData.lunch.startTime, formData.openingTime, formData.closingTime)) {
          errors['lunch.startTime'] = 'Lunch start time must be between opening and closing time';
          hasErrors = true;
        }
        if (formData.lunch.endTime && !isTimeInRange(formData.lunch.endTime, formData.openingTime, formData.closingTime)) {
          errors['lunch.endTime'] = 'Lunch end time must be between opening and closing time';
          hasErrors = true;
        }
      }

      // Validate dinner times
      if (formData.dinner.available) {
        if (formData.dinner.startTime && !isTimeInRange(formData.dinner.startTime, formData.openingTime, formData.closingTime)) {
          errors['dinner.startTime'] = 'Dinner start time must be between opening and closing time';
          hasErrors = true;
        }
        if (formData.dinner.endTime && !isTimeInRange(formData.dinner.endTime, formData.openingTime, formData.closingTime)) {
          errors['dinner.endTime'] = 'Dinner end time must be between opening and closing time';
          hasErrors = true;
        }
      }
    }

    // Validate rating (only if provided)
    const trimmedRating = formData.ratting?.toString().trim();
    if (trimmedRating) {
      const numericRating = Number(trimmedRating);
      const isInvalidRating = Number.isNaN(numericRating) || numericRating < 0 || numericRating > 5;
      if (isInvalidRating) {
        errors.ratting = 'Rating must be between 0 and 5';
        hasErrors = true;
      }
    }

    // Validate forTwo (only if provided)
    const trimmedForTwo = formData.forTwo?.toString().trim();
    if (trimmedForTwo) {
      const validPrice = /^\d{1,5}$/;
      if (!validPrice.test(trimmedForTwo)) {
        errors.forTwo = 'Price for Two must be numeric and up to 5 digits';
        hasErrors = true;
      }
    }

    // Validate offerPercentage (only if provided)
    const trimmedOffer = formData.offerPercentage?.toString().trim();
    if (trimmedOffer) {
      const numericOffer = Number(trimmedOffer);
      const isInvalidOffer = Number.isNaN(numericOffer) || numericOffer < 0 || numericOffer > 100;
      if (isInvalidOffer) {
        errors.offerPercentage = 'Offer percentage must be between 0 and 100';
        hasErrors = true;
      }
    }

    // Validate couponPercentage (only if provided)
    const trimmedCoupon = formData.couponPercentage?.toString().trim();
    if (trimmedCoupon) {
      const numericCoupon = Number(trimmedCoupon);
      const isInvalidCoupon = Number.isNaN(numericCoupon) || numericCoupon < 0 || numericCoupon > 100;
      if (isInvalidCoupon) {
        errors.couponPercentage = 'Coupon percentage must be between 0 and 100';
        hasErrors = true;
      }
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (name.startsWith('breakfast.') || name.startsWith('lunch.') || name.startsWith('dinner.')) {
      const [mealType, field] = name.split('.');
      const fieldKey = `${mealType}.${field}`;
      setFormData({
        ...formData,
        [mealType]: {
          ...formData[mealType],
          [field]: type === 'checkbox' ? checked : value,
        },
      });
      // Clear meal time errors
      if (fieldErrors[fieldKey]) {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldKey];
          return newErrors;
        });
      }
    } else {
    setFormData({
      ...formData,
        [name]: name === 'interestId' ? parseInt(value) || 0 : value,
      });
    }
  };

  const handleMobileNumberChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // If non-numeric characters were removed, show error
    if (value !== numericValue && numericValue.length < value.length) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: 'Only numbers are allowed in mobile number'
      }));
    } else {
      // Clear error if valid input
      if (fieldErrors[name]) {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
    
    // Update form data with only numeric value
    setFormData({
      ...formData,
      [name]: numericValue,
    });
  };

  const handleMobileNumberKeyPress = (e) => {
    // Allow: backspace, delete, tab, escape, enter, and numbers
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
      setFieldErrors(prev => ({
        ...prev,
        mobileNumber: 'Only numbers are allowed in mobile number'
      }));
    }
  };

  const handleRemoveLogo = () => {
    setLogoImage(null);
    setLogoPreview(null);
    // Clear the file input
    const fileInput = document.getElementById('logoImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemoveDetailImage = (index) => {
    const newImages = detailImages.filter((_, i) => i !== index);
    const newPreviews = detailPreviews.filter((_, i) => i !== index);
    setDetailImages(newImages);
    setDetailPreviews(newPreviews);
  };

  const handleRemoveFoodMenuImage = (index) => {
    const newImages = foodMenuImages.filter((_, i) => i !== index);
    const newPreviews = foodMenuPreviews.filter((_, i) => i !== index);
    setFoodMenuImages(newImages);
    setFoodMenuPreviews(newPreviews);
  };

  const handleRemoveBeveragesMenuImage = (index) => {
    const newImages = beveragesMenuImages.filter((_, i) => i !== index);
    const newPreviews = beveragesMenuPreviews.filter((_, i) => i !== index);
    setBeveragesMenuImages(newImages);
    setBeveragesMenuPreviews(newPreviews);
  };

  const handleImageChange = (type, files) => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB in bytes
    const MAX_IMAGES = 10;

    if (type === 'logo') {
      const file = files[0] || null;
      
      // Validate file size
      if (file && file.size > MAX_FILE_SIZE) {
        setFieldErrors(prev => ({
          ...prev,
          logoImage: 'Image size must be less than 2 MB'
        }));
        return;
      }
      
      setLogoImage(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setLogoPreview(null);
      }
    } else if (type === 'detail') {
      if (!files || files.length === 0) {
        setDetailImages([]);
        setDetailPreviews([]);
        return;
      }
      
      const fileArray = Array.from(files);
      const totalImages = existingDetailImages.length + fileArray.length;
      
      // Validate total count (existing + new should not exceed 10)
      if (totalImages > MAX_IMAGES) {
        setFieldErrors(prev => ({
          ...prev,
          detailImages: `Maximum ${MAX_IMAGES} images allowed. You have ${existingDetailImages.length} existing images and selected ${fileArray.length} new images.`
        }));
        // Clear the file input
        const fileInput = document.getElementById('detailImages');
        if (fileInput) {
          fileInput.value = '';
        }
        return;
      }
      
      // Validate each file size
      const oversizedFiles = fileArray.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        setFieldErrors(prev => ({
          ...prev,
          detailImages: `Some images exceed 2 MB limit. Please select smaller images.`
        }));
        return;
      }
      
      // Clear any previous errors
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.detailImages;
        return newErrors;
      });
      
      // Set images first
      setDetailImages(fileArray);
      
      // Generate previews for all files
      const previewPromises = fileArray.map((file, index) => {
        return new Promise((resolve) => {
          try {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) {
                resolve({ index, preview: reader.result });
              } else {
                console.error('No result for file:', file.name);
                resolve({ index, preview: null });
              }
            };
            reader.onerror = (error) => {
              console.error('Error reading file:', file.name, error);
              resolve({ index, preview: null });
            };
            reader.readAsDataURL(file);
          } catch (error) {
            console.error('Exception reading file:', file.name, error);
            resolve({ index, preview: null });
          }
        });
      });
      
      Promise.all(previewPromises)
        .then((results) => {
          // Sort by index to maintain file order
          results.sort((a, b) => a.index - b.index);
          const previews = results.map(r => r.preview).filter(Boolean);
          
          if (previews.length !== fileArray.length) {
            console.warn(`Generated ${previews.length} previews out of ${fileArray.length} files`);
          }
          
          // Use functional update to ensure we're setting the latest state
          setDetailPreviews(() => previews);
          
          if (previews.length === 0) {
            showToast('Failed to generate previews for selected images', 'error');
          } else if (previews.length < fileArray.length) {
            showToast(`Generated ${previews.length} out of ${fileArray.length} previews`, 'warning');
          }
        })
        .catch((error) => {
          console.error('Error in Promise.all for detail images:', error);
          showToast('Error generating image previews', 'error');
        });
    } else if (type === 'foodMenu') {
      if (!files || files.length === 0) {
        setFoodMenuImages([]);
        setFoodMenuPreviews([]);
        return;
      }
      
      const fileArray = Array.from(files);
      const totalImages = existingFoodMenuImages.length + fileArray.length;
      
      // Validate total count (existing + new should not exceed 10)
      if (totalImages > MAX_IMAGES) {
        setFieldErrors(prev => ({
          ...prev,
          foodMenuImages: `Maximum ${MAX_IMAGES} images allowed. You have ${existingFoodMenuImages.length} existing images and selected ${fileArray.length} new images.`
        }));
        // Clear the file input
        const fileInput = document.getElementById('foodMenuImages');
        if (fileInput) {
          fileInput.value = '';
        }
        return;
      }
      
      // Validate each file size
      const oversizedFiles = fileArray.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        setFieldErrors(prev => ({
          ...prev,
          foodMenuImages: `Some images exceed 2 MB limit. Please select smaller images.`
        }));
        return;
      }
      
      // Clear any previous errors
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.foodMenuImages;
        return newErrors;
      });
      
      // Set images first
      setFoodMenuImages(fileArray);
      
      // Generate previews for all files
      const previewPromises = fileArray.map((file, index) => {
        return new Promise((resolve) => {
          try {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) {
                resolve({ index, preview: reader.result });
              } else {
                console.error('No result for file:', file.name);
                resolve({ index, preview: null });
              }
            };
            reader.onerror = (error) => {
              console.error('Error reading file:', file.name, error);
              resolve({ index, preview: null });
            };
            reader.readAsDataURL(file);
          } catch (error) {
            console.error('Exception reading file:', file.name, error);
            resolve({ index, preview: null });
          }
        });
      });
      
      Promise.all(previewPromises)
        .then((results) => {
          // Sort by index to maintain file order
          results.sort((a, b) => a.index - b.index);
          const previews = results.map(r => r.preview).filter(Boolean);
          
          if (previews.length !== fileArray.length) {
            console.warn(`Generated ${previews.length} previews out of ${fileArray.length} files`);
          }
          
          // Use functional update to ensure we're setting the latest state
          setFoodMenuPreviews(() => previews);
          
          if (previews.length === 0) {
            showToast('Failed to generate previews for selected images', 'error');
          } else if (previews.length < fileArray.length) {
            showToast(`Generated ${previews.length} out of ${fileArray.length} previews`, 'warning');
          }
        })
        .catch((error) => {
          console.error('Error in Promise.all for food menu images:', error);
          showToast('Error generating image previews', 'error');
        });
    } else if (type === 'beveragesMenu') {
      if (!files || files.length === 0) {
        setBeveragesMenuImages([]);
        setBeveragesMenuPreviews([]);
        return;
      }
      
      const fileArray = Array.from(files);
      const totalImages = existingBeveragesMenuImages.length + fileArray.length;
      
      // Validate total count (existing + new should not exceed 10)
      if (totalImages > MAX_IMAGES) {
        setFieldErrors(prev => ({
          ...prev,
          beveragesMenuImages: `Maximum ${MAX_IMAGES} images allowed. You have ${existingBeveragesMenuImages.length} existing images and selected ${fileArray.length} new images.`
        }));
        // Clear the file input
        const fileInput = document.getElementById('beveragesMenuImages');
        if (fileInput) {
          fileInput.value = '';
        }
        return;
      }
      
      // Validate each file size
      const oversizedFiles = fileArray.filter(file => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        setFieldErrors(prev => ({
          ...prev,
          beveragesMenuImages: `Some images exceed 2 MB limit. Please select smaller images.`
        }));
        return;
      }
      
      // Clear any previous errors
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.beveragesMenuImages;
        return newErrors;
      });
      
      // Set images first
      setBeveragesMenuImages(fileArray);
      
      // Generate previews for all files
      const previewPromises = fileArray.map((file, index) => {
        return new Promise((resolve) => {
          try {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) {
                resolve({ index, preview: reader.result });
              } else {
                console.error('No result for file:', file.name);
                resolve({ index, preview: null });
              }
            };
            reader.onerror = (error) => {
              console.error('Error reading file:', file.name, error);
              resolve({ index, preview: null });
            };
            reader.readAsDataURL(file);
          } catch (error) {
            console.error('Exception reading file:', file.name, error);
            resolve({ index, preview: null });
          }
        });
      });
      
      Promise.all(previewPromises)
        .then((results) => {
          // Sort by index to maintain file order
          results.sort((a, b) => a.index - b.index);
          const previews = results.map(r => r.preview).filter(Boolean);
          
          if (previews.length !== fileArray.length) {
            console.warn(`Generated ${previews.length} previews out of ${fileArray.length} files`);
          }
          
          // Use functional update to ensure we're setting the latest state
          setBeveragesMenuPreviews(() => previews);
          
          if (previews.length === 0) {
            showToast('Failed to generate previews for selected images', 'error');
          } else if (previews.length < fileArray.length) {
            showToast(`Generated ${previews.length} out of ${fileArray.length} previews`, 'warning');
          }
        })
        .catch((error) => {
          console.error('Error in Promise.all for beverages menu images:', error);
          showToast('Error generating image previews', 'error');
        });
    }
  };

  const uploadImage = async (endpoint, formDataField, files) => {
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    if (files.length === 1) {
      formData.append(formDataField, files[0]);
    } else {
      files.forEach((file) => {
        formData.append(formDataField, file);
      });
    }

    try {
      await api.post(`/place/${id}/${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error(`Error uploading ${endpoint}:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);

    try {
      // Prepare payload with only changed fields
      const payload = {
        placeId: parseInt(id),
      };

      // Only include fields that have values
      if (formData.address) payload.address = formData.address;
      if (formData.name) payload.name = formData.name;
      if (formData.description) payload.description = formData.description;
      if (formData.email) {
        const trimmedEmail = formData.email.toString().trim();
        if (trimmedEmail) payload.email = trimmedEmail;
      }
      if (formData.mobileNumber) {
        const trimmedMobileNumber = formData.mobileNumber.toString().trim();
        if (trimmedMobileNumber) payload.mobileNumber = trimmedMobileNumber;
      }
      if (formData.password && formData.password.trim()) payload.password = formData.password;
      if (formData.latitude) {
        const trimmedLatitude = formData.latitude.toString().trim();
        if (trimmedLatitude) payload.latitude = trimmedLatitude;
      }
      if (formData.longitude) {
        const trimmedLongitude = formData.longitude.toString().trim();
        if (trimmedLongitude) payload.longitude = trimmedLongitude;
      }
      if (formData.openingTime) payload.openingTime = formData.openingTime;
      if (formData.closingTime) payload.closingTime = formData.closingTime;
      if (formData.forTwo) payload.forTwo = formData.forTwo;
      if (formData.offerPercentage) payload.offerPercentage = formData.offerPercentage;
      if (formData.couponPercentage) payload.couponPercentage = formData.couponPercentage;
      if (formData.interestId) payload.interestId = parseInt(formData.interestId);
      if (formData.ratting) payload.ratting = parseFloat(formData.ratting);
      if (formData.tableBookingTerms) payload.tableBookingTerms = formData.tableBookingTerms;
      if (formData.breakfast) payload.breakfast = formData.breakfast;
      if (formData.lunch) payload.lunch = formData.lunch;
      if (formData.dinner) payload.dinner = formData.dinner;

      await api.put('/place', payload);

      setUploadingImages(true);

      // Upload images sequentially
      if (logoImage) {
        await uploadImage('addLogo', 'logoImage', [logoImage]);
      }

      if (detailImages.length > 0) {
        await uploadImage('addDetailImage', 'detailImage', detailImages);
      }

      if (foodMenuImages.length > 0) {
        await uploadImage('addFoodMenuImages', 'menuImages', foodMenuImages);
      }

      if (beveragesMenuImages.length > 0) {
        await uploadImage('addBeveragesMenuImages', 'menuImages', beveragesMenuImages);
      }

      navigate('/restaurants');
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      // Check if error contains field-specific errors
      if (errorData?.errors && typeof errorData.errors === 'object') {
        // Map API field errors to fieldErrors state
        const apiFieldErrors = {};
        Object.keys(errorData.errors).forEach((field) => {
          const fieldName = field.toLowerCase();
          // Map common field names
          if (fieldName.includes('email')) {
            apiFieldErrors.email = Array.isArray(errorData.errors[field]) 
              ? errorData.errors[field][0] 
              : errorData.errors[field];
          } else if (fieldName.includes('mobile') || fieldName.includes('phone')) {
            apiFieldErrors.mobileNumber = Array.isArray(errorData.errors[field]) 
              ? errorData.errors[field][0] 
              : errorData.errors[field];
          } else if (fieldName.includes('latitude')) {
            apiFieldErrors.latitude = Array.isArray(errorData.errors[field]) 
              ? errorData.errors[field][0] 
              : errorData.errors[field];
          } else if (fieldName.includes('longitude')) {
            apiFieldErrors.longitude = Array.isArray(errorData.errors[field]) 
              ? errorData.errors[field][0] 
              : errorData.errors[field];
          } else if (fieldName.includes('name')) {
            apiFieldErrors.name = Array.isArray(errorData.errors[field]) 
              ? errorData.errors[field][0] 
              : errorData.errors[field];
          } else if (fieldName.includes('address')) {
            apiFieldErrors.address = Array.isArray(errorData.errors[field]) 
              ? errorData.errors[field][0] 
              : errorData.errors[field];
          } else {
            // Try to match field name directly
            apiFieldErrors[field] = Array.isArray(errorData.errors[field]) 
              ? errorData.errors[field][0] 
              : errorData.errors[field];
          }
        });
        
        if (Object.keys(apiFieldErrors).length > 0) {
          setFieldErrors(prev => ({ ...prev, ...apiFieldErrors }));
        }
        
        // Show toast with general message
        const errorMessage = errorData?.message || 
                            errorData?.error || 
                            'Please check the highlighted fields';
        showToast(errorMessage, 'error');
      } else if (status === 500) {
        showToast('Something went wrong', 'error');
      } else if (status === 400) {
        const errorMessage = errorData?.message || 
                            errorData?.error || 
                            error.message || 
                            'Invalid request. Please check your input.';
        showToast(errorMessage, 'error');
      } else {
        const errorMessage = errorData?.message || 
                            errorData?.error || 
                            error.message || 
                            'Failed to update restaurant';
        showToast(errorMessage, 'error');
      }
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <div className="w-full py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              to="/restaurants"
              className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
            >
              ← Back to Restaurants
            </Link>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Restaurant</h1>
            <p className="mt-2 text-gray-600">
              Update restaurant information.
            </p>
              </div>
              <Link
                to={`/restaurants/${id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>


          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Restaurant Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                  />
                </div>
              </div>

                <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      pattern={EMAIL_REGEX.source}
                      value={formData.email}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 sm:text-sm ${
                        fieldErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#ea432b]'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      id="mobileNumber"
                      maxLength="10"
                      value={formData.mobileNumber}
                      onChange={handleMobileNumberChange}
                      onKeyDown={handleMobileNumberKeyPress}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        const numericValue = pastedText.replace(/[^0-9]/g, '');
                        if (numericValue !== pastedText) {
                          setFieldErrors(prev => ({
                            ...prev,
                            mobileNumber: 'Only numbers are allowed in mobile number'
                          }));
                        }
                        setFormData({
                          ...formData,
                          mobileNumber: numericValue.slice(0, 10),
                        });
                      }}
                      placeholder="10 digit mobile number"
                      className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 sm:text-sm ${
                        fieldErrors.mobileNumber ? 'border-red-500' : 'border-gray-300 focus:border-[#ea432b]'
                      }`}
                    />
                    {fieldErrors.mobileNumber && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.mobileNumber}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password (Leave blank to keep current password)
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Only enter a password if you want to change it
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="space-y-6">
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                  </label>
                  <input
                    type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                    onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-[#ea432b] sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                        Latitude
                    </label>
                    <input
                      type="text"
                        name="latitude"
                        id="latitude"
                        value={formData.latitude}
                      onChange={handleChange}
                        placeholder="e.g., 19.305808"
                        pattern={LAT_REGEX.source}
                        className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 sm:text-sm ${
                          fieldErrors.latitude ? 'border-red-500' : 'border-gray-300 focus:border-[#ea432b]'
                        }`}
                    />
                    {fieldErrors.latitude && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.latitude}</p>
                    )}
                  </div>

                  <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                        Longitude
                      </label>
                      <input
                        type="text"
                        name="longitude"
                        id="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="e.g., 73.063109"
                        pattern={LONG_REGEX.source}
                        className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 sm:text-sm ${
                          fieldErrors.longitude ? 'border-red-500' : 'border-gray-300 focus:border-[#ea432b]'
                        }`}
                      />
                      {fieldErrors.longitude && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.longitude}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Operating Hours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="openingTime" className="block text-sm font-medium text-gray-700">
                      Opening Time
                    </label>
                    <TimePicker
                      name="openingTime"
                      id="openingTime"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                      error={fieldErrors.openingTime}
                    />
                  </div>

                  <div>
                    <label htmlFor="closingTime" className="block text-sm font-medium text-gray-700">
                      Closing Time
                    </label>
                    <TimePicker
                      name="closingTime"
                      id="closingTime"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                      error={fieldErrors.closingTime}
                    />
                  </div>
                </div>
              </div>

              {/* Meal Times */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Meal Times</h2>
                
                {/* Breakfast */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      name="breakfast.available"
                      id="breakfast.available"
                      checked={formData.breakfast.available}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="breakfast.available" className="ml-2 block text-sm font-medium text-gray-700">
                      Breakfast Available
                    </label>
                  </div>
                  {formData.breakfast.available && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="breakfast.startTime" className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <TimePicker
                          name="breakfast.startTime"
                          id="breakfast.startTime"
                          value={formData.breakfast.startTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                          error={fieldErrors['breakfast.startTime']}
                        />
                      </div>
                      <div>
                        <label htmlFor="breakfast.endTime" className="block text-sm font-medium text-gray-700">
                          End Time
                        </label>
                        <TimePicker
                          name="breakfast.endTime"
                          id="breakfast.endTime"
                          value={formData.breakfast.endTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                          error={fieldErrors['breakfast.endTime']}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Lunch */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      name="lunch.available"
                      id="lunch.available"
                      checked={formData.lunch.available}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lunch.available" className="ml-2 block text-sm font-medium text-gray-700">
                      Lunch Available
                    </label>
                  </div>
                  {formData.lunch.available && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="lunch.startTime" className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <TimePicker
                          name="lunch.startTime"
                          id="lunch.startTime"
                          value={formData.lunch.startTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                          error={fieldErrors['lunch.startTime']}
                        />
                      </div>
                      <div>
                        <label htmlFor="lunch.endTime" className="block text-sm font-medium text-gray-700">
                          End Time
                        </label>
                        <TimePicker
                          name="lunch.endTime"
                          id="lunch.endTime"
                          value={formData.lunch.endTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                          error={fieldErrors['lunch.endTime']}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dinner */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      name="dinner.available"
                      id="dinner.available"
                      checked={formData.dinner.available}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="dinner.available" className="ml-2 block text-sm font-medium text-gray-700">
                      Dinner Available
                    </label>
                  </div>
                  {formData.dinner.available && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dinner.startTime" className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <TimePicker
                          name="dinner.startTime"
                          id="dinner.startTime"
                          value={formData.dinner.startTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                          error={fieldErrors['dinner.startTime']}
                        />
                      </div>
                      <div>
                        <label htmlFor="dinner.endTime" className="block text-sm font-medium text-gray-700">
                          End Time
                  </label>
                        <TimePicker
                          name="dinner.endTime"
                          id="dinner.endTime"
                          value={formData.dinner.endTime}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                          error={fieldErrors['dinner.endTime']}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="forTwo" className="block text-sm font-medium text-gray-700">
                      Price for Two
                    </label>
                    <input
                      type="text"
                      name="forTwo"
                      id="forTwo"
                      value={formData.forTwo}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 sm:text-sm ${
                        fieldErrors.forTwo ? 'border-red-500' : 'border-gray-300 focus:border-[#ea432b]'
                      }`}
                    />
                    {fieldErrors.forTwo && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.forTwo}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="interestId" className="block text-sm font-medium text-gray-700">
                      Interest
                    </label>
                    <select
                      name="interestId"
                      id="interestId"
                      value={formData.interestId}
                      onChange={handleChange}
                      disabled={loadingInterests}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="0">Select an interest</option>
                      {interests.map((interest) => (
                        <option key={interest.interestId} value={interest.interestId}>
                          {interest.interestName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label htmlFor="offerPercentage" className="block text-sm font-medium text-gray-700">
                      Offer Percentage
                    </label>
                    <input
                      type="text"
                      name="offerPercentage"
                      id="offerPercentage"
                      value={formData.offerPercentage}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 sm:text-sm ${
                        fieldErrors.offerPercentage ? 'border-red-500' : 'border-gray-300 focus:border-[#ea432b]'
                      }`}
                    />
                    {fieldErrors.offerPercentage && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.offerPercentage}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="couponPercentage" className="block text-sm font-medium text-gray-700">
                      Coupon Percentage
                    </label>
                    <input
                      type="text"
                      name="couponPercentage"
                      id="couponPercentage"
                      value={formData.couponPercentage}
                      onChange={handleChange}
                      className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 sm:text-sm ${
                        fieldErrors.couponPercentage ? 'border-red-500' : 'border-gray-300 focus:border-[#ea432b]'
                      }`}
                    />
                    {fieldErrors.couponPercentage && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.couponPercentage}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="ratting" className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <input
                    type="number"
                    name="ratting"
                    id="ratting"
                    value={formData.ratting}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className={`mt-1 block w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 sm:text-sm ${
                      fieldErrors.ratting ? 'border-red-500' : 'border-gray-300 focus:border-[#ea432b]'
                    }`}
                  />
                  {fieldErrors.ratting && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.ratting}</p>
                  )}
                </div>

                <div className="mt-6">
                  <label htmlFor="tableBookingTerms" className="block text-sm font-medium text-gray-700">
                    Table Booking Terms
                  </label>
                  <textarea
                    name="tableBookingTerms"
                    id="tableBookingTerms"
                    rows={3}
                    value={formData.tableBookingTerms}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-0 focus:border-[#ea432b] sm:text-sm"
                  />
                </div>
              </div>

              {/* Image Uploads */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Images</h2>
                
                <div className="space-y-6">
                <div>
                    <label htmlFor="logoImage" className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Image
                      <span className="text-xs text-gray-500 font-normal ml-2">(Max 2 MB)</span>
                  </label>
                    <input
                      type="file"
                      name="logoImage"
                      id="logoImage"
                      accept="image/*"
                      onChange={(e) => handleImageChange('logo', e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="mt-4 flex gap-4">
                      {existingLogo && !logoPreview && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                          <img
                            src={existingLogo}
                            alt="Current logo"
                            className="h-32 w-32 object-cover rounded-lg border border-[#ea432b]"
                          />
                        </div>
                      )}
                      {logoPreview && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">New Logo Preview:</p>
                          <div className="relative w-fit">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="h-32 w-32 object-cover rounded-lg border border-[#ea432b]"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 z-10"
                              title="Remove logo"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                </div>

                  <div>
                    <label htmlFor="detailImages" className="block text-sm font-medium text-gray-700 mb-2">
                      Detail Images (Multiple)
                      <span className="text-xs text-gray-500 font-normal ml-2">(Max 10 images total, 2 MB each)</span>
                    </label>
                    <input
                      type="file"
                      name="detailImages"
                      id="detailImages"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageChange('detail', e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {fieldErrors.detailImages && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.detailImages}</p>
                    )}
                    {(existingDetailImages.length > 0 || detailPreviews.length > 0) && (
                      <div className="mt-4">
                        {existingDetailImages.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current Detail Images ({existingDetailImages.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {existingDetailImages.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Detail ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-lg border border-[#ea432b]"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {detailPreviews.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">New Detail Images Preview ({detailPreviews.length}):</p>
                            <div className="flex flex-wrap gap-4">
                              {detailPreviews.map((preview, index) => (
                                <div key={`detail-preview-${index}`} className="relative">
                                  <img
                                    src={preview}
                                    alt={`Detail preview ${index + 1}`}
                                    className="h-24 w-24 object-cover rounded-lg border border-[#ea432b]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDetailImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 z-10 shadow-md"
                                    title="Remove image"
                                    aria-label="Remove image"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                </div>
              )}
                  </div>

              <div>
                    <label htmlFor="foodMenuImages" className="block text-sm font-medium text-gray-700 mb-2">
                      Food Menu Images (Multiple)
                      <span className="text-xs text-gray-500 font-normal ml-2">(Max 10 images total, 2 MB each)</span>
                </label>
                <input
                  type="file"
                      name="foodMenuImages"
                      id="foodMenuImages"
                  accept="image/*"
                      multiple
                      onChange={(e) => handleImageChange('foodMenu', e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {fieldErrors.foodMenuImages && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.foodMenuImages}</p>
                    )}
                    {(existingFoodMenuImages.length > 0 || foodMenuPreviews.length > 0) && (
                      <div className="mt-4">
                        {existingFoodMenuImages.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current Food Menu Images ({existingFoodMenuImages.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {existingFoodMenuImages.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Food menu ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-lg border border-[#ea432b]"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {foodMenuPreviews.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">New Food Menu Images Preview ({foodMenuPreviews.length}):</p>
                            <div className="flex flex-wrap gap-4">
                              {foodMenuPreviews.map((preview, index) => (
                                <div key={`food-menu-preview-${index}`} className="relative">
                                  <img
                                    src={preview}
                                    alt={`Food menu preview ${index + 1}`}
                                    className="h-24 w-24 object-cover rounded-lg border border-[#ea432b]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFoodMenuImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 z-10 shadow-md"
                                    title="Remove image"
                                    aria-label="Remove image"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
              </div>

              <div>
                    <label htmlFor="beveragesMenuImages" className="block text-sm font-medium text-gray-700 mb-2">
                      Beverages Menu Images (Multiple)
                      <span className="text-xs text-gray-500 font-normal ml-2">(Max 10 images total, 2 MB each)</span>
                </label>
                    <input
                      type="file"
                      name="beveragesMenuImages"
                      id="beveragesMenuImages"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageChange('beveragesMenu', e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {fieldErrors.beveragesMenuImages && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.beveragesMenuImages}</p>
                    )}
                    {(existingBeveragesMenuImages.length > 0 || beveragesMenuPreviews.length > 0) && (
                      <div className="mt-4">
                        {existingBeveragesMenuImages.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current Beverages Menu Images ({existingBeveragesMenuImages.length}):</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {existingBeveragesMenuImages.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Beverages menu ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-lg border border-[#ea432b]"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {beveragesMenuPreviews.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">New Beverages Menu Images Preview ({beveragesMenuPreviews.length}):</p>
                            <div className="flex flex-wrap gap-4">
                              {beveragesMenuPreviews.map((preview, index) => (
                                <div key={`beverages-menu-preview-${index}`} className="relative">
                                  <img
                                    src={preview}
                                    alt={`Beverages menu preview ${index + 1}`}
                                    className="h-24 w-24 object-cover rounded-lg border border-[#ea432b]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBeveragesMenuImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 z-10 shadow-md"
                                    title="Remove image"
                                    aria-label="Remove image"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/restaurants')}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImages}
                  className="bg-[#EB422B] text-white px-4 py-2 rounded-md hover:bg-[#EB422B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImages ? 'Uploading Images...' : saving ? 'Saving...' : 'Update Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurant;
