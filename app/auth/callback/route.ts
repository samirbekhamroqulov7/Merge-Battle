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

    const user = sessionData.user

    if (!user) {
      return NextResponse.redirect(
        new URL(`/auth/error?message=${encodeURIComponent("User session initialization failed")}`, requestUrl.origin),
      )
    }

    const username =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.user_name ||
      user.email?.split("@")[0] ||
      `User_${Math.random().toString(36).substr(2, 8)}`

    const avatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`

    const { data: existingUser } = await supabase.from("users").select("id").eq("auth_id", user.id).maybeSingle()

    if (existingUser) {
      await supabase
        .from("users")
        .update({
          email: user.email,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("auth_id", user.id)
    } else {
      const { error: insertError } = await supabase.from("users").insert({
        auth_id: user.id,
        email: user.email,
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

      if (insertError) {
        console.error("Profile creation error:", insertError)
      }

      try {
        await supabase.from("mastery").insert({
          user_id: user.id,
          level: 1,
          mini_level: 0,
          fragments: 0,
          total_wins: 0,
          created_at: new Date().toISOString(),
        })

        await supabase.from("glory").insert({
          user_id: user.id,
          level: 1,
          wins: 0,
          total_glory_wins: 0,
          created_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Mastery/Glory creation error:", error)
      }
    }

    const response = NextResponse.redirect(new URL("/", requestUrl.origin))

    response.cookies.set({
      name: "sb-access-token",
      value: sessionData.session.access_token,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.set({
      name: "sb-refresh-token",
      value: sessionData.session.refresh_token,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    response.cookies.set({
      name: "auth_refresh",
      value: "1",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5,
      path: "/",
    })

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
