"use client"

import { useState, useCallback, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { GameResultModal } from "@/components/games/game-result-modal"
import { GameButton } from "@/components/ui/game-button"
import { cn } from "@/lib/utils"
import { Eraser, Lightbulb, Sparkles } from "lucide-react"

type Cell = {
  value: number | null
  isFixed: boolean
  isError: boolean
  notes: number[]
}

type Board = Cell[][]

// Simple Sudoku generator
function generateSudoku(difficulty: "easy" | "medium" | "hard" = "easy"): Board {
  // Start with a valid solution
  const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ]

  const cellsToRemove = difficulty === "easy" ? 30 : difficulty === "medium" ? 40 : 50
  const board: Board = solution.map((row) =>
    row.map((value) => ({
      value,
      isFixed: true,
      isError: false,
      notes: [],
    })),
  )

  // Remove cells
  let removed = 0
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    if (board[row][col].value !== null) {
      board[row][col] = { value: null, isFixed: false, isError: false, notes: [] }
      removed++
    }
  }

  return board
}

function isValidPlacement(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c].value === num) return false
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col].value === num) return false
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row && c !== col && board[r][c].value === num) return false
    }
  }

  return true
}

function isBoardComplete(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell.value !== null && !cell.isError))
}

export function SudokuGame() {
  const { t } = useI18n()
  const router = useRouter()
  const [board, setBoard] = useState<Board>(() => generateSudoku("easy"))
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [won, setWon] = useState(false)
  const [hints, setHints] = useState(3)

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col].isFixed) return
    setSelectedCell({ row, col })
  }

  const handleNumberInput = useCallback(
    (num: number) => {
      if (!selectedCell || board[selectedCell.row][selectedCell.col].isFixed) return

      const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
      const cell = newBoard[selectedCell.row][selectedCell.col]

      if (num === 0) {
        cell.value = null
        cell.isError = false
      } else {
        cell.value = num
        cell.isError = !isValidPlacement(newBoard, selectedCell.row, selectedCell.col, num)
      }

      setBoard(newBoard)

      if (!cell.isError && isBoardComplete(newBoard)) {
        setWon(true)
      }
    },
    [selectedCell, board],
  )

  const useHint = () => {
    if (hints <= 0 || !selectedCell) return

    const solution = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ]

    const correctValue = solution[selectedCell.row][selectedCell.col]
    handleNumberInput(correctValue)
    setHints((h) => h - 1)
  }

  const resetGame = () => {
    setBoard(generateSudoku("easy"))
    setSelectedCell(null)
    setWon(false)
    setHints(3)
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(Number.parseInt(e.key))
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleNumberInput(0)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNumberInput])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-6 py-8">
      <div className="flex items-center gap-4">
        <GameButton
          variant="outline"
          size="md"
          onClick={useHint}
          disabled={hints <= 0 || !selectedCell}
          className={cn(
            "flex items-center gap-2 border-2 transition-all",
            hints > 0 && selectedCell
              ? "border-amber-400/50 hover:border-amber-400 hover:bg-amber-500/10 hover:scale-105 hover:shadow-lg hover:shadow-amber-400/20"
              : "opacity-40 cursor-not-allowed",
          )}
        >
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span className="font-bold">{hints}</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </GameButton>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />

        <div className="grid grid-cols-9 gap-0 bg-gradient-to-br from-border/80 to-border/40 p-1 rounded-2xl shadow-2xl w-full max-w-lg border-2 border-primary/20">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex
              const isInSameRow = selectedCell?.row === rowIndex
              const isInSameCol = selectedCell?.col === colIndex
              const isInSameBox =
                selectedCell &&
                Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) &&
                Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3)

              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={cn(
                    "aspect-square flex items-center justify-center text-lg font-bold transition-all duration-200",
                    "relative overflow-hidden group",
                    // Base colors
                    cell.isFixed
                      ? "bg-gradient-to-br from-secondary to-secondary/80 text-foreground"
                      : "bg-gradient-to-br from-card to-card/90",
                    // Error state
                    cell.isError && "text-red-400 animate-pulse",
                    // User input
                    !cell.isFixed && !cell.isError && cell.value && "text-cyan-400 font-extrabold",
                    // Selection highlights
                    isSelected &&
                      "bg-gradient-to-br from-primary/40 to-primary/30 shadow-lg shadow-primary/20 scale-105 z-10",
                    (isInSameRow || isInSameCol || isInSameBox) && !isSelected && "bg-primary/10",
                    // Borders for 3x3 boxes
                    colIndex % 3 === 2 && colIndex !== 8 && "border-r-2 border-primary/30",
                    rowIndex % 3 === 2 && rowIndex !== 8 && "border-b-2 border-primary/30",
                    // Hover effect
                    !cell.isFixed && "hover:bg-primary/20 hover:scale-105 cursor-pointer",
                  )}
                >
                  {/* Glow effect for selected cell */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent animate-pulse" />
                  )}

                  <span className="relative z-10">{cell.value}</span>
                </button>
              )
            }),
          )}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 w-full max-w-md px-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className={cn(
              "aspect-square rounded-xl text-2xl font-bold transition-all duration-300",
              "bg-gradient-to-br from-secondary to-secondary/80 border-2 border-border/50",
              "hover:scale-110 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20",
              "active:scale-95",
              "relative overflow-hidden group",
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 text-foreground group-hover:text-primary">{num}</span>
          </button>
        ))}
        <button
          onClick={() => handleNumberInput(0)}
          className={cn(
            "aspect-square rounded-xl transition-all duration-300",
            "bg-gradient-to-br from-destructive/20 to-destructive/10 border-2 border-destructive/30",
            "hover:scale-110 hover:border-destructive/50 hover:shadow-lg hover:shadow-destructive/20",
            "active:scale-95",
            "flex items-center justify-center group",
          )}
        >
          <Eraser className="w-7 h-7 text-destructive group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Result Modal */}
      {won && <GameResultModal result="win" onPlayAgain={resetGame} onExit={() => router.push("/classic")} />}
    </div>
  )
}
