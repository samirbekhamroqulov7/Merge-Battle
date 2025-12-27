"use client"

import { useState, useEffect, useCallback } from "react"

interface Profile {
  id: string
  auth_id: string
  username: string
  email: string
  avatar_url?: string
  avatar_frame?: string
  nickname_style?: string
  isGuest: boolean
  sound_enabled: boolean
  music_enabled: boolean
  language: string
  created_at: string
  updated_at: string
}

interface Mastery {
  id: string
  user_id: string
  level: number
  mini_level: number
  fragments: number
  total_wins: number
  created_at: string
  updated_at: string
}

interface Glory {
  id: string
  user_id: string
  level: number
  wins: number
  total_glory_wins: number
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
  user_metadata?: Record<string, unknown>
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

      const response = await fetch("/api/auth/me")
      const data = await response.json()

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          user_metadata: {},
        })
        setProfile(data.user)
        setMastery(data.mastery)
        setGlory(data.glory)
      } else {
        // Check for guest profile in localStorage
        const guestProfile = localStorage.getItem("brain_battle_guest_profile")
        if (guestProfile) {
          try {
            const parsedProfile = JSON.parse(guestProfile)
            setProfile(parsedProfile)
            setUser({
              id: parsedProfile.auth_id,
              email: parsedProfile.email,
              user_metadata: { is_guest: true },
            })
          } catch {
            // Silent error
          }
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

      try {
        const response = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          throw new Error("Failed to update profile")
        }

        setProfile((prev) => (prev ? { ...prev, ...updates } : null))

        return { isNew: false }
      } catch (error) {
        throw error
      }
    },
    [profile],
  )

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setProfile(null)
      setMastery(null)
      setGlory(null)
      localStorage.removeItem("brain_battle_guest_profile")
      localStorage.removeItem("brain_battle_guest_mode")
      localStorage.removeItem("brain_battle_session")
      localStorage.removeItem("brain_battle_auto_login")
    } catch (error) {
      console.error("[v0] signOut error:", error)
    }
  }, [])

  const registerGameAccount = useCallback(
    async (gameUsername: string) => {
      try {
        const response = await fetch("/api/auth/register-game-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: gameUsername }),
        })

        if (!response.ok) {
          throw new Error("Failed to register game account")
        }

        await fetchUserData()
        localStorage.setItem("brain_battle_username", gameUsername)
        localStorage.setItem("brain_battle_registered", "true")

        return { isNew: true }
      } catch (error) {
        throw error
      }
    },
    [fetchUserData],
  )

  const createGuestAccount = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to create guest account")
      }

      await fetchUserData()
      localStorage.setItem("brain_battle_auto_login", "true")

      return user
    } catch (error) {
      console.error("[v0] createGuestAccount error:", error)
      throw error
    }
  }, [fetchUserData, user])

  const quickGuestPlay = useCallback(() => {
    if (typeof window === "undefined") return null

    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    const guestUsername = `Guest_${guestId.slice(-4)}`

    const guestProfile: Profile = {
      id: guestId,
      auth_id: guestId,
      username: guestUsername,
      email: `guest_${Date.now()}@brainbattle.com`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${guestUsername}`,
      avatar_frame: "none",
      nickname_style: "normal",
      isGuest: true,
      sound_enabled: true,
      music_enabled: true,
      language: "ru",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const tempUser: User = {
      id: guestId,
      email: guestProfile.email,
      user_metadata: { is_guest: true, guest_name: guestUsername },
    }

    setUser(tempUser)
    setProfile(guestProfile)

    localStorage.setItem("brain_battle_guest_profile", JSON.stringify(guestProfile))
    localStorage.setItem("brain_battle_guest_mode", "true")
    localStorage.setItem(
      "brain_battle_session",
      JSON.stringify({
        access_token: "guest_token_" + Date.now(),
        refresh_token: "guest_refresh_" + Date.now(),
        expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }),
    )
    localStorage.setItem("brain_battle_auto_login", "true")

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
