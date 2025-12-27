"use client"

interface SettingsScreenProps {
  onRestart: () => void
  onContinue: () => void
  onExit: () => void
  onBack: () => void
  isGameActive: boolean
}

export function SettingsScreen({ onRestart, onContinue, onExit, onBack, isGameActive }: SettingsScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back to Game
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            GAME SETTINGS
          </h1>
          <p className="text-gray-400">Manage your game session</p>
        </div>

        {/* Settings options */}
        <div className="space-y-6">
          {/* Restart Game */}
          <button
            onClick={onRestart}
            className="w-full p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl text-white font-bold text-xl hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-4"
          >
            <span className="text-2xl">🔄</span>
            RESTART GAME
          </button>

          {/* Continue Game (only if game is active) */}
          {isGameActive && (
            <button
              onClick={onContinue}
              className="w-full p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white font-bold text-xl hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-4"
            >
              <span className="text-2xl">▶️</span>
              CONTINUE GAME
            </button>
          )}

          {/* Exit to Menu */}
          <button
            onClick={onExit}
            className="w-full p-6 bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl text-white font-bold text-xl hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-4"
          >
            <span className="text-2xl">🚪</span>
            EXIT TO MENU
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Progress is saved automatically</p>
          <p className="mt-2">Current game can be resumed anytime</p>
        </div>
      </div>
    </div>
  )
}
