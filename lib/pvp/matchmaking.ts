"use server"

// Явные, статические экспортa — чтобы сборщик гарантированно видел все экспорты.
// Экспортируем makeMove и другие серверные функции/типы из соответствующих модулей.

import { makeMove as _makeMove } from "./matchmaking-moves"
import { findMatch as _findMatch, cancelSearch as _cancelSearch } from "./matchmaking-core"
import {
  initializeGameState as _initializeGameState,
  generateMathProblems as _generateMathProblems,
  generateFlagsQuestions as _generateFlagsQuestions,
  generateAnagramWords as _generateAnagramWords,
} from "./matchmaking-game-init"

export const makeMove = _makeMove
export const findMatch = _findMatch
export const cancelSearch = _cancelSearch
export const initializeGameState = _initializeGameState
export const generateMathProblems = _generateMathProblems
export const generateFlagsQuestions = _generateFlagsQuestions
export const generateAnagramWords = _generateAnagramWords

// Экспорт типов
export type { MatchmakingResult, MatchState } from "./matchmaking-core"

// Локальные утилиты (явно экспортируем для совместимости)
export function initializeCheckersBoard() {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) board[row][col] = "black"
    }
  }
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) board[row][col] = "white"
    }
  }
  return { board, currentPlayer: "white" }
}

export function generateSudokuPuzzle() {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(0))
}

export function generateCrosswordGrid() {
  return Array(10)
    .fill(null)
    .map(() => Array(10).fill(""))
}