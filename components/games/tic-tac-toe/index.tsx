"use client"

import { useState, useEffect } from "react"
import { Screen, GameMode, AILevel } from "./types"
import { ModeSelect } from "./mode-select"
import { GameScreen } from "./game-screen"
import { SettingsScreen } from "./settings-screen"
import { PlayerSelect } from "./player-select"

export function TicTacToeGame() {
  const [screen, setScreen] = useState<Screen>("mode")
  const [gameMode, setGameMode] = useState<GameMode>("3x3")
  const [aiLevel, setAILevel] = useState<AILevel>("normal")
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O">("X")
  const [matchStats, setMatchStats] = useState({
    matches: 0, // сыгранные матчи
    wins: 0,    // выигранные матчи
    gamesInMatch: 0, // игры в текущем матче (0-3)
    currentMatchWins: 0, // победы в текущем матче
    currentMatchLosses: 0, // поражения в текущем матче
  })

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem("tic_tac_toe_stats")
    if (savedStats) {
      try {
        setMatchStats(JSON.parse(savedStats))
      } catch (e) {
        console.error("Failed to load stats:", e)
      }
    }
  }, [])

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem("tic_tac_toe_stats", JSON.stringify(matchStats))
  }, [matchStats])

  const handleStartGame = (mode: GameMode, ai: AILevel) => {
    setGameMode(mode)
    setAILevel(ai)
    setScreen("player-select")
  }

  const handlePlayerSelect = (symbol: "X" | "O") => {
    setPlayerSymbol(symbol)
    setScreen("game")
    // Сброс статистики текущего матча
    setMatchStats(prev => ({
      ...prev,
      gamesInMatch: 0,
      currentMatchWins: 0,
      currentMatchLosses: 0
    }))
  }

  const handleGameEnd = (result: "win" | "lose" | "draw") => {
    setMatchStats(prev => {
      const newStats = { ...prev }
      newStats.gamesInMatch += 1
      
      if (result === "win") {
        newStats.currentMatchWins += 1
      } else if (result === "lose") {
        newStats.currentMatchLosses += 1
      }
      
      // Проверяем закончен ли матч (best of 3)
      if (newStats.gamesInMatch >= 3 || 
          newStats.currentMatchWins >= 2 || 
          newStats.currentMatchLosses >= 2) {
        
        if (newStats.currentMatchWins > newStats.currentMatchLosses) {
          newStats.wins += 1
        }
        newStats.matches += 1
        
        // Сброс текущего матча
        newStats.gamesInMatch = 0
        newStats.currentMatchWins = 0
        newStats.currentMatchLosses = 0
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
      {/* Match stats display (only in game screen) */}
      {screen === "game" && (
        <div className="fixed top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-xl p-4">
          <div className="text-white text-sm">
            <div className="flex gap-8">
              {/* Матчи сыграно / всего */}
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {matchStats.matches}
                </div>
                <div className="text-xs text-gray-400">МАТЧИ</div>
              </div>
              
              {/* Победы в матчах */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {matchStats.wins}
                </div>
                <div className="text-xs text-gray-400">ПОБЕДЫ</div>
              </div>
              
              {/* Текущий матч: игры сыграно */}
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {matchStats.gamesInMatch}/3
                </div>
                <div className="text-xs text-gray-400">ИГРЫ</div>
              </div>
              
              {/* Текущий счет в матче */}
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {matchStats.currentMatchWins}/{matchStats.currentMatchLosses}
                </div>
                <div className="text-xs text-gray-400">СЧЕТ</div>
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

      {screen === "player-select" && (
        <PlayerSelect
          onSelect={handlePlayerSelect}
          onBack={() => setScreen("mode")}
        />
      )}

      {screen === "game" && (
        <GameScreen
          mode={gameMode}
          aiLevel={aiLevel}
          playerSymbol={playerSymbol}
          onScreenChange={setScreen}
          onGameEnd={handleGameEnd}
          matchStats={matchStats}
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
