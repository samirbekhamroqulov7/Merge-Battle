"use client"

import { useState, useCallback } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { GameLayout } from "@/components/games/game-layout"
import { GameResultModal } from "@/components/games/game-result-modal"
import { GameCard } from "@/components/ui/game-card"
import { cn } from "@/lib/utils"

type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"
type PieceColor = "white" | "black"
type Piece = { type: PieceType; color: PieceColor } | null
type Board = Piece[][]
type Position = { row: number; col: number }

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
  black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
}

function createInitialBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: "pawn", color: "black" }
    board[6][i] = { type: "pawn", color: "white" }
  }

  // Set up other pieces
  const backRow: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: backRow[i], color: "black" }
    board[7][i] = { type: backRow[i], color: "white" }
  }

  return board
}

function getValidMoves(board: Board, from: Position, piece: Piece): Position[] {
  if (!piece) return []

  const moves: Position[] = []
  const { row, col } = from
  const direction = piece.color === "white" ? -1 : 1

  const isValidSquare = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8

  const canCapture = (r: number, c: number) => {
    if (!isValidSquare(r, c)) return false
    const target = board[r][c]
    return target !== null && target.color !== piece.color
  }

  const isEmpty = (r: number, c: number) => isValidSquare(r, c) && board[r][c] === null

  switch (piece.type) {
    case "pawn":
      // Forward move
      if (isEmpty(row + direction, col)) {
        moves.push({ row: row + direction, col })
        // Double move from starting position
        const startRow = piece.color === "white" ? 6 : 1
        if (row === startRow && isEmpty(row + 2 * direction, col)) {
          moves.push({ row: row + 2 * direction, col })
        }
      }
      // Captures
      if (canCapture(row + direction, col - 1)) moves.push({ row: row + direction, col: col - 1 })
      if (canCapture(row + direction, col + 1)) moves.push({ row: row + direction, col: col + 1 })
      break

    case "knight":
      const knightMoves = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ]
      for (const [dr, dc] of knightMoves) {
        const nr = row + dr
        const nc = col + dc
        if (isValidSquare(nr, nc) && (isEmpty(nr, nc) || canCapture(nr, nc))) {
          moves.push({ row: nr, col: nc })
        }
      }
      break

    case "bishop":
      for (const [dr, dc] of [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i
          const nc = col + dc * i
          if (!isValidSquare(nr, nc)) break
          if (isEmpty(nr, nc)) {
            moves.push({ row: nr, col: nc })
          } else if (canCapture(nr, nc)) {
            moves.push({ row: nr, col: nc })
            break
          } else {
            break
          }
        }
      }
      break

    case "rook":
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i
          const nc = col + dc * i
          if (!isValidSquare(nr, nc)) break
          if (isEmpty(nr, nc)) {
            moves.push({ row: nr, col: nc })
          } else if (canCapture(nr, nc)) {
            moves.push({ row: nr, col: nc })
            break
          } else {
            break
          }
        }
      }
      break

    case "queen":
      for (const [dr, dc] of [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i
          const nc = col + dc * i
          if (!isValidSquare(nr, nc)) break
          if (isEmpty(nr, nc)) {
            moves.push({ row: nr, col: nc })
          } else if (canCapture(nr, nc)) {
            moves.push({ row: nr, col: nc })
            break
          } else {
            break
          }
        }
      }
      break

    case "king":
      for (const [dr, dc] of [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ]) {
        const nr = row + dr
        const nc = col + dc
        if (isValidSquare(nr, nc) && (isEmpty(nr, nc) || canCapture(nr, nc))) {
          moves.push({ row: nr, col: nc })
        }
      }
      break
  }

  return moves
}

export function ChessGame() {
  const { t } = useI18n()
  const router = useRouter()
  const [board, setBoard] = useState<Board>(createInitialBoard)
  const [selectedPos, setSelectedPos] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Position[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white")
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null)
  const [capturedPieces, setCapturedPieces] = useState<{ white: Piece[]; black: Piece[] }>({ white: [], black: [] })

  const isKingCaptured = useCallback((board: Board, color: PieceColor): boolean => {
    for (const row of board) {
      for (const piece of row) {
        if (piece?.type === "king" && piece.color === color) return false
      }
    }
    return true
  }, [])

  const makeAIMove = useCallback((currentBoard: Board) => {
    // Simple AI: Random valid move
    const blackPieces: { pos: Position; piece: Piece }[] = []
    currentBoard.forEach((row, r) => {
      row.forEach((piece, c) => {
        if (piece?.color === "black") {
          blackPieces.push({ pos: { row: r, col: c }, piece })
        }
      })
    })

    // Shuffle and find a valid move
    const shuffled = blackPieces.sort(() => Math.random() - 0.5)
    for (const { pos, piece } of shuffled) {
      const moves = getValidMoves(currentBoard, pos, piece)
      if (moves.length > 0) {
        const move = moves[Math.floor(Math.random() * moves.length)]
        return { from: pos, to: move }
      }
    }
    return null
  }, [])

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      if (gameResult || currentPlayer !== "white") return

      const clickedPiece = board[row][col]

      if (selectedPos) {
        const isValidMove = validMoves.some((m) => m.row === row && m.col === col)

        if (isValidMove) {
          const newBoard = board.map((r) => [...r])
          const capturedPiece = newBoard[row][col]

          newBoard[row][col] = newBoard[selectedPos.row][selectedPos.col]
          newBoard[selectedPos.row][selectedPos.col] = null

          if (capturedPiece) {
            setCapturedPieces((prev) => ({
              ...prev,
              white: [...prev.white, capturedPiece],
            }))
          }

          setBoard(newBoard)
          setSelectedPos(null)
          setValidMoves([])

          // Check for win
          if (isKingCaptured(newBoard, "black")) {
            setGameResult("win")
            return
          }

          setCurrentPlayer("black")

          // AI move
          setTimeout(() => {
            const aiMove = makeAIMove(newBoard)
            if (aiMove) {
              const aiBoard = newBoard.map((r) => [...r])
              const aiCaptured = aiBoard[aiMove.to.row][aiMove.to.col]

              aiBoard[aiMove.to.row][aiMove.to.col] = aiBoard[aiMove.from.row][aiMove.from.col]
              aiBoard[aiMove.from.row][aiMove.from.col] = null

              if (aiCaptured) {
                setCapturedPieces((prev) => ({
                  ...prev,
                  black: [...prev.black, aiCaptured],
                }))
              }

              setBoard(aiBoard)

              if (isKingCaptured(aiBoard, "white")) {
                setGameResult("lose")
                return
              }

              setCurrentPlayer("white")
            }
          }, 500)
        } else if (clickedPiece?.color === "white") {
          setSelectedPos({ row, col })
          setValidMoves(getValidMoves(board, { row, col }, clickedPiece))
        } else {
          setSelectedPos(null)
          setValidMoves([])
        }
      } else if (clickedPiece?.color === "white") {
        setSelectedPos({ row, col })
        setValidMoves(getValidMoves(board, { row, col }, clickedPiece))
      }
    },
    [board, selectedPos, validMoves, currentPlayer, gameResult, isKingCaptured, makeAIMove],
  )

  const resetGame = () => {
    setBoard(createInitialBoard())
    setSelectedPos(null)
    setValidMoves([])
    setCurrentPlayer("white")
    setGameResult(null)
    setCapturedPieces({ white: [], black: [] })
  }

  return (
    <GameLayout title={t("games.chess")}>
      {/* Turn Indicator */}
      <GameCard className="px-6 py-3 mb-4">
        <span className="text-lg font-semibold">
          {currentPlayer === "white" ? t("game.yourTurn") : t("game.opponentTurn")}
        </span>
      </GameCard>

      {/* Captured Pieces */}
      <div className="flex justify-between w-full max-w-sm mb-2 px-2">
        <div className="flex gap-1 text-2xl">{capturedPieces.white.map((p, i) => p && <span key={i}>♟</span>)}</div>
        <div className="flex gap-1 text-2xl">{capturedPieces.black.map((p, i) => p && <span key={i}>♙</span>)}</div>
      </div>

      {/* Chess Board */}
      <div className="grid grid-cols-8 border-2 border-border rounded-lg overflow-hidden w-full max-w-sm aspect-square">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0
            const isSelected = selectedPos?.row === rowIndex && selectedPos?.col === colIndex
            const isValidMove = validMoves.some((m) => m.row === rowIndex && m.col === colIndex)

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={cn(
                  "aspect-square flex items-center justify-center text-3xl sm:text-4xl",
                  "transition-colors relative",
                  isLight ? "bg-amber-100" : "bg-amber-800",
                  isSelected && "bg-primary/50",
                  isValidMove && "after:absolute after:inset-1/4 after:rounded-full after:bg-green-500/50",
                  piece?.color === "white" && "hover:bg-primary/30",
                )}
              >
                {piece && (
                  <span className={piece.color === "white" ? "text-white drop-shadow-lg" : "text-gray-900"}>
                    {PIECE_SYMBOLS[piece.color][piece.type]}
                  </span>
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
