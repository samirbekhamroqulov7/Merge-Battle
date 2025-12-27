"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { GameButton } from "@/components/ui/game-button"
import { GameCard } from "@/components/ui/game-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Lock, Loader2, User, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGuestLoading, setIsGuestLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Success - redirect to home
      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      await window.location.assign(
        "https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=openid%20email%20profile",
      )
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to sign in with Google")
      setIsGoogleLoading(false)
    }
  }

  const handleGuestPlay = async () => {
    setIsGuestLoading(true)
    setError(null)

    try {
      const { error } = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (error) throw error

      localStorage.setItem("brain_battle_guest_mode", "true")
      localStorage.setItem("brain_battle_auto_login", "true")

      router.push("/")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsGuestLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      <div className="p-4">
        <GameButton variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <GameCard variant="elevated" className="p-6">
            <h1 className="text-2xl font-bold text-primary text-center mb-6">{t("auth.login")}</h1>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  {t("auth.email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  {t("auth.password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <GameButton type="submit" variant="primary" size="md" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("auth.login")}
              </GameButton>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">{t("auth.or")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <GameButton
              variant="outline"
              size="md"
              className="w-full mb-3 border-border bg-secondary hover:bg-secondary/80"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading || isGuestLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {t("auth.loginWithGoogle")}
            </GameButton>

            <GameButton
              variant="secondary"
              size="md"
              className="w-full mb-4"
              onClick={handleGuestPlay}
              disabled={isGuestLoading || isLoading || isGoogleLoading}
            >
              {isGuestLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <User className="w-5 h-5 mr-2" />}
              {t("auth.guest")}
            </GameButton>

            <div className="mb-4 p-3 bg-muted/30 rounded border border-border">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Guest mode limitations:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Progress saved only in this browser</li>
                    <li>Cannot play PvP multiplayer</li>
                    <li>Limited access to features</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("auth.noAccount")}{" "}
              <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                {t("auth.signUp")}
              </Link>
            </p>
          </GameCard>
        </div>
      </div>
    </div>
  )
}
