import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const finalUsername = username || email.split("@")[0] || `user_${Date.now()}`

    const supabase = await createClient()

    const { data: existingUsers } = await supabase
      .from("users")
      .select("auth_id, email")
      .eq("email", email)
      .maybeSingle()

    if (existingUsers) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        user: signInData.user,
        session: signInData.session,
      })
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: finalUsername,
          full_name: finalUsername,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const user = authData.user

    if (!user) {
      return NextResponse.json({ error: "User not created" }, { status: 500 })
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return NextResponse.json({ error: "Failed to sign in after registration" }, { status: 500 })
    }

    const { error: profileError } = await supabase.from("users").upsert({
      auth_id: user.id,
      email: user.email,
      username: finalUsername.substring(0, 20),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalUsername}`,
      avatar_frame: "none",
      nickname_style: "normal",
      language: "ru",
      sound_enabled: true,
      music_enabled: true,
      isGuest: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
    }

    try {
      await supabase.from("mastery").upsert({
        user_id: user.id,
        level: 1,
        mini_level: 0,
        fragments: 0,
        total_wins: 0,
        created_at: new Date().toISOString(),
      })

      await supabase.from("glory").upsert({
        user_id: user.id,
        level: 1,
        wins: 0,
        total_glory_wins: 0,
        created_at: new Date().toISOString(),
      })
    } catch {
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: finalUsername,
      },
      session: signInData.session,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
