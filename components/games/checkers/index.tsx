"use client"

import { useState, useCallback } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { GameLayout } from "@/components/games/game-layout"
import { GameResultModal } from "@/components/games/game-result-modal"
import { GameCard } from "@/components/ui/game-card"
import { cn } from "@/lib/utils"

type PieceType = "normal" | "king"
type PieceColor = "red" | "black"
type Piece = { type: PieceType; color: PieceColor } | null
type Board = Piece[][]
type Position = { row: number; col: number }
type Move = { from: Position; to: Position; captured?: Position }

function createInitialBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { type: "normal", color: "black" }
      }
    }
  }

  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { type: "normal", color: "red" }
      }
    }
  }

  return board
}

function getValidMoves(board: Board, from: Position, piece: Piece): Move[] {
  if (!piece) return []

  const moves: Move[] = []
  const { row, col } = from
  const directions = piece.type === "king" ? [-1, 1] : piece.color === "red" ? [-1] : [1]

  // Simple moves
  for (const dRow of directions) {
    for (const dCol of [-1, 1]) {
      const newRow = row + dRow
      const newCol = col + dCol
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && !board[newRow][newCol]) {
        moves.push({ from, to: { row: newRow, col: newCol } })
      }
    }
  }

  // Capture moves
  for (const dRow of piece.type === "king" ? [-1, 1] : piece.color === "red" ? [-1] : [1]) {
    for (const dCol of [-1, 1]) {
      const jumpRow = row + dRow
      const jumpCol = col + dCol
      const landRow = row + dRow * 2
      const landCol = col + dCol * 2

      if (
        landRow >= 0 &&
        landRow < 8 &&
        landCol >= 0 &&
        landCol < 8 &&
        board[jumpRow]?.[jumpCol]?.color &&
        board[jumpRow][jumpCol]!.color !== piece.color &&
        !board[landRow][landCol]
      ) {
        moves.push({
          from,
          to: { row: landRow, col: landCol },
          captured: { row: jumpRow, col: jumpCol },
        })
      }
    }
  }

  // Prioritize captures
  const captures = moves.filter((m) => m.captured)
  return captures.length > 0 ? captures : moves
}

export function CheckersGame() {
  const { t } = useI18n()
  const router = useRouter()
  const [board, setBoard] = useState<Board>(createInitialBoard)
  const [selectedPos, setSelectedPos] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Move[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("red")
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null)

  const countPieces = useCallback((board: Board, color: PieceColor) => {
    let count = 0
    board.forEach((row) => {
      row.forEach((piece) => {
        if (piece?.color === color) count++
      })
    })
    return count
  }, [])

  const makeAIMove = useCallback((currentBoard: Board) => {
    const blackPieces: { pos: Position; piece: Piece }[] = []
    currentBoard.forEach((row, r) => {
      row.forEach((piece, c) => {
        if (piece?.color === "black") {
          blackPieces.push({ pos: { row: r, col: c }, piece })
        }
      })
    })

    let bestMove: Move | null = null

    // Prioritize captures
    for (const { pos, piece } of blackPieces) {
      const moves = getValidMoves(currentBoard, pos, piece)
      const capture = moves.find((m) => m.captured)
      if (capture) {
        bestMove = capture
        break
      }
      if (!bestMove && moves.length > 0) {
        bestMove = moves[Math.floor(Math.random() * moves.length)]
      }
    }

    return bestMove
  }, [])

  const executeMove = useCallback((board: Board, move: Move): Board => {
    const newBoard = board.map((r) => [...r])
    const piece = newBoard[move.from.row][move.from.col]

    newBoard[move.to.row][move.to.col] = piece
    newBoard[move.from.row][move.from.col] = null

    if (move.captured) {
      newBoard[move.captured.row][move.captured.col] = null
    }

    // Promote to king
    if (piece && piece.type === "normal") {
      if ((piece.color === "red" && move.to.row === 0) || (piece.color === "black" && move.to.row === 7)) {
        newBoard[move.to.row][move.to.col] = { ...piece, type: "king" }
      }
    }

    return newBoard
  }, [])

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (gameResult || currentPlayer !== "red") return

      const clickedPiece = board[row][col]

      if (selectedPos) {
        const move = validMoves.find((m) => m.to.row === row && m.to.col === col)

        if (move) {
          const newBoard = executeMove(board, move)
          setBoard(newBoard)
          setSelectedPos(null)
          setValidMoves([])

          // Check for win
          if (countPieces(newBoard, "black") === 0) {
            setGameResult("win")
            return
          }

          setCurrentPlayer("black")

          // AI move
          setTimeout(() => {
            const aiMove = makeAIMove(newBoard)
            if (aiMove) {
              const aiBoard = executeMove(newBoard, aiMove)
              setBoard(aiBoard)

              if (countPieces(aiBoard, "red") === 0) {
                setGameResult("lose")
                return
              }

              setCurrentPlayer("red")
            } else {
              // No valid moves for AI = player wins
              setGameResult("win")
            }
          }, 500)
        } else if (clickedPiece?.color === "red") {
          setSelectedPos({ row, col })
          setValidMoves(getValidMoves(board, { row, col }, clickedPiece))
        } else {
          setSelectedPos(null)
          setValidMoves([])
        }
      } else if (clickedPiece?.color === "red") {
        setSelectedPos({ row, col })
        setValidMoves(getValidMoves(board, { row, col }, clickedPiece))
      }
    },
    [board, selectedPos, validMoves, currentPlayer, gameResult, countPieces, executeMove, makeAIMove],
  )

  const resetGame = () => {
    setBoard(createInitialBoard())
    setSelectedPos(null)
    setValidMoves([])
    setCurrentPlayer("red")
    setGameResult(null)
  }

  return (
    <GameLayout title={t("games.checkers")}>
      {/* Turn Indicator */}
      <GameCard className="px-6 py-3 mb-4">
        <span className="text-lg font-semibold">
          {currentPlayer === "red" ? t("game.yourTurn") : t("game.opponentTurn")}
        </span>
      </GameCard>

      {/* Score */}
      <div className="flex items-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-700" />
          <span className="font-bold">{countPieces(board, "red")}</span>
        </div>
        <span className="text-muted-foreground">VS</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600" />
          <span className="font-bold">{countPieces(board, "black")}</span>
        </div>
      </div>

      {/* Checkers Board */}
      <div className="grid grid-cols-8 border-2 border-border rounded-lg overflow-hidden w-full max-w-sm aspect-square">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isDark = (rowIndex + colIndex) % 2 === 1
            const isSelected = selectedPos?.row === rowIndex && selectedPos?.col === colIndex
            const isValidMove = validMoves.some((m) => m.to.row === rowIndex && m.to.col === colIndex)
            const isCapture = validMoves.some((m) => m.to.row === rowIndex && m.to.col === colIndex && m.captured)

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={cn(
                  "aspect-square flex items-center justify-center relative",
                  "transition-colors",
                  isDark ? "bg-amber-800" : "bg-amber-100",
                  isSelected && "bg-primary/50",
                  isValidMove &&
                    !isCapture &&
                    "after:absolute after:inset-1/4 after:rounded-full after:bg-green-500/50",
                  isCapture && "after:absolute after:inset-1/4 after:rounded-full after:bg-red-500/50",
                )}
              >
                {piece && (
                  <div
                    className={cn(
                      "w-3/4 h-3/4 rounded-full border-4 shadow-lg",
                      piece.color === "red"
                        ? "bg-gradient-to-br from-red-400 to-red-600 border-red-700"
                        : "bg-gradient-to-br from-gray-600 to-gray-800 border-gray-900",
                      piece.type === "king" && "ring-2 ring-amber-400",
                    )}
                  >
                    {piece.type === "king" && (
                      <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold">♔</div>
                    )}
                  </div>
                )}
              </button>
            )
          }),
        )}
      </div>

      {/* Result Modal */}
      {gameResult && (
        <GameResultModal result={gameResult} onPlayAgain={resetGame} onExit={() => router.push("/classic")} />
      )}
    </GameLayout>
  )
}
