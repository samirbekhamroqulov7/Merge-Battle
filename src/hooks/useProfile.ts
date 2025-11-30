import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { loadProfile, createInitialProfile, uploadAvatar, saveProfile } from "../utils/profileApi";

export interface SocialLinks {
  instagram: string;
  telegram: string;
  vk: string;
  tiktok: string;
  phone: string;
}

export interface ProfileData {
  about: string;
  birth: string;
  city: string;
  hobby: string;
  displayName: string;
  social: SocialLinks;
  avatarUrl?: string;
  games?: number;
  winRate?: number;
  bestScore?: number;
  wins?: number;
}

export function useProfile(user: FirebaseUser | null) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = async (user: FirebaseUser) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Loading profile for user:", user.uid);
      let data = await loadProfile(user.uid);
      console.log("Loaded profile:", data);
      
      if (!data) {
        console.log("Creating initial profile...");
        await createInitialProfile(user.uid, {
          displayName: user.displayName || "Player",
          email: user.email || ""
        });
        data = await loadProfile(user.uid);
      }
      
      setProfile(data);
      return data;
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveUserProfile = async (userId: string, profileData: ProfileData) => {
    setLoading(true);
    setError(null);
    try {
      await saveProfile(userId, profileData);
      const updated = await loadProfile(userId);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError("Failed to save profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadUserAvatar = async (userId: string, file: File) => {
    setLoading(true);
    setError(null);
    try {
      const url = await uploadAvatar(userId, file);
      const updatedProfile = { ...(profile || {}), avatarUrl: url } as ProfileData;
      setProfile(updatedProfile);
      return url;
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setError("Failed to upload avatar");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    setError,
    loadUserProfile,
    saveUserProfile,
    uploadUserAvatar,
    setProfile
  };
}