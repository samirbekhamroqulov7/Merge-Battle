"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type MatchmakingStatus = "idle" | "searching" | "found" | "playing" | "finished"

export interface MatchData {
  id: string
  player1_id: string
  player2_id: string
  game_type: string
  status: string
  current_turn: string
  game_state: any
  winner_id: string | null
  created_at: string
}

export async function findMatch(gameType?: string, mode: "normal" | "triple" | "five" = "normal") {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  const userId = user?.id || `guest_${Date.now()}`
  const playerRating = 1000

  if (!user) {
    return {
      status: "found" as const,
      match: {
        id: `guest_match_${Date.now()}`,
        player1_id: userId,
        player2_id: `ai_${Math.random().toString(36).substr(2, 9)}`,
        game_type: gameType || "tic-tac-toe",
        mode: mode,
        status: "playing",
        current_turn: userId,
        game_state: initializeGameState(gameType || "tic-tac-toe"),
        round: 1,
        player1_wins: 0,
        player2_wins: 0,
        created_at: new Date().toISOString(),
      }
    }
  }

  const { data: playerStats } = await supabase.from("player_stats").select("*").eq("user_id", user.id).single()

  const actualRating = playerStats?.rating || 1000

  const { data: queueEntry } = await supabase
    .from("matchmaking_queue")
    .upsert(
      {
        user_id: user.id,
        rating: actualRating,
        game_type: gameType || "random",
        mode: mode,
        status: "searching",
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )
    .select()
    .single()

  const { data: opponents } = await supabase
    .from("matchmaking_queue")
    .select("*")
    .neq("user_id", user.id)
    .eq("status", "searching")
    .eq("mode", mode)
    .gte("rating", actualRating - 100)
    .lte("rating", actualRating + 100)
    .order("created_at", { ascending: true })
    .limit(1)

  if (opponents && opponents.length > 0) {
    const opponent = opponents[0]

    const games = [
      "tic-tac-toe",
      "chess",
      "checkers",
      "sudoku",
      "puzzle-15",
      "crossword",
      "anagrams",
      "math-duel",
      "dots",
      "flags-quiz",
    ]
    const selectedGame = gameType || games[Math.floor(Math.random() * games.length)]

    const { data: match } = await supabase
      .from("matches")
      .insert({
        player1_id: user.id,
        player2_id: opponent.user_id,
        game_type: selectedGame,
        mode: mode,
        status: "playing",
        current_turn: user.id,
        game_state: initializeGameState(selectedGame),
        round: 1,
        player1_wins: 0,
        player2_wins: 0,
      })
      .select()
      .single()

    await supabase.from("matchmaking_queue").delete().in("user_id", [user.id, opponent.user_id])

    return { status: "found" as const, match }
  }

  return { status: "searching" as const, queuePosition: 1 }
}

export async function cancelSearch() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { status: "cancelled" }

  await supabase.from("matchmaking_queue").delete().eq("user_id", user.id)

  return { status: "cancelled" }
}

function initializeGameState(gameType: string): any {
  switch (gameType) {
    case "tic-tac-toe":
      return { board: Array(9).fill(null), currentPlayer: "X" }
    case "chess":
      return { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" }
    case "checkers":
      return initializeCheckersBoard()
    case "sudoku":
      return { puzzle: generateSudokuPuzzle(), solution: null }
    case "puzzle-15":
      return { tiles: generatePuzzle15() }
    case "dots":
      return { horizontalLines: [], verticalLines: [], boxes: [], scores: { p1: 0, p2: 0 } }
    case "math-duel":
      return { problems: generateMathProblems(10), currentProblem: 0, scores: { p1: 0, p2: 0 } }
    case "flags-quiz":
      return { questions: generateFlagsQuestions(10), currentQuestion: 0, scores: { p1: 0, p2: 0 } }
    case "anagrams":
      return { words: generateAnagramWords(10), currentWord: 0, scores: { p1: 0, p2: 0 } }
    case "crossword":
      return { grid: generateCrosswordGrid(), clues: [], scores: { p1: 0, p2: 0 } }
    default:
      return {}
  }
}

function initializeCheckersBoard() {
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

function generateSudokuPuzzle() {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(0))
}

function generatePuzzle15() {
  const tiles = Array.from({ length: 15 }, (_, i) => i + 1)
  tiles.push(0)
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }
  return tiles
}

function generateMathProblems(count: number) {
  const problems = []
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 20) + 1
    const b = Math.floor(Math.random() * 20) + 1
    const ops = ["+", "-", "*"]
    const op = ops[Math.floor(Math.random() * ops.length)]
    let answer: number
    switch (op) {
      case "+":
        answer = a + b
        break
      case "-":
        answer = a - b
        break
      case "*":
        answer = a * b
        break
      default:
        answer = a + b
    }
    problems.push({ a, b, op, answer, question: `${a} ${op} ${b} = ?` })
  }
  return problems
}

function generateFlagsQuestions(count: number) {
  const countries = [
    { code: "RU", name: "Россия" },
    { code: "US", name: "США" },
    { code: "GB", name: "Великобритания" },
    { code: "FR", name: "Франция" },
    { code: "DE", name: "Германия" },
    { code: "JP", name: "Япония" },
    { code: "CN", name: "Китай" },
    { code: "BR", name: "Бразилия" },
    { code: "IN", name: "Индия" },
    { code: "IT", name: "Италия" },
    { code: "ES", name: "Испания" },
    { code: "KR", name: "Южная Корея" },
    { code: "CA", name: "Канада" },
    { code: "AU", name: "Австралия" },
    { code: "MX", name: "Мексика" },
    { code: "NL", name: "Нидерланды" },
  ]
  const shuffled = [...countries].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((c) => ({
    countryCode: c.code,
    correctAnswer: c.name,
    options: getRandomOptions(
      c.name,
      countries.map((x) => x.name),
    ),
  }))
}

function getRandomOptions(correct: string, all: string[]) {
  const others = all
    .filter((x) => x !== correct)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  const options = [correct, ...others].sort(() => Math.random() - 0.5)
  return options
}

function generateAnagramWords(count: number) {
  const words = [
    "ПРОГРАММА",
    "КОМПЬЮТЕР",
    "ИНТЕРНЕТ",
    "ТЕЛЕФОН",
    "МОНИТОР",
    "КЛАВИША",
    "МЫШКА",
    "ПРИНТЕР",
    "СКАНЕР",
    "КОЛОНКИ",
  ]
  return words.slice(0, count).map((word) => ({
    original: word,
    scrambled: word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join(""),
  }))
}

function generateCrosswordGrid() {
  return Array(10)
    .fill(null)
    .map(() => Array(10).fill(""))
}

export async function makeMove(matchId: string, move: any) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userId = user?.id || `guest_${Date.now()}`

  if (matchId.startsWith('guest_match_')) {
    return { success: true, result: { finished: false, winner: null } }
  }

  const { data: match } = await supabase.from("matches").select("*").eq("id", matchId).single()

  if (!match) throw new Error("Match not found")
  if (match.current_turn !== userId) throw new Error("Not your turn")

  const newGameState = applyMove(match.game_state, move, match.game_type)
  const result = checkGameResult(newGameState, match.game_type)

  const nextTurn = match.current_turn === match.player1_id ? match.player2_id : match.player1_id

  const updateData: any = {
    game_state: newGameState,
    current_turn: nextTurn,
    updated_at: new Date().toISOString(),
  }

  if (result.finished) {
    updateData.status = "finished"
    updateData.winner_id =
      result.winner === "player1" ? match.player1_id : result.winner === "player2" ? match.player2_id : null

    if (result.winner && user) {
      await updatePlayerStats(
        result.winner === "player1" ? match.player1_id : match.player2_id,
        result.winner === "player1" ? match.player2_id : match.player1_id,
        match.game_type,
      )
    }
  }

  await supabase.from("matches").update(updateData).eq("id", matchId)

  revalidatePath(`/pvp/match/${matchId}`)
  return { success: true, result }
}

function applyMove(gameState: any, move: any, gameType: string): any {
  switch (gameType) {
    case "tic-tac-toe":
      const newBoard = [...gameState.board]
      newBoard[move.index] = gameState.currentPlayer
      return {
        board: newBoard,
        currentPlayer: gameState.currentPlayer === "X" ? "O" : "X",
      }
    case "dots":
      return { ...gameState, ...move }
    case "math-duel":
    case "flags-quiz":
    case "anagrams":
      return { ...gameState, ...move }
    default:
      return { ...gameState, ...move }
  }
}

function checkGameResult(gameState: any, gameType: string): { finished: boolean; winner: string | null } {
  switch (gameType) {
    case "tic-tac-toe":
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ]
      for (const [a, b, c] of lines) {
        if (
          gameState.board[a] &&
          gameState.board[a] === gameState.board[b] &&
          gameState.board[a] === gameState.board[c]
        ) {
          return { finished: true, winner: gameState.board[a] === "X" ? "player1" : "player2" }
        }
      }
      if (gameState.board.every((cell: any) => cell !== null)) {
        return { finished: true, winner: null }
      }
      return { finished: false, winner: null }
    default:
      return { finished: false, winner: null }
  }
}

async function updatePlayerStats(winnerId: string, loserId: string, gameType: string) {
  const supabase = await createClient()

  await supabase.rpc("increment_wins", {
    p_user_id: winnerId,
    p_game_type: gameType,
  })

  await supabase.rpc("increment_losses", {
    p_user_id: loserId,
    p_game_type: gameType,
  })
}
