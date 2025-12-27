"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useUser } from "@/lib/hooks/use-user"
import { GameButton } from "@/components/ui/game-button"
import { GameCard } from "@/components/ui/game-card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trophy, Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

const masteryLevels = [
  { level: 1, name: "level1", color: "from-gray-400 to-gray-600" },
  { level: 2, name: "level2", color: "from-green-400 to-green-600" },
  { level: 3, name: "level3", color: "from-blue-400 to-blue-600" },
  { level: 4, name: "level4", color: "from-purple-400 to-purple-600" },
  { level: 5, name: "level5", color: "from-yellow-400 to-yellow-600" },
  { level: 6, name: "level6", color: "from-orange-400 to-orange-600" },
  { level: 7, name: "level7", color: "from-red-400 to-red-600" },
  { level: 8, name: "level8", color: "from-pink-400 to-pink-600" },
  { level: 9, name: "level9", color: "from-indigo-400 to-indigo-600" },
  { level: 10, name: "level10", color: "from-amber-400 to-amber-600" },
]

export function PvpArena() {
  const { t } = useI18n()
  const { mastery, glory, loading } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"mastery" | "glory">("mastery")
  const [searching, setSearching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeTab === "mastery") {
        setActiveTab("glory")
      } else if (diff < 0 && activeTab === "glory") {
        setActiveTab("mastery")
      }
    }
    setTouchStart(null)
  }

  const currentMasteryLevel = masteryLevels[(mastery?.level || 1) - 1]
  const gloryProgress = glory?.wins || 0

  const handleFindMatch = async (mode: "pvp" | "triple" | "fiver") => {
    setSearching(true)
    // TODO: Implement matchmaking
    setTimeout(() => {
      setSearching(false)
      router.push(`/match?mode=${mode}`)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-4">
          <GameButton variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="w-5 h-5" />
          </GameButton>
          <h1 className="text-2xl font-bold text-primary uppercase tracking-wider">{t("pvp.title")}</h1>
        </div>
      </div>

      {/* Tab Indicator */}
      <div className="flex items-center justify-center gap-2 py-4">
        <button
          onClick={() => setActiveTab("mastery")}
          className={`w-2 h-2 rounded-full transition-all ${activeTab === "mastery" ? "w-6 bg-primary" : "bg-muted"}`}
        />
        <button
          onClick={() => setActiveTab("glory")}
          className={`w-2 h-2 rounded-full transition-all ${activeTab === "glory" ? "w-6 bg-primary" : "bg-muted"}`}
        />
      </div>

      {/* Swipeable Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 h-full"
          style={{ transform: `translateX(${activeTab === "mastery" ? "0%" : "-100%"})` }}
        >
          {/* Mastery Tab */}
          <div className="min-w-full px-4 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              {activeTab === "mastery" && <ChevronRight className="w-5 h-5 text-muted-foreground animate-pulse" />}
            </div>

            {/* Mastery Badge */}
            <div className="relative mb-6">
              <div
                className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentMasteryLevel.color} flex items-center justify-center shadow-2xl`}
              >
                <Trophy className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-full border border-border">
                <span className="text-sm font-bold text-primary">
                  {t("pvp.level")} {mastery?.level || 1}
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">
              {t(`mastery.${currentMasteryLevel.name}` as Parameters<typeof t>[0])}
            </h2>

            {/* Progress */}
            <GameCard className="w-full max-w-sm p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{t("pvp.fragments")}</span>
                <span className="text-primary font-bold">
                  {mastery?.fragments || 0}/5 ({t("pvp.level")} {mastery?.mini_level || 1}/3)
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${((mastery?.fragments || 0) / 5) * 100}%` }}
                />
              </div>
            </GameCard>

            {/* Find Match Button */}
            <GameButton
              variant="primary"
              size="lg"
              className="w-full max-w-sm"
              onClick={() => handleFindMatch("pvp")}
              disabled={searching}
            >
              {searching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t("pvp.searching")}
                </>
              ) : (
                t("pvp.findMatch")
              )}
            </GameButton>
          </div>

          {/* Glory Tab */}
          <div className="min-w-full px-4 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              {activeTab === "glory" && <ChevronLeft className="w-5 h-5 text-muted-foreground animate-pulse" />}
            </div>

            {/* Glory Badge */}
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl">
                <Star className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-full border border-border">
                <span className="text-sm font-bold text-primary">
                  {t("pvp.level")} {glory?.level || 1}
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">{t("pvp.glory")}</h2>

            {/* Glory Progress */}
            <GameCard className="w-full max-w-sm p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{t("pvp.wins")}</span>
                <span className="text-primary font-bold">{gloryProgress}/100</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${gloryProgress}%` }}
                />
              </div>
            </GameCard>

            {/* Glory Mode Buttons */}
            <div className="w-full max-w-sm flex flex-col gap-3">
              <GameButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => handleFindMatch("triple")}
                disabled={searching}
              >
                {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : t("pvp.triple")}
              </GameButton>
              <GameButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => handleFindMatch("fiver")}
                disabled={searching}
              >
                {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : t("pvp.fiver")}
              </GameButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
