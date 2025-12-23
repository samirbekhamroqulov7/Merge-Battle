"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

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

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mastery, setMastery] = useState(null)
  const [glory, setGlory] = useState(null)
  const [loading, setLoading] = useState(true)

  const createUserProfile = useCallback(async (authUser: User) => {
    try {
      const supabase = createClient()

      const username =
        authUser.user_metadata?.username ||
        authUser.user_metadata?.full_name ||
        authUser.email?.split("@")[0] ||
        `User_${Math.random().toString(36).substr(2, 6)}`

      const profileData = {
        auth_id: authUser.id,
        email: authUser.email,
        username: username.substring(0, 20),
        avatar_url: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        avatar_frame: "none",
        nickname_style: "normal",
        language: "ru",
        sound_enabled: true,
        music_enabled: true,
        isGuest: authUser.id?.startsWith("guest_") || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("users").insert(profileData).select().single()

      if (error) {
        if (error.code === "23505" || error.message.includes("duplicate")) {
          const { data: existingProfile } = await supabase.from("users").select("*").eq("auth_id", authUser.id).single()
          return existingProfile
        }
        console.error("Profile creation error:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error creating profile:", error)
      return null
    }
  }, [])

  const fetchUserData = useCallback(async () => {
    try {
      if (typeof window === "undefined") return

      setLoading(true)
      const supabase = createClient()

      const savedSession = localStorage.getItem("brain_battle_session")
      const guestMode = localStorage.getItem("brain_battle_guest_mode")

      if (savedSession && !guestMode) {
        try {
          const parsedSession = JSON.parse(savedSession)
          const {
            data: { session },
            error,
          } = await supabase.auth.setSession({
            access_token: parsedSession.access_token,
            refresh_token: parsedSession.refresh_token,
          })

          if (!error && session?.user) {
            setUser(session.user)
          }
        } catch (e) {
          console.error("Session restore error:", e)
          localStorage.removeItem("brain_battle_session")
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        setUser(authUser)

        if (session) {
          localStorage.setItem(
            "brain_battle_session",
            JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at,
            }),
          )
        }

        const { data: profileData } = await supabase.from("users").select("*").eq("auth_id", authUser.id).maybeSingle()

        if (profileData) {
          setProfile(profileData)
        } else {
          const newProfile = await createUserProfile(authUser)

          if (newProfile) {
            setProfile(newProfile)
          } else {
            const tempProfile: Profile = {
              id: "temp-" + Date.now(),
              auth_id: authUser.id,
              username: authUser.user_metadata?.username || authUser.email?.split("@")[0] || "Пользователь",
              email: authUser.email || "",
              avatar_url: authUser.user_metadata?.avatar_url || "",
              avatar_frame: "none",
              nickname_style: "normal",
              isGuest: authUser.id?.startsWith("guest_") || false,
              sound_enabled: true,
              music_enabled: true,
              language: "ru",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            setProfile(tempProfile)
          }
        }

        if (profileData && !profileData.isGuest) {
          const { data: masteryData } = await supabase
            .from("mastery")
            .select("*")
            .eq("user_id", authUser.id)
            .maybeSingle()
          setMastery(masteryData)

          const { data: gloryData } = await supabase.from("glory").select("*").eq("user_id", authUser.id).maybeSingle()
          setGlory(gloryData)
        }
      } else if (guestMode === "true") {
        const guestProfile = localStorage.getItem("brain_battle_guest_profile")
        if (guestProfile) {
          try {
            const parsedProfile = JSON.parse(guestProfile)
            setProfile(parsedProfile)

            const tempUser = {
              id: parsedProfile.auth_id,
              email: parsedProfile.email,
              user_metadata: { is_guest: true },
              app_metadata: {},
              aud: "authenticated",
              created_at: parsedProfile.created_at,
            } as User
            setUser(tempUser)
          } catch (e) {
            console.error("Error parsing guest profile:", e)
          }
        }
      } else {
        setUser(null)
        setProfile(null)
        setMastery(null)
        setGlory(null)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }, [createUserProfile])

  const saveDeviceInfo = useCallback(async (userId: string) => {
    try {
      if (typeof window === "undefined") return

      const supabase = createClient()
      const deviceInfo = {
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        is_mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        language: navigator.language,
        timestamp: new Date().toISOString(),
      }

      const { error } = await supabase.from("user_devices").insert({
        user_id: userId,
        device_info: deviceInfo,
        created_at: new Date().toISOString(),
      })

      if (error && !error.message.includes("duplicate")) {
        console.error("Error saving device:", error)
      }
    } catch (error) {
      console.error("Error saving device:", error)
    }
  }, [])

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) {
        throw new Error("Пользователь не авторизован")
      }

      try {
        const supabase = createClient()

        const { error } = await supabase
          .from("users")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("auth_id", user.id)

        if (error) {
          if (error.code === "PGRST116") {
            const newProfile = await createUserProfile(user)
            if (newProfile) {
              setProfile(newProfile)
              return { isNew: true }
            }
          }
          throw error
        }

        setProfile((prev) => (prev ? { ...prev, ...updates } : null))

        return { isNew: false }
      } catch (error) {
        console.error("Error updating profile:", error)
        throw error
      }
    },
    [user, createUserProfile],
  )

  const signOut = useCallback(async () => {
    if (typeof window === "undefined") return

    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setMastery(null)
    setGlory(null)
    localStorage.removeItem("brain_battle_session")
    localStorage.removeItem("brain_battle_auto_login")
    localStorage.removeItem("brain_battle_guest_profile")
    localStorage.removeItem("brain_battle_guest_mode")
  }, [])

  const registerGameAccount = useCallback(
    async (gameUsername: string) => {
      if (typeof window === "undefined") throw new Error("Client only")

      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        throw new Error("Пользователь не авторизован")
      }

      const { data: existingProfile } = await supabase
        .from("users")
        .select("id, isGuest")
        .eq("auth_id", authUser.id)
        .maybeSingle()

      let result

      if (existingProfile) {
        const { error } = await supabase
          .from("users")
          .update({
            username: gameUsername,
            isGuest: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id)

        if (error) throw error

        if (existingProfile.isGuest) {
          const { error: masteryError } = await supabase.from("mastery").insert({
            user_id: authUser.id,
            level: 1,
            mini_level: 0,
            fragments: 0,
            total_wins: 0,
            created_at: new Date().toISOString(),
          })

          if (masteryError && !masteryError.message.includes("duplicate")) throw masteryError

          const { error: gloryError } = await supabase.from("glory").insert({
            user_id: authUser.id,
            level: 1,
            wins: 0,
            total_glory_wins: 0,
            created_at: new Date().toISOString(),
          })

          if (gloryError && !gloryError.message.includes("duplicate")) throw gloryError
        }

        result = { isNew: false }
      } else {
        const { error } = await supabase.from("users").insert({
          auth_id: authUser.id,
          email: authUser.email,
          username: gameUsername,
          language: "en",
          sound_enabled: true,
          music_enabled: true,
          isGuest: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) throw error

        const { error: masteryError } = await supabase.from("mastery").insert({
          user_id: authUser.id,
          level: 1,
          mini_level: 0,
          fragments: 0,
          total_wins: 0,
          created_at: new Date().toISOString(),
        })

        if (masteryError) throw masteryError

        const { error: gloryError } = await supabase.from("glory").insert({
          user_id: authUser.id,
          level: 1,
          wins: 0,
          total_glory_wins: 0,
          created_at: new Date().toISOString(),
        })

        if (gloryError) throw gloryError

        result = { isNew: true }
      }

      await saveDeviceInfo(authUser.id)
      await fetchUserData()

      localStorage.setItem("brain_battle_username", gameUsername)
      localStorage.setItem("brain_battle_registered", "true")

      return result
    },
    [fetchUserData, saveDeviceInfo],
  )

  const createGuestAccount = useCallback(async () => {
    try {
      if (typeof window === "undefined") throw new Error("Client only")

      const supabase = createClient()
      const { data, error } = await supabase.auth.signInAnonymously()

      if (error) throw error

      const { error: profileError } = await supabase.from("users").insert({
        auth_id: data.user.id,
        email: `guest_${Date.now()}@brainbattle.com`,
        username: `Guest_${Math.random().toString(36).substr(2, 6)}`,
        language: "en",
        sound_enabled: true,
        music_enabled: true,
        isGuest: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.warn("Не удалось создать профиль в БД, используем локальное сохранение")
      }

      await saveDeviceInfo(data.user.id)
      await fetchUserData()

      const session = await supabase.auth.getSession()
      if (session.data.session) {
        localStorage.setItem(
          "brain_battle_session",
          JSON.stringify({
            access_token: session.data.session.access_token,
            refresh_token: session.data.session.refresh_token,
            expires_at: session.data.session.expires_at,
          }),
        )
      }

      return data.user
    } catch (error) {
      console.error("Ошибка создания гостевого аккаунта:", error)
      throw error
    }
  }, [fetchUserData, saveDeviceInfo])

  const quickGuestPlay = useCallback(() => {
    if (typeof window === "undefined") return null

    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    const guestUsername = `Guest_${guestId.slice(-4)}`

    const guestProfile = {
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

    const tempUser = {
      id: guestId,
      email: guestProfile.email,
      user_metadata: { is_guest: true, guest_name: guestUsername },
      app_metadata: {},
      aud: "authenticated",
      created_at: guestProfile.created_at,
    } as User

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

    return guestProfile
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user)
        await fetchUserData()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setMastery(null)
        setGlory(null)
        localStorage.removeItem("brain_battle_session")
        localStorage.removeItem("brain_battle_auto_login")
      } else if (event === "TOKEN_REFRESHED" && session) {
        localStorage.setItem(
          "brain_battle_session",
          JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          }),
        )
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserData])

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
