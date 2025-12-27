"use client"

import { useI18n } from "@/lib/i18n/context"
import { useUser } from "@/lib/hooks/use-user"
import { useSound } from "@/lib/hooks/use-sound"
import { useMusic } from "@/lib/hooks/use-music"
import { GameButton } from "@/components/ui/game-button"
import { GameCard } from "@/components/ui/game-card"
import { languages } from "@/lib/i18n/translations"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Settings, 
  Globe, 
  Volume2, 
  User, 
  HelpCircle, 
  LogOut, 
  Check, 
  Loader2, 
  Music, 
  Pencil,
  AlertCircle,
  Sparkles,
  Smartphone,
  RefreshCw
} from "lucide-react"
import { useState, useEffect } from "react"
import { HelpModal } from "@/components/modals/help-modal"
import { ProfileEditorModal } from "@/components/modals/profile-editor-modal"
import { AvatarCircle } from "@/components/ui/avatar-circle"

const AccountPanel = () => {
  const { t } = useI18n()
  const { user, profile, isGuest, signOut, refetch, loading: userLoading } = useUser()
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const router = useRouter()
  const [retryCount, setRetryCount] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && user && !profile && !userLoading && retryCount < 3) {
      const timer = setTimeout(() => {
        refetch()
        setRetryCount(prev => prev + 1)
      }, 1000 * (retryCount + 1))
      
      return () => clearTimeout(timer)
    }
  }, [isClient, user, profile, userLoading, refetch, retryCount])

  if (userLoading && retryCount === 0) {
    return (
      <GameCard className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p>Загрузка профиля...</p>
      </GameCard>
    )
  }

  if (!isClient || !user) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl blur-xl" />
        <GameCard variant="interactive" className="p-6 text-center relative">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("auth.notSignedIn")}</h3>
          <p className="text-muted-foreground mb-4">
            Войдите в аккаунт для сохранения прогресса
          </p>
          <GameButton
            variant="primary"
            className="w-full"
            onClick={() => router.push('/auth/login')}
          >
            {t("auth.login")}
          </GameButton>
        </GameCard>
      </div>
    )
  }

  const currentFrame = profile?.avatar_frame || "none"
  const frameStyle = currentFrame === "gold" ? "border-4 border-yellow-400" :
                    currentFrame === "platinum" ? "border-4 border-cyan-300" :
                    currentFrame === "diamond" ? "border-4 border-blue-400" :
                    currentFrame === "rainbow" ? "border-4 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" :
                    currentFrame === "bronze" ? "border-4 border-amber-600" :
                    currentFrame === "silver" ? "border-4 border-gray-400" :
                    "border-4 border-primary/50"

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
      
      <GameCard className="p-8 relative">
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`relative rounded-full p-2 mb-4 ${frameStyle}`}>
            <AvatarCircle 
              src={profile?.avatar_url} 
              size="xl" 
              className="border-4 border-background"
            />
            <button
              onClick={() => setShowProfileEditor(true)}
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-110"
            >
              <Pencil className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-3xl font-bold ${profile?.nickname_style === "normal" ? "text-foreground" : 
                         profile?.nickname_style === "bold" ? "text-foreground font-bold" :
                         profile?.nickname_style === "gradient1" ? "bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-bold" :
                         profile?.nickname_style === "gradient2" ? "bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent font-bold" :
                         profile?.nickname_style === "gradient3" ? "bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-bold" :
                         profile?.nickname_style === "gradient4" ? "bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent font-bold" :
                         "text-foreground"}`}>
              {profile?.username || user.email || "Пользователь"}
            </h3>
            {profile?.nickname_style && profile.nickname_style !== "normal" && (
              <Sparkles className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Smartphone className="w-4 h-4" />
            <span>Устройство сохранено</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {user.email}
            {isGuest && (
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                Гостевой аккаунт
              </span>
            )}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <GameButton
              variant="outline"
              className="flex-1"
              onClick={async () => {
                await signOut()
                router.push('/')
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("auth.logout")}
            </GameButton>
            
            <GameButton
              variant="ghost"
              className="flex-1"
              onClick={async () => {
                await signOut()
                router.push('/auth/login')
              }}
            >
              Сменить аккаунт
            </GameButton>
          </div>
          
          <GameButton
            variant="outline"
            className="w-full"
            onClick={() => {
              refetch()
              if (isClient) {
                setTimeout(() => window.location.reload(), 300)
              }
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить данные
          </GameButton>
        </div>

        {isGuest && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-600">Гостевой режим</p>
                <p className="text-xs text-yellow-500/80 mt-1">
                  Зарегистрируйте аккаунт, чтобы сохранять прогресс, участвовать в PvP и получить доступ ко всем функциям.
                </p>
              </div>
            </div>
          </div>
        )}
      </GameCard>
      
      {showProfileEditor && <ProfileEditorModal onClose={() => setShowProfileEditor(false)} />}
    </div>
  )
}

export function SettingsPage() {
  const { t, language, setLanguage } = useI18n()
  const { profile, signOut, loading } = useUser()
  const { soundEnabled, toggleSound } = useSound()
  const { musicEnabled: musicState, toggleMusic } = useMusic()
  const router = useRouter()
  const [showLanguages, setShowLanguages] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-4">
          <GameButton variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="w-5 h-5" />
          </GameButton>
          <h1 className="text-2xl font-bold text-primary uppercase tracking-wider">{t("settings.title")}</h1>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-4 border-primary/50 flex items-center justify-center mb-6 shadow-lg">
          <Settings className="w-12 h-12 text-primary" />
        </div>

        <div className="w-full max-w-md flex flex-col gap-4">
          <GameCard
            variant="interactive"
            className="p-4 flex items-center justify-between"
            onClick={() => setShowLanguages(!showLanguages)}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary" />
              <span className="font-semibold">{t("settings.language")}</span>
            </div>
            <span className="text-muted-foreground">{languages.find((l) => l.code === language)?.nativeName}</span>
          </GameCard>

          {showLanguages && (
            <GameCard className="p-2 max-h-64 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`w-full p-3 rounded-lg flex items-center justify-between hover:bg-secondary/50 transition-colors ${
                    language === lang.code ? "bg-primary/20" : ""
                  }`}
                  onClick={() => {
                    setLanguage(lang.code)
                    setShowLanguages(false)
                  }}
                >
                  <span>{lang.nativeName}</span>
                  {language === lang.code && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </GameCard>
          )}

          <GameCard variant="interactive" className="p-4 flex items-center justify-between" onClick={toggleSound}>
            <div className="flex items-center gap-3">
              <Volume2 className="w-6 h-6 text-primary" />
              <span className="font-semibold">{t("settings.sound")}</span>
            </div>
            <span className={soundEnabled ? "text-green-400" : "text-muted-foreground"}>
              {soundEnabled ? t("settings.on") : t("settings.off")}
            </span>
          </GameCard>

          <GameCard variant="interactive" className="p-4 flex items-center justify-between" onClick={toggleMusic}>
            <div className="flex items-center gap-3">
              <Music className="w-6 h-6 text-primary" />
              <span className="font-semibold">{t("settings.music")}</span>
            </div>
            <span className={musicState ? "text-green-400" : "text-muted-foreground"}>
              {musicState ? t("settings.on") : t("settings.off")}
            </span>
          </GameCard>

          <AccountPanel />

          <GameCard
            variant="interactive"
            className="p-4 flex items-center gap-3"
            onClick={() => setShowHelpModal(true)}
          >
            <HelpCircle className="w-6 h-6 text-primary" />
            <span className="font-semibold">{t("settings.help")}</span>
          </GameCard>

          {profile && !("isGuest" in profile && profile.isGuest) && (
            <GameButton
              variant="ghost"
              className="mt-4 text-destructive hover:bg-destructive/10"
              onClick={async () => {
                await signOut()
                router.push("/")
              }}
            >
              <LogOut className="w-5 h-5 mr-2" />
              {t("auth.logout")}
            </GameButton>
          )}
        </div>
      </div>

      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  )
}
