"use client"

import { useState, useCallback, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { GameLayout } from "@/components/games/game-layout"
import { GameResultModal } from "@/components/games/game-result-modal"
import { GameCard } from "@/components/ui/game-card"
import { GameButton } from "@/components/ui/game-button"
import { cn } from "@/lib/utils"
import { RefreshCw, Clock } from "lucide-react"

type Board = (number | null)[]

const SOLVED_BOARD: Board = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null]

function shuffleBoard(): Board {
  const board = [...SOLVED_BOARD]
  // Fisher-Yates shuffle with solvability check
  for (let i = board.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[board[i], board[j]] = [board[j], board[i]]
  }

  // Ensure puzzle is solvable
  if (!isSolvable(board)) {
    // Swap first two non-null tiles
    const nonNullIndices = board.map((v, i) => (v !== null ? i : -1)).filter((i) => i !== -1)
    ;[board[nonNullIndices[0]], board[nonNullIndices[1]]] = [board[nonNullIndices[1]], board[nonNullIndices[0]]]
  }

  return board
}

function isSolvable(board: Board): boolean {
  let inversions = 0
  const flatBoard = board.filter((x) => x !== null) as number[]

  for (let i = 0; i < flatBoard.length; i++) {
    for (let j = i + 1; j < flatBoard.length; j++) {
      if (flatBoard[i] > flatBoard[j]) inversions++
    }
  }

  const emptyRow = Math.floor(board.indexOf(null) / 4)
  return (inversions + emptyRow) % 2 === 1
}

function isSolved(board: Board): boolean {
  return board.every((val, idx) => val === SOLVED_BOARD[idx])
}

export function Puzzle15Game() {
  const { t } = useI18n()
  const router = useRouter()
  const [board, setBoard] = useState<Board>(shuffleBoard)
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [won, setWon] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && !won) {
      interval = setInterval(() => setTime((t) => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, won])

  const getEmptyIndex = useCallback((board: Board) => board.indexOf(null), [])

  const canMove = useCallback((index: number, emptyIndex: number) => {
    const row = Math.floor(index / 4)
    const col = index % 4
    const emptyRow = Math.floor(emptyIndex / 4)
    const emptyCol = emptyIndex % 4

    return (Math.abs(row - emptyRow) === 1 && col === emptyCol) || (Math.abs(col - emptyCol) === 1 && row === emptyRow)
  }, [])

  const handleTileClick = useCallback(
    (index: number) => {
      const emptyIndex = getEmptyIndex(board)
      if (!canMove(index, emptyIndex)) return

      if (!isRunning) setIsRunning(true)

      const newBoard = [...board]
      ;[newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]]
      setBoard(newBoard)
      setMoves((m) => m + 1)

      if (isSolved(newBoard)) {
        setWon(true)
        setIsRunning(false)
      }
    },
    [board, canMove, getEmptyIndex, isRunning],
  )

  const resetGame = () => {
    setBoard(shuffleBoard())
    setMoves(0)
    setTime(0)
    setIsRunning(false)
    setWon(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <GameLayout title={t("games.puzzle15")}>
      {/* Stats */}
      <div className="flex items-center gap-6 mb-6">
        <GameCard className="px-4 py-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-mono text-lg">{formatTime(time)}</span>
        </GameCard>
        <GameCard className="px-4 py-2">
          <span className="font-mono text-lg">{moves} moves</span>
        </GameCard>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-xs aspect-square">
        {board.map((value, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(index)}
            disabled={value === null || won}
            className={cn(
              "aspect-square rounded-lg border-2 transition-all duration-150",
              "flex items-center justify-center text-2xl font-bold",
              value === null
                ? "bg-transparent border-transparent"
                : [
                    "bg-gradient-to-br from-amber-500 to-amber-700 border-amber-600",
                    "text-white shadow-lg",
                    "hover:from-amber-400 hover:to-amber-600",
                    "active:scale-95",
                  ],
            )}
          >
            {value}
          </button>
        ))}
      </div>

      {/* Reset Button */}
      <GameButton variant="secondary" size="md" className="mt-6" onClick={resetGame}>
        <RefreshCw className="w-5 h-5 mr-2" />
        Reset
      </GameButton>

      {/* Result Modal */}
      {won && <GameResultModal result="win" onPlayAgain={resetGame} onExit={() => router.push("/classic")} />}
    </GameLayout>
  )
}
