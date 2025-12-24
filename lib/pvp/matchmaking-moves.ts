"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function makeMove(matchId: string, move: any) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userId = user?.id || `guest_${Date.now()}`

  if (matchId.startsWith("guest_match_")) {
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
