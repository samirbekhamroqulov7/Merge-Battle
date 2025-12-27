"use client"

interface PlayerSelectProps {
  onSelect: (symbol: "X" | "O") => void
  onBack: () => void
}

export function PlayerSelect({ onSelect, onBack }: PlayerSelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Choose your side
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Who will make the first move?
        </p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* X Button */}
          <button
            onClick={() => onSelect("X")}
            className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-105 transition-transform"
          >
            <div className="text-6xl font-bold text-white mb-4">X</div>
            <div className="text-xl font-bold text-white">Crosses</div>
            <div className="text-sm text-cyan-200 mt-2">First move</div>
          </button>

          {/* O Button */}
          <button
            onClick={() => onSelect("O")}
            className="bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl p-8 flex flex-col items-center justify-center hover:scale-105 transition-transform"
          >
            <div className="text-6xl font-bold text-white mb-4">O</div>
            <div className="text-xl font-bold text-white">Noughts</div>
            <div className="text-sm text-pink-200 mt-2">Second move</div>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
