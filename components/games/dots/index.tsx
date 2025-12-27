"use client"

import { useState, useCallback } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { GameLayout } from "@/components/games/game-layout"
import { GameResultModal } from "@/components/games/game-result-modal"
import { GameCard } from "@/components/ui/game-card"
import { cn } from "@/lib/utils"

type Player = "red" | "blue"
type Line = { row: number; col: number; direction: "h" | "v"; player: Player }
type Box = { row: number; col: number; owner: Player }

const GRID_SIZE = 4

function createEmptyLines(): Line[] {
  return []
}

function getLineKey(row: number, col: number, direction: "h" | "v"): string {
  return `${row}-${col}-${direction}`
}

export function DotsGame() {
  const { t } = useI18n()
  const router = useRouter()
  const [lines, setLines] = useState<Line[]>(createEmptyLines)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player>("red")
  const [gameResult, setGameResult] = useState<"win" | "lose" | "draw" | null>(null)
  const [scores, setScores] = useState({ red: 0, blue: 0 })

  const isLineDrawn = useCallback(
    (row: number, col: number, direction: "h" | "v") => {
      return lines.some((l) => l.row === row && l.col === col && l.direction === direction)
    },
    [lines],
  )

  const checkForBox = useCallback(
    (newLines: Line[], row: number, col: number): Player | null => {
      const hasTop = newLines.some((l) => l.row === row && l.col === col && l.direction === "h")
      const hasBottom = newLines.some((l) => l.row === row + 1 && l.col === col && l.direction === "h")
      const hasLeft = newLines.some((l) => l.row === row && l.col === col && l.direction === "v")
      const hasRight = newLines.some((l) => l.row === row && l.col === col + 1 && l.direction === "v")

      if (hasTop && hasBottom && hasLeft && hasRight) {
        return currentPlayer
      }
      return null
    },
    [currentPlayer],
  )

  const makeAIMove = useCallback((currentLines: Line[], currentBoxes: Box[]): Line | null => {
    // Find all available moves
    const availableMoves: { row: number; col: number; direction: "h" | "v" }[] = []

    // Horizontal lines
    for (let row = 0; row <= GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!currentLines.some((l) => l.row === row && l.col === col && l.direction === "h")) {
          availableMoves.push({ row, col, direction: "h" })
        }
      }
    }

    // Vertical lines
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col <= GRID_SIZE; col++) {
        if (!currentLines.some((l) => l.row === row && l.col === col && l.direction === "v")) {
          availableMoves.push({ row, col, direction: "v" })
        }
      }
    }

    if (availableMoves.length === 0) return null

    // Simple AI: random move
    const move = availableMoves[Math.floor(Math.random() * availableMoves.length)]
    return { ...move, player: "blue" }
  }, [])

  const handleLineClick = useCallback(
    (row: number, col: number, direction: "h" | "v") => {
      if (isLineDrawn(row, col, direction) || gameResult || currentPlayer !== "red") return

      const newLine: Line = { row, col, direction, player: "red" }
      const newLines = [...lines, newLine]
      setLines(newLines)

      // Check for completed boxes
      let boxesCompleted = 0
      const newBoxes = [...boxes]

      if (direction === "h") {
        // Check box above
        if (row > 0) {
          const owner = checkForBox(newLines, row - 1, col)
          if (owner && !boxes.some((b) => b.row === row - 1 && b.col === col)) {
            newBoxes.push({ row: row - 1, col, owner })
            boxesCompleted++
          }
        }
        // Check box below
        if (row < GRID_SIZE) {
          const owner = checkForBox(newLines, row, col)
          if (owner && !boxes.some((b) => b.row === row && b.col === col)) {
            newBoxes.push({ row, col, owner })
            boxesCompleted++
          }
        }
      } else {
        // Check box left
        if (col > 0) {
          const owner = checkForBox(newLines, row, col - 1)
          if (owner && !boxes.some((b) => b.row === row && b.col === col - 1)) {
            newBoxes.push({ row, col: col - 1, owner })
            boxesCompleted++
          }
        }
        // Check box right
        if (col < GRID_SIZE) {
          const owner = checkForBox(newLines, row, col)
          if (owner && !boxes.some((b) => b.row === row && b.col === col)) {
            newBoxes.push({ row, col, owner })
            boxesCompleted++
          }
        }
      }

      setBoxes(newBoxes)
      if (boxesCompleted > 0) {
        setScores((s) => ({ ...s, red: s.red + boxesCompleted }))
      }

      // Check game end
      const totalBoxes = GRID_SIZE * GRID_SIZE
      if (newBoxes.length === totalBoxes) {
        const redScore = newBoxes.filter((b) => b.owner === "red").length
        const blueScore = newBoxes.filter((b) => b.owner === "blue").length
        if (redScore > blueScore) setGameResult("win")
        else if (blueScore > redScore) setGameResult("lose")
        else setGameResult("draw")
        return
      }

      // If no box completed, switch player
      if (boxesCompleted === 0) {
        setCurrentPlayer("blue")

        // AI turn
        setTimeout(() => {
          const aiMove = makeAIMove(newLines, newBoxes)
          if (aiMove) {
            const aiLines = [...newLines, aiMove]
            setLines(aiLines)

            let aiBoxes = 0
            const finalBoxes = [...newBoxes]

            // Check for AI completed boxes (simplified)
            if (aiMove.direction === "h") {
              if (aiMove.row > 0) {
                const hasTop = aiLines.some(
                  (l) => l.row === aiMove.row - 1 && l.col === aiMove.col && l.direction === "h",
                )
                const hasBottom = aiLines.some(
                  (l) => l.row === aiMove.row && l.col === aiMove.col && l.direction === "h",
                )
                const hasLeft = aiLines.some(
                  (l) => l.row === aiMove.row - 1 && l.col === aiMove.col && l.direction === "v",
                )
                const hasRight = aiLines.some(
                  (l) => l.row === aiMove.row - 1 && l.col === aiMove.col + 1 && l.direction === "v",
                )
                if (
                  hasTop &&
                  hasBottom &&
                  hasLeft &&
                  hasRight &&
                  !finalBoxes.some((b) => b.row === aiMove.row - 1 && b.col === aiMove.col)
                ) {
                  finalBoxes.push({ row: aiMove.row - 1, col: aiMove.col, owner: "blue" })
                  aiBoxes++
                }
              }
            }

            setBoxes(finalBoxes)
            if (aiBoxes > 0) {
              setScores((s) => ({ ...s, blue: s.blue + aiBoxes }))
            }

            setCurrentPlayer("red")
          }
        }, 500)
      }
    },
    [lines, boxes, currentPlayer, gameResult, isLineDrawn, checkForBox, makeAIMove],
  )

  const resetGame = () => {
    setLines(createEmptyLines())
    setBoxes([])
    setCurrentPlayer("red")
    setGameResult(null)
    setScores({ red: 0, blue: 0 })
  }

  return (
    <GameLayout title={t("games.dots")}>
      {/* Turn Indicator */}
      <GameCard className="px-6 py-3 mb-4">
        <span className="text-lg font-semibold">
          {currentPlayer === "red" ? t("game.yourTurn") : t("game.opponentTurn")}
        </span>
      </GameCard>

      {/* Score */}
      <div className="flex items-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="font-bold">{scores.red}</span>
        </div>
        <span className="text-muted-foreground">VS</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="font-bold">{scores.blue}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative w-full max-w-xs aspect-square">
        {/* Dots */}
        {Array.from({ length: GRID_SIZE + 1 }).map((_, row) =>
          Array.from({ length: GRID_SIZE + 1 }).map((_, col) => (
            <div
              key={`dot-${row}-${col}`}
              className="absolute w-4 h-4 rounded-full bg-foreground"
              style={{
                left: `${(col / GRID_SIZE) * 100}%`,
                top: `${(row / GRID_SIZE) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )),
        )}

        {/* Horizontal Lines */}
        {Array.from({ length: GRID_SIZE + 1 }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const drawn = lines.find((l) => l.row === row && l.col === col && l.direction === "h")
            return (
              <button
                key={`h-${row}-${col}`}
                onClick={() => handleLineClick(row, col, "h")}
                className={cn(
                  "absolute h-2 rounded-full transition-colors",
                  drawn ? (drawn.player === "red" ? "bg-red-500" : "bg-blue-500") : "bg-secondary hover:bg-primary/50",
                )}
                style={{
                  left: `${(col / GRID_SIZE) * 100}%`,
                  top: `${(row / GRID_SIZE) * 100}%`,
                  width: `${(1 / GRID_SIZE) * 100}%`,
                  transform: "translateY(-50%)",
                }}
                disabled={!!drawn || currentPlayer !== "red"}
              />
            )
          }),
        )}

        {/* Vertical Lines */}
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE + 1 }).map((_, col) => {
            const drawn = lines.find((l) => l.row === row && l.col === col && l.direction === "v")
            return (
              <button
                key={`v-${row}-${col}`}
                onClick={() => handleLineClick(row, col, "v")}
                className={cn(
                  "absolute w-2 rounded-full transition-colors",
                  drawn ? (drawn.player === "red" ? "bg-red-500" : "bg-blue-500") : "bg-secondary hover:bg-primary/50",
                )}
                style={{
                  left: `${(col / GRID_SIZE) * 100}%`,
                  top: `${(row / GRID_SIZE) * 100}%`,
                  height: `${(1 / GRID_SIZE) * 100}%`,
                  transform: "translateX(-50%)",
                }}
                disabled={!!drawn || currentPlayer !== "red"}
              />
            )
          }),
        )}

        {/* Filled Boxes */}
        {boxes.map((box) => (
          <div
            key={`box-${box.row}-${box.col}`}
            className={cn("absolute rounded opacity-50", box.owner === "red" ? "bg-red-500" : "bg-blue-500")}
            style={{
              left: `${(box.col / GRID_SIZE) * 100}%`,
              top: `${(box.row / GRID_SIZE) * 100}%`,
              width: `${(1 / GRID_SIZE) * 100}%`,
              height: `${(1 / GRID_SIZE) * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Result Modal */}
      {gameResult && (
        <GameResultModal result={gameResult} onPlayAgain={resetGame} onExit={() => router.push("/classic")} />
      )}
    </GameLayout>
  )
}
