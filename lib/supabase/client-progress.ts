import { createClient } from "./client"
import { isGuestModeEnabled } from "./client-guest"

export const recordGameProgress = async (gameId: string, score: number, win: boolean) => {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    handleGuestGameProgress(gameId, win)
    return
  }

  await updateUserGameStats(supabase, user.id, gameId, win)

  if (win) {
    await updateUserMasteryAndGlory(supabase, user.id)
  }
}

function handleGuestGameProgress(gameId: string, win: boolean) {
  if (typeof window !== "undefined" && isGuestModeEnabled()) {
    const guestProgress = JSON.parse(localStorage.getItem("brain_battle_guest_progress") || "{}")
    if (!guestProgress[gameId]) {
      guestProgress[gameId] = { wins: 0, losses: 0, draws: 0, rating: 1000 }
    }
    guestProgress[gameId].wins += win ? 1 : 0
    guestProgress[gameId].losses += win ? 0 : 1
    guestProgress[gameId].rating += win ? 10 : -5
    localStorage.setItem("brain_battle_guest_progress", JSON.stringify(guestProgress))
  }
}

async function updateUserGameStats(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  gameId: string,
  win: boolean,
) {
  const { data: existingStats } = await supabase
    .from("user_game_stats")
    .select("*")
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .maybeSingle()

  const updates = {
    user_id: userId,
    game_id: gameId,
    wins: existingStats ? existingStats.wins + (win ? 1 : 0) : win ? 1 : 0,
    losses: existingStats ? existingStats.losses + (win ? 0 : 1) : win ? 0 : 1,
    draws: existingStats ? existingStats.draws : 0,
    rating: existingStats ? existingStats.rating + (win ? 10 : -5) : win ? 1000 : 900,
    updated_at: new Date().toISOString(),
  }

  if (existingStats) {
    await supabase.from("user_game_stats").update(updates).eq("id", existingStats.id)
  } else {
    await supabase.from("user_game_stats").insert({
      ...updates,
      created_at: new Date().toISOString(),
    })
  }
}

async function updateUserMasteryAndGlory(supabase: ReturnType<typeof createClient>, userId: string) {
  await supabase.rpc("update_mastery_on_win", { p_user_id: userId })
  await supabase.rpc("update_glory_on_win", { p_user_id: userId })
}

export const autoSaveProgress = async (gameState: Record<string, unknown>) => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    handleGuestAutoSave(gameState)
    return
  }

  await saveUserProgress(supabase, user.id, gameState)
}

function handleGuestAutoSave(gameState: Record<string, unknown>) {
  if (typeof window !== "undefined" && isGuestModeEnabled()) {
    const guestSaves = JSON.parse(localStorage.getItem("brain_battle_guest_saves") || "{}")
    guestSaves[Date.now()] = {
      gameState,
      timestamp: new Date().toISOString(),
    }
    const keys = Object.keys(guestSaves)
      .sort((a, b) => Number(b) - Number(a))
      .slice(0, 10)
    const recentSaves: Record<string, unknown> = {}
    keys.forEach((key) => {
      recentSaves[key] = guestSaves[key]
    })
    localStorage.setItem("brain_battle_guest_saves", JSON.stringify(recentSaves))
  }
}

async function saveUserProgress(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  gameState: Record<string, unknown>,
) {
  try {
    const { data: existingProgress } = await supabase
      .from("user_game_progress")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle()

    if (existingProgress) {
      await supabase
        .from("user_game_progress")
        .update({
          game_state: gameState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProgress.id)
    } else {
      await supabase.from("user_game_progress").insert({
        user_id: userId,
        game_state: gameState,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  } catch {}
}
