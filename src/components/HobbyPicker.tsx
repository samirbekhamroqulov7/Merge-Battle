import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Heart } from "lucide-react";

interface HobbyPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const popularHobbies = [
  "Reading", "Gaming", "Sports", "Music", "Travel", "Cooking", 
  "Photography", "Painting", "Dancing", "Swimming", "Running", 
  "Cycling", "Yoga", "Meditation", "Writing", "Programming",
  "Movies", "TV Series", "Anime", "Board Games", "Chess",
  "Football", "Basketball", "Tennis", "Volleyball", "Skating",
  "Skiing", "Snowboarding", "Hiking", "Camping", "Fishing",
  "Gardening", "Drawing", "Singing", "Guitar", "Piano",
  "Dancing", "Acting", "Theater", "Museums", "Art Galleries",
  "Cars", "Motorcycles", "DIY Projects", "Electronics", "Robotics",
  "Astronomy", "Science", "History", "Languages", "Learning",
  "Shopping", "Fashion", "Makeup", "Hair Styling", "Tattoos",
  "Animals", "Pets", "Bird Watching", "Nature", "Environment",
  "Volunteering", "Charity", "Social Work", "Teaching", "Mentoring"
];

export function HobbyPicker({ value, onChange, placeholder = "Select hobbies", className = "" }: HobbyPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Hobbies Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#0A0A0A] border-2 border-[#00FFFF] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#00FFFF] focus:ring-2 focus:ring-[#00FFFF] min-h-[60px] flex flex-wrap items-center gap-2 text-lg font-medium ${className}`}
      >
        {selectedHobbies.length > 0 ? (
          selectedHobbies.map((hobby, index) => (
            <span
              key={hobby}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#00FFFF] text-black rounded-full text-sm border border-[#00FFFF] font-medium"
            >
              {hobby}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeHobby(hobby);
                }}
                className="hover:text-red-600 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <Plus size={20} className="ml-auto text-[#00FFFF]" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0A0A0A] border-2 border-[#00FFFF] rounded-lg shadow-lg z-50 max-h-80 overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-[#00FFFF] bg-[#1A1A2E]">
              <input
                type="text"
                placeholder="Search hobbies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#00FFFF] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#00FFFF]"
              />
            </div>

            {/* Hobbies List */}
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-2 gap-1 p-2">
                {filteredHobbies.map((hobby) => (
                  <button
                    key={hobby}
                    onClick={() => toggleHobby(hobby)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg transition-all font-medium ${
                      selectedHobbies.includes(hobby)
                        ? 'bg-[#00FFFF] text-black border border-[#00FFFF]'
                        : 'text-white bg-[#0A0A0A] hover:bg-[#00FFFF] hover:text-black'
                    }`}
                  >
                    <Heart 
                      size={14} 
                      className={selectedHobbies.includes(hobby) ? "fill-current" : ""} 
                    />
                    {hobby}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Hobby Input */}
            <div className="p-3 border-t border-[#00FFFF] bg-[#1A1A2E]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom hobby..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      toggleHobby(e.currentTarget.value.trim());
                      e.currentTarget.value = '';
                    }
                  }}
                  className="flex-1 bg-[#0A0A0A] border border-[#00FFFF] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#00FFFF] text-sm"
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add custom hobby..."]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      toggleHobby(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-3 py-2 bg-[#00FFFF] text-black rounded-lg font-semibold hover:bg-[#00FFFF]/80 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}