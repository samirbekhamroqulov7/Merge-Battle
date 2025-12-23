"use client"

import type { ReactNode } from "react"
import { I18nProvider } from "@/lib/i18n/context"
import { useMusic } from "@/lib/hooks/use-music"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

function MusicProvider({ children }: { children: ReactNode }) {
  const { playMusic, stopMusic } = useMusic()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return

    const handleUserInteraction = () => {
      if (pathname === "/" || pathname === "/auth/login" || pathname === "/auth/sign-up") {
        playMusic("/music/menu-theme.mp3")
      } else if (pathname.includes("/classic") || pathname.includes("/pvp")) {
        playMusic("/music/game-theme.mp3")
      } else {
        stopMusic()
      }

      // Remove listeners after first interaction
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }

    // Wait for user interaction before playing music (browser policy)
    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)

    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }
  }, [pathname, playMusic, stopMusic, mounted])

  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <MusicProvider>{children}</MusicProvider>
    </I18nProvider>
  )
}
