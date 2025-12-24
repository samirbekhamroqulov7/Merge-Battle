"use client"

import { useState, useEffect } from "react"
import { Screen, GameMode, AILevel } from "./types"
import { ModeSelect } from "./mode-select"
import { GameScreen } from "./game-screen"
import { SettingsScreen } from "./settings-screen"

export function TicTacToeGame() {
  const [screen, setScreen] = useState<Screen>("mode")
  const [gameMode, setGameMode] = useState<GameMode>("3x3")
  const [aiLevel, setAILevel] = useState<AILevel>("normal")
  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    draws: 0,
    streak: 0,
  })

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem("tic_tac_toe_stats")
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats))
      } catch (e) {
        console.error("Failed to load stats:", e)
      }
    }
  }, [])

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem("tic_tac_toe_stats", JSON.stringify(stats))
  }, [stats])

  const handleStartGame = (mode: GameMode, ai: AILevel) => {
    setGameMode(mode)
    setAILevel(ai)
    setScreen("game")
  }

  const handleGameEnd = (result: "win" | "lose" | "draw") => {
    setStats(prev => {
      const newStats = { ...prev }
      
      if (result === "win") {
        newStats.wins += 1
        newStats.streak = Math.max(0, newStats.streak) + 1
      } else if (result === "lose") {
        newStats.losses += 1
        newStats.streak = Math.min(0, newStats.streak) - 1
      } else {
        newStats.draws += 1
      }
      
      return newStats
    })
  }

  const handleRestart = () => {
    setScreen("game")
  }

  const handleContinue = () => {
    setScreen("game")
  }

  const handleExitToMenu = () => {
    setScreen("mode")
  }

  // Get current game state for settings
  const isGameActive = screen === "game"

  return (
    <div className="relative">
      {/* Stats display (only in game screen) */}
      {screen === "game" && (
        <div className="fixed top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-xl p-4">
          <div className="text-white text-sm">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.wins}</div>
                <div className="text-xs text-gray-400">WINS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.losses}</div>
                <div className="text-xs text-gray-400">LOSSES</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.draws}</div>
                <div className="text-xs text-gray-400">DRAWS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {stats.streak > 0 ? `+${stats.streak}` : stats.streak}
                </div>
                <div className="text-xs text-gray-400">STREAK</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Screen */}
      {screen === "mode" && (
        <ModeSelect
          onStartGame={handleStartGame}
          onBack={() => window.history.back()}
        />
      )}

      {screen === "game" && (
        <GameScreen
          mode={gameMode}
          aiLevel={aiLevel}
          onScreenChange={setScreen}
          onGameEnd={handleGameEnd}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          onRestart={handleRestart}
          onContinue={handleContinue}
          onExit={handleExitToMenu}
          onBack={() => setScreen("game")}
          isGameActive={isGameActive}
        />
      )}
    </div>
  )
}