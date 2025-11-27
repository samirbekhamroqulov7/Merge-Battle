import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface CenteredDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CenteredDatePicker({ value, onChange, placeholder = "DD.MM.YYYY", className = "" }: CenteredDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'day' | 'month' | 'year'>('day');
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
    { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
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
    
    // На мобильных автоматически переключаем вкладки
    if (type === 'day') setActiveTab('month');
    else if (type === 'month') setActiveTab('year');
    else setIsOpen(false); // Закрываем после выбора года
    
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

  // Мобильная версия - пошаговый выбор
  const MobileDatePicker = () => (
    <div className="md:hidden">
      {/* Вкладки для мобильных */}
      <div className="flex border-b border-[#00FFFF] mb-4">
        {(['day', 'month', 'year'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center font-bold text-sm ${
              activeTab === tab 
                ? 'text-[#00FFFF] border-b-2 border-[#00FFFF]' 
                : 'text-gray-400'
            }`}
          >
            {tab === 'day' ? 'Day' : tab === 'month' ? 'Month' : 'Year'}
          </button>
        ))}
      </div>

      {/* Контент вкладок */}
      <div className="max-h-48 overflow-y-auto">
        {activeTab === 'day' && (
          <div className="grid grid-cols-5 gap-2 p-2">
            {days.map(day => (
              <button
                key={day}
                onClick={() => handleDateSelect('day', day)}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                  selectedDate?.day === day 
                    ? 'bg-[#00FFFF] text-black' 
                    : 'bg-gray-800 text-white hover:bg-[#00FFFF] hover:text-black'
                }`}
              >
                {String(day).padStart(2, '0')}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'month' && (
          <div className="grid grid-cols-3 gap-2 p-2">
            {months.map(month => (
              <button
                key={month.value}
                onClick={() => handleDateSelect('month', month.value)}
                className={`min-h-[44px] flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                  selectedDate?.month === month.value 
                    ? 'bg-[#00FFFF] text-black' 
                    : 'bg-gray-800 text-white hover:bg-[#00FFFF] hover:text-black'
                }`}
              >
                {month.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'year' && (
          <div className="grid grid-cols-3 gap-2 p-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => handleDateSelect('year', year)}
                className={`min-h-[44px] flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                  selectedDate?.year === year 
                    ? 'bg-[#00FFFF] text-black' 
                    : 'bg-gray-800 text-white hover:bg-[#00FFFF] hover:text-black'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Десктоп версия - все колонки сразу
  const DesktopDatePicker = () => (
    <div className="hidden md:flex">
      {/* Days */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 border-b border-[#00FFFF] text-center text-[#00FFFF] text-sm font-bold bg-gray-900">
          Day
        </div>
        <div className="max-h-48 overflow-y-auto grid grid-cols-4 gap-1 p-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => handleDateSelect('day', day)}
              className={`min-h-[36px] text-sm text-center rounded transition-all ${
                selectedDate?.day === day 
                  ? 'bg-[#00FFFF] text-black font-bold' 
                  : 'text-white bg-gray-800 hover:bg-[#00FFFF] hover:text-black'
              }`}
            >
              {String(day).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      {/* Months */}
      <div className="flex-1 overflow-y-auto border-l border-[#00FFFF]">
        <div className="p-2 border-b border-[#00FFFF] text-center text-[#00FFFF] text-sm font-bold bg-gray-900">
          Month
        </div>
        <div className="max-h-48 overflow-y-auto">
          {months.map(month => (
            <button
              key={month.value}
              onClick={() => handleDateSelect('month', month.value)}
              className={`w-full min-h-[36px] text-sm text-center transition-all ${
                selectedDate?.month === month.value 
                  ? 'bg-[#00FFFF] text-black font-bold' 
                  : 'text-white bg-gray-800 hover:bg-[#00FFFF] hover:text-black'
              }`}
            >
              {month.label}
            </button>
          ))}
        </div>
      </div>

      {/* Years */}
      <div className="flex-1 overflow-y-auto border-l border-[#00FFFF]">
        <div className="p-2 border-b border-[#00FFFF] text-center text-[#00FFFF] text-sm font-bold bg-gray-900">
          Year
        </div>
        <div className="max-h-48 overflow-y-auto grid grid-cols-3 gap-1 p-2">
          {years.map(year => (
            <button
              key={year}
              onClick={() => handleDateSelect('year', year)}
              className={`min-h-[36px] text-sm text-center rounded transition-all ${
                selectedDate?.year === year 
                  ? 'bg-[#00FFFF] text-black font-bold' 
                  : 'text-white bg-gray-800 hover:bg-[#00FFFF] hover:text-black'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-black border-2 border-[#00FFFF] text-white rounded-lg px-4 py-4 focus:outline-none focus:border-[#00FFFF] flex items-center justify-between text-lg font-bold min-h-[60px] ${className}`}
      >
        <span className={value ? "text-white" : "text-gray-400"}>
          {formatDisplayValue() || placeholder}
        </span>
        <Calendar size={24} className="text-[#00FFFF]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black border-2 border-[#00FFFF] rounded-lg shadow-lg z-50 max-h-80 overflow-hidden w-full"
          >
            <MobileDatePicker />
            <DesktopDatePicker />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}