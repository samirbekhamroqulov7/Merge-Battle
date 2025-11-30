import React from "react";
import { Save, X } from "lucide-react";
import { NeonModal } from "./NeonModal";
import { Input } from "./ui/input";
import { NeonButton } from "./NeonButton";
import { CenteredDatePicker } from "./CenteredDatePicker";
import { CenteredHobbyPicker } from "./CenteredHobbyPicker";
import { ProfileData } from "../hooks/useProfile";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData: ProfileData;
  onUpdateField: (field: string, value: string) => void;
  onUpdateSocialField: (platform: string, value: string) => void;
  onSave: () => void;
  loading: boolean;
}

export function EditProfileModal({
  isOpen,
  onClose,
  editData,
  onUpdateField,
  onUpdateSocialField,
  onSave,
  loading
}: EditProfileModalProps) {
  return (
    <NeonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      glowColor="cyan"
      className="max-w-2xl mx-2 md:mx-0"
    >
      <div className="space-y-4 md:space-y-6 max-h-[70vh] md:max-h-[80vh] overflow-y-auto p-1">
        {/* Display Name */}
        <div className="bg-gray-900 rounded-xl p-4 border-2 border-[#00FFFF]">
          <label className="block text-lg font-bold text-[#00FFFF] mb-3 text-center">Display Name</label>
          <Input
            value={editData.displayName}
            onChange={(e) => onUpdateField("displayName", e.target.value)}
            placeholder="Enter your name"
            className="bg-black border-2 border-[#00FFFF] text-white text-lg py-4 px-4 rounded-lg focus:border-[#00FFFF] text-center font-bold min-h-[60px]"
            maxLength={20}
          />
        </div>

        {/* About Section */}
        <div className="bg-gray-900 rounded-xl p-4 border-2 border-[#00FFFF]">
          <label className="block text-lg font-bold text-[#00FFFF] mb-3 text-center">About</label>
          <textarea
            value={editData.about}
            onChange={(e) => onUpdateField("about", e.target.value)}
            placeholder="Tell about yourself"
            className="w-full bg-black border-2 border-[#00FFFF] text-white rounded-lg px-4 py-4 focus:outline-none focus:border-[#00FFFF] min-h-[120px] text-lg font-bold text-center"
            maxLength={200}
          />
        </div>

        {/* Birth Date and City */}
        <div className="bg-gray-900 rounded-xl p-4 border-2 border-[#00FFFF]">
          <h3 className="text-lg font-bold text-[#00FFFF] mb-4 text-center">Personal Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-base font-bold text-[#B8B8B8] mb-2 text-center">Birth Date</label>
              <CenteredDatePicker
                value={editData.birth}
                onChange={(value) => onUpdateField("birth", value)}
                placeholder="DD.MM.YYYY"
              />
            </div>
            
            <div>
              <label className="block text-base font-bold text-[#B8B8B8] mb-2 text-center">City</label>
              <Input
                value={editData.city}
                onChange={(e) => onUpdateField("city", e.target.value)}
                placeholder="Your city"
                className="bg-black border-2 border-[#00FFFF] text-white py-4 px-4 rounded-lg focus:border-[#00FFFF] text-center font-bold min-h-[60px] text-lg"
              />
            </div>
          </div>
        </div>

        {/* Hobbies Picker */}
        <div className="bg-gray-900 rounded-xl p-4 border-2 border-[#00FFFF]">
          <label className="block text-lg font-bold text-[#00FFFF] mb-3 text-center">Hobbies</label>
          <p className="text-sm text-[#B8B8B8] mb-3 text-center font-medium">
            Select your hobbies from popular options or add your own
          </p>
          <CenteredHobbyPicker
            value={editData.hobby}
            onChange={(value) => onUpdateField("hobby", value)}
            placeholder="Click to select hobbies..."
          />
        </div>

        {/* Social Links */}
        <div className="bg-gray-900 rounded-xl p-4 border-2 border-[#00FFFF]">
          <h3 className="text-lg font-bold text-[#00FFFF] mb-4 text-center">Social Links</h3>
          <div className="space-y-4">
            {['instagram', 'telegram', 'vk', 'tiktok', 'phone'].map((platform) => (
              <div key={platform}>
                <label className="block text-base font-bold text-[#B8B8B8] mb-2 text-center capitalize">
                  {platform === 'vk' ? 'VK' : platform === 'tiktok' ? 'TikTok' : platform}
                </label>
                <Input
                  value={editData.social[platform as keyof typeof editData.social]}
                  onChange={(e) => onUpdateSocialField(platform, e.target.value)}
                  placeholder={`${platform === 'vk' ? 'VK' : platform === 'tiktok' ? 'TikTok' : platform} username or link`}
                  className="bg-black border-2 border-[#00FFFF] text-white py-4 px-4 rounded-lg focus:border-[#00FFFF] text-center font-bold min-h-[60px] text-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <NeonButton
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-3 py-4 text-lg font-bold min-h-[60px]"
            disabled={loading}
          >
            <Save size={24} />
            {loading ? "Saving..." : "Save Profile"}
          </NeonButton>
          <NeonButton
            variant="ghost"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-3 py-4 text-lg font-bold min-h-[60px]"
          >
            <X size={24} />
            Cancel
          </NeonButton>
        </div>
      </div>
    </NeonModal>
  );
}