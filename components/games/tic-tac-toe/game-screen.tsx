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
  onScreenChange: (screen: Screen) => void
  onGameEnd: (result: "win" | "lose" | "draw") => void
}

export function GameScreen({ mode, aiLevel, onScreenChange, onGameEnd }: GameScreenProps) {
  const [board, setBoard] = useState<Player[]>(() => initializeBoard(mode))
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X")
  const [winner, setWinner] = useState<Player | "draw" | null>(null)
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const { play } = useSound()

  // Load saved game
  useEffect(() => {
    const savedGame = localStorage.getItem(`tic_tac_toe_${mode}_${aiLevel}`)
    if (savedGame) {
      const { board: savedBoard, currentPlayer: savedPlayer } = JSON.parse(savedGame)
      setBoard(savedBoard)
      setCurrentPlayer(savedPlayer)
    }
  }, [mode, aiLevel])

  // Save game state
  const saveGameState = useCallback((board: Player[], currentPlayer: "X" | "O") => {
    localStorage.setItem(`tic_tac_toe_${mode}_${aiLevel}`, JSON.stringify({
      board,
      currentPlayer,
      timestamp: Date.now()
    }))
  }, [mode, aiLevel])

  // Handle AI move
  useEffect(() => {
    if (currentPlayer === "O" && !winner && !isThinking) {
      setIsThinking(true)
      
      const timer = setTimeout(() => {
        const aiMoveIndex = makeAIMove(board, aiLevel, mode, currentPlayer)
        
        if (aiMoveIndex !== -1) {
          const newBoard = makeGameMove(board, aiMoveIndex, "O")
          setBoard(newBoard)
          saveGameState(newBoard, "X")
          
          const result = checkWinner(newBoard, mode)
          if (result.winner) {
            setWinner(result.winner)
            setWinningLine(result.line)
            setShowResult(true)
            
            if (result.winner === "O") {
              onGameEnd("lose")
              play("lose")
            } else if (result.winner === "draw") {
              onGameEnd("draw")
            }
            
            // Clear saved game
            localStorage.removeItem(`tic_tac_toe_${mode}_${aiLevel}`)
          } else {
            setCurrentPlayer("X")
          }
        }
        
        setIsThinking(false)
      }, aiLevel === "easy" ? 500 : aiLevel === "normal" ? 800 : 1200)

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, winner, isThinking, board, aiLevel, mode])

  // Handle player move
  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner || currentPlayer !== "X" || isThinking) return

    play("click")
    const newBoard = makeGameMove(board, index, "X")
    setBoard(newBoard)
    saveGameState(newBoard, "O")

    const result = checkWinner(newBoard, mode)
    if (result.winner) {
      setWinner(result.winner)
      setWinningLine(result.line)
      setShowResult(true)
      
      if (result.winner === "X") {
        onGameEnd("win")
        play("win")
      } else if (result.winner === "draw") {
        onGameEnd("draw")
      }
      
      // Clear saved game
      localStorage.removeItem(`tic_tac_toe_${mode}_${aiLevel}`)
    } else {
      setCurrentPlayer("O")
    }
  }, [board, winner, currentPlayer, isThinking, mode, play, onGameEnd, saveGameState])

  // Restart game
  const handleRestart = () => {
    setBoard(initializeBoard(mode))
    setCurrentPlayer("X")
    setWinner(null)
    setWinningLine(null)
    setShowResult(false)
    localStorage.removeItem(`tic_tac_toe_${mode}_${aiLevel}`)
    play("click")
  }

  // Exit to menu
  const handleExit = () => {
    localStorage.removeItem(`tic_tac_toe_${mode}_${aiLevel}`)
    onScreenChange("mode")
    play("click")
  }

  // Game status text
  const getStatusText = () => {
    if (winner === "X") return "🎉 YOU WIN!"
    if (winner === "O") return "💀 AI WINS!"
    if (winner === "draw") return "🤝 DRAW!"
    if (currentPlayer === "X") return "🎮 YOUR TURN"
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
            {mode.toUpperCase()} | AI: {aiLevel.toUpperCase()}
          </div>
          <div className={`text-lg font-semibold ${
            winner === "X" ? "text-green-400" :
            winner === "O" ? "text-red-400" :
            winner === "draw" ? "text-yellow-400" :
            currentPlayer === "X" ? "text-cyan-400" : "text-pink-400"
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
          isPlayerTurn={currentPlayer === "X" && !winner}
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
                {winner === "X" ? "🎉 VICTORY!" :
                 winner === "O" ? "💀 DEFEAT!" : "🤝 DRAW!"}
              </h2>
              
              <p className="text-gray-300 mb-8">
                {winner === "X" ? "You outsmarted the AI!" :
                 winner === "O" ? "The AI was too strong!" :
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