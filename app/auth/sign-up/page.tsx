"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GameButton } from "@/components/ui/game-button"
import { GameCard } from "@/components/ui/game-card"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n/context"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, Lock, User, ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function SignUpPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  })
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      if (data.success && data.session) {
        localStorage.setItem(
          "brain_battle_session",
          JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          })
        )
        localStorage.setItem("brain_battle_auto_login", "true")
        localStorage.setItem("brain_battle_username", formData.username)

        toast.success("Регистрация успешна! Добро пожаловать!")
        
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1000)
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      toast.error(error.message || "Ошибка регистрации")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <GameCard className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Регистрация успешна!</h1>
          <p className="text-muted-foreground mb-6">Перенаправляем на главную страницу...</p>
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          </div>
        </GameCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-4">
          <GameButton variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="w-5 h-5" />
          </GameButton>
          <h1 className="text-2xl font-bold text-primary uppercase tracking-wider">{t("auth.create_account")}</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <GameCard className="max-w-md w-full p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                {t("auth.username")}
              </label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={t("auth.username_placeholder")}
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t("auth.email")}
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t("auth.password")}
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t("auth.password_placeholder")}
                required
                minLength={6}
              />
            </div>

            <GameButton type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("auth.creating_account")}
                </>
              ) : (
                t("auth.create_account")
              )}
            </GameButton>

            <div className="text-center text-sm text-muted-foreground">
              {t("auth.already_have_account")}{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                {t("auth.login_here")}
              </Link>
            </div>
          </form>
        </GameCard>
      </div>
    </div>
  )
}