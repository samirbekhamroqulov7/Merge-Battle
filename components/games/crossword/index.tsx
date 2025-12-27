"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { GameLayout } from "@/components/games/game-layout"
import { GameResultModal } from "@/components/games/game-result-modal"
import { GameCard } from "@/components/ui/game-card"
import { cn } from "@/lib/utils"

interface Clue {
  number: number
  clue: string
  answer: string
  row: number
  col: number
  direction: "across" | "down"
}

const SAMPLE_CROSSWORD: { grid: (string | null)[][]; clues: Clue[] } = {
  grid: [
    ["C", "A", "T", null, "D"],
    ["A", null, "O", null, "O"],
    ["R", "U", "N", null, "G"],
    [null, null, null, null, null],
    ["S", "U", "N", null, null],
  ],
  clues: [
    { number: 1, clue: "Pet that says meow", answer: "CAT", row: 0, col: 0, direction: "across" },
    { number: 2, clue: "Pet that barks", answer: "DOG", row: 0, col: 4, direction: "down" },
    { number: 3, clue: "Move fast with legs", answer: "RUN", row: 2, col: 0, direction: "across" },
    { number: 4, clue: "Vehicle with wheels", answer: "CAR", row: 0, col: 0, direction: "down" },
    { number: 5, clue: "Star in our sky", answer: "SUN", row: 4, col: 0, direction: "across" },
    { number: 6, clue: "Opposite of from", answer: "TO", row: 0, col: 2, direction: "down" },
  ],
}

export function CrosswordGame() {
  const { t } = useI18n()
  const router = useRouter()
  const [userGrid, setUserGrid] = useState<(string | null)[][]>(
    SAMPLE_CROSSWORD.grid.map((row) => row.map((cell) => (cell ? "" : null))),
  )
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null)
  const [won, setWon] = useState(false)

  const checkWin = useCallback(() => {
    for (let r = 0; r < SAMPLE_CROSSWORD.grid.length; r++) {
      for (let c = 0; c < SAMPLE_CROSSWORD.grid[r].length; c++) {
        const expected = SAMPLE_CROSSWORD.grid[r][c]
        const actual = userGrid[r][c]
        if (expected !== null && actual?.toUpperCase() !== expected) {
          return false
        }
      }
    }
    return true
  }, [userGrid])

  const handleCellClick = (row: number, col: number) => {
    if (SAMPLE_CROSSWORD.grid[row][col] === null) return
    setSelectedCell({ row, col })

    // Find relevant clue
    const clue = SAMPLE_CROSSWORD.clues.find(
      (c) =>
        (c.direction === "across" && c.row === row && col >= c.col && col < c.col + c.answer.length) ||
        (c.direction === "down" && c.col === col && row >= c.row && row < c.row + c.answer.length),
    )
    setSelectedClue(clue || null)
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedCell) return

      const { row, col } = selectedCell
      const key = e.key.toUpperCase()

      if (key.length === 1 && key >= "A" && key <= "Z") {
        const newGrid = userGrid.map((r) => [...r])
        newGrid[row][col] = key
        setUserGrid(newGrid)

        // Move to next cell
        if (selectedClue) {
          if (selectedClue.direction === "across" && col < 4) {
            setSelectedCell({ row, col: col + 1 })
          } else if (selectedClue.direction === "down" && row < 4) {
            setSelectedCell({ row: row + 1, col })
          }
        }

        // Check win after update
        setTimeout(() => {
          const updatedGrid = [...newGrid]
          updatedGrid[row][col] = key
          let isWin = true
          for (let r = 0; r < SAMPLE_CROSSWORD.grid.length; r++) {
            for (let c = 0; c < SAMPLE_CROSSWORD.grid[r].length; c++) {
              const expected = SAMPLE_CROSSWORD.grid[r][c]
              const actual = updatedGrid[r][c]
              if (expected !== null && actual?.toUpperCase() !== expected) {
                isWin = false
                break
              }
            }
            if (!isWin) break
          }
          if (isWin) setWon(true)
        }, 100)
      } else if (e.key === "Backspace") {
        const newGrid = userGrid.map((r) => [...r])
        newGrid[row][col] = ""
        setUserGrid(newGrid)
      }
    },
    [selectedCell, selectedClue, userGrid],
  )

  const resetGame = () => {
    setUserGrid(SAMPLE_CROSSWORD.grid.map((row) => row.map((cell) => (cell ? "" : null))))
    setSelectedCell(null)
    setSelectedClue(null)
    setWon(false)
  }

  const getCellNumber = (row: number, col: number): number | null => {
    const clue = SAMPLE_CROSSWORD.clues.find((c) => c.row === row && c.col === col)
    return clue?.number || null
  }

  return (
    <GameLayout title={t("games.crossword")}>
      {/* Current Clue */}
      {selectedClue && (
        <GameCard className="px-4 py-3 mb-4 max-w-sm">
          <span className="text-primary font-bold">{selectedClue.number}. </span>
          <span>{selectedClue.clue}</span>
        </GameCard>
      )}

      {/* Crossword Grid */}
      <div
        className="grid gap-0.5 bg-border p-0.5 rounded-lg w-full max-w-xs"
        style={{ gridTemplateColumns: `repeat(5, 1fr)` }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {SAMPLE_CROSSWORD.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cellNumber = getCellNumber(rowIndex, colIndex)
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex
            const isInClue =
              selectedClue &&
              ((selectedClue.direction === "across" &&
                selectedClue.row === rowIndex &&
                colIndex >= selectedClue.col &&
                colIndex < selectedClue.col + selectedClue.answer.length) ||
                (selectedClue.direction === "down" &&
                  selectedClue.col === colIndex &&
                  rowIndex >= selectedClue.row &&
                  rowIndex < selectedClue.row + selectedClue.answer.length))

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={cn(
                  "aspect-square relative flex items-center justify-center text-lg font-bold",
                  cell === null ? "bg-background" : "bg-card",
                  isSelected && "bg-primary/30",
                  isInClue && !isSelected && "bg-primary/10",
                )}
                disabled={cell === null}
              >
                {cellNumber && (
                  <span className="absolute top-0.5 left-1 text-[10px] text-muted-foreground">{cellNumber}</span>
                )}
                {userGrid[rowIndex][colIndex]}
              </button>
            )
          }),
        )}
      </div>

      {/* Clues */}
      <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-sm">
        <div>
          <h3 className="font-bold text-primary mb-2">Across</h3>
          {SAMPLE_CROSSWORD.clues
            .filter((c) => c.direction === "across")
            .map((clue) => (
              <button
                key={clue.number}
                onClick={() => {
                  setSelectedClue(clue)
                  setSelectedCell({ row: clue.row, col: clue.col })
                }}
                className={cn(
                  "block text-left text-sm py-1 w-full",
                  selectedClue?.number === clue.number && "text-primary",
                )}
              >
                {clue.number}. {clue.clue}
              </button>
            ))}
        </div>
        <div>
          <h3 className="font-bold text-primary mb-2">Down</h3>
          {SAMPLE_CROSSWORD.clues
            .filter((c) => c.direction === "down")
            .map((clue) => (
              <button
                key={clue.number}
                onClick={() => {
                  setSelectedClue(clue)
                  setSelectedCell({ row: clue.row, col: clue.col })
                }}
                className={cn(
                  "block text-left text-sm py-1 w-full",
                  selectedClue?.number === clue.number && "text-primary",
                )}
              >
                {clue.number}. {clue.clue}
              </button>
            ))}
        </div>
      </div>

      {/* Result Modal */}
      {won && <GameResultModal result="win" onPlayAgain={resetGame} onExit={() => router.push("/classic")} />}
    </GameLayout>
  )
}
