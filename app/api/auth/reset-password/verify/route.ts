import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json()

    console.log("[v0] Verifying reset code for:", email)

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Email, code, and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const supabase = await createClient()

    // Find valid reset code
    const { data: resetCode } = await supabase
      .from("password_reset_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!resetCode) {
      console.log("[v0] Invalid or expired reset code")
      return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 })
    }

    console.log("[v0] Valid reset code found, updating password")

    // Get user's auth_id
    const { data: user } = await supabase.from("users").select("auth_id").eq("email", email).maybeSingle()

    if (!user || !user.auth_id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update password in Supabase Auth using admin API
    // Note: This requires service role key, so we'll use the auth.updateUser method
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.auth_id, { password: newPassword })

    if (updateError) {
      console.error("[v0] Failed to update password:", updateError)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    // Mark code as used
    await supabase.from("password_reset_codes").update({ used: true }).eq("id", resetCode.id)

    console.log("[v0] Password updated successfully")

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("[v0] Password reset verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
