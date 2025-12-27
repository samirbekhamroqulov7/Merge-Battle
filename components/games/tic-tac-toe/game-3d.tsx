"use client"

import { GameMode, Player } from "./types"

interface Game3DProps {
  board: Player[]
  gameMode: GameMode
  winningLine: number[] | null
  onCellClick: (index: number) => void
  isPlayerTurn: boolean
}

export function Game3D({ board, gameMode, winningLine, onCellClick, isPlayerTurn }: Game3DProps) {
  const size = gameMode === "3x3" ? 3 : gameMode === "5x5" ? 5 : 7
  const gridCols = size === 3 ? "grid-cols-3" : size === 5 ? "grid-cols-5" : "grid-cols-7"
  const gap = size === 3 ? "gap-3" : size === 5 ? "gap-1.5" : "gap-1"

  return (
    <div className="flex justify-center items-center">
      <div className={`grid ${gridCols} ${gap} bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-3xl shadow-2xl border border-gray-700/50`}>
        {board.map((cell, index) => {
          const isWinningCell = winningLine?.includes(index)
          const cellSize = size === 3 ? "w-24 h-24 md:w-28 md:h-28" : 
                         size === 5 ? "w-20 h-20 md:w-24 md:h-24" : 
                         "w-16 h-16 md:w-20 md:h-20"
          const textSize = size === 3 ? "text-5xl md:text-6xl" : 
                         size === 5 ? "text-4xl md:text-5xl" : 
                         "text-3xl md:text-4xl"

          return (
            <button
              key={index}
              onClick={() => onCellClick(index)}
              disabled={!!cell || !isPlayerTurn}
              className={`
                relative ${cellSize}
                bg-gradient-to-br from-gray-800 to-gray-900
                rounded-xl
                flex items-center justify-center
                transition-all duration-300
                transform
                ${!cell && isPlayerTurn ?
                  'hover:scale-110 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/30 cursor-pointer' :
                  'cursor-default'
                }
                ${cell ? 'scale-95' : ''}
                shadow-lg
                border border-gray-700/50
                group
              `}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* 3D depth effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700/50 to-gray-900/50 rounded-xl -z-10 translate-z-[-10px]"></div>

              {/* Cell content with 3D effect */}
              {cell === "X" && (
                <div className="relative">
                  <div className={`${textSize} font-bold text-transparent bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text`}>
                    X
                  </div>
                  <div className={`absolute inset-0 ${textSize} font-bold text-cyan-900/30 blur-sm`}>
                    X
                  </div>
                </div>
              )}

              {cell === "O" && (
                <div className="relative">
                  <div className={`${textSize} font-bold text-transparent bg-gradient-to-br from-pink-400 to-red-500 bg-clip-text`}>
                    O
                  </div>
                  <div className={`absolute inset-0 ${textSize} font-bold text-pink-900/30 blur-sm`}>
                    O
                  </div>
                </div>
              )}

              {/* Empty cell hover effect */}
              {!cell && isPlayerTurn && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-4xl text-gray-500/50">
                    ?
                  </div>
                </div>
              )}

              {/* Winning cell effect */}
              {isWinningCell && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-xl animate-pulse"></div>
                  <div className="absolute inset-0 border-4 border-gradient-to-r from-yellow-400 to-orange-500 rounded-xl animate-pulse"></div>
                </>
              )}

              {/* Cell glow effect */}
              <div className={`absolute inset-0 rounded-xl ${
                isWinningCell ?
                  'shadow-[0_0_40px_rgba(251,191,36,0.6)]' :
                  'shadow-[0_0_20px_rgba(0,0,0,0.3)]'
              } transition-shadow duration-300`}></div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
