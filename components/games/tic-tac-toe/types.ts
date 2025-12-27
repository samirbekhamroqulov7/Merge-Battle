export type Player = "X" | "O" | null;
export type Board = Player[];
export type GameMode = "3x3" | "5x5" | "7x7";
export type AILevel = "easy" | "normal" | "hard";
export type Screen = "mode" | "game" | "settings";

export interface GameState {
  board: Board;
  currentPlayer: "X" | "O";
  winner: Player | "draw" | null;
  winningLine: number[] | null;
  gameMode: GameMode;
  aiLevel: AILevel;
  isGameActive: boolean;
}

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  streak: number;
}

export interface Cell3D {
  x: number;
  y: number;
  z: number;
  index: number;
  value: Player;
}
