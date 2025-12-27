"use client"

import { useI18n } from "@/lib/i18n/context"
import { useUser } from "@/lib/hooks/use-user"
import { AvatarCircle } from "@/components/ui/avatar-circle"
import { GameButton } from "@/components/ui/game-button"
import { useRouter } from "next/navigation"
import { Loader2, Pencil } from "lucide-react"
import { useState } from "react"
import { ProfileEditorModal } from "@/components/modals/profile-editor-modal"

export function MainMenu() {
  const { t } = useI18n()
  const { profile, loading } = useUser()
  const router = useRouter()
  const [showProfileEditor, setShowProfileEditor] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background safe-area-top safe-area-bottom">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Avatar Section with Edit Button */}
        <div className="flex flex-col items-center gap-3 relative">
          <div className={`rounded-full p-1 ${avatarFrame}`}>
            <AvatarCircle src={profile?.avatar_url} size="xl" />
          </div>

          <button
            onClick={() => setShowProfileEditor(true)}
            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary hover:bg-primary/80 transition-colors flex items-center justify-center shadow-lg border-2 border-background"
            title="Edit Profile"
          >
            <Pencil className="w-5 h-5 text-primary-foreground" />
          </button>

          <h1 className={`text-2xl font-bold tracking-wide ${nicknameStyle}`}>
            {profile?.username || t("home.username")}
          </h1>
        </div>

        {/* Menu Buttons */}
        <div className="w-full flex flex-col gap-4 mt-4">
          <GameButton size="lg" className="w-full" onClick={() => router.push("/classic")}>
            {t("nav.classic")}
          </GameButton>

          <GameButton size="lg" className="w-full" onClick={() => router.push("/pvp")}>
            {t("nav.pvp")}
          </GameButton>

          <GameButton size="lg" className="w-full" onClick={() => router.push("/settings")}>
            {t("nav.settings")}
          </GameButton>
        </div>
      </div>

      {showProfileEditor && <ProfileEditorModal onClose={() => setShowProfileEditor(false)} />}
    </div>
  )
}
