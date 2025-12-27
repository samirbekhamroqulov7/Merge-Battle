import { NextResponse } from "next/server"
import { validateVerificationCode } from "@/lib/auth/validation"
import { createSession } from "@/lib/auth/session"
import { getDatabase } from "@/lib/database/client"
import { createMastery, createGlory } from "@/lib/database/mastery"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email и код обязательны" }, { status: 400 })
    }

    // Validate code format
    const codeValidation = validateVerificationCode(code)
    if (!codeValidation.valid) {
      return NextResponse.json({ error: codeValidation.error }, { status: 400 })
    }

    const sql = getDatabase()

    // Проверяем код
    const [verification] = await sql`
      SELECT vc.*, u.* 
      FROM verification_codes vc
      JOIN users u ON vc.user_id = u.id
      WHERE vc.email = ${email} 
        AND vc.code = ${code}
        AND vc.used = false
        AND vc.expires_at > NOW()
      LIMIT 1
    `

    if (!verification) {
      return NextResponse.json({ error: "Неверный или просроченный код" }, { status: 400 })
    }

    // Помечаем код как использованный
    await sql`
      UPDATE verification_codes 
      SET used = true 
      WHERE id = ${verification.id}
    `

    // Активируем пользователя
    await sql`
      UPDATE users 
      SET is_verified = true 
      WHERE id = ${verification.user_id}
    `

    // Создаем мастерство и славу
    await Promise.all([
      createMastery(verification.user_id),
      createGlory(verification.user_id)
    ])

    // Создаем сессию
    await createSession(
      verification.user_id, 
      verification.email, 
      verification.username, 
      false
    )

    return NextResponse.json({
      success: true,
      message: "Email успешно подтвержден",
      user: {
        id: verification.user_id,
        email: verification.email,
        username: verification.username,
      },
    })
  } catch (error) {
    console.error("[v0] Email verification error:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}