import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database/client"
import { generateVerificationCode, sendVerificationEmail } from "@/lib/auth/validation"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const sql = getDatabase()

    // Check if user exists and not verified
    const [user] = await sql`
      SELECT id, email, username, is_verified 
      FROM users 
      WHERE email = ${email} 
      LIMIT 1
    `

    if (!user) {
      return NextResponse.json({ 
        error: "Пользователь не найден" 
      }, { status: 404 })
    }

    if (user.is_verified) {
      return NextResponse.json({ 
        error: "Аккаунт уже подтвержден" 
      }, { status: 400 })
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode()
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode)
    
    if (!emailSent) {
      return NextResponse.json({ error: "Не удалось отправить код подтверждения" }, { status: 500 })
    }

    // Delete old verification codes for this user
    await sql`
      DELETE FROM verification_codes 
      WHERE user_id = ${user.id} OR email = ${email}
    `

    // Save new verification code
    await sql`
      INSERT INTO verification_codes (
        user_id, code, email, expires_at
      )
      VALUES (
        ${user.id},
        ${verificationCode},
        ${email},
        ${new Date(Date.now() + 10 * 60 * 1000).toISOString()} -- 10 минут
      )
    `

    return NextResponse.json({
      success: true,
      message: "Новый код подтверждения отправлен на ваш email"
    })
  } catch (error) {
    console.error("[v0] Resend verification error:", error)
    return NextResponse.json({ error: "Failed to resend verification code" }, { status: 500 })
  }
}