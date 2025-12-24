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

export const saveGuestSession = (session: unknown) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("brain_battle_guest_session", JSON.stringify(session))
  }
}

export const clearGuestSession = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("brain_battle_guest_session")
    localStorage.removeItem("brain_battle_guest_mode")
  }
}
