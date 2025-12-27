"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/hooks/use-user"
import { createClient } from "@/lib/supabase/client"

export function SessionRestorer() {
  const { refetch } = useUser()
  const [mounted, setMounted] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === "undefined" || isRestoring) return

    const restoreSession = async () => {
      try {
        setIsRestoring(true)

        const authRefresh = document.cookie.includes("auth_refresh=1")
        const accessToken = document.cookie.match(/sb-access-token=([^;]+)/)?.[1]
        const refreshToken = document.cookie.match(/sb-refresh-token=([^;]+)/)?.[1]

        if (authRefresh && accessToken && refreshToken) {
          console.log("[v0] Restoring session from OAuth callback")

          const supabase = createClient()

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (!error && data.session) {
            localStorage.setItem(
              "brain_battle_session",
              JSON.stringify({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
              }),
            )
            localStorage.setItem("brain_battle_auto_login", "true")

            document.cookie = "auth_refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
            document.cookie = "sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
            document.cookie = "sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

            await refetch()

            console.log("[v0] Session restored successfully")
          } else {
            console.error("[v0] Failed to restore session:", error)
          }
        }
      } catch (error) {
        console.error("[v0] Session restoration error:", error)
      } finally {
        setIsRestoring(false)
      }
    }

    restoreSession()
  }, [mounted, refetch, isRestoring])

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return

    const interval = setInterval(() => {
      const hasSession = localStorage.getItem("brain_battle_session")
      const shouldPersist = localStorage.getItem("brain_battle_auto_login")

      if (hasSession && shouldPersist === "true") {
        refetch()
      }
    }, 30000) // Каждые 30 секунд

    return () => clearInterval(interval)
  }, [refetch, mounted])

  return null
}
