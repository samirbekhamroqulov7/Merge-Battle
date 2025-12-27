import { getDatabase } from "./client"

export interface ResetToken {
  id: string
  user_id: string
  email: string
  token: string
  expires_at: string
  used: boolean
  created_at: string
}

export async function createResetToken(userId: string, email: string, token: string) {
  const sql = getDatabase()

  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  const [resetToken] = await sql`
    INSERT INTO password_reset_tokens (user_id, email, token, expires_at)
    VALUES (${userId}, ${email}, ${token}, ${expiresAt})
    RETURNING *
  `

  return resetToken as ResetToken
}

export async function getResetToken(token: string) {
  const sql = getDatabase()

  const [resetToken] = await sql`
    SELECT * FROM password_reset_tokens 
    WHERE token = ${token} AND used = false
    LIMIT 1
  `

  return resetToken as ResetToken | undefined
}

export async function markTokenAsUsed(token: string) {
  const sql = getDatabase()

  await sql`
    UPDATE password_reset_tokens 
    SET used = true
    WHERE token = ${token}
  `
}

export async function deleteExpiredTokens() {
  const sql = getDatabase()

  await sql`
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW()
  `
}
