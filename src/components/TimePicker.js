import React, { useState, useRef, useEffect } from 'react';

const TimePicker = ({ value, onChange, name, id, className, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [period, setPeriod] = useState('AM');
  const pickerRef = useRef(null);

  useEffect(() => {
    if (value) {
      // Parse HH:MM format to hours, minutes, and period
      const [h, m] = value.split(':').map(Number);
      if (h === 0) {
        setHours('12');
        setPeriod('AM');
      } else if (h < 12) {
        setHours(h.toString().padStart(2, '0'));
        setPeriod('AM');
      } else if (h === 12) {
        setHours('12');
        setPeriod('PM');
      } else {
        setHours((h - 12).toString().padStart(2, '0'));
        setPeriod('PM');
      }
      setMinutes(m.toString().padStart(2, '0'));
    } else {
      setHours('');
      setMinutes('');
      setPeriod('AM');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTimeChange = (newHours, newMinutes, newPeriod) => {
    let hour24 = 0;
    if (newPeriod === 'AM') {
      hour24 = newHours === '12' ? 0 : parseInt(newHours || 0);
    } else {
      hour24 = newHours === '12' ? 12 : parseInt(newHours || 0) + 12;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${newMinutes.padStart(2, '0')}`;
    
    // Create a synthetic event that matches the expected format
    const syntheticEvent = {
      target: {
        name: name,
        value: timeString,
        type: 'time'
      }
    };
    
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const formatDisplayTime = () => {
    if (!value) return '--:--';
    const [h, m] = value.split(':').map(Number);
    let hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    if (h === 12) hour12 = 12;
    const period = h >= 12 ? 'PM' : 'AM';
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-0 focus:border-[#ea432b] flex items-center justify-between w-full`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {formatDisplayTime()}
        </span>
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
          <div className="grid grid-cols-3 gap-2">
            {/* Hours */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hour</label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                {hourOptions.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => {
                      const newHours = hour;
                      handleTimeChange(newHours, minutes || '00', period);
                    }}
                    className={`w-full px-3 py-2 text-sm hover:bg-blue-50 ${
                      hours === hour ? 'bg-blue-100 font-semibold' : ''
                    }`}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Minute</label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                {minuteOptions.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => {
                      const newMinutes = minute;
                      handleTimeChange(hours || '01', newMinutes, period);
                    }}
                    className={`w-full px-3 py-2 text-sm hover:bg-blue-50 ${
                      minutes === minute ? 'bg-blue-100 font-semibold' : ''
                    }`}
                  >
                    {minute}
                  </button>
                ))}
              </div>
            </div>

            {/* Period */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Period</label>
              <div className="border border-gray-200 rounded">
                <button
                  type="button"
                  onClick={() => {
                    handleTimeChange(hours || '01', minutes || '00', 'AM');
                  }}
                  className={`w-full px-3 py-2 text-sm hover:bg-blue-50 ${
                    period === 'AM' ? 'bg-blue-100 font-semibold' : ''
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleTimeChange(hours || '01', minutes || '00', 'PM');
                  }}
                  className={`w-full px-3 py-2 text-sm hover:bg-blue-50 border-t border-gray-200 ${
                    period === 'PM' ? 'bg-blue-100 font-semibold' : ''
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TimePicker;

