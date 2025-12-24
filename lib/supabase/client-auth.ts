import { createClient } from "./client"

export const signInWithEmail = async (email: string, password: string) => {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const signUpWithEmail = async (email: string, password: string, username: string) => {
  const response = await fetch("/api/register", {
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
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }

  return { success: true }
}

export const signInWithGoogle = async () => {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const requestPasswordReset = async (email: string) => {
  const response = await fetch("/api/auth/reset-password/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Failed to send reset code")
  }

  return await response.json()
}

export const verifyResetCode = async (email: string, code: string, newPassword: string) => {
  const response = await fetch("/api/auth/reset-password/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, newPassword }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Failed to reset password")
  }

  return await response.json()
}
