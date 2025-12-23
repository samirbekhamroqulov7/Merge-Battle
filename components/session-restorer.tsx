"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/lib/hooks/use-user"

export function SessionRestorer() {
  const { refetch } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return

    const checkForAuthRefresh = async () => {
      const { usePathname, useSearchParams } = await import("next/navigation")

      const oauthComplete = document.cookie.includes("oauth_complete=true")
      const currentPath = window.location.pathname
      const searchParams = new URLSearchParams(window.location.search)
      const isOAuthCallback = currentPath === "/" && searchParams.get("oauth_success") === "true"
      const needsRefresh = localStorage.getItem("brain_battle_needs_refresh") === "true"

      if (oauthComplete || isOAuthCallback || needsRefresh) {
        refetch()

        document.cookie = "oauth_complete=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        localStorage.removeItem("brain_battle_needs_refresh")

        if (isOAuthCallback && window.history.replaceState) {
          const newUrl = window.location.pathname
          window.history.replaceState({}, "", newUrl)
        }
      }
    }

    checkForAuthRefresh()

    const handleRouteChange = () => {
      setTimeout(checkForAuthRefresh, 100)
    }

    window.addEventListener("popstate", handleRouteChange)

    return () => {
      window.removeEventListener("popstate", handleRouteChange)
    }
  }, [refetch, mounted])

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return

    const interval = setInterval(() => {
      const hasSession = localStorage.getItem("brain_battle_session")
      const shouldPersist = localStorage.getItem("brain_battle_auto_login")

      if (hasSession && shouldPersist === "true") {
        refetch()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [refetch, mounted])

  return null
}
