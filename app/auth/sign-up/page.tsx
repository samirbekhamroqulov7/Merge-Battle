"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GameButton } from "@/components/ui/game-button"
import { GameCard } from "@/components/ui/game-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n/context"
import { Loader2, Mail, Lock, User, ArrowLeft, AlertCircle, Chrome } from "lucide-react"
import { signUpWithEmail, signInWithGoogle } from "@/lib/supabase/client"

export default function SignUpPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log("[v0] Sign up attempt:", {
      email: formData.email,
      username: formData.username,
      passwordLength: formData.password.length,
    })

    try {
      await signUpWithEmail(formData.email, formData.password, formData.username)

      console.log("[v0] Registration successful, redirecting to home...")
      router.push("/")
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      console.error("[v0] Registration error:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Google sign-up failed"
      console.error("[v0] Google sign-up error:", errorMessage)
      setError(errorMessage)
      setIsGoogleLoading(false)
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
            <h1 className="text-2xl font-bold text-primary text-center mb-6">{t("auth.create_account")}</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  {t("auth.username")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder={t("auth.username_placeholder")}
                    className="pl-10 bg-secondary border-border"
                    required
                    minLength={3}
                    maxLength={20}
                  />
                </div>
                <p className="text-xs text-muted-foreground">3-20 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  {t("auth.email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
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
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t("auth.password_placeholder")}
                    className="pl-10 bg-secondary border-border"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <GameButton type="submit" variant="primary" size="md" className="w-full mt-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("auth.creating_account")}
                  </>
                ) : (
                  t("auth.create_account")
                )}
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
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading || loading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Chrome className="w-5 h-5 mr-2" />
              )}
              Continue with Google
            </GameButton>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("auth.already_have_account")}{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                {t("auth.login_here")}
              </Link>
            </p>
          </GameCard>
        </div>
      </div>
    </div>
  )
}
