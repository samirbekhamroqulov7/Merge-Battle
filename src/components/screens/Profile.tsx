import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { useProfile, ProfileData } from "../../hooks/useProfile";
import { IconButton } from "../IconButton";
import { NeonButton } from "../NeonButton";
import { ProfileStats } from "../ProfileStats";
import { EditProfileModal } from "../EditProfileModal";
import { Heart } from "lucide-react";
import { 
  ArrowLeft, 
  Edit2,
  Camera,
  User,
  LogIn
} from "lucide-react";

interface ProfileProps {
  onNavigate: (screen: string) => void;
}

const initialProfileData: ProfileData = {
  about: "",
  birth: "",
  city: "",
  hobby: "",
  displayName: "",
  social: {
    instagram: "",
    telegram: "",
    vk: "",
    tiktok: "",
    phone: ""
  }
};

export function Profile({ onNavigate }: ProfileProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  
  const {
    profile,
    loading,
    error,
    setError,
    loadUserProfile,
    saveUserProfile,
    uploadUserAvatar
  } = useProfile(user);

  const [editData, setEditData] = useState<ProfileData>(initialProfileData);

  // Load user and profile
  useEffect(() => {
    console.log("Setting up auth listener...");
    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log("Auth state changed:", u);
      setUser(u);
      if (u) {
        try {
          const data = await loadUserProfile(u);
          setEditData({
            about: data?.about || "",
            birth: data?.birth || "",
            city: data?.city || "",
            hobby: data?.hobby || "",
            displayName: data?.displayName || u.displayName || "Player",
            social: {
              instagram: data?.social?.instagram || "",
              telegram: data?.social?.telegram || "",
              vk: data?.social?.vk || "",
              tiktok: data?.social?.tiktok || "",
              phone: data?.social?.phone || ""
            }
          });
        } catch (err) {
          console.error("Error in auth listener:", err);
        }
      } else {
        console.log("No user, clearing profile");
        setEditData(initialProfileData);
      }
    });
    return () => unsub();
  }, []);

  // Google auth with better error handling
  const handleLogin = async () => {
    setAuthLoading(true);
    setError(null);
    try {
      console.log("Starting Google login...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Login successful:", result.user);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login with Google");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await signOut(auth);
      console.log("Logout successful");
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || "Failed to logout");
    }
  };

  // Avatar upload
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadUserAvatar(user.uid, file);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      await saveUserProfile(user.uid, editData);
      setShowEditModal(false);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  // Update edit field
  const updateEditField = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update social field
  const updateSocialField = (platform: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value
      }
    }));
  };

  const currentDisplayName = profile?.displayName || user?.displayName || "Player";
  const currentAvatar = profile?.avatarUrl || user?.photoURL || "https://i.imgur.com/QLcZ8iF.png";

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-[#0A0A0A] to-[#1A1A2E]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <IconButton
          icon={<ArrowLeft size={24} />}
          onClick={() => onNavigate("menu")}
          className="text-[#00FFFF] hover:bg-[#00FFFF]/20"
        />
        
        <motion.h2 
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#A100FF] text-glow-cyan"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          PROFILE
        </motion.h2>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <IconButton
                icon={<Edit2 size={20} />}
                onClick={() => setShowEditModal(true)}
                className="text-[#00FFFF] hover:bg-[#00FFFF]/20"
              />
              <NeonButton
                variant="ghost"
                onClick={handleLogout}
                className="text-sm px-3 py-1"
                disabled={authLoading}
              >
                {authLoading ? "..." : "Logout"}
              </NeonButton>
            </>
          ) : (
            <NeonButton
              onClick={handleLogin}
              className="text-sm px-4 py-2"
              disabled={authLoading}
            >
              <LogIn size={16} className="mr-2" />
              {authLoading ? "Loading..." : "Login with Google"}
            </NeonButton>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4"
        >
          <p className="text-red-300 text-sm">{error}</p>
        </motion.div>
      )}

      {!user ? (
        // Login state
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center p-8"
        >
          <div className="text-6xl mb-6">🎮</div>
          <h3 className="text-2xl font-bold text-white mb-3">Login to Save Progress</h3>
          <p className="text-[#B8B8B8] mb-6 max-w-md">
            Sync your stats, achievements, and customizations across all your devices
          </p>
          
          <NeonButton 
            onClick={handleLogin} 
            className="px-8 py-4 text-lg"
            disabled={authLoading}
          >
            <LogIn size={20} className="mr-2" />
            {authLoading ? "Connecting..." : "Login with Google"}
          </NeonButton>

          <p className="text-[#B8B8B8] text-sm mt-6">
            Your progress will be safely stored in the cloud
          </p>
        </motion.div>
      ) : (
        // Profile content
        <>
          {/* Profile Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-[#00FFFF]/20 to-[#A100FF]/20 rounded-3xl p-6 border-2 border-[#00FFFF]/50 shadow-[0_0_30px_rgba(0,255,255,0.2)] mb-6"
          >
            <div className="flex items-center gap-4 mb-6">
              {/* Avatar */}
              <div className="relative">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="relative group"
                  disabled={loading}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00FFFF] to-[#A100FF] flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                    <img 
                      src={currentAvatar} 
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 border-2 border-dashed border-[#00FFFF]/30 rounded-full"
                  />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                  disabled={loading}
                />
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-white">{currentDisplayName}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#B8B8B8] mb-2">
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <ProfileStats profile={profile} />
          </motion.div>

          {/* About Me Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#00FFFF]/10 to-[#A100FF]/10 rounded-2xl p-6 border-2 border-[#00FFFF]/30 mb-4"
          >
            <h3 className="text-xl font-bold text-[#00FFFF] mb-4 flex items-center gap-2">
              <User size={20} />
              About Me
            </h3>
            
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#B8B8B8]">About:</label>
                <div className="text-white min-h-[20px]">
                  {profile?.about || "—"}
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#B8B8B8]">Birth date:</label>
                <div className="text-white">
                  {profile?.birth || "—"}
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#B8B8B8]">City:</label>
                <div className="text-white">
                  {profile?.city || "—"}
                </div>
              </div>
              
              {/* Исправленный блок Hobby */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-[#B8B8B8]">Hobby:</label>
                <div className="text-white">
                  {profile?.hobby ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.hobby.split(',').map((hobby, index) => (
                        hobby.trim() && (
                          <span 
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#00FFFF]/20 rounded-full text-[#00FFFF] text-sm border border-[#00FFFF]/50"
                          >
                            <Heart size={12} className="fill-current" />
                            {hobby.trim()}
                          </span>
                        )
                      ))}
                    </div>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Links Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#FF00FF]/10 to-[#00FFFF]/10 rounded-2xl p-6 border-2 border-[#FF00FF]/30"
          >
            <h3 className="text-xl font-bold text-[#FF00FF] mb-4">Social Links</h3>
            
            <div className="space-y-3">
              {profile?.social?.instagram && (
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#E1306C] to-[#F77737] rounded flex items-center justify-center">
                    <span className="text-xs">IG</span>
                  </div>
                  <span>{profile.social.instagram}</span>
                </div>
              )}
              
              {profile?.social?.telegram && (
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#0088CC] to-[#00FF99] rounded flex items-center justify-center">
                    <span className="text-xs">TG</span>
                  </div>
                  <span>{profile.social.telegram}</span>
                </div>
              )}
              
              {!profile?.social?.instagram && !profile?.social?.telegram && 
               !profile?.social?.vk && !profile?.social?.tiktok && !profile?.social?.phone && (
                <div className="text-[#B8B8B8] text-center py-4">
                  No social links added yet. Click edit to add some!
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editData={editData}
        onUpdateField={updateEditField}
        onUpdateSocialField={updateSocialField}
        onSave={handleSaveProfile}
        loading={loading}
      />
    </div>
  );
}