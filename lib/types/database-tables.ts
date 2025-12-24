import type { Json } from "./database-json"

export interface UsersTable {
  Row: {
    id: string
    auth_id: string
    username: string
    email: string
    avatar_url: string | null
    avatar_frame: string
    nickname_style: string
    language: string
    sound_enabled: boolean
    music_enabled: boolean
    isGuest: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    auth_id: string
    username: string
    email: string
    avatar_url?: string | null
    avatar_frame?: string
    nickname_style?: string
    language?: string
    sound_enabled?: boolean
    music_enabled?: boolean
    isGuest?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    auth_id?: string
    username?: string
    email?: string
    avatar_url?: string | null
    avatar_frame?: string
    nickname_style?: string
    language?: string
    sound_enabled?: boolean
    music_enabled?: boolean
    isGuest?: boolean
    created_at?: string
    updated_at?: string
  }
}

export interface UserDevicesTable {
  Row: {
    id: string
    user_id: string
    device_info: Json
    created_at: string
  }
  Insert: {
    id?: string
    user_id: string
    device_info: Json
    created_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    device_info?: Json
    created_at?: string
  }
}

export interface UserPurchasesTable {
  Row: {
    id: string
    user_id: string
    item_type: string
    item_id: string
    item_name: string
    price: number
    currency: string
    status: string
    payment_method: string
    created_at: string
  }
  Insert: {
    id?: string
    user_id: string
    item_type: string
    item_id: string
    item_name: string
    price: number
    currency?: string
    status?: string
    payment_method?: string
    created_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    item_type?: string
    item_id?: string
    item_name?: string
    price?: number
    currency?: string
    status?: string
    payment_method?: string
    created_at?: string
  }
}

export interface UserGameProgressTable {
  Row: {
    id: string
    user_id: string
    game_state: Json
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    game_state: Json
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    game_state?: Json
    created_at?: string
    updated_at?: string
  }
}

export interface MasteryTable {
  Row: {
    id: string
    user_id: string
    level: number
    mini_level: number
    fragments: number
    total_wins: number
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    level?: number
    mini_level?: number
    fragments?: number
    total_wins?: number
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    level?: number
    mini_level?: number
    fragments?: number
    total_wins?: number
    created_at?: string
    updated_at?: string
  }
}

export interface GloryTable {
  Row: {
    id: string
    user_id: string
    level: number
    wins: number
    total_glory_wins: number
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    level?: number
    wins?: number
    total_glory_wins?: number
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    level?: number
    wins?: number
    total_glory_wins?: number
    created_at?: string
    updated_at?: string
  }
}
