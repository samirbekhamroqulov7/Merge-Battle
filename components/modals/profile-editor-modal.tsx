"use client"

import { useState, useEffect, useRef } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useUser } from "@/lib/hooks/use-user"
import { GameButton } from "@/components/ui/game-button"
import { GameCard } from "@/components/ui/game-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, Lock, CheckCircle2, Crown, Palette, Image, DollarSign, Zap, Star, Gem, CrownIcon, ShoppingCart, AlertCircle, User, Loader2 } from "lucide-react"
import { AvatarCircle } from "@/components/ui/avatar-circle"
import { toast } from "sonner"
import { createCheckoutSession, isItemOwned, initDemoPurchases } from "@/lib/supabase/client"

interface ProfileEditorModalProps {
  onClose: () => void
}

const FREE_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot2",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Hero",
]

const PREMIUM_AVATARS = [
  { id: "phoenix", url: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Phoenix", price: 2.00, name: "Феникс" },
  { id: "samurai", url: "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Samurai", price: 2.00, name: "Самурай" },
  { id: "cyber", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyber", price: 2.00, name: "Кибер" },
  { id: "demon", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Demon", price: 2.00, name: "Демон" },
  { id: "angel", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Angel", price: 2.00, name: "Ангел" },
  { id: "dragon_legend", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Dragon", price: 300.00, name: "Дракон Легенды", super: true },
]

const FRAMES = [
  { id: "none", name: "Без рамки", premium: false, style: "border-2 border-border" },
  { id: "bronze", name: "Бронзовая", premium: false, style: "border-4 border-amber-600" },
  { id: "silver", name: "Серебряная", premium: false, style: "border-4 border-gray-400" },
  { id: "gold", name: "Золотая", premium: true, style: "border-4 border-yellow-400", price: 2.00 },
  { id: "platinum", name: "Платиновая", premium: true, style: "border-4 border-cyan-300", price: 2.00 },
  { id: "diamond", name: "Алмазная", premium: true, style: "border-4 border-blue-400", price: 2.00 },
  {
    id: "rainbow",
    name: "Радужная",
    premium: true,
    style: "border-4 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500",
    price: 2.00,
  },
  {
    id: "legendary",
    name: "Легендарная",
    premium: true,
    style: "border-6 border-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-pulse",
    price: 300.00,
    super: true,
  },
]

const NICKNAME_STYLES = [
  { id: "normal", name: "Обычный", premium: false, className: "text-foreground" },
  { id: "bold", name: "Жирный", premium: false, className: "text-foreground font-bold" },
  {
    id: "gradient1",
    name: "Огненный",
    premium: true,
    className: "bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-bold",
    price: 2.00,
  },
  {
    id: "gradient2",
    name: "Океанский",
    premium: true,
    className: "bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent font-bold",
    price: 2.00,
  },
  {
    id: "gradient3",
    name: "Королевский",
    premium: true,
    className: "bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent font-bold",
    price: 2.00,
  },
  {
    id: "gradient4",
    name: "Лесной",
    premium: true,
    className: "bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent font-bold",
    price: 2.00,
  },
  {
    id: "neon",
    name: "Неоновый",
    premium: true,
    className: "bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent font-bold text-shadow-neon",
    price: 2.00,
  },
  {
    id: "golden",
    name: "Золотой",
    premium: true,
    className: "bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent font-bold",
    price: 2.00,
  },
  {
    id: "legendary",
    name: "Легендарный",
    premium: true,
    className: "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent font-bold animate-pulse",
    price: 300.00,
    super: true,
  },
]

export function ProfileEditorModal({ onClose }: ProfileEditorModalProps) {
  const { t } = useI18n()
  const { profile, updateProfile, isGuest, user, quickGuestPlay, refetch } = useUser()
  const [username, setUsername] = useState(profile?.username || "")
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || FREE_AVATARS[0])
  const [selectedFrame, setSelectedFrame] = useState(profile?.avatar_frame || "none")
  const [selectedStyle, setSelectedStyle] = useState(profile?.nickname_style || "normal")
  const [activeTab, setActiveTab] = useState<"basic" | "avatar" | "customization">("basic")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [ownedAvatars, setOwnedAvatars] = useState<string[]>([])
  const [ownedFrames, setOwnedFrames] = useState<string[]>([])
  const [ownedStyles, setOwnedStyles] = useState<string[]>([])
  const [loadingOwnership, setLoadingOwnership] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentFrame = FRAMES.find((f) => f.id === selectedFrame)
  const currentStyle = NICKNAME_STYLES.find((s) => s.id === selectedStyle)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "")
      setSelectedAvatar(profile.avatar_url || FREE_AVATARS[0])
      setSelectedFrame(profile.avatar_frame || "none")
      setSelectedStyle(profile.nickname_style || "normal")
    }
  }, [profile])

  useEffect(() => {
    const loadOwnership = async () => {
      if (user?.id) {
        try {
          setLoadingOwnership(true)

          if (process.env.NODE_ENV === 'development') {
            await initDemoPurchases(user.id)
          }

          const avatarIds = PREMIUM_AVATARS.map(a => a.id)
          const frameIds = FRAMES.filter(f => f.premium).map(f => f.id)
          const styleIds = NICKNAME_STYLES.filter(s => s.premium).map(s => s.id)

          const ownershipPromises = {
            avatars: Promise.all(avatarIds.map(async (id) => ({
              id,
              owned: await isItemOwned(user.id, 'avatar', id)
            }))),
            frames: Promise.all(frameIds.map(async (id) => ({
              id,
              owned: await isItemOwned(user.id, 'frame', id)
            }))),
            styles: Promise.all(styleIds.map(async (id) => ({
              id,
              owned: await isItemOwned(user.id, 'nickname_style', id)
            })))
          }

          const [avatarResults, frameResults, styleResults] = await Promise.all([
            ownershipPromises.avatars,
            ownershipPromises.frames,
            ownershipPromises.styles
          ])

          setOwnedAvatars(avatarResults.filter(r => r.owned).map(r => r.id))
          setOwnedFrames(frameResults.filter(r => r.owned).map(r => r.id))
          setOwnedStyles(styleResults.filter(r => r.owned).map(r => r.id))

        } catch (error) {
          console.error('Error loading ownership:', error)
        } finally {
          setLoadingOwnership(false)
        }
      } else {
        setOwnedAvatars([])
        setOwnedFrames(['none', 'bronze', 'silver'])
        setOwnedStyles(['normal', 'bold'])
        setLoadingOwnership(false)
      }
    }

    loadOwnership()
  }, [user])

  useEffect(() => {
    const handleDemoPurchase = (e: CustomEvent) => {
      if (e.detail.itemType === 'avatar') {
        setOwnedAvatars(prev => [...prev, e.detail.itemId])
      } else if (e.detail.itemType === 'frame') {
        setOwnedFrames(prev => [...prev, e.detail.itemId])
      } else if (e.detail.itemType === 'nickname_style') {
        setOwnedStyles(prev => [...prev, e.detail.itemId])
      }
      
      toast.success(`Предмет "${e.detail.itemName}" куплен!`, {
        description: "Теперь вы можете его использовать",
        duration: 3000,
      })
    }

    const handleGuestPurchase = (e: CustomEvent) => {
      toast.success(`Предмет "${e.detail.itemName}" куплен для гостя!`, {
        description: "Предмет доступен в этой сессии",
        duration: 3000,
      })
    }

    window.addEventListener('demoPurchaseCompleted', handleDemoPurchase as EventListener)
    window.addEventListener('guestPurchaseCompleted', handleGuestPurchase as EventListener)

    return () => {
      window.removeEventListener('demoPurchaseCompleted', handleDemoPurchase as EventListener)
      window.removeEventListener('guestPurchaseCompleted', handleGuestPurchase as EventListener)
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("Пожалуйста, выберите изображение")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Изображение должно быть меньше 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
      setSelectedAvatar("")
    }
    reader.readAsDataURL(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Введите имя пользователя")
      return
    }

    if (username.length < 3 || username.length > 20) {
      toast.error("Имя должно быть от 3 до 20 символов")
      return
    }

    setIsSaving(true)
    try {
      const result = await updateProfile({
        username: username.trim(),
        avatar_url: uploadedImage || selectedAvatar,
        avatar_frame: selectedFrame,
        nickname_style: selectedStyle,
      })

      setSaveSuccess(true)
      
      if (result?.isNew) {
        toast.success("Профиль создан и сохранен!", {
          description: "Ваши настройки успешно применены",
          duration: 3000,
        })
      } else {
        toast.success("Профиль обновлен!", {
          description: "Изменения успешно сохранены",
          duration: 3000,
        })
      }

      await refetch()
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error: any) {
      console.error("Failed to save profile:", error)
      
      let errorMessage = "Не удалось сохранить изменения"
      let errorDescription = "Попробуйте еще раз"
      
      if (error.message?.includes("duplicate") || error.message?.includes("уже существует")) {
        errorMessage = "Это имя пользователя уже занято"
        errorDescription = "Пожалуйста, выберите другое имя"
      } else if (error.message?.includes("auth") || error.message?.includes("авторизации")) {
        errorMessage = "Проблема с авторизацией"
        errorDescription = "Попробуйте войти снова"
      } else if (error.message?.includes("network") || !navigator.onLine) {
        errorMessage = "Проблема с интернетом"
        errorDescription = "Проверьте подключение и попробуйте еще раз"
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBuyPremium = async (item: any, type: 'frame' | 'style' | 'avatar') => {
    if (!user) {
      const shouldContinue = window.confirm(
        "Для покупки предметов нужна регистрация.\n\n" +
        "Хотите продолжить как гость? Гостевые покупки будут доступны только в этой сессии."
      )
      
      if (shouldContinue) {
        quickGuestPlay()
        toast.info("Гостевой режим активирован", {
          description: "Теперь вы можете покупать предметы",
          duration: 3000,
        })
        setTimeout(() => {
          handleBuyPremium(item, type)
        }, 1000)
      }
      return
    }

    try {
      const itemTypeMap = {
        'avatar': 'avatar',
        'frame': 'frame',
        'style': 'nickname_style'
      }

      const checkoutUrl = await createCheckoutSession(
        itemTypeMap[type],
        item.id,
        item.name,
        item.price
      )

      if (item.super) {
        toast.info(`Легендарный предмет: ${item.name}`, {
          description: `Цена: $${item.price}. Открываем платежную страницу...`,
          duration: 3000,
        })
      } else {
        toast.info(`Покупка ${item.name}`, {
          description: `Цена: $${item.price}. Открываем платежную страницу...`,
        })
      }

      const newWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
      if (newWindow) {
        newWindow.opener = null
      }

    } catch (error: any) {
      console.error('Purchase error:', error)
      
      let errorMessage = "Ошибка при покупке"
      if (error.message?.includes("не авторизован")) {
        errorMessage = "Пожалуйста, войдите в аккаунт"
      } else if (error.message?.includes("сеть")) {
        errorMessage = "Проблема с интернет-соединением"
      }
      
      toast.error(errorMessage, {
        description: error.message || "Попробуйте еще раз",
      })
    }
  }

  const isPremiumAvatarOwned = (avatarId: string) => ownedAvatars.includes(avatarId)
  const isPremiumFrameOwned = (frameId: string) => ownedFrames.includes(frameId)
  const isPremiumStyleOwned = (styleId: string) => ownedStyles.includes(styleId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <GameCard variant="elevated" className="w-full max-w-2xl p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {!saveSuccess ? (
          <>
            <h2 className="text-2xl font-bold text-primary mb-6">Редактирование профиля</h2>

            {isGuest && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-600">Гостевой режим</p>
                    <p className="text-yellow-500/80">Ваши настройки сохраняются только в этом браузере</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-4 mb-6 p-4 bg-secondary/50 rounded-lg border border-border">
              <div className={`rounded-full p-1 ${currentFrame?.style || "border-2 border-border"}`}>
                <AvatarCircle src={uploadedImage || selectedAvatar} size="xl" />
              </div>
              <h3 className={`text-2xl ${currentStyle?.className || "text-foreground"}`}>
                {username || "Игрок"}
              </h3>
              {isGuest && (
                <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded-full">
                  Гость
                </span>
              )}
            </div>

            <div className="flex gap-2 mb-4 border-b border-border">
              <button
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === "basic" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("basic")}
              >
                Основное
              </button>
              <button
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === "avatar" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("avatar")}
              >
                <Image className="w-4 h-4 inline mr-2" />
                Аватар
              </button>
              <button
                className={`px-4 py-2 font-semibold transition-colors ${
                  activeTab === "customization" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("customization")}
              >
                <Palette className="w-4 h-4 inline mr-2" />
                Оформление
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto pr-2">
              {activeTab === "basic" && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground">
                    Имя пользователя
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Введите имя (3-20 символов)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-secondary border-border"
                    minLength={3}
                    maxLength={20}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Это имя будет отображаться другим игрокам
                  </p>
                </div>
              )}

              {activeTab === "avatar" && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-foreground flex items-center gap-2 mb-3">
                      <Upload className="w-4 h-4" />
                      Загрузить фото
                    </Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <GameButton
                      variant="outline"
                      className="w-full"
                      onClick={handleUploadClick}
                    >
                      Выбрать файл с телефона
                    </GameButton>
                    {uploadedImage && (
                      <div className="mt-3 text-sm text-green-500 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Фото загружено
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Бесплатные аватары</h4>
                    <div className="grid grid-cols-5 gap-3">
                      {FREE_AVATARS.map((avatar, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedAvatar(avatar)
                            setUploadedImage(null)
                          }}
                          className={`relative rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                            selectedAvatar === avatar && !uploadedImage
                              ? "border-primary ring-2 ring-primary"
                              : "border-border"
                          }`}
                        >
                          <AvatarCircle src={avatar} size="md" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      Премиум аватары
                      <Lock className="w-4 h-4 text-yellow-500" />
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {PREMIUM_AVATARS.map((avatar) => (
                        <div
                          key={avatar.id}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                            (selectedAvatar === avatar.url && !uploadedImage) || isPremiumAvatarOwned(avatar.id)
                              ? "border-yellow-500 ring-2 ring-yellow-500"
                              : "border-yellow-600/50"
                          } ${avatar.super ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20' : 'bg-secondary/50'}`}
                        >
                          <button
                            onClick={() => {
                              if (isPremiumAvatarOwned(avatar.id) || (process.env.NODE_ENV === 'development' && avatar.price <= 10)) {
                                setSelectedAvatar(avatar.url)
                                setUploadedImage(null)
                              }
                            }}
                            className="w-full"
                            disabled={!isPremiumAvatarOwned(avatar.id) && !loadingOwnership && !(process.env.NODE_ENV === 'development' && avatar.price <= 10)}
                          >
                            <div className="p-3">
                              <div className="relative mx-auto w-16 h-16 rounded-full overflow-hidden mb-2">
                                <AvatarCircle src={avatar.url} size="md" />
                                {!isPremiumAvatarOwned(avatar.id) && !loadingOwnership && !(process.env.NODE_ENV === 'development' && avatar.price <= 10) && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-yellow-500" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs font-medium text-center mb-1">{avatar.name}</p>
                              <div className="flex items-center justify-center">
                                {avatar.super ? (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
                                    <CrownIcon className="w-3 h-3" />
                                    <span>${avatar.price}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 text-xs">
                                    <DollarSign className="w-3 h-3" />
                                    <span>${avatar.price}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                          {avatar.super && (
                            <div className="absolute -top-2 -right-2">
                              <Zap className="w-6 h-6 text-purple-500 animate-pulse" />
                            </div>
                          )}

                          <div className="absolute bottom-2 left-0 right-0 px-2">
                            {isPremiumAvatarOwned(avatar.id) || (process.env.NODE_ENV === 'development' && avatar.price <= 10) ? (
                              <GameButton
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700 text-xs py-1"
                                onClick={() => {
                                  setSelectedAvatar(avatar.url)
                                  setUploadedImage(null)
                                }}
                              >
                                Выбрать
                              </GameButton>
                            ) : !loadingOwnership ? (
                              <GameButton
                                size="sm"
                                variant="default"
                                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-xs py-1"
                                onClick={() => handleBuyPremium(avatar, 'avatar')}
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Купить
                              </GameButton>
                            ) : (
                              <div className="text-center text-xs text-muted-foreground py-1">
                                Загрузка...
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "customization" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Стиль никнейма</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {NICKNAME_STYLES.map((style) => (
                        <div
                          key={style.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedStyle === style.id ? "border-primary bg-primary/10" : "border-border bg-secondary/50"
                          } ${style.super ? 'bg-gradient-to-br from-purple-600/10 to-pink-600/10' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                  {style.name}
                                </p>
                                {style.premium && <Lock className="w-3 h-3 text-yellow-500" />}
                                {style.super && <Star className="w-3 h-3 text-purple-500 animate-pulse" />}
                              </div>
                              <p className={`text-xl ${style.className}`}>{username || "Пример"}</p>
                            </div>
                            {style.premium ? (
                              isPremiumStyleOwned(style.id) || (process.env.NODE_ENV === 'development' && style.price <= 10) ? (
                                <GameButton
                                  size="sm"
                                  variant={selectedStyle === style.id ? "primary" : "outline"}
                                  onClick={() => setSelectedStyle(style.id)}
                                >
                                  {selectedStyle === style.id ? "Выбрано" : "Выбрать"}
                                </GameButton>
                              ) : !loadingOwnership ? (
                                <GameButton
                                  size="sm"
                                  variant={style.super ? "default" : "outline"}
                                  className={style.super ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                                  onClick={() => handleBuyPremium(style, 'style')}
                                >
                                  {style.super ? (
                                    <>
                                      <Gem className="w-3 h-3 mr-1" />
                                      ${style.price}
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="w-3 h-3 mr-1" />
                                      ${style.price}
                                    </>
                                  )}
                                </GameButton>
                              ) : (
                                <div className="text-xs text-muted-foreground">Загрузка...</div>
                              )
                            ) : (
                              <GameButton
                                size="sm"
                                variant={selectedStyle === style.id ? "primary" : "outline"}
                                onClick={() => setSelectedStyle(style.id)}
                              >
                                {selectedStyle === style.id ? "Выбрано" : "Выбрать"}
                              </GameButton>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Рамка аватара</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {FRAMES.map((frame) => (
                        <div
                          key={frame.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedFrame === frame.id ? "border-primary bg-primary/10" : "border-border bg-secondary/50"
                          } ${frame.super ? 'bg-gradient-to-br from-purple-600/10 to-pink-600/10' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full ${frame.style}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-foreground">
                                    {frame.name}
                                  </p>
                                  {frame.premium && <Lock className="w-3 h-3 text-yellow-500" />}
                                  {frame.super && <Star className="w-3 h-3 text-purple-500 animate-pulse" />}
                                </div>
                              </div>
                            </div>
                            {frame.premium ? (
                              isPremiumFrameOwned(frame.id) || (process.env.NODE_ENV === 'development' && frame.price <= 10) ? (
                                <GameButton
                                  size="sm"
                                  variant={selectedFrame === frame.id ? "primary" : "outline"}
                                  onClick={() => setSelectedFrame(frame.id)}
                                >
                                  {selectedFrame === frame.id ? "Выбрано" : "Выбрать"}
                                </GameButton>
                              ) : !loadingOwnership ? (
                                <GameButton
                                  size="sm"
                                  variant={frame.super ? "default" : "outline"}
                                  className={frame.super ? "bg-gradient-to-r from-purple-600 to-pink-600" : ""}
                                  onClick={() => handleBuyPremium(frame, 'frame')}
                                >
                                  {frame.super ? (
                                    <>
                                      <Gem className="w-3 h-3 mr-1" />
                                      ${frame.price}
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="w-3 h-3 mr-1" />
                                      ${frame.price}
                                    </>
                                  )}
                                </GameButton>
                              ) : (
                                <div className="text-xs text-muted-foreground">Загрузка...</div>
                              )
                            ) : (
                              <GameButton
                                size="sm"
                                variant={selectedFrame === frame.id ? "primary" : "outline"}
                                onClick={() => setSelectedFrame(frame.id)}
                              >
                                {selectedFrame === frame.id ? "Выбрано" : "Выбрать"}
                              </GameButton>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <GameButton variant="outline" size="md" className="flex-1" onClick={onClose} disabled={isSaving}>
                Отмена
              </GameButton>
              <GameButton
                variant="primary"
                size="md"
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : "Сохранить"}
              </GameButton>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-primary">Профиль обновлен</h3>
            <p className="text-sm text-muted-foreground text-center">
              Ваши изменения успешно сохранены
            </p>
            <GameButton 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="mt-4"
            >
              Закрыть
            </GameButton>
          </div>
        )}
      </GameCard>
    </div>
  )
}
