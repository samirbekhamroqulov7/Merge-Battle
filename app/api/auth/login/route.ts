import { NextResponse } from "next/server"
import { validateEmail, validatePassword } from "@/lib/auth/validation"
import { verifyPassword } from "@/lib/auth/password"
import { createSession } from "@/lib/auth/session"
import { getUserByEmail } from "@/lib/database/users"
import { getDatabase } from "@/lib/database/client"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    // Get user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 })
    }

    // Check if account is verified
    if (!user.is_verified) {
      return NextResponse.json({ 
        error: "Аккаунт не подтвержден. Проверьте email для кода подтверждения." 
      }, { status: 401 })
    }

    // Verify password
    if (!user.password_hash) {
      return NextResponse.json({ error: "Password not set for this account" }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 })
    }

    // Create game account if it doesn't exist
    const sql = getDatabase()
    
    // Check if mastery exists
    const [existingMastery] = await sql`
      SELECT id FROM mastery WHERE user_id = ${user.id} LIMIT 1
    `

    if (!existingMastery) {
      await sql`
        INSERT INTO mastery (
          user_id, level, mini_level, fragments, total_wins,
          created_at, updated_at
        )
        VALUES (
          ${user.id},
          1,
          0,
          0,
          0,
          NOW(),
          NOW()
        )
      `
    }

    // Check if glory exists
    const [existingGlory] = await sql`
      SELECT id FROM glory WHERE user_id = ${user.id} LIMIT 1
    `

    if (!existingGlory) {
      await sql`
        INSERT INTO glory (
          user_id, level, wins, total_glory_wins,
          created_at, updated_at
        )
        VALUES (
          ${user.id},
          1,
          0,
          0,
          NOW(),
          NOW()
        )
      `
    }

    // Create session
    await createSession(user.id, user.email, user.username, user.isGuest || false)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}