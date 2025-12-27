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
import { Loader2, Mail, Lock, ArrowLeft, AlertCircle, CheckCircle, KeyRound } from "lucide-react"

export default function ResetPasswordPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [step, setStep] = useState<"request" | "verify">("request")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [devCode, setDevCode] = useState<string | null>(null)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset code")
      }

      setSuccess(data.message)
      setStep("verify")

      // In development, show the code
      if (data.code) {
        setDevCode(data.code)
      }
    } catch (error: unknown) {
      console.error("[v0] Reset request error:", error)
      setError(error instanceof Error ? error.message : "Failed to send reset code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/auth/reset-password/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, email, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      setSuccess("Password reset successfully! Redirecting to login...")

      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: unknown) {
      console.error("[v0] Reset verify error:", error)
      setError(error instanceof Error ? error.message : "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      <div className="p-4">
        <GameButton variant="ghost" size="sm" onClick={() => router.push("/auth/login")}>
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <GameCard variant="elevated" className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                {step === "request" ? "Reset Password" : "Enter Reset Code"}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {step === "request"
                  ? "Enter your email to receive a reset code"
                  : "Check your email for the 6-digit code"}
              </p>
            </div>

            {step === "request" ? (
              <form onSubmit={handleRequestReset} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
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

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-green-500">{success}</p>
                  </div>
                )}

                <GameButton type="submit" variant="primary" size="md" className="w-full mt-2" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Code"}
                </GameButton>

                <div className="text-center">
                  <Link href="/auth/login" className="text-sm text-primary hover:underline">
                    Back to login
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyReset} className="flex flex-col gap-4">
                {devCode && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 font-mono">
                      Dev code: <strong>{devCode}</strong>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-foreground">
                    Reset Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="pl-10 bg-secondary border-border"
                      required
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 bg-secondary border-border"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-green-500">{success}</p>
                  </div>
                )}

                <GameButton type="submit" variant="primary" size="md" className="w-full mt-2" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                </GameButton>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("request")}
                    className="text-sm text-primary hover:underline"
                  >
                    Request new code
                  </button>
                </div>
              </form>
            )}
          </GameCard>
        </div>
      </div>
    </div>
  )
}
