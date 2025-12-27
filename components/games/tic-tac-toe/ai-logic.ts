import { Board, GameMode, AILevel } from "./types";
import { checkWinner, getAvailableMoves, getBoardSize } from "./game-logic";

// Оценка позиции для минимакса
function evaluatePosition(board: Board, player: "X" | "O", mode: GameMode): number {
  const size = getBoardSize(mode);
  const winLength = mode === "3x3" ? 3 : mode === "5x5" ? 4 : 5;
  let score = 0;

  // Оцениваем все возможные линии
  const evaluateLine = (cells: ("X" | "O" | null)[]) => {
    const playerCount = cells.filter(cell => cell === player).length;
    const opponentCount = cells.filter(cell => cell === (player === "X" ? "O" : "X")).length;
    const emptyCount = cells.filter(cell => cell === null).length;

    if (playerCount === winLength) return 10000;
    if (opponentCount === winLength) return -10000;
    if (opponentCount === winLength - 1 && emptyCount === 1) return -5000;
    if (playerCount === winLength - 1 && emptyCount === 1) return 5000;
    if (playerCount === winLength - 2 && emptyCount === 2) return 100;
    if (opponentCount === winLength - 2 && emptyCount === 2) return -100;
    if (playerCount > 0 && opponentCount === 0) return playerCount * 10;
    if (opponentCount > 0 && playerCount === 0) return -opponentCount * 10;
    return 0;
  };

  // Горизонтали
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      const cells = [];
      for (let k = 0; k < winLength; k++) {
        cells.push(board[row * size + col + k]);
      }
      score += evaluateLine(cells);
    }
  }

  // Вертикали
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winLength; row++) {
      const cells = [];
      for (let k = 0; k < winLength; k++) {
        cells.push(board[(row + k) * size + col]);
      }
      score += evaluateLine(cells);
    }
  }

  // Диагонали (слева направо)
  for (let row = 0; row <= size - winLength; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      const cells = [];
      for (let k = 0; k < winLength; k++) {
        cells.push(board[(row + k) * size + col + k]);
      }
      score += evaluateLine(cells);
    }
  }

  // Диагонали (справа налево)
  for (let row = 0; row <= size - winLength; row++) {
    for (let col = winLength - 1; col < size; col++) {
      const cells = [];
      for (let k = 0; k < winLength; k++) {
        cells.push(board[(row + k) * size + col - k]);
      }
      score += evaluateLine(cells);
    }
  }

  // Центр важнее углов
  const center = Math.floor(size / 2);
  if (board[center * size + center] === player) score += 50;

  return score;
}

// Минимакс алгоритм
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  player: "X" | "O",
  mode: GameMode,
  maxDepth: number
): { score: number; index: number | null } {
  const winner = checkWinner(board, mode);
  const availableMoves = getAvailableMoves(board);

  if (winner.winner === player) return { score: 10000 - depth, index: null };
  if (winner.winner === (player === "X" ? "O" : "X")) return { score: -10000 + depth, index: null };
  if (winner.winner === "draw") return { score: 0, index: null };
  if (depth >= maxDepth || availableMoves.length === 0) {
    return { score: evaluatePosition(board, player, mode), index: null };
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = player;
      const result = minimax(newBoard, depth + 1, false, alpha, beta, player, mode, maxDepth);
      
      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }

    return { score: bestScore, index: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = player === "X" ? "O" : "X";
      const result = minimax(newBoard, depth + 1, true, alpha, beta, player, mode, maxDepth);
      
      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }
      
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }

    return { score: bestScore, index: bestMove };
  }
}

// Основная функция для хода ИИ
export function makeAIMove(
  board: Board,
  aiLevel: AILevel,
  mode: GameMode,
  currentPlayer: "X" | "O"
): number {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return -1;

  const size = getBoardSize(mode);
  const center = Math.floor(size / 2);
  const centerIndex = center * size + center;

  // Easy - случайные ходы с базовой логикой
  if (aiLevel === "easy") {
    // 80% случайных, 20% умных
    if (Math.random() < 0.8) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }

  // Normal - минимакс с ограниченной глубиной
  if (aiLevel === "normal") {
    const maxDepth = size <= 3 ? 6 : size <= 5 ? 4 : 3;
    const result = minimax(board, 0, true, -Infinity, Infinity, currentPlayer, mode, maxDepth);
    return result.index !== null ? result.index : availableMoves[0];
  }

  // Hard - агрессивный минимакс
  if (aiLevel === "hard") {
    const maxDepth = size <= 3 ? 9 : size <= 5 ? 6 : 4;
    const result = minimax(board, 0, true, -Infinity, Infinity, currentPlayer, mode, maxDepth);
    return result.index !== null ? result.index : availableMoves[0];
  }

  // Базовые стратегии для всех уровней
  const aiSymbol = currentPlayer;
  const playerSymbol = currentPlayer === "X" ? "O" : "X";

  // 1. Попробовать выиграть
  // 2. Блокировать игрока
  // 3. Занимать центр
  if (board[centerIndex] === null) return centerIndex;

  // 4. Случайный ход
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}
