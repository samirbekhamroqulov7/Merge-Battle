"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/hooks/use-user"
import { GameCard } from "@/components/ui/game-card"
import { GameButton } from "@/components/ui/game-button"
import { AvatarCircle } from "@/components/ui/avatar-circle"
import { ProfileEditorModal } from "@/components/modals/profile-editor-modal"
import { Gamepad2, Swords, Settings, Crown, Brain, Pencil, Loader2, User } from "lucide-react"
import { toast } from "sonner"

export default function HomePage() {
  const router = useRouter()
  const { user, profile, loading, isGuest, quickGuestPlay } = useUser()
  const [initializing, setInitializing] = useState(true)
  const [showProfileEditor, setShowProfileEditor] = useState(false)

  useEffect(() => {
    const checkGuestMode = async () => {
      const guestMode = localStorage.getItem("brain_battle_guest_mode")
      const session = localStorage.getItem("brain_battle_session")

      if (!session && !loading && !profile) {
        // User can choose to start as guest later
      }

      setInitializing(false)
    }

    checkGuestMode()
  }, [loading, profile])

  const handleGuestPlay = async () => {
    try {
      quickGuestPlay()
      toast.success("Гостевой режим активирован!")
      router.push("/classic")
    } catch {
      toast.error("Ошибка создания гостевого аккаунта")
    }
  }

  const handleClassicGames = () => {
    if (!profile) {
      handleGuestPlay()
    } else {
      router.push("/classic")
    }
  }

  const avatarFrame = profile?.avatar_frame
    ? [
        { id: "none", style: "border-2 border-border" },
        { id: "bronze", style: "border-4 border-amber-600" },
        { id: "silver", style: "border-4 border-gray-400" },
        { id: "gold", style: "border-4 border-yellow-400" },
        { id: "platinum", style: "border-4 border-cyan-300" },
        { id: "diamond", style: "border-4 border-blue-400" },
        {
          id: "rainbow",
          style: "border-4 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500",
        },
      ].find((f) => f.id === profile.avatar_frame)?.style
    : "border-2 border-border"

  const nicknameStyle = profile?.nickname_style
    ? [
        { id: "normal", className: "text-foreground" },
        { id: "bold", className: "text-foreground font-bold" },
        {
          id: "gradient1",
          className: "bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-bold",
        },
        {
          id: "gradient2",
          className: "bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent font-bold",
        },
        {
          id: "gradient3",
          className: "bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-bold",
        },
        {
          id: "gradient4",
          className: "bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent font-bold",
        },
      ].find((s) => s.id === profile.nickname_style)?.className
    : "text-primary"

  if (loading && initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Загрузка Brain Battle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      {/* Красивый хедер с логотипом и аватаром */}
      <div className="pt-8 px-6">
        {/* Логотип игры */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Brain Battle
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Игры для интеллекта</p>
            </div>
          </div>

          {/* Аватар и никнейм пользователя */}
          <div className="flex flex-col items-center gap-3 relative">
            <div className={`rounded-full p-1 ${avatarFrame} relative group`}>
              {profile?.avatar_url ? (
                <AvatarCircle
                  src={profile.avatar_url}
                  size="lg"
                  className="transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
              )}
              {profile && (
                <button
                  onClick={() => setShowProfileEditor(true)}
                  className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 transition-all flex items-center justify-center shadow-lg border-2 border-background z-10"
                  title="Редактировать профиль"
                >
                  <Pencil className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            <div className="text-center">
              <h2 className={`text-xl font-bold tracking-wide ${nicknameStyle}`}>{profile?.username || "Гость"}</h2>
              {!profile && <p className="text-sm text-muted-foreground mt-1">Войдите или играйте как гость</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Основные кнопки */}
      <div className="p-6 max-w-md mx-auto space-y-4">
        <GameButton variant="primary" size="lg" className="w-full" onClick={handleClassicGames}>
          <Gamepad2 className="w-5 h-5 mr-2" />
          Классические игры
        </GameButton>

        <GameButton
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => {
            if (!profile || isGuest) {
              toast.info("Для PvP режима нужен зарегистрированный аккаунт")
              router.push("/auth/login")
            } else {
              router.push("/pvp")
            }
          }}
        >
          <Swords className="w-5 h-5 mr-2" />
          PvP Арена
        </GameButton>

        {!profile && (
          <div className="pt-4 border-t border-border">
            <GameButton variant="ghost" size="lg" className="w-full" onClick={handleGuestPlay}>
              <User className="w-5 h-5 mr-2" />
              Играть как гость
            </GameButton>
          </div>
        )}
      </div>

      {/* Карточки внизу */}
      <div className="p-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
        <GameCard
          className="p-4 text-center hover:bg-accent/5 transition-colors cursor-pointer"
          onClick={() => router.push("/classic")}
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-sm mb-1">Рейтинги</h3>
          <p className="text-xs text-muted-foreground">Соревнуйтесь с другими</p>
        </GameCard>

        <GameCard
          className="p-4 text-center hover:bg-accent/5 transition-colors cursor-pointer"
          onClick={() => router.push("/settings")}
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-sm mb-1">Настройки</h3>
          <p className="text-xs text-muted-foreground">Персонализируйте игру</p>
        </GameCard>
      </div>

      {/* Модальное окно редактора профиля */}
      {showProfileEditor && <ProfileEditorModal onClose={() => setShowProfileEditor(false)} />}
    </div>
  )
}
