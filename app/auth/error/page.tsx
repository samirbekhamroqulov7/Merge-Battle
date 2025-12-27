"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { GameButton } from "@/components/ui/game-button"
import { GameCard } from "@/components/ui/game-card"
import { AlertTriangle, Home, LogIn } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useI18n()
  
  const message = searchParams.get("message") || t("auth.defaultError")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <GameCard className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-destructive mb-2">
          {t("auth.authenticationError")}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {message === "Failed to create user profile" 
            ? "Не удалось создать профиль пользователя. Попробуйте еще раз или войдите другим способом."
            : message}
        </p>
        
        <div className="space-y-3">
          <GameButton 
            onClick={() => router.push("/auth/login")}
            className="w-full"
          >
            <LogIn className="w-5 h-5 mr-2" />
            {t("auth.tryAgain")}
          </GameButton>
          
          <GameButton 
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full"
          >
            <Home className="w-5 h-5 mr-2" />
            {t("auth.goHome")}
          </GameButton>
        </div>
      </GameCard>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
