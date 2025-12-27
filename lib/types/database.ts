export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
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
      user_devices: {
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
      user_purchases: {
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
      user_game_progress: {
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
      mastery: {
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
      glory: {
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
      games: {
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
      matches: {
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
      match_participants: {
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
      matchmaking_queue: {
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
      user_game_stats: {
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
    }
    Functions: {
      update_mastery_on_win: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_glory_on_win: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
  }
}
