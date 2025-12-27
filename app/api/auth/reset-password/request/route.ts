import { NextResponse } from "next/server"
import { validateEmail } from "@/lib/auth/validation"
import { getUserByEmail } from "@/lib/database/users"
import { createResetToken } from "@/lib/database/reset-tokens"
import { generateVerificationCode } from "@/lib/auth/password"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    // Get user
    const user = await getUserByEmail(email)
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset code has been sent",
      })
    }

    // Generate verification code
    const code = generateVerificationCode()

    // Save reset token
    await createResetToken(user.id, email, code)

    // Log the code (in production, send via email)
    console.log(`[v0] Password reset code for ${email}: ${code}`)

    // TODO: Send email with code
    // await sendPasswordResetEmail(email, code)

    return NextResponse.json({
      success: true,
      message: "Reset code sent to email",
      // Remove this in production
      code: process.env.NODE_ENV === "development" ? code : undefined,
    })
  } catch (error) {
    console.error("[v0] Reset request error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
