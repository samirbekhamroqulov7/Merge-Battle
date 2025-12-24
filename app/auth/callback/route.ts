import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?message=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin),
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?message=No authorization code received", requestUrl.origin))
  }

  try {
    const supabase = await createClient()

    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) throw sessionError
    if (!sessionData.session) throw new Error("Session not created")

    const authUser = sessionData.user

    if (!authUser) {
      return NextResponse.redirect(
        new URL(`/auth/error?message=${encodeURIComponent("User session initialization failed")}`, requestUrl.origin),
      )
    }

    console.log("OAuth callback - auth user:", authUser.id)

    const { data: existingUser } = await supabase
      .from("users")
      .select("id, auth_id")
      .eq("auth_id", authUser.id)
      .maybeSingle()

    let userId: string

    if (existingUser) {
      console.log("User exists, updating profile")
      userId = existingUser.id

      const username =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.user_metadata?.user_name ||
        authUser.email?.split("@")[0] ||
        `User_${Math.random().toString(36).substr(2, 8)}`

      const avatarUrl =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`

      const { error: updateError } = await supabase
        .from("users")
        .update({
          email: authUser.email,
          username: username.substring(0, 20),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Profile update error:", updateError)
      }
    } else {
      console.log("Creating new user profile")

      const username =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.user_metadata?.user_name ||
        authUser.email?.split("@")[0] ||
        `User_${Math.random().toString(36).substr(2, 8)}`

      const avatarUrl =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          auth_id: authUser.id,
          email: authUser.email,
          username: username.substring(0, 20),
          avatar_url: avatarUrl,
          avatar_frame: "none",
          nickname_style: "normal",
          language: "ru",
          sound_enabled: true,
          music_enabled: true,
          isGuest: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (insertError) {
        console.error("Profile creation error:", insertError)
        throw new Error("Failed to create user profile")
      }

      userId = newUser.id
      console.log("New user created with id:", userId)

      try {
        const { error: masteryError } = await supabase.from("mastery").insert({
          user_id: userId,
          level: 1,
          mini_level: 0,
          fragments: 0,
          total_wins: 0,
          created_at: new Date().toISOString(),
        })

        if (masteryError) {
          console.error("Mastery creation error:", masteryError)
        }

        const { error: gloryError } = await supabase.from("glory").insert({
          user_id: userId,
          level: 1,
          wins: 0,
          total_glory_wins: 0,
          created_at: new Date().toISOString(),
        })

        if (gloryError) {
          console.error("Glory creation error:", gloryError)
        }

        console.log("Mastery and glory records created")
      } catch (error) {
        console.error("Error creating mastery/glory:", error)
      }
    }

    const response = NextResponse.redirect(new URL("/", requestUrl.origin))

    response.cookies.set({
      name: "sb-access-token",
      value: sessionData.session.access_token,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    response.cookies.set({
      name: "sb-refresh-token",
      value: sessionData.session.refresh_token,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    })

    response.cookies.set({
      name: "auth_refresh",
      value: "1",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10,
      path: "/",
    })

    console.log("Redirecting to home with session cookies")
    return response
  } catch (error: any) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(
      new URL(
        `/auth/error?message=${encodeURIComponent(error?.message || "Unexpected authentication error")}`,
        requestUrl.origin,
      ),
    )
  }
}