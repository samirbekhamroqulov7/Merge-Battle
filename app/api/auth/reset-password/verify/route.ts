import { NextResponse } from "next/server"
import { validatePassword } from "@/lib/auth/validation"
import { hashPassword } from "@/lib/auth/password"
import { getResetToken, markTokenAsUsed } from "@/lib/database/reset-tokens"
import { updateUserPassword } from "@/lib/database/users"

export async function POST(request: Request) {
  try {
    const { code, email, newPassword } = await request.json()

    if (!code || !email || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    // Get reset token
    const resetToken = await getResetToken(code)

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ error: "Code has expired" }, { status: 400 })
    }

    // Check if email matches
    if (resetToken.email !== email) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 })
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update password
    await updateUserPassword(email, passwordHash)

    // Mark token as used
    await markTokenAsUsed(code)

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("[v0] Reset verify error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
