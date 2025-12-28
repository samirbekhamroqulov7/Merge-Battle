import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database/client"
import { createSession } from "@/lib/auth/session"
import { validateVerificationCode } from "@/lib/auth/validation"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    // Validate code format
    const codeValidation = validateVerificationCode(code)
    if (!codeValidation.valid) {
      return NextResponse.json({ error: codeValidation.error }, { status: 400 })
    }

    const sql = getDatabase()

    // Find verification code
    const [verification] = await sql`
      SELECT * FROM verification_codes 
      WHERE email = ${email} 
        AND code = ${code}
        AND expires_at > NOW()
        AND used = false
      LIMIT 1
    `

    if (!verification) {
      return NextResponse.json({ 
        error: "Неверный код или срок действия истек" 
      }, { status: 400 })
    }

    // Get user
    const [user] = await sql`
      SELECT * FROM users 
      WHERE email = ${email} AND is_verified = false
      LIMIT 1
    `

    if (!user) {
      return NextResponse.json({ 
        error: "Пользователь не найден или уже верифицирован" 
      }, { status: 404 })
    }

    // Mark code as used
    await sql`
      UPDATE verification_codes 
      SET used = true, updated_at = NOW()
      WHERE id = ${verification.id}
    `

    // Update user as verified
    await sql`
      UPDATE users 
      SET is_verified = true, updated_at = NOW()
      WHERE id = ${user.id}
    `

    // Create game account (mastery and glory)
    try {
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
    } catch (gameError) {
      console.error("Error creating game account:", gameError)
      // Continue even if game account creation fails
    }

    // Create session
    await createSession(user.id, user.email, user.username, false)

    return NextResponse.json({
      success: true,
      message: "Аккаунт успешно подтвержден и создан игровой профиль",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    })
  } catch (error) {
    console.error("[v0] Verify email error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}