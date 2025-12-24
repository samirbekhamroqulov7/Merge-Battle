"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { GameButton } from "@/components/ui/game-button"
import { GameCard } from "@/components/ui/game-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Lock, Loader2, User, AlertCircle, Chrome } from "lucide-react"
import Link from "next/link"
import { signInWithEmail, signInAsGuest, signInWithGoogle } from "@/lib/supabase/client"

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

    console.log("[v0] Login attempt for email:", email)

    try {
      await signInWithEmail(email, password)

      console.log("[v0] Login successful, redirecting...")
      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      console.error("[v0] Login error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Google sign-in failed"
      console.error("[v0] Google login error:", errorMessage)
      setError(errorMessage)
      setIsGoogleLoading(false)
    }
  }

  const handleGuestPlay = async () => {
    setIsGuestLoading(true)
    setError(null)

    console.log("[v0] Creating guest account...")

    try {
      await signInAsGuest()

      console.log("[v0] Guest account created successfully")

      localStorage.setItem("brain_battle_guest_mode", "true")
      localStorage.setItem("brain_battle_auto_login", "true")

      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      console.error("[v0] Guest error:", errorMessage)
      setError(errorMessage)
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <GameButton
              variant="secondary"
              size="md"
              className="w-full mb-4"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading || isGuestLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Chrome className="w-5 h-5 mr-2" />
              )}
              Continue with Google
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
