import type { Json } from "./database-json"

export interface GamesTable {
  Row: {
    id: string
    slug: string
    name_key: string
    description_key: string | null
    icon: string | null
    is_pvp_enabled: boolean
    min_players: number
    max_players: number
    created_at: string
  }
  Insert: {
    id?: string
    slug: string
    name_key: string
    description_key?: string | null
    icon?: string | null
    is_pvp_enabled?: boolean
    min_players?: number
    max_players?: number
    created_at?: string
  }
  Update: {
    id?: string
    slug?: string
    name_key?: string
    description_key?: string | null
    icon?: string | null
    is_pvp_enabled?: boolean
    min_players?: number
    max_players?: number
    created_at?: string
  }
}

export interface MatchesTable {
  Row: {
    id: string
    game_id: string
    mode: string
    status: string
    winner_id: string | null
    created_at: string
    finished_at: string | null
    game_state: Json
  }
  Insert: {
    id?: string
    game_id: string
    mode: string
    status?: string
    winner_id?: string | null
    created_at?: string
    finished_at?: string | null
    game_state?: Json
  }
  Update: {
    id?: string
    game_id?: string
    mode?: string
    status?: string
    winner_id?: string | null
    created_at?: string
    finished_at?: string | null
    game_state?: Json
  }
}

export interface MatchParticipantsTable {
  Row: {
    id: string
    match_id: string
    user_id: string
    score: number
    is_ready: boolean
    joined_at: string
  }
  Insert: {
    id?: string
    match_id: string
    user_id: string
    score?: number
    is_ready?: boolean
    joined_at?: string
  }
  Update: {
    id?: string
    match_id?: string
    user_id?: string
    score?: number
    is_ready?: boolean
    joined_at?: string
  }
}

export interface MatchmakingQueueTable {
  Row: {
    id: string
    user_id: string
    mode: string
    rating: number
    joined_at: string
  }
  Insert: {
    id?: string
    user_id: string
    mode: string
    rating?: number
    joined_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    mode?: string
    rating?: number
    joined_at?: string
  }
}

export interface UserGameStatsTable {
  Row: {
    id: string
    user_id: string
    game_id: string
    wins: number
    losses: number
    draws: number
    rating: number
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    game_id: string
    wins?: number
    losses?: number
    draws?: number
    rating?: number
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    game_id?: string
    wins?: number
    losses?: number
    draws?: number
    rating?: number
    created_at?: string
    updated_at?: string
  }
}
