"use client"

import { GameMode, AILevel } from "./types"
import { useState } from "react"

interface ModeSelectProps {
  onStartGame: (mode: GameMode, aiLevel: AILevel) => void
  onBack: () => void
}

export function ModeSelect({ onStartGame, onBack }: ModeSelectProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>("3x3")
  const [selectedAI, setSelectedAI] = useState<AILevel>("normal")

  const modes = [
    { id: "3x3", label: "3×3 CLASSIC", desc: "Win with 3 in a row", color: "from-cyan-500 to-blue-600" },
    { id: "5x5", label: "5×5 PRO", desc: "Win with 4 in a row", color: "from-purple-500 to-pink-600" },
    { id: "7x7", label: "7×7 EXTREME", desc: "Win with 5 in a row", color: "from-orange-500 to-red-600" },
  ]

  const aiLevels = [
    { id: "easy", label: "😊 EASY", desc: "For beginners" },
    { id: "normal", label: "😐 NORMAL", desc: "Balanced challenge" },
    { id: "hard", label: "😎 HARD", desc: "Expert level" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>

        {/* Header - УБРАЛИ "3D" */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            TIC-TAC-TOE
          </h1>
          <p className="text-gray-400 text-lg">Select game mode and AI level</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Modes */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Game Mode</h2>
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id as GameMode)}
                className={`
                  w-full p-6 rounded-2xl transition-all duration-300 transform
                  ${selectedMode === mode.id
                    ? `bg-gradient-to-br ${mode.color} scale-105 shadow-2xl`
                    : "bg-gray-800/50 hover:bg-gray-800/80 hover:scale-[1.02]"}
                  border-2 ${selectedMode === mode.id ? "border-white/30" : "border-transparent"}
                `}
              >
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">{mode.label}</h3>
                  <p className="text-gray-300">{mode.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* AI Levels */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">AI Level</h2>
            {aiLevels.map((ai) => (
              <button
                key={ai.id}
                onClick={() => setSelectedAI(ai.id as AILevel)}
                className={`
                  w-full p-6 rounded-2xl transition-all duration-300 transform
                  ${selectedAI === ai.id
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 scale-105 shadow-2xl"
                    : "bg-gray-800/50 hover:bg-gray-800/80 hover:scale-[1.02]"}
                  border-2 ${selectedAI === ai.id ? "border-white/30" : "border-transparent"}
                `}
              >
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">{ai.label}</h3>
                  <p className="text-gray-300">{ai.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => onStartGame(selectedMode, selectedAI)}
            className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white font-bold text-xl hover:scale-105 transition-transform shadow-2xl hover:shadow-cyan-500/30"
          >
            START GAME
          </button>
        </div>

        {/* Footer - УБРАЛИ "3D board" */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Game features: Smart AI • Multiple modes • Statistics</p>
        </div>
      </div>
    </div>
  )
}
