"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { makeMove } from "@/lib/pvp/matchmaking"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { Clock, User, Trophy, ArrowLeft } from "lucide-react"

// Импорт игровых компонентов (оставлен без изменений — дизайн сохранён)
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
  }, [match?.current_turn, currentUserId])

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
      try {
        // безопасный cleanup для разных версий supabase-js
        // @ts-ignore
        if (typeof supabase.removeChannel === "function") {
          // @ts-ignore
          supabase.removeChannel(channel)
        } else if (channel && typeof channel.unsubscribe === "function") {
          // @ts-ignore
          channel.unsubscribe()
        }
      } catch (e) {
        // ignore
      }
    }
  }, [matchId, supabase])

  // Таймер хода
  useEffect(() => {
    if (!isMyTurn || match.status === "finished") return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout()
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isMyTurn, match?.status])

  const handleTimeout = useCallback(async () => {
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
    if (!match) return null
    if (playerId === match.player1_id) return { slot: 1, id: playerId }
    if (playerId === match.player2_id) return { slot: 2, id: playerId }
    return null
  }

  const renderGame = () => {
    const gameType = match.game_type
    const gameProps = {
      gameState: match.game_state,
      onMove: handleGameMove,
      currentUserId,
    }

    switch (gameType) {
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
        return <div>Unknown game type: {gameType}</div>
    }
  }

  return (
    <div className="pvp-match-container">
      <div className="match-header">
        <button onClick={() => router.back()}>
          <ArrowLeft />
        </button>

        <div className="match-info">
          <div className="players">
            <div>{getPlayerInfo(match.player1_id)?.id || "Player 1"}</div>
            <div>{getPlayerInfo(match.player2_id)?.id || "Player 2"}</div>
          </div>
        </div>

        <div className="match-timer">
          <Clock />
          <span>{timeLeft}s</span>
        </div>
      </div>

      <div className="match-body">{renderGame()}</div>

      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="match-result">
              {match.winner_id ? <Trophy /> : <div>Draw</div>}
              <div>{match.winner_id ? `${match.winner_id} wins` : "Draw"}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}