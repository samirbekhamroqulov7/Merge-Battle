import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Guest mode functions
export const enableGuestMode = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem("brain_battle_guest_mode", "true")
  }
}

export const disableGuestMode = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("brain_battle_guest_mode")
  }
}

export const isGuestModeEnabled = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("brain_battle_guest_mode") === "true"
  }
  return false
}

export const getGuestSession = () => {
  if (typeof window !== "undefined") {
    const guestData = localStorage.getItem("brain_battle_guest_session")
    if (guestData) {
      try {
        return JSON.parse(guestData)
      } catch {
        return null
      }
    }
  }
  return null
}

// Auth functions
export const signInWithEmail = async (email: string, password: string) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Login failed")
  }

  return await response.json()
}

export const signUpWithEmail = async (email: string, password: string, username: string) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Registration failed")
  }

  return await response.json()
}

export const signInAsGuest = async () => {
  const response = await fetch("/api/auth/guest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Failed to create guest account")
  }

  return await response.json()
}

export const signOut = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Logout failed")
  }

  return await response.json()
}

// Google OAuth function (ИСПРАВЛЕННАЯ версия)
export const signInWithGoogle = async () => {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })
  
  if (error) {
    throw new Error(`Google sign-in failed: ${error.message}`)
  }
  
  return data
}

// User management
export const getCurrentUser = async () => {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw error
  }
  
  return user
}

export const getUserProfile = async (userId: string) => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()
  
  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
  
  return data
}

// Purchase functions
export const createCheckoutSession = async (itemType: string, itemId: string, itemName: string, price: number) => {
  const response = await fetch("/api/auth/me")
  const data = await response.json()

  if (!data.user) {
    throw new Error("User not authenticated")
  }

  const user = data.user

  // Demo purchases for development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && price <= 10) {
    const demoPurchase = {
      id: "demo_" + Date.now(),
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      price: price,
      currency: "USD",
      status: "completed",
      payment_method: "demo",
      created_at: new Date().toISOString(),
    }

    const demoPurchases = JSON.parse(localStorage.getItem("brain_battle_demo_purchases") || "[]")
    demoPurchases.push(demoPurchase)
    localStorage.setItem("brain_battle_demo_purchases", JSON.stringify(demoPurchases))

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("demoPurchaseCompleted", {
          detail: { itemType, itemId, itemName },
        }),
      )
    }

    return `${window.location.origin}/profile?purchase=success&item=${itemId}`
  }

  // Guest purchases
  if (user.auth_id?.startsWith("guest_") && typeof window !== "undefined") {
    const guestPurchases = JSON.parse(localStorage.getItem("brain_battle_guest_purchases") || "[]")
    guestPurchases.push({
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      price: price,
      purchased_at: new Date().toISOString(),
    })
    localStorage.setItem("brain_battle_guest_purchases", JSON.stringify(guestPurchases))

    window.dispatchEvent(
      new CustomEvent("guestPurchaseCompleted", {
        detail: { itemType, itemId, itemName },
      }),
    )

    return `${window.location.origin}/profile?purchase=success&item=${itemId}`
  }

  // Real checkout for authenticated users
  try {
    const checkoutResponse = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemName,
        price,
        itemType,
        itemId,
      }),
    })

    if (!checkoutResponse.ok) throw new Error("Failed to create checkout session")

    const session = await checkoutResponse.json()
    return session.url
  } catch {
    throw new Error("Checkout session creation failed")
  }
}

export const getOwnedItems = async (userId: string) => {
  if (typeof window === "undefined") return []

  const supabase = createClient()

  if (userId?.startsWith("guest_")) {
    const guestPurchases = JSON.parse(localStorage.getItem("brain_battle_guest_purchases") || "[]")
    return guestPurchases.map((p: { item_type: string; item_id: string; item_name: string }) => ({
      item_type: p.item_type,
      item_id: p.item_id,
      item_name: p.item_name,
    }))
  }

  const { data: purchases, error } = await supabase
    .from("user_purchases")
    .select("item_type, item_id, item_name")
    .eq("user_id", userId)
    .eq("status", "completed")

  if (error) {
    return []
  }

  return purchases || []
}

export const getOwnedAvatars = async (userId: string) => {
  const purchases = await getOwnedItems(userId)
  return purchases.filter((p) => p.item_type === "avatar").map((p) => p.item_id)
}

export const getOwnedFrames = async (userId: string) => {
  const purchases = await getOwnedItems(userId)
  return purchases.filter((p) => p.item_type === "frame").map((p) => p.item_id)
}

export const getOwnedNicknameStyles = async (userId: string) => {
  const purchases = await getOwnedItems(userId)
  return purchases.filter((p) => p.item_type === "nickname_style").map((p) => p.item_id)
}

export const isItemOwned = async (userId: string, itemType: string, itemId: string) => {
  if (typeof window === "undefined") return true

  const freeItems = ["none", "bronze", "silver", "normal", "bold"]
  if (freeItems.includes(itemId)) {
    return true
  }

  if (userId?.startsWith("guest_")) {
    const guestPurchases = JSON.parse(localStorage.getItem("brain_battle_guest_purchases") || "[]")
    const isOwned = guestPurchases.some(
      (p: { item_type: string; item_id: string }) => p.item_type === itemType && p.item_id === itemId,
    )
    if (isOwned) return true
  }

  try {
    const supabase = createClient()

    const { data } = await supabase
      .from("user_purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("item_type", itemType)
      .eq("item_id", itemId)
      .eq("status", "completed")
      .maybeSingle()

    return !!data
  } catch {
    return false
  }
}

// Game progress functions
export const recordGameProgress = async (gameId: string, score: number, win: boolean) => {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    if (typeof window !== "undefined" && isGuestModeEnabled()) {
      const guestProgress = JSON.parse(localStorage.getItem("brain_battle_guest_progress") || "{}")
      if (!guestProgress[gameId]) {
        guestProgress[gameId] = { wins: 0, losses: 0, draws: 0, rating: 1000 }
      }
      guestProgress[gameId].wins += win ? 1 : 0
      guestProgress[gameId].losses += win ? 0 : 1
      guestProgress[gameId].rating += win ? 10 : -5
      localStorage.setItem("brain_battle_guest_progress", JSON.stringify(guestProgress))
    }
    return
  }

  const { data: existingStats } = await supabase
    .from("user_game_stats")
    .select("*")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .maybeSingle()

  const updates = {
    user_id: user.id,
    game_id: gameId,
    wins: existingStats ? existingStats.wins + (win ? 1 : 0) : win ? 1 : 0,
    losses: existingStats ? existingStats.losses + (win ? 0 : 1) : win ? 0 : 1,
    draws: existingStats ? existingStats.draws : 0,
    rating: existingStats ? existingStats.rating + (win ? 10 : -5) : win ? 1000 : 900,
    updated_at: new Date().toISOString(),
  }

  if (existingStats) {
    await supabase.from("user_game_stats").update(updates).eq("id", existingStats.id)
  } else {
    await supabase.from("user_game_stats").insert({
      ...updates,
      created_at: new Date().toISOString(),
    })
  }

  if (win) {
    await supabase.rpc("update_mastery_on_win", { p_user_id: user.id })
    await supabase.rpc("update_glory_on_win", { p_user_id: user.id })
  }
}

export const autoSaveProgress = async (gameState: Record<string, unknown>) => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (typeof window !== "undefined" && isGuestModeEnabled()) {
      const guestSaves = JSON.parse(localStorage.getItem("brain_battle_guest_saves") || "{}")
      guestSaves[Date.now()] = {
        gameState,
        timestamp: new Date().toISOString(),
      }
      const keys = Object.keys(guestSaves)
        .sort((a, b) => Number(b) - Number(a))
        .slice(0, 10)
      const recentSaves: Record<string, unknown> = {}
      keys.forEach((key) => {
        recentSaves[key] = guestSaves[key]
      })
      localStorage.setItem("brain_battle_guest_saves", JSON.stringify(recentSaves))
    }
    return
  }

  try {
    const { data: existingProgress } = await supabase
      .from("user_game_progress")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    if (existingProgress) {
      await supabase
        .from("user_game_progress")
        .update({
          game_state: gameState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProgress.id)
    } else {
      await supabase.from("user_game_progress").insert({
        user_id: user.id,
        game_state: gameState,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  } catch {}
}

// Demo functions
export const initDemoPurchases = async (userId: string) => {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return
  }

  const existingPurchases = localStorage.getItem("brain_battle_demo_purchases")
  if (existingPurchases) {
    const purchases = JSON.parse(existingPurchases)
    if (purchases.some((p: { user_id: string }) => p.user_id === userId)) {
      return
    }
  }

  const demoPurchases = [
    {
      id: "demo_avatar_1",
      user_id: userId,
      item_type: "avatar",
      item_id: "cyber-ninja-avatar-neon",
      item_name: "Cyber Ninja Avatar",
      price: 5,
      currency: "USD",
      status: "completed",
      payment_method: "demo",
      created_at: new Date().toISOString(),
    },
    {
      id: "demo_frame_1",
      user_id: userId,
      item_type: "frame",
      item_id: "gold",
      item_name: "Gold Frame",
      price: 3,
      currency: "USD",
      status: "completed",
      payment_method: "demo",
      created_at: new Date().toISOString(),
    },
  ]

  const allPurchases = existingPurchases ? JSON.parse(existingPurchases) : []
  allPurchases.push(...demoPurchases)
  localStorage.setItem("brain_battle_demo_purchases", JSON.stringify(allPurchases))
}

// Session helper
export const refreshSession = async () => {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    throw error
  }
  
  return session
}
