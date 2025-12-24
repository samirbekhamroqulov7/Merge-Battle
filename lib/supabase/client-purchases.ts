import { createClient } from "./client"

export const createCheckoutSession = async (itemType: string, itemId: string, itemName: string, price: number) => {
  const response = await fetch("/api/auth/me")
  const data = await response.json()

  if (!data.user) {
    throw new Error("User not authenticated")
  }

  const user = data.user

  // Demo purchases for development
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && price <= 10) {
    return handleDemoPurchase(user.id, itemType, itemId, itemName, price)
  }

  // Guest purchases
  if (user.auth_id?.startsWith("guest_") && typeof window !== "undefined") {
    return handleGuestPurchase(itemType, itemId, itemName, price)
  }

  // Real checkout for authenticated users
  return handleRealCheckout(itemName, price, itemType, itemId)
}

function handleDemoPurchase(userId: string, itemType: string, itemId: string, itemName: string, price: number) {
  const demoPurchase = {
    id: "demo_" + Date.now(),
    user_id: userId,
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

function handleGuestPurchase(itemType: string, itemId: string, itemName: string, price: number) {
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

async function handleRealCheckout(itemName: string, price: number, itemType: string, itemId: string) {
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
