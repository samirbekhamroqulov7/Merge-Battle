"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Server action: makeMove
 * - на сервере обновляет состояние матча
 * - перезапрашивает статистику игрока при завершении
 * - вызывает revalidatePath для актуализации страницы
 */

export async function makeMove(matchId: string, move: any) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userId = user?.id || `guest_${Date.now()}`

  // Гостевые локальные матчи (не в БД) — быстрый ответ
  if (matchId.startsWith("guest_match_")) {
    return { success: true, result: { finished: false, winner: null } }
  }

  const { data: match, error: matchError } = await supabase.from("matches").select("*").eq("id", matchId).single()

  if (matchError) throw matchError
  if (!match) throw new Error("Match not found")

  // простая проверка очередности
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

    // Обновляем статистику победителя/проигравшего (если есть аутентифицированный игрок)
    if (result.winner) {
      try {
        await updatePlayerStats(
          result.winner === "player1" ? match.player1_id : match.player2_id,
          result.winner === "player1" ? match.player2_id : match.player1_id,
          match.game_type,
        )
      } catch (e) {
        // лог ошибки, но не ломаем основной поток
        console.error("[v0] updatePlayerStats failed:", e)
      }
    }
  }

  const { error: updateError } = await supabase.from("matches").update(updateData).eq("id", matchId)
  if (updateError) throw updateError

  // Обновим кэш/SSR страницу
  try {
    revalidatePath(`/pvp/match/${matchId}`)
  } catch (e) {
    // revalidatePath доступна только в Next/новых версиях, может быть безопасно проигнорировать
  }

  return { success: true, result }
}

/**
 * applyMove: простая логика применения хода в зависимости от типа игры
 * (поддерживает несколько типов; при необходимости расширяйте)
 */
function applyMove(gameState: any, move: any, gameType: string): any {
  switch (gameType) {
    case "tic-tac-toe": {
      const board = Array.isArray(gameState.board) ? [...gameState.board] : Array(9).fill(null)
      board[move.index] = gameState.currentPlayer
      return {
        ...gameState,
        board,
        currentPlayer: gameState.currentPlayer === "X" ? "O" : "X",
      }
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

/**
 * checkGameResult: простая проверка для tic-tac-toe; для прочих игр — placeholder
 */
function checkGameResult(gameState: any, gameType: string): { finished: boolean; winner: string | null } {
  switch (gameType) {
    case "tic-tac-toe": {
      const board = gameState.board || []
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
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          // определить кто выиграл — player1 или player2
          // Предположим: X — player1, O — player2 (унификация зависит от вашего кода)
          const winner = board[a] === "X" ? "player1" : "player2"
          return { finished: true, winner }
        }
      }
      if (board.every((cell: any) => cell !== null)) {
        return { finished: true, winner: null } // ничья
      }
      return { finished: false, winner: null }
    }
    default:
      return { finished: false, winner: null }
  }
}

/**
 * updatePlayerStats: простой пример обновления статистики побед/проигрышей
 * Расширяйте логику в соответствии с вашими функциями и вызовами RPC
 */
async function updatePlayerStats(winnerId: string, loserId: string, gameType: string) {
  const supabase = await createClient()

  // Увеличиваем wins/ losses в player_stats
  await supabase.from("player_stats").upsert(
    { user_id: winnerId, wins: 1, rating: 1000 },
    { onConflict: "user_id", returning: "minimal" },
  )

  await supabase.from("player_stats").upsert(
    { user_id: loserId, losses: 1, rating: 1000 },
    { onConflict: "user_id", returning: "minimal" },
  )

  // Вызов процедур update_mastery_on_win / update_glory_on_win через RPC, если требуется
  try {
    await supabase.rpc("update_mastery_on_win", { p_user_id: winnerId })
  } catch (e) {
    // возможно функция не настроена — игнорируем с логом
    console.warn("[v0] rpc update_mastery_on_win failed:", e)
  }

  try {
    await supabase.rpc("update_glory_on_win", { p_user_id: winnerId })
  } catch (e) {
    console.warn("[v0] rpc update_glory_on_win failed:", e)
  }
}