export interface Profile {
  id: string
  auth_id: string
  username: string
  email: string
  avatar_url?: string
  avatar_frame?: string
  nickname_style?: string
  isGuest: boolean
  sound_enabled: boolean
  music_enabled: boolean
  language: string
  created_at: string
  updated_at: string
}

export interface Mastery {
  id: string
  user_id: string
  level: number
  mini_level: number
  fragments: number
  total_wins: number
  created_at: string
  updated_at: string
}

export interface Glory {
  id: string
  user_id: string
  level: number
  wins: number
  total_glory_wins: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  user_metadata?: Record<string, unknown>
}
