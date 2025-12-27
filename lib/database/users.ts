import { getDatabase } from "./client"

export interface User {
  id: string
  auth_id: string
  email: string
  username: string
  password_hash?: string
  avatar_url?: string
  avatar_frame?: string
  nickname_style?: string
  language?: string
  sound_enabled?: boolean
  music_enabled?: boolean
  isGuest?: boolean
  created_at?: string
  updated_at?: string
}

export async function createUser(user: {
  auth_id: string
  email: string
  username: string
  password_hash?: string
  isGuest?: boolean
}) {
  const sql = getDatabase()

  const [newUser] = await sql`
    INSERT INTO users (
      auth_id, email, username, password_hash, 
      avatar_url, avatar_frame, nickname_style,
      language, sound_enabled, music_enabled, isGuest
    )
    VALUES (
      ${user.auth_id}, 
      ${user.email}, 
      ${user.username}, 
      ${user.password_hash || null},
      ${"https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.username},
      'none',
      'normal',
      'ru',
      true,
      true,
      ${user.isGuest || false}
    )
    RETURNING *
  `

  return newUser as User
}

export async function getUserByEmail(email: string) {
  const sql = getDatabase()

  const [user] = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `

  return user as User | undefined
}

export async function getUserByAuthId(authId: string) {
  const sql = getDatabase()

  const [user] = await sql`
    SELECT * FROM users WHERE auth_id = ${authId} LIMIT 1
  `

  return user as User | undefined
}

export async function getUserById(id: string) {
  const sql = getDatabase()

  const [user] = await sql`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `

  return user as User | undefined
}

export async function updateUser(id: string, updates: Partial<User>) {
  const sql = getDatabase()

  const allowedFields = [
    "username",
    "avatar_url",
    "avatar_frame",
    "nickname_style",
    "language",
    "sound_enabled",
    "music_enabled",
  ]

  const updateFields: Record<string, unknown> = {}

  for (const key of allowedFields) {
    if (key in updates) {
      updateFields[key] = updates[key as keyof User]
    }
  }

  updateFields.updated_at = new Date().toISOString()

  const setClauses = Object.keys(updateFields)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(", ")
  const values = Object.values(updateFields)

  const [updatedUser] = await sql`
    UPDATE users 
    SET ${sql(updateFields)}
    WHERE id = ${id}
    RETURNING *
  `

  return updatedUser as User
}

export async function updateUserPassword(email: string, passwordHash: string) {
  const sql = getDatabase()

  await sql`
    UPDATE users 
    SET password_hash = ${passwordHash}, updated_at = NOW()
    WHERE email = ${email}
  `
}
