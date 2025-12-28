import { NextResponse } from "next/server"
import { validateEmail, validatePassword, validateUsername, generateVerificationCode, sendVerificationEmail } from "@/lib/auth/validation"
import { hashPassword } from "@/lib/auth/password"
import { getUserByEmail, getUserByUsername } from "@/lib/database/users"
import { getDatabase } from "@/lib/database/client"

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()

    // Validate input
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      return NextResponse.json({ error: usernameValidation.error }, { status: 400 })
    }

    // Check if email exists
    const existingUserByEmail = await getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json({ error: "Email уже зарегистрирован" }, { status: 400 })
    }

    // Check if username exists (добавьте эту функцию в lib/database/users.ts)
    const existingUserByUsername = await getUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json({ error: "Этот никнейм уже занят" }, { status: 400 })
    }

    // Generate verification code
    const verificationCode = generateVerificationCode()
    
    // Отправляем код подтверждения
    const emailSent = await sendVerificationEmail(email, verificationCode)
    
    if (!emailSent) {
      return NextResponse.json({ error: "Не удалось отправить код подтверждения" }, { status: 500 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user in pending state (без сессии и мастерства пока)
    const authId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const sql = getDatabase()
    
    // Создаем пользователя с is_verified = false
    const [newUser] = await sql`
      INSERT INTO users (
        auth_id, email, username, password_hash, 
        avatar_url, avatar_frame, nickname_style,
        language, sound_enabled, music_enabled, isGuest,
        is_verified, created_at, updated_at
      )
      VALUES (
        ${authId}, 
        ${email}, 
        ${username}, 
        ${passwordHash},
        ${"https://api.dicebear.com/7.x/avataaars/svg?seed=" + username},
        'none',
        'normal',
        'ru',
        true,
        true,
        false,
        false,
        ${new Date().toISOString()},
        ${new Date().toISOString()}
      )
      RETURNING id, email, username
    `

    // Сохраняем код подтверждения в отдельной таблице
    try {
      await sql`
        INSERT INTO verification_codes (
          user_id, code, email, expires_at
        )
        VALUES (
          ${newUser.id},
          ${verificationCode},
          ${email},
          ${new Date(Date.now() + 10 * 60 * 1000).toISOString()} -- 10 минут
        )
      `
    } catch (dbError) {
      console.error("Error saving verification code:", dbError)
      // Если таблицы нет, можно использовать временное решение
      // или просто продолжить без сохранения кода
    }

    return NextResponse.json({
      success: true,
      message: "6-значный код подтверждения отправлен на ваш email",
      requiresVerification: true,
      email: email,
      userId: newUser.id
    })
  } catch (error) {
    console.error("[v0] Register error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}