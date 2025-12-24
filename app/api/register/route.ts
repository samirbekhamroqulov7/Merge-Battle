import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()

    console.log("[v0] Registration started for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const finalUsername = username || email.split("@")[0] || `user_${Date.now()}`
    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("auth_id, email")
      .eq("email", email)
      .maybeSingle()

    // If user exists, just sign them in
    if (existingUser) {
      console.log("[v0] User exists, signing in")
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

    console.log("[v0] Creating new user")

    // Create new auth user with auto-confirm
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: finalUsername,
          full_name: finalUsername,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (authError) {
      console.error("[v0] Auth creation failed:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const user = authData.user

    if (!user) {
      return NextResponse.json({ error: "User not created" }, { status: 500 })
    }

    console.log("[v0] Auth user created, creating profile")

    // Create user profile
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
      console.error("[v0] Profile creation error:", profileError)
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
    }

    console.log("[v0] Profile created, initializing stats")

    // Initialize mastery and glory
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

      console.log("[v0] Stats initialized successfully")
    } catch (statsError) {
      console.error("[v0] Stats initialization error:", statsError)
      // Continue anyway
    }

    // Sign in immediately after registration
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error("[v0] Auto sign-in failed:", signInError)
      return NextResponse.json({
        success: true,
        user: { id: user.id, email: user.email, username: finalUsername },
        message: "Account created, please sign in",
      })
    }

    console.log("[v0] Registration completed successfully")

    return NextResponse.json({
      success: true,
      user: signInData.user,
      session: signInData.session,
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
