import { getDatabase } from "./client"

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

export async function createMastery(userId: string) {
  const sql = getDatabase()

  const [mastery] = await sql`
    INSERT INTO mastery (user_id, level, mini_level, fragments, total_wins)
    VALUES (${userId}, 1, 0, 0, 0)
    RETURNING *
  `

  return mastery as Mastery
}

export async function getMasteryByUserId(userId: string) {
  const sql = getDatabase()

  const [mastery] = await sql`
    SELECT * FROM mastery WHERE user_id = ${userId} LIMIT 1
  `

  return mastery as Mastery | undefined
}

export async function createGlory(userId: string) {
  const sql = getDatabase()

  const [glory] = await sql`
    INSERT INTO glory (user_id, level, wins, total_glory_wins)
    VALUES (${userId}, 1, 0, 0)
    RETURNING *
  `

  return glory
}

export async function getGloryByUserId(userId: string) {
  const sql = getDatabase()

  const [glory] = await sql`
    SELECT * FROM glory WHERE user_id = ${userId} LIMIT 1
  `

  return glory
}
