"use client"

import { useUser } from "@/lib/hooks/use-user"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useState } from "react"
import { GameCard } from "@/components/ui/game-card"
import { GameButton } from "@/components/ui/game-button"
import { Brain, Gamepad2 } from "lucide-react"

export function GuestGameWrapper({ children, gameSlug }: { children: ReactNode, gameSlug: string }) {
  const { profile, loading, quickGuestPlay } = useUser()
  const router = useRouter()
  const [creatingGuest, setCreatingGuest] = useState(false)

  useEffect(() => {
    if (!loading && !profile) {
      // Автоматически создаем гостевой аккаунт если нет профиля
      setCreatingGuest(true)
      setTimeout(() => {
        const guestProfile = quickGuestPlay()
        console.log("Автоматически создан гостевой профиль:", guestProfile.username)
        setCreatingGuest(false)
      }, 500)
    }
  }, [loading, profile, quickGuestPlay])

  if (creatingGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Подготовка игры...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Если все еще нет профиля (очень редкий случай)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <GameCard className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-primary mb-3">Начните игру</h2>
          <p className="text-muted-foreground mb-6">
            Чтобы играть в {gameSlug}, войдите в аккаунт или играйте как гость
          </p>
          <div className="space-y-3">
            <GameButton
              variant="primary"
              className="w-full"
              onClick={() => {
                const guestProfile = quickGuestPlay()
                console.log("Создан гостевой профиль:", guestProfile.username)
              }}
            >
              Играть как гость
            </GameButton>
            <GameButton
              variant="outline"
              className="w-full"
              onClick={() => router.push("/auth/login")}
            >
              Войти в аккаунт
            </GameButton>
            <GameButton
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/classic")}
            >
              Назад к играм
            </GameButton>
          </div>
        </GameCard>
      </div>
    )
  }

  return <>{children}</>
}
