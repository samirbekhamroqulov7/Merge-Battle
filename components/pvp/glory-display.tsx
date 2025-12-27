"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { createClient } from "@/lib/supabase/client"
import { Sparkles, Star, Flame, Crown, Shield, Sword, Target, Award, Gem } from "lucide-react"

// 10 уровней славы с разными рангами
const GLORY_LEVELS = [
  { name: "Бронза I", icon: Shield, color: "#CD7F32", winsNeeded: 0 },
  { name: "Бронза II", icon: Shield, color: "#CD7F32", winsNeeded: 100 },
  { name: "Серебро I", icon: Sword, color: "#C0C0C0", winsNeeded: 200 },
  { name: "Серебро II", icon: Sword, color: "#C0C0C0", winsNeeded: 300 },
  { name: "Золото I", icon: Star, color: "#FFD700", winsNeeded: 400 },
  { name: "Золото II", icon: Star, color: "#FFD700", winsNeeded: 500 },
  { name: "Платина", icon: Gem, color: "#E5E4E2", winsNeeded: 600 },
  { name: "Алмаз", icon: Sparkles, color: "#B9F2FF", winsNeeded: 700 },
  { name: "Чемпион", icon: Award, color: "#FF4500", winsNeeded: 800 },
  { name: "Легенда", icon: Crown, color: "#FF1493", winsNeeded: 900 },
]

interface GloryDisplayProps {
  userId?: string
  showAnimation?: boolean
}

export function GloryDisplay({ userId, showAnimation = true }: GloryDisplayProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      let targetUserId = userId

      if (!targetUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        targetUserId = user?.id
      }

      if (!targetUserId) {
        setLoading(false)
        return
      }

      const { data } = await supabase.from("player_stats").select("*").eq("user_id", targetUserId).single()

      if (data) {
        setStats(data)
      } else {
        setStats({
          glory_level: 1,
          glory_wins: 0,
        })
      }
      setLoading(false)
    }

    loadStats()
  }, [userId, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const currentLevel = GLORY_LEVELS[Math.min(stats.glory_level - 1, 9)]
  const nextLevel = stats.glory_level < 10 ? GLORY_LEVELS[stats.glory_level] : null
  const LevelIcon = currentLevel.icon

  const winsInLevel = stats.glory_wins - currentLevel.winsNeeded
  const winsToNext = nextLevel ? nextLevel.winsNeeded - currentLevel.winsNeeded : 100
  const progress = Math.min((winsInLevel / winsToNext) * 100, 100)

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={showAnimation ? { scale: 0.9, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 p-6"
        style={{ borderColor: currentLevel.color }}
      >
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: currentLevel.color }}
              initial={{
                x: Math.random() * 400,
                y: Math.random() * 300,
                opacity: 0.3,
              }}
              animate={{
                y: [null, Math.random() * -100],
                opacity: [0.3, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Glory emblem */}
        <div className="relative flex flex-col items-center mb-6">
          <motion.div
            animate={
              showAnimation
                ? {
                    boxShadow: [
                      `0 0 20px ${currentLevel.color}40`,
                      `0 0 40px ${currentLevel.color}60`,
                      `0 0 20px ${currentLevel.color}40`,
                    ],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="relative w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(from 0deg, ${currentLevel.color}, ${currentLevel.color}80, ${currentLevel.color})`,
            }}
          >
            <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
              <LevelIcon className="w-14 h-14" style={{ color: currentLevel.color }} />
            </div>
          </motion.div>

          <h2
            className="text-2xl font-bold mt-4 tracking-wide"
            style={{ color: currentLevel.color, textShadow: `0 0 20px ${currentLevel.color}60` }}
          >
            {currentLevel.name}
          </h2>

          <p className="text-sm text-primary/60 mt-1">{t("pvp.gloryRank")}</p>
        </div>

        {/* Progress bar */}
        <div className="relative mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-primary/60">{t("pvp.progress")}</span>
            <span style={{ color: currentLevel.color }}>
              {winsInLevel} / {winsToNext}
            </span>
          </div>

          <div className="h-4 bg-primary/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full relative"
              style={{
                background: `linear-gradient(90deg, ${currentLevel.color}80, ${currentLevel.color})`,
              }}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Glory stats */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-xl text-center"
            style={{ backgroundColor: `${currentLevel.color}15`, borderColor: `${currentLevel.color}30` }}
          >
            <Flame className="w-6 h-6 mx-auto mb-2" style={{ color: currentLevel.color }} />
            <p className="text-2xl font-bold" style={{ color: currentLevel.color }}>
              {stats.glory_wins}
            </p>
            <p className="text-xs text-primary/60">{t("pvp.totalGloryWins")}</p>
          </div>

          <div
            className="p-4 rounded-xl text-center"
            style={{ backgroundColor: `${currentLevel.color}15`, borderColor: `${currentLevel.color}30` }}
          >
            <Target className="w-6 h-6 mx-auto mb-2" style={{ color: currentLevel.color }} />
            <p className="text-2xl font-bold" style={{ color: currentLevel.color }}>
              {stats.glory_level}
            </p>
            <p className="text-xs text-primary/60">{t("pvp.currentRank")}</p>
          </div>
        </div>

        {/* Next rank preview */}
        {nextLevel && (
          <motion.div
            initial={showAnimation ? { y: 10, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {(() => {
                const NextIcon = nextLevel.icon
                return <NextIcon className="w-5 h-5" style={{ color: nextLevel.color }} />
              })()}
              <span className="text-sm" style={{ color: nextLevel.color }}>
                {nextLevel.name}
              </span>
            </div>
            <span className="text-sm text-primary/60">
              {nextLevel.winsNeeded - stats.glory_wins} {t("pvp.winsLeft")}
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
