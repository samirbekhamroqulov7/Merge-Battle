import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    console.log("[v0] Password reset requested for:", email)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user exists
    const { data: user } = await supabase.from("users").select("id, email, username").eq("email", email).maybeSingle()

    if (!user) {
      // For security, don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a reset code",
      })
    }

    console.log("[v0] User found, generating reset code")

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store code in database
    const { error: insertError } = await supabase.from("password_reset_codes").insert({
      user_id: user.id,
      email: user.email,
      code: code,
      expires_at: expiresAt.toISOString(),
      used: false,
    })

    if (insertError) {
      console.error("[v0] Failed to store reset code:", insertError)
      return NextResponse.json({ error: "Failed to generate reset code" }, { status: 500 })
    }

    console.log("[v0] Reset code generated successfully")

    // TODO: Send email with code (for now just log it)
    console.log(`[v0] Reset code for ${email}: ${code}`)

    return NextResponse.json({
      success: true,
      message: "Reset code sent to your email",
      // In development, return code (REMOVE IN PRODUCTION!)
      ...(process.env.NODE_ENV === "development" && { devCode: code }),
    })
  } catch (error) {
    console.error("[v0] Password reset request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
