import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle()

    const { data: mastery } = await supabase
      .from("mastery")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    const { data: glory } = await supabase
      .from("glory")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...profile
      },
      profile,
      mastery,
      glory
    })
  } catch (error) {
    console.error("[v0] /api/auth/me error:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}