import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";

interface CenteredDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CenteredDatePicker({ value, onChange, placeholder = "DD.MM.YYYY", className = "" }: CenteredDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse current value
  useEffect(() => {
    if (value) {
      const parts = value.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          setSelectedDate({ day, month, year });
          return;
        }
      }
    }
    setSelectedDate(null);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const handleDateSelect = (type: 'day' | 'month' | 'year', val: number) => {
    const current = selectedDate || { day: 1, month: 1, year: currentYear };
    
    let newDate = { ...current };
    
    if (type === 'year') {
      newDate.year = val;
      const daysInNewMonth = getDaysInMonth(newDate.month, newDate.year);
      if (newDate.day > daysInNewMonth) {
        newDate.day = daysInNewMonth;
      }
    } else if (type === 'month') {
      newDate.month = val;
      const daysInNewMonth = getDaysInMonth(newDate.month, newDate.year);
      if (newDate.day > daysInNewMonth) {
        newDate.day = daysInNewMonth;
      }
    } else {
      newDate.day = val;
    }

    setSelectedDate(newDate);
    onChange(`${String(newDate.day).padStart(2, '0')}.${String(newDate.month).padStart(2, '0')}.${newDate.year}`);
  };

  const formatDisplayValue = () => {
    if (selectedDate) {
      return `${String(selectedDate.day).padStart(2, '0')}.${String(selectedDate.month).padStart(2, '0')}.${selectedDate.year}`;
    }
    return value || '';
  };

  const daysInSelectedMonth = selectedDate ? getDaysInMonth(selectedDate.month, selectedDate.year) : 31;
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-black border-2 border-[#00FFFF] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#00FFFF] flex items-center justify-between text-lg font-bold ${className}`}
      >
        <span className={value ? "text-white" : "text-gray-400"}>
          {formatDisplayValue() || placeholder}
        </span>
        <Calendar size={20} className="text-[#00FFFF]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black border-2 border-[#00FFFF] rounded-lg shadow-lg z-50 max-h-64 overflow-hidden flex"
          >
            {/* Days - Центрирован */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 border-b border-[#00FFFF] text-center text-[#00FFFF] text-sm font-bold bg-gray-900">
                Day
              </div>
              <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-1 p-2">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => handleDateSelect('day', day)}
                    className={`w-full px-2 py-2 text-sm text-center hover:bg-[#00FFFF] hover:text-black transition-colors rounded ${
                      selectedDate?.day === day ? 'bg-[#00FFFF] text-black font-bold' : 'text-white bg-black'
                    }`}
                  >
                    {String(day).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Months - Центрирован */}
            <div className="flex-1 overflow-y-auto border-l border-[#00FFFF]">
              <div className="p-2 border-b border-[#00FFFF] text-center text-[#00FFFF] text-sm font-bold bg-gray-900">
                Month
              </div>
              <div className="max-h-48 overflow-y-auto">
                {months.map(month => (
                  <button
                    key={month.value}
                    onClick={() => handleDateSelect('month', month.value)}
                    className={`w-full px-2 py-2 text-sm text-center hover:bg-[#00FFFF] hover:text-black transition-colors ${
                      selectedDate?.month === month.value ? 'bg-[#00FFFF] text-black font-bold' : 'text-white bg-black'
                    }`}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Years - Центрирован */}
            <div className="flex-1 overflow-y-auto border-l border-[#00FFFF]">
              <div className="p-2 border-b border-[#00FFFF] text-center text-[#00FFFF] text-sm font-bold bg-gray-900">
                Year
              </div>
              <div className="max-h-48 overflow-y-auto grid grid-cols-3 gap-1 p-2">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => handleDateSelect('year', year)}
                    className={`w-full px-2 py-2 text-sm text-center hover:bg-[#00FFFF] hover:text-black transition-colors rounded ${
                      selectedDate?.year === year ? 'bg-[#00FFFF] text-black font-bold' : 'text-white bg-black'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}