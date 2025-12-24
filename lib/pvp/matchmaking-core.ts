"use server"

import { createClient } from "@/lib/supabase/server"

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

  if (!user) {
    const { initializeGameState } = await import("./matchmaking-game-init")
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
      },
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
    const { initializeGameState } = await import("./matchmaking-game-init")

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
