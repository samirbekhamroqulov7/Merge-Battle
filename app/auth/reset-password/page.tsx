"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { requestPasswordReset, verifyResetCode } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"request" | "verify">("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [devCode, setDevCode] = useState("")

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await requestPasswordReset(email)
      console.log("[v0] Reset code requested:", result)

      if (result.devCode) {
        setDevCode(result.devCode)
      }

      setStep("verify")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await verifyResetCode(email, code, newPassword)
      router.push("/auth/login?reset=success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">
            {step === "request" ? "Enter your email to receive a reset code" : "Enter the code sent to your email"}
          </p>
        </div>

        {step === "request" ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={() => router.push("/auth/login")}>
              Back to Login
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            {devCode && (
              <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded">
                <strong>Dev Mode:</strong> Your code is <strong>{devCode}</strong>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Reset Code
              </label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
                disabled={loading}
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("request")}
              disabled={loading}
            >
              Request New Code
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
