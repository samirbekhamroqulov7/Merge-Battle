"use client"

import { useState, useEffect, useCallback } from "react"
import type { Profile, Mastery, Glory, User } from "./use-user-types"
import {
  fetchUserFromAPI,
  updateProfileAPI,
  registerGameAccountAPI,
  createGuestAccountAPI,
  signOutAPI,
} from "./use-user-api"
import {
  getGuestProfileFromStorage,
  createQuickGuestProfile,
  saveGuestToStorage,
  clearGuestStorage,
} from "./use-user-guest"
import { createClient } from "@/lib/supabase/client"

async function ensureUserProfile(userId: string, email: string) {
  try {
    const supabase = createClient()
    
    const { data: existingProfile } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", userId)
      .maybeSingle()

    if (existingProfile) {
      return existingProfile
    }

    const username = email.split("@")[0] || `user_${Date.now()}`
    
    const { data: newProfile, error } = await supabase
      .from("users")
      .upsert({
        auth_id: userId,
        email: email,
        username: username.substring(0, 20),
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        avatar_frame: "none",
        nickname_style: "normal",
        language: "ru",
        sound_enabled: true,
        music_enabled: true,
        isGuest: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'auth_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Failed to create user profile:", error)
      return null
    }

    return newProfile
  } catch (error) {
    console.error("[v0] ensureUserProfile error:", error)
    return null
  }
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mastery, setMastery] = useState<Mastery | null>(null)
  const [glory, setGlory] = useState<Glory | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true)

      const data = await fetchUserFromAPI()

      if (data && data.user) {
        if (!data.profile && data.user.id) {
          const profile = await ensureUserProfile(data.user.id, data.user.email)
          
          if (profile) {
            setUser(data.user)
            setProfile(profile)
            setMastery(data.mastery)
            setGlory(data.glory)
          } else {
            setUser(null)
            setProfile(null)
            setMastery(null)
            setGlory(null)
          }
        } else {
          setUser(data.user)
          setProfile(data.profile)
          setMastery(data.mastery)
          setGlory(data.glory)
        }
      } else {
        const guestProfile = getGuestProfileFromStorage()
        if (guestProfile) {
          setProfile(guestProfile)
          setUser({
            id: guestProfile.auth_id,
            email: guestProfile.email,
            user_metadata: { is_guest: true },
          })
        }
      }
    } catch (error) {
      console.error("[v0] fetchUserData error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!profile) {
        throw new Error("No profile to update")
      }

      const result = await updateProfileAPI(updates)
      setProfile((prev) => (prev ? { ...prev, ...updates } : null))
      return result
    },
    [profile],
  )

  const signOut = useCallback(async () => {
    await signOutAPI()
    setUser(null)
    setProfile(null)
    setMastery(null)
    setGlory(null)
    clearGuestStorage()
  }, [])

  const registerGameAccount = useCallback(
    async (gameUsername: string) => {
      const result = await registerGameAccountAPI(gameUsername)
      await fetchUserData()
      localStorage.setItem("brain_battle_username", gameUsername)
      localStorage.setItem("brain_battle_registered", "true")
      return result
    },
    [fetchUserData],
  )

  const createGuestAccount = useCallback(async () => {
    await createGuestAccountAPI()
    await fetchUserData()
    localStorage.setItem("brain_battle_auto_login", "true")
    return user
  }, [fetchUserData, user])

  const quickGuestPlay = useCallback(() => {
    const { user: tempUser, profile: guestProfile } = createQuickGuestProfile()
    setUser(tempUser)
    setProfile(guestProfile)
    saveGuestToStorage(guestProfile)
    return guestProfile
  }, [])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  return {
    user,
    profile,
    mastery,
    glory,
    loading,
    updateProfile,
    signOut,
    refetch: fetchUserData,
    isGuest: profile?.isGuest ?? false,
    registerGameAccount,
    createGuestAccount,
    quickGuestPlay,
    hasGameAccount: profile && !profile.isGuest,
  }
}