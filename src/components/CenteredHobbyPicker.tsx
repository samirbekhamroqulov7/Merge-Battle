import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Heart, Search, X } from "lucide-react";

interface CenteredHobbyPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const popularHobbies = [
  "Reading", "Gaming", "Sports", "Music", "Travel", "Cooking", 
  "Photography", "Painting", "Drawing", "Dancing", "Swimming", 
  "Running", "Cycling", "Yoga", "Meditation", "Writing", 
  "Programming", "Movies", "TV Series", "Anime", "Board Games", 
  "Chess", "Football", "Basketball", "Tennis", "Volleyball", 
  "Skating", "Skiing", "Snowboarding", "Hiking", "Camping", 
  "Fishing", "Gardening", "Singing", "Guitar", "Piano", 
  "Acting", "Theater", "Museums", "Art", "Cars", 
  "Motorcycles", "DIY", "Electronics", "Robotics", "Astronomy", 
  "Science", "History", "Languages", "Learning", "Shopping", 
  "Fashion", "Makeup", "Animals", "Pets", "Nature", 
  "Volunteering", "Charity", "Teaching"
];

export function CenteredHobbyPicker({ value, onChange, placeholder = "Select hobbies", className = "" }: CenteredHobbyPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse current value
  useEffect(() => {
    if (value) {
      const hobbies = value.split(',').filter(h => h.trim() !== '');
      setSelectedHobbies(hobbies);
    } else {
      setSelectedHobbies([]);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleHobby = (hobby: string) => {
    const newHobbies = selectedHobbies.includes(hobby)
      ? selectedHobbies.filter(h => h !== hobby)
      : [...selectedHobbies, hobby];
    
    setSelectedHobbies(newHobbies);
    onChange(newHobbies.join(', '));
  };

  const removeHobby = (hobby: string) => {
    const newHobbies = selectedHobbies.filter(h => h !== hobby);
    setSelectedHobbies(newHobbies);
    onChange(newHobbies.join(', '));
  };

  const filteredHobbies = popularHobbies.filter(hobby =>
    hobby.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addCustomHobby = () => {
    const input = document.querySelector('input[placeholder="Add custom hobby..."]') as HTMLInputElement;
    if (input?.value.trim()) {
      toggleHobby(input.value.trim());
      input.value = '';
      setSearchTerm('');
      setShowSearch(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Hobbies Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-black border-2 border-[#00FFFF] text-white rounded-lg px-4 py-4 focus:outline-none focus:border-[#00FFFF] min-h-[60px] flex flex-wrap items-center justify-center gap-2 text-lg font-bold ${className}`}
      >
        {selectedHobbies.length > 0 ? (
          selectedHobbies.map((hobby, index) => (
            <span
              key={hobby}
              className="inline-flex items-center gap-1 px-3 py-2 bg-[#00FFFF] text-black rounded-full text-sm border border-[#00FFFF] font-bold min-h-[44px]"
            >
              <Heart size={14} className="fill-current" />
              {hobby}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeHobby(hobby);
                }}
                className="hover:text-red-600 transition-colors ml-1 min-w-[20px] min-h-[20px] flex items-center justify-center"
              >
                <Trash2 size={14} />
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-center">{placeholder}</span>
        )}
        <Plus size={24} className="text-[#00FFFF] absolute right-4" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border-2 border-[#00FFFF] rounded-lg shadow-lg z-50 max-h-80 overflow-hidden"
          >
            {/* Search Header */}
            <div className="p-3 border-b border-[#00FFFF] bg-gray-800">
              <div className="flex items-center gap-2">
                {showSearch ? (
                  <>
                    <input
                      type="text"
                      placeholder="Search hobbies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-gray-700 border border-[#00FFFF] text-white rounded-lg px-3 py-3 text-lg focus:outline-none focus:border-[#00FFFF]"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setShowSearch(false);
                        setSearchTerm('');
                      }}
                      className="p-2 text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 text-center">
                      <span className="text-[#00FFFF] font-bold text-lg">Select Hobbies</span>
                    </div>
                    <button
                      onClick={() => setShowSearch(true)}
                      className="p-2 text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <Search size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Hobbies List */}
            <div className="max-h-64 overflow-y-auto bg-gray-800">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3">
                {filteredHobbies.slice(0, 30).map((hobby) => (
                  <button
                    key={hobby}
                    onClick={() => toggleHobby(hobby)}
                    className={`min-h-[44px] flex items-center justify-center gap-2 px-2 py-3 text-sm text-center rounded-lg transition-all font-bold ${
                      selectedHobbies.includes(hobby)
                        ? 'bg-[#00FFFF] text-black border border-[#00FFFF]'
                        : 'bg-gray-700 text-white hover:bg-[#00FFFF] hover:text-black'
                    }`}
                  >
                    <Heart 
                      size={16} 
                      className={selectedHobbies.includes(hobby) ? "fill-current" : ""} 
                    />
                    <span className="flex-1 text-center">{hobby}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Hobby Input */}
            <div className="p-3 border-t border-[#00FFFF] bg-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom hobby..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCustomHobby();
                    }
                  }}
                  className="flex-1 bg-gray-700 border border-[#00FFFF] text-white rounded-lg px-3 py-3 text-lg focus:outline-none focus:border-[#00FFFF] min-h-[44px]"
                />
                <button
                  onClick={addCustomHobby}
                  className="px-4 py-3 bg-[#00FFFF] text-black rounded-lg font-bold hover:bg-[#00FFFF]/80 transition-colors min-w-[60px] min-h-[44px] flex items-center justify-center"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected Count */}
            {selectedHobbies.length > 0 && (
              <div className="p-3 border-t border-[#00FFFF] bg-gray-700">
                <div className="text-center">
                  <span className="text-[#00FFFF] font-bold">
                    {selectedHobbies.length} hobby{selectedHobbies.length !== 1 ? 'ies' : ''} selected
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}