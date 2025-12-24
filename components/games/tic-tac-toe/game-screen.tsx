"use client"

import { useState, useEffect, useCallback } from "react"
import { GameMode, AILevel, Player, Screen } from "./types"
import { Game3D } from "./game-3d" // ← Вернули 3D компонент
import { makeAIMove } from "./ai-logic"
import { checkWinner, initializeBoard, makeMove as makeGameMove } from "./game-logic"
import { useSound } from "@/lib/hooks/use-sound"

// ... остальной код такой же как раньше, но используем Game3D ...

// В части рендеринга:
return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
    {/* ... */}
    
    {/* Game Board - используем Game3D */}
    <div className="py-8">
      <Game3D
        board={board}
        gameMode={mode}
        winningLine={winningLine}
        onCellClick={handleCellClick}
        isPlayerTurn={isPlayerTurn && !winner}
      />
    </div>
    
    {/* ... */}
  </div>
)