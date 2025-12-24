"use client"

import { useState, useEffect } from "react"
import { Board, GameMode } from "./types"
import { getBoardSize } from "./game-logic"
import { cn } from "@/lib/utils"

interface Game3DProps {
  board: Board
  gameMode: GameMode
  winningLine: number[] | null
  onCellClick: (index: number) => void
  isPlayerTurn: boolean
}

export function Game3D({ board, gameMode, winningLine, onCellClick, isPlayerTurn }: Game3DProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)
  const size = getBoardSize(gameMode)
  const cellSize = size <= 3 ? "w-20 h-20" : size <= 5 ? "w-16 h-16" : "w-12 h-12"

  // Создаем 3D эффект с transform
  const getCellStyle = (index: number) => {
    const isHovered = hoveredCell === index
    const isWinning = winningLine?.includes(index)
    const row = Math.floor(index / size)
    const col = index % size
    
    return {
      transform: `
        perspective(1000px)
        rotateX(${isHovered ? -10 : 0}deg)
        rotateY(${isHovered ? 10 : 0}deg)
        translateZ(${isHovered ? 20 : 0}px)
        translateX(${col * 2 - size + 1}px)
        translateY(${row * 2 - size + 1}px)
      `,
      boxShadow: isWinning 
        ? "0 0 30px #00ffaa, inset 0 0 20px rgba(0, 255, 170, 0.5)"
        : isHovered
        ? "0 10px 30px rgba(0, 200, 255, 0.5), inset 0 0 10px rgba(0, 200, 255, 0.2)"
        : "0 5px 15px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.1)",
      background: isWinning
        ? "linear-gradient(145deg, rgba(0, 255, 170, 0.3), rgba(0, 200, 255, 0.2))"
        : "linear-gradient(145deg, rgba(30, 30, 40, 0.9), rgba(20, 20, 30, 0.9))",
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* 3D Container */}
      <div 
        className="relative"
        style={{
          transform: "perspective(1500px) rotateX(10deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Grid background with 3D effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-cyan-900/30 shadow-2xl" />
        
        <div 
          className="grid gap-4 p-8 rounded-3xl"
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            background: "radial-gradient(circle at center, rgba(10, 15, 40, 0.9), rgba(5, 10, 30, 0.95))",
            border: "2px solid rgba(100, 150, 255, 0.3)",
          }}
        >
          {board.map((cell, index) => {
            const isWinning = winningLine?.includes(index)
            
            return (
              <button
                key={index}
                onClick={() => onCellClick(index)}
                onMouseEnter={() => setHoveredCell(index)}
                onMouseLeave={() => setHoveredCell(null)}
                disabled={!!cell || !isPlayerTurn}
                className={cn(
                  "relative transition-all duration-300 rounded-xl flex items-center justify-center",
                  cellSize,
                  !cell && isPlayerTurn && "cursor-pointer hover:scale-110",
                  cell ? "cursor-default" : "cursor-pointer",
                  isWinning && "animate-pulse"
                )}
                style={getCellStyle(index)}
              >
                {/* 3D cell border */}
                <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30" />
                
                {/* Cell content */}
                <div className="relative z-10">
                  {cell === "X" && (
                    <div className="relative">
                      {/* 3D X symbol */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3/4 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 transform rotate-45 rounded-full" />
                        <div className="absolute w-3/4 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 transform -rotate-45 rounded-full" />
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-md" />
                    </div>
                  )}
                  
                  {cell === "O" && (
                    <div className="relative">
                      {/* 3D O symbol */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 rounded-full border-4 border-gradient-to-r from-pink-400 to-purple-500" />
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-500/20 blur-md rounded-full" />
                    </div>
                  )}
                  
                  {/* Hover effect */}
                  {!cell && isPlayerTurn && (
                    <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* 3D lighting effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  )
}