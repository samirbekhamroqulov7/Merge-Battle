import type { Profile } from "./use-user-types"

export async function fetchUserFromAPI() {
  try {
    const response = await fetch("/api/auth/me")
    const data = await response.json()

    if (data.user) {
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: {},
        },
        profile: data.user,
        mastery: data.mastery,
        glory: data.glory,
      }
    }

    return null
  } catch (error) {
    console.error("[v0] fetchUserFromAPI error:", error)
    return null
  }
}

export async function updateProfileAPI(updates: Partial<Profile>) {
  const response = await fetch("/api/auth/update-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error("Failed to update profile")
  }

  return { isNew: false }
}

export async function registerGameAccountAPI(gameUsername: string) {
  const response = await fetch("/api/auth/register-game-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: gameUsername }),
  })

  if (!response.ok) {
    throw new Error("Failed to register game account")
  }

  return { isNew: true }
}

export async function createGuestAccountAPI() {
  const response = await fetch("/api/auth/guest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error("Failed to create guest account")
  }

  return await response.json()
}

export async function signOutAPI() {
  try {
    await fetch("/api/auth/logout", { method: "POST" })
  } catch (error) {
    console.error("[v0] signOutAPI error:", error)
  }
}