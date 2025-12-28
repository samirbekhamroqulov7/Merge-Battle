"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { GameButton } from "@/components/ui/game-button"
import { GameCard } from "@/components/ui/game-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"

export default function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const email = searchParams.get("email") || ""

  useEffect(() => {
    if (!email) {
      router.push("/auth/sign-up")
    }
  }, [email, router])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }

    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Введите все 6 цифр кода")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: fullCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Verification failed")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 2000)
    } catch (error: unknown) {
      console.error("[v0] Verification error:", error)
      setError(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code")
      }

      alert("Новый код отправлен на ваш email")
    } catch (error) {
      console.error("Resend error:", error)
      alert("Не удалось отправить код")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      <div className="p-4">
        <GameButton variant="ghost" size="sm" onClick={() => router.push("/auth/sign-up")}>
          <ArrowLeft className="w-5 h-5" />
        </GameButton>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <GameCard variant="elevated" className="p-6">
            {!success ? (
              <>
                <h1 className="text-2xl font-bold text-primary text-center mb-2">
                  Подтверждение email
                </h1>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Мы отправили 6-значный код на{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="space-y-3">
                    <Label className="text-foreground text-center block">
                      Введите код подтверждения
                    </Label>
                    <div className="flex gap-2 justify-center">
                      {code.map((digit, index) => (
                        <Input
                          key={index}
                          id={`code-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-12 text-center text-xl font-bold bg-secondary border-border"
                          required
                        />
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <GameButton type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Проверка...
                      </>
                    ) : (
                      "Подтвердить"
                    )}
                  </GameButton>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={resendCode}
                    className="text-sm text-primary hover:underline"
                  >
                    Не получили код? Отправить еще раз
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-primary mb-2">Email подтвержден!</h2>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Ваш аккаунт активирован. Перенаправляем в игру...
                </p>
              </div>
            )}
          </GameCard>
        </div>
      </div>
    </div>
  )
}