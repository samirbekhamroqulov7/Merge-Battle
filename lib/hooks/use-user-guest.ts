import type { Profile, User } from "./use-user-types"

export function getGuestProfileFromStorage(): Profile | null {
  if (typeof window === "undefined") return null

  const guestProfile = localStorage.getItem("brain_battle_guest_profile")
  if (!guestProfile) return null

  try {
    return JSON.parse(guestProfile)
  } catch {
    return null
  }
}

export function createQuickGuestProfile(): { user: User; profile: Profile } {
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

  return { user: tempUser, profile: guestProfile }
}

export function saveGuestToStorage(profile: Profile) {
  if (typeof window === "undefined") return

  localStorage.setItem("brain_battle_guest_profile", JSON.stringify(profile))
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
}

export function clearGuestStorage() {
  if (typeof window === "undefined") return

  localStorage.removeItem("brain_battle_guest_profile")
  localStorage.removeItem("brain_battle_guest_mode")
  localStorage.removeItem("brain_battle_session")
  localStorage.removeItem("brain_battle_auto_login")
  localStorage.removeItem("brain_battle_username")
  localStorage.removeItem("brain_battle_registered")
}
