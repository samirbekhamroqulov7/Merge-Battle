import { Board, GameMode } from "./types";

export function getBoardSize(mode: GameMode): number {
  return parseInt(mode[0]);
}

export function getWinLength(mode: GameMode): number {
  switch (mode) {
    case "3x3": return 3;
    case "5x5": return 4;
    case "7x7": return 5;
    default: return 3;
  }
}

export function initializeBoard(mode: GameMode): Board {
  const size = getBoardSize(mode);
  return Array(size * size).fill(null);
}

export function isValidMove(board: Board, index: number): boolean {
  return board[index] === null;
}

export function makeMove(board: Board, index: number, player: "X" | "O"): Board {
  const newBoard = [...board];
  newBoard[index] = player;
  return newBoard;
}

export function checkWinner(board: Board, mode: GameMode): { winner: "X" | "O" | "draw" | null; line: number[] | null } {
  const size = getBoardSize(mode);
  const winLength = getWinLength(mode);

  // Проверка горизонталей
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      const line = [];
      for (let k = 0; k < winLength; k++) {
        line.push(row * size + col + k);
      }
      
      const first = board[line[0]];
      if (first && line.every(index => board[index] === first)) {
        return { winner: first, line };
      }
    }
  }

  // Проверка вертикалей
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winLength; row++) {
      const line = [];
      for (let k = 0; k < winLength; k++) {
        line.push((row + k) * size + col);
      }
      
      const first = board[line[0]];
      if (first && line.every(index => board[index] === first)) {
        return { winner: first, line };
      }
    }
  }

  // Проверка диагоналей (слева направо)
  for (let row = 0; row <= size - winLength; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      const line = [];
      for (let k = 0; k < winLength; k++) {
        line.push((row + k) * size + col + k);
      }
      
      const first = board[line[0]];
      if (first && line.every(index => board[index] === first)) {
        return { winner: first, line };
      }
    }
  }

  // Проверка диагоналей (справа налево)
  for (let row = 0; row <= size - winLength; row++) {
    for (let col = winLength - 1; col < size; col++) {
      const line = [];
      for (let k = 0; k < winLength; k++) {
        line.push((row + k) * size + col - k);
      }
      
      const first = board[line[0]];
      if (first && line.every(index => board[index] === first)) {
        return { winner: first, line };
      }
    }
  }

  // Проверка на ничью
  if (board.every(cell => cell !== null)) {
    return { winner: "draw", line: null };
  }

  return { winner: null, line: null };
}

export function getAvailableMoves(board: Board): number[] {
  return board.map((cell, index) => cell === null ? index : -1).filter(i => i !== -1);
}

export function getBoardIndices(size: number): number[] {
  return Array.from({ length: size * size }, (_, i) => i);
}

export function getRowCol(index: number, size: number): { row: number; col: number } {
  return {
    row: Math.floor(index / size),
    col: index % size,
  };
}
