"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { findMatch, cancelSearch } from "@/lib/pvp/matchmaking"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/i18n/context"
import { Loader2, X, Swords, Users, Trophy } from "lucide-react"

interface MatchmakingScreenProps {
  mode: "normal" | "triple" | "five"
  onClose: () => void
}

export function MatchmakingScreen({ mode, onClose }: MatchmakingScreenProps) {
  const [status, setStatus] = useState<"idle" | "searching" | "found">("idle")
  const [searchTime, setSearchTime] = useState(0)
  const [opponent, setOpponent] = useState<any>(null)
  const [matchId, setMatchId] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useLanguage()
  const supabase = createClient()

  const startSearch = useCallback(async () => {
    setStatus("searching")
    setSearchTime(0)

    try {
      const result = await findMatch(undefined, mode)

      if (result.status === "found" && result.match) {
        setStatus("found")
        setMatchId(result.match.id)

        // Получаем данные соперника
        const opponentId = result.match.player2_id
        const { data: opponentData } = await supabase.from("profiles").select("*").eq("id", opponentId).single()

        setOpponent(opponentData)

        // Переход к матчу через 2 секунды
        setTimeout(() => {
          router.push(`/pvp/match/${result.match.id}`)
        }, 2000)
      }
    } catch (error) {
      console.error("Matchmaking error:", error)
    }
  }, [mode, router, supabase])

  useEffect(() => {
    startSearch()
  }, [startSearch])

  // Таймер поиска
  useEffect(() => {
    if (status !== "searching") return

    const interval = setInterval(() => {
      setSearchTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [status])

  // Real-time подписка на обновления очереди
  useEffect(() => {
    if (status !== "searching") return

    const channel = supabase
      .channel("matchmaking")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
        },
        async (payload) => {
          const match = payload.new as any
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (match.player1_id === user?.id || match.player2_id === user?.id) {
            setStatus("found")
            setMatchId(match.id)

            const opponentId = match.player1_id === user?.id ? match.player2_id : match.player1_id

            const { data: opponentData } = await supabase.from("profiles").select("*").eq("id", opponentId).single()

            setOpponent(opponentData)

            setTimeout(() => {
              router.push(`/pvp/match/${match.id}`)
            }, 2000)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [status, supabase, router])

  const handleCancel = async () => {
    await cancelSearch()
    onClose()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getModeIcon = () => {
    switch (mode) {
      case "normal":
        return <Swords className="w-8 h-8" />
      case "triple":
        return <Users className="w-8 h-8" />
      case "five":
        return <Trophy className="w-8 h-8" />
    }
  }

  const getModeName = () => {
    switch (mode) {
      case "normal":
        return t("pvp.normalMode")
      case "triple":
        return t("pvp.tripleMode")
      case "five":
        return t("pvp.fiveMode")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-card-bg border-2 border-card-border rounded-2xl p-8 max-w-md w-full text-center"
      >
        <AnimatePresence mode="wait">
          {status === "searching" && (
            <motion.div
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-center text-primary">{getModeIcon()}</div>

              <h2 className="text-2xl font-bold text-primary">{getModeName()}</h2>

              <div className="relative w-24 h-24 mx-auto">
                <motion.div
                  className="absolute inset-0 border-4 border-primary/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-lg text-primary/80">{t("pvp.searchingOpponent")}</p>
                <p className="text-3xl font-mono text-primary">{formatTime(searchTime)}</p>
              </div>

              <p className="text-sm text-primary/60">{t("pvp.searchingHint")}</p>

              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
                {t("common.cancel")}
              </button>
            </motion.div>
          )}

          {status === "found" && opponent && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-6xl"
              >
                ⚔️
              </motion.div>

              <h2 className="text-2xl font-bold text-green-400">{t("pvp.opponentFound")}</h2>

              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl mb-2">
                    👤
                  </div>
                  <p className="text-primary font-medium">{t("pvp.you")}</p>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl text-primary"
                >
                  VS
                </motion.div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-2xl mb-2">
                    {opponent.avatar_url ? (
                      <img
                        src={opponent.avatar_url || "/placeholder.svg"}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <p className="text-primary font-medium">{opponent.username || t("pvp.opponent")}</p>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-primary/60"
              >
                {t("pvp.startingSoon")}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
