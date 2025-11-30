// src/utils/profileApi.ts
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface ProfileData {
  about: string;
  birth: string;
  city: string;
  hobby: string;
  displayName: string;
  social: {
    instagram: string;
    telegram: string;
    vk: string;
    tiktok: string;
    phone: string;
  };
  avatarUrl?: string;
  games?: number;
  winRate?: number;
  bestScore?: number;
  wins?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const loadProfile = async (userId: string): Promise<ProfileData | null> => {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ProfileData;
    }
    return null;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
};

export const createInitialProfile = async (userId: string, userData?: any) => {
  try {
    const initialProfile: ProfileData = {
      about: "",
      birth: "",
      city: "",
      hobby: "",
      displayName: userData?.displayName || "Player",
      social: {
        instagram: "",
        telegram: "",
        vk: "",
        tiktok: "",
        phone: ""
      },
      games: 0,
      winRate: 0,
      bestScore: 0,
      wins: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'profiles', userId), initialProfile);
    return initialProfile;
  } catch (error) {
    console.error('Error creating initial profile:', error);
    throw error;
  }
};

export const saveProfile = async (userId: string, profileData: Partial<ProfileData>) => {
  try {
    const docRef = doc(db, 'profiles', userId);
    await updateDoc(docRef, {
      ...profileData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `avatars/${userId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};