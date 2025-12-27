"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { createClient } from "@/lib/supabase/client"
import { Star, Trophy, Zap, Crown, Shield, Sword, Flame, Diamond, Award, Medal } from "lucide-react"

// 10 уровней мастерства с уникальными иконками и цветами
const MASTERY_LEVELS = [
  { name: "Новичок", icon: Shield, color: "#8B7355", bgColor: "from-amber-900/30 to-amber-800/20" },
  { name: "Ученик", icon: Sword, color: "#A0A0A0", bgColor: "from-gray-600/30 to-gray-500/20" },
  { name: "Воин", icon: Zap, color: "#CD7F32", bgColor: "from-orange-700/30 to-orange-600/20" },
  { name: "Ветеран", icon: Star, color: "#C0C0C0", bgColor: "from-slate-400/30 to-slate-300/20" },
  { name: "Элита", icon: Flame, color: "#FFD700", bgColor: "from-yellow-500/30 to-yellow-400/20" },
  { name: "Мастер", icon: Award, color: "#00CED1", bgColor: "from-cyan-500/30 to-cyan-400/20" },
  { name: "Гроссмейстер", icon: Diamond, color: "#9370DB", bgColor: "from-purple-500/30 to-purple-400/20" },
  { name: "Чемпион", icon: Crown, color: "#FF4500", bgColor: "from-red-500/30 to-red-400/20" },
  { name: "Легенда", icon: Medal, color: "#FF1493", bgColor: "from-pink-500/30 to-pink-400/20" },
  { name: "Бессмертный", icon: Trophy, color: "#00FF00", bgColor: "from-emerald-400/30 to-emerald-300/20" },
]

interface MasteryDisplayProps {
  userId?: string
  showAnimation?: boolean
}

export function MasteryDisplay({ userId, showAnimation = true }: MasteryDisplayProps) {
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
        // Создаем начальную статистику
        setStats({
          mastery_level: 1,
          mastery_stage: 1,
          mastery_fragments: 0,
          total_wins: 0,
          total_losses: 0,
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

  const currentLevel = MASTERY_LEVELS[Math.min(stats.mastery_level - 1, 9)]
  const LevelIcon = currentLevel.icon
  const fragmentsNeeded = 5
  const stagesNeeded = 3

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main mastery card */}
      <motion.div
        initial={showAnimation ? { scale: 0.9, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentLevel.bgColor} border-2 p-6`}
        style={{ borderColor: currentLevel.color }}
      >
        {/* Background glow effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${currentLevel.color}, transparent 70%)`,
          }}
        />

        {/* Level icon */}
        <div className="relative flex flex-col items-center mb-6">
          <motion.div
            animate={showAnimation ? { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="relative"
          >
            {/* Outer ring */}
            <div
              className="absolute -inset-4 rounded-full opacity-30 blur-md"
              style={{ backgroundColor: currentLevel.color }}
            />

            {/* Icon container */}
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentLevel.color}40, ${currentLevel.color}20)`,
                boxShadow: `0 0 30px ${currentLevel.color}40`,
              }}
            >
              <LevelIcon className="w-12 h-12" style={{ color: currentLevel.color }} />
            </div>

            {/* Level badge */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: currentLevel.color,
                color: "#1a1a2e",
              }}
            >
              LVL {stats.mastery_level}
            </div>
          </motion.div>

          {/* Level name */}
          <h2
            className="text-2xl font-bold mt-6 tracking-wide"
            style={{ color: currentLevel.color, textShadow: `0 0 20px ${currentLevel.color}60` }}
          >
            {currentLevel.name}
          </h2>
        </div>

        {/* Stage progress */}
        <div className="relative mb-4">
          <p className="text-center text-sm text-primary/60 mb-2">
            {t("pvp.stage")} {stats.mastery_stage} / {stagesNeeded}
          </p>

          <div className="flex justify-center gap-2">
            {Array.from({ length: stagesNeeded }).map((_, i) => (
              <motion.div
                key={i}
                initial={showAnimation ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  i < stats.mastery_stage ? "bg-primary/30" : "bg-primary/10"
                }`}
                style={{
                  borderColor: i < stats.mastery_stage ? currentLevel.color : "transparent",
                  borderWidth: 2,
                }}
              >
                {i < stats.mastery_stage && <Star className="w-4 h-4" style={{ color: currentLevel.color }} />}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fragments progress */}
        <div className="relative">
          <p className="text-center text-sm text-primary/60 mb-2">
            {t("pvp.fragments")}: {stats.mastery_fragments} / {fragmentsNeeded}
          </p>

          <div className="flex justify-center gap-1">
            {Array.from({ length: fragmentsNeeded }).map((_, i) => (
              <motion.div
                key={i}
                initial={showAnimation ? { y: 20, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="relative"
              >
                <div
                  className={`w-10 h-12 rounded-lg transition-all duration-300 ${
                    i < stats.mastery_fragments ? "scale-100" : "scale-90 opacity-40"
                  }`}
                  style={{
                    background:
                      i < stats.mastery_fragments
                        ? `linear-gradient(135deg, ${currentLevel.color}, ${currentLevel.color}80)`
                        : "rgba(255,255,255,0.1)",
                    boxShadow: i < stats.mastery_fragments ? `0 4px 15px ${currentLevel.color}40` : "none",
                  }}
                >
                  {/* Crystal shape */}
                  <svg viewBox="0 0 40 48" className="w-full h-full">
                    <polygon
                      points="20,4 36,16 36,36 20,44 4,36 4,16"
                      fill={i < stats.mastery_fragments ? currentLevel.color : "rgba(255,255,255,0.2)"}
                      stroke={i < stats.mastery_fragments ? currentLevel.color : "rgba(255,255,255,0.3)"}
                      strokeWidth="1"
                    />
                    <polygon
                      points="20,4 36,16 20,24 4,16"
                      fill={i < stats.mastery_fragments ? `${currentLevel.color}cc` : "rgba(255,255,255,0.15)"}
                    />
                  </svg>
                </div>

                {i < stats.mastery_fragments && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                    className="absolute inset-0 rounded-lg"
                    style={{ boxShadow: `0 0 15px ${currentLevel.color}60` }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats summary */}
        <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-primary/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{stats.total_wins}</p>
            <p className="text-xs text-primary/60">{t("pvp.wins")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{stats.total_losses}</p>
            <p className="text-xs text-primary/60">{t("pvp.losses")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {stats.total_wins + stats.total_losses > 0
                ? Math.round((stats.total_wins / (stats.total_wins + stats.total_losses)) * 100)
                : 0}
              %
            </p>
            <p className="text-xs text-primary/60">{t("pvp.winrate")}</p>
          </div>
        </div>
      </motion.div>

      {/* Next level preview */}
      {stats.mastery_level < 10 && (
        <motion.div
          initial={showAnimation ? { y: 20, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {(() => {
              const NextIcon = MASTERY_LEVELS[stats.mastery_level].icon
              return <NextIcon className="w-6 h-6" style={{ color: MASTERY_LEVELS[stats.mastery_level].color }} />
            })()}
            <div>
              <p className="text-sm text-primary/60">{t("pvp.nextLevel")}</p>
              <p className="font-semibold" style={{ color: MASTERY_LEVELS[stats.mastery_level].color }}>
                {MASTERY_LEVELS[stats.mastery_level].name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-primary/60">{t("pvp.winsNeeded")}</p>
            <p className="font-bold text-primary">
              {(stagesNeeded - stats.mastery_stage) * fragmentsNeeded + (fragmentsNeeded - stats.mastery_fragments)}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
