"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { makeMove } from "@/lib/pvp/matchmaking"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { Clock, User, Trophy, ArrowLeft } from "lucide-react"

// Импорт всех игр для PVP
import { TicTacToeGame } from "@/components/games/tic-tac-toe"
import { ChessGame } from "@/components/games/chess"
import { CheckersGame } from "@/components/games/checkers"
import { DotsGame } from "@/components/games/dots"
import { MathDuelGame } from "@/components/games/math-duel"
import { FlagsQuizGame } from "@/components/games/flags-quiz"
import { AnagramsGame } from "@/components/games/anagrams"

interface PvpMatchProps {
  matchId: string
  initialMatch: any
  currentUserId: string
}

export function PvpMatch({ matchId, initialMatch, currentUserId }: PvpMatchProps) {
  const [match, setMatch] = useState(initialMatch)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const { t } = useI18n()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setIsMyTurn(match.current_turn === currentUserId)
  }, [match.current_turn, currentUserId])

  // Real-time обновления матча
  useEffect(() => {
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          setMatch(payload.new)
          if (payload.new.status === "finished") {
            setShowResult(true)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  // Таймер хода
  useEffect(() => {
    if (!isMyTurn || match.status === "finished") return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Время вышло - автоматический ход
          handleTimeout()
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isMyTurn, match.status])

  const handleTimeout = useCallback(async () => {
    // При таймауте - пропуск хода или случайный ход
    try {
      await makeMove(matchId, { timeout: true })
    } catch (error) {
      console.error("Timeout error:", error)
    }
  }, [matchId])

  const handleGameMove = async (move: any) => {
    if (!isMyTurn) return

    try {
      await makeMove(matchId, move)
      setTimeLeft(60)
    } catch (error) {
      console.error("Move error:", error)
    }
  }

  const getPlayerInfo = (playerId: string) => {
    const isPlayer1 = playerId === match.player1_id
    return {
      name: isPlayer1 ? match.player1_name : match.player2_name,
      avatar: isPlayer1 ? match.player1_avatar : match.player2_avatar,
      isCurrentUser: playerId === currentUserId,
    }
  }

  const renderGame = () => {
    const gameProps = {
      gameState: match.game_state,
      onMove: handleGameMove,
      isMyTurn,
      playerId: currentUserId,
      mode: "pvp" as const,
    }

    switch (match.game_type) {
      case "tic-tac-toe":
        return <TicTacToeGame {...gameProps} />
      case "chess":
        return <ChessGame {...gameProps} />
      case "checkers":
        return <CheckersGame {...gameProps} />
      case "dots":
        return <DotsGame {...gameProps} />
      case "math-duel":
        return <MathDuelGame {...gameProps} />
      case "flags-quiz":
        return <FlagsQuizGame {...gameProps} />
      case "anagrams":
        return <AnagramsGame {...gameProps} />
      default:
        return <div className="text-primary">Game not found</div>
    }
  }

  const isWinner = match.winner_id === currentUserId
  const isDraw = match.status === "finished" && !match.winner_id

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/pvp")}
          className="p-2 text-primary/60 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h1 className="text-lg font-bold text-primary uppercase">{match.game_type.replace("-", " ")}</h1>
          <p className="text-sm text-primary/60">
            {match.mode === "normal"
              ? t("pvp.normalMode")
              : match.mode === "triple"
                ? `${t("pvp.tripleMode")} - ${t("pvp.round")} ${match.round}/3`
                : `${t("pvp.fiveMode")} - ${t("pvp.round")} ${match.round}/5`}
          </p>
        </div>

        <div className="w-10" />
      </div>

      {/* Players */}
      <div className="flex items-center justify-between mb-6 px-4">
        <PlayerCard
          player={getPlayerInfo(match.player1_id)}
          score={match.player1_wins}
          isActive={match.current_turn === match.player1_id}
        />

        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-bold text-primary">VS</span>
          {match.status !== "finished" && (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                timeLeft <= 10 ? "bg-red-500/20 text-red-400" : "bg-primary/20 text-primary"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono">{timeLeft}s</span>
            </div>
          )}
        </div>

        <PlayerCard
          player={getPlayerInfo(match.player2_id)}
          score={match.player2_wins}
          isActive={match.current_turn === match.player2_id}
        />
      </div>

      {/* Turn indicator */}
      {match.status !== "finished" && (
        <div
          className={`text-center mb-4 py-2 rounded-lg ${
            isMyTurn ? "bg-green-500/20 text-green-400" : "bg-primary/10 text-primary/60"
          }`}
        >
          {isMyTurn ? t("pvp.yourTurn") : t("pvp.opponentTurn")}
        </div>
      )}

      {/* Game area */}
      <div className="flex-1 flex items-center justify-center">{renderGame()}</div>

      {/* Result modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-card-bg border-2 border-card-border rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-6xl mb-4"
              >
                {isWinner ? "🏆" : isDraw ? "🤝" : "😢"}
              </motion.div>

              <h2
                className={`text-2xl font-bold mb-2 ${
                  isWinner ? "text-yellow-400" : isDraw ? "text-primary" : "text-red-400"
                }`}
              >
                {isWinner ? t("game.victory") : isDraw ? t("game.draw") : t("game.defeat")}
              </h2>

              {isWinner && (
                <div className="flex items-center justify-center gap-2 text-primary/80 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span>+1 {t("pvp.masteryFragment")}</span>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => router.push("/pvp")}
                  className="flex-1 py-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-colors"
                >
                  {t("common.back")}
                </button>
                <button
                  onClick={() => {
                    setShowResult(false)
                    // Rematch logic
                  }}
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-background rounded-xl transition-colors font-semibold"
                >
                  {t("pvp.rematch")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PlayerCard({
  player,
  score,
  isActive,
}: {
  player: { name: string; avatar: string; isCurrentUser: boolean }
  score: number
  isActive: boolean
}) {
  return (
    <motion.div
      animate={{ scale: isActive ? 1.05 : 1 }}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
        isActive ? "bg-primary/20" : "bg-transparent"
      }`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
          player.isCurrentUser ? "bg-primary/30 ring-2 ring-primary" : "bg-card-bg"
        }`}
      >
        {player.avatar ? (
          <img src={player.avatar || "/placeholder.svg"} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <User className="w-6 h-6 text-primary" />
        )}
      </div>
      <span className="text-sm font-medium text-primary truncate max-w-20">
        {player.isCurrentUser ? "Вы" : player.name || "Игрок"}
      </span>
      <span className="text-xs text-primary/60">{score} побед</span>
    </motion.div>
  )
}
