"use client"

import { useState, useEffect, useCallback } from "react"
import { GameMode, AILevel, Player, Screen } from "./types"
import { Game3D } from "./game-3d"
import { makeAIMove } from "./ai-logic"
import { checkWinner, initializeBoard, makeMove as makeGameMove } from "./game-logic"
import { useSound } from "@/lib/hooks/use-sound"

interface GameScreenProps {
  mode: GameMode
  aiLevel: AILevel
  playerSymbol: "X" | "O"
  onScreenChange: (screen: Screen) => void
  onGameEnd: (result: "win" | "lose" | "draw") => void
  matchStats: {
    matches: number
    wins: number
    gamesInMatch: number
    currentMatchWins: number
    currentMatchLosses: number
  }
}

export function GameScreen({ mode, aiLevel, playerSymbol, onScreenChange, onGameEnd, matchStats }: GameScreenProps) {
  const [board, setBoard] = useState<Player[]>(() => initializeBoard(mode))
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">(playerSymbol)
  const [winner, setWinner] = useState<Player | "draw" | null>(null)
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const { play } = useSound()

  // Определяем кто игрок, кто AI
  const aiSymbol = playerSymbol === "X" ? "O" : "X"
  const isPlayerTurn = currentPlayer === playerSymbol

  // Handle AI move
  useEffect(() => {
    if (currentPlayer === aiSymbol && !winner && !isThinking) {
      setIsThinking(true)
      
      const timer = setTimeout(() => {
        const aiMoveIndex = makeAIMove(board, aiLevel, mode, aiSymbol)
        
        if (aiMoveIndex !== -1) {
          const newBoard = makeGameMove(board, aiMoveIndex, aiSymbol)
          setBoard(newBoard)
          
          const result = checkWinner(newBoard, mode)
          if (result.winner) {
            setWinner(result.winner)
            setWinningLine(result.line)
            setShowResult(true)
            
            if (result.winner === aiSymbol) {
              onGameEnd("lose")
              play("lose")
            } else if (result.winner === "draw") {
              onGameEnd("draw")
            }
          } else {
            setCurrentPlayer(playerSymbol)
          }
        }
        
        setIsThinking(false)
      }, aiLevel === "easy" ? 300 : aiLevel === "normal" ? 500 : 800)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, winner, isThinking, board, aiLevel, mode, playerSymbol, aiSymbol, onGameEnd, play])

  // Handle player move
  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner || !isPlayerTurn || isThinking) return

    play("click")
    const newBoard = makeGameMove(board, index, playerSymbol)
    setBoard(newBoard)

    const result = checkWinner(newBoard, mode)
    if (result.winner) {
      setWinner(result.winner)
      setWinningLine(result.line)
      setShowResult(true)
      
      if (result.winner === playerSymbol) {
        onGameEnd("win")
        play("win")
      } else if (result.winner === "draw") {
        onGameEnd("draw")
      }
    } else {
      setCurrentPlayer(aiSymbol)
    }
  }, [board, winner, isPlayerTurn, isThinking, mode, play, onGameEnd, playerSymbol, aiSymbol])

  // Restart game
  const handleRestart = () => {
    setBoard(initializeBoard(mode))
    setCurrentPlayer(playerSymbol)
    setWinner(null)
    setWinningLine(null)
    setShowResult(false)
    play("click")
  }

  // Exit to menu
  const handleExit = () => {
    onScreenChange("mode")
    play("click")
  }

  // Game status text
  const getStatusText = () => {
    if (winner === playerSymbol) return "🎉 YOU WIN!"
    if (winner === aiSymbol) return "💀 AI WINS!"
    if (winner === "draw") return "🤝 DRAW!"
    if (isPlayerTurn) return "🎮 YOUR TURN"
    if (isThinking) return "🤔 AI THINKING..."
    return "⏳ WAITING..."
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Top Bar */}
      <div className="p-6 flex justify-between items-center">
        {/* Back button */}
        <button
          onClick={() => onScreenChange("mode")}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5"
        >
          ← Back to Menu
        </button>

        {/* Game Info */}
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {mode === "3x3" ? "3×3" : mode === "5x5" ? "5×5" : "7×7"} | AI: {aiLevel.toUpperCase()}
          </div>
          <div className={`text-lg font-semibold ${
            winner === playerSymbol ? "text-green-400" :
            winner === aiSymbol ? "text-red-400" :
            winner === "draw" ? "text-yellow-400" :
            isPlayerTurn ? "text-cyan-400" : "text-pink-400"
          }`}>
            {getStatusText()}
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={() => onScreenChange("settings")}
          className="text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Game Board */}
      <div className="py-8">
        <Game3D
          board={board}
          gameMode={mode}
          winningLine={winningLine}
          onCellClick={handleCellClick}
          isPlayerTurn={isPlayerTurn && !winner}
        />
      </div>

      {/* Game Controls */}
      <div className="flex justify-center gap-6 p-6">
        <button
          onClick={handleRestart}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white font-bold hover:scale-105 transition-transform"
        >
          🔄 Restart
        </button>
        
        <button
          onClick={() => onScreenChange("settings")}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-white font-bold hover:scale-105 transition-transform"
        >
          ⚙️ Settings
        </button>
        
        <button
          onClick={handleExit}
          className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl text-white font-bold hover:scale-105 transition-transform"
        >
          🚪 Exit
        </button>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4 text-white">
                {winner === playerSymbol ? "🎉 VICTORY!" :
                 winner === aiSymbol ? "💀 DEFEAT!" : "🤝 DRAW!"}
              </h2>
              
              <p className="text-gray-300 mb-8">
                {winner === playerSymbol ? "You outsmarted the AI!" :
                 winner === aiSymbol ? "The AI was too strong!" :
                 "Well fought match!"}
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-bold hover:scale-105 transition-transform"
                >
                  Play Again
                </button>
                
                <button
                  onClick={handleExit}
                  className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl text-white font-bold hover:scale-105 transition-transform"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Thinking Indicator */}
      {isThinking && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full">
          <div className="flex items-center gap-3">
            <div className="animate-spin">🌀</div>
            <span>AI is thinking...</span>
          </div>
        </div>
      )}
    </div>
  )
}
