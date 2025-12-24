import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

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

    console.log("OAuth callback - auth user:", authUser.id, "email:", authUser.email)

    // Создаем или обновляем профиль пользователя
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

    const { data: existingUser } = await supabase
      .from("users")
      .select("id, auth_id")
      .eq("auth_id", authUser.id)
      .maybeSingle()

    if (!existingUser) {
      console.log("Creating new user profile for:", authUser.id)

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .upsert({
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
        }, {
          onConflict: 'auth_id'
        })
        .select("id")
        .single()

      if (insertError) {
        console.error("Profile creation error during OAuth:", insertError)
        // Не прерываем процесс, продолжаем без профиля - он создастся через триггер или хуки
      } else {
        console.log("New user created with id:", newUser?.id)

        // Пытаемся создать mastery и glory, но если ошибка - игнорируем
        try {
          await supabase.from("mastery").upsert({
            user_id: newUser?.id,
            level: 1,
            mini_level: 0,
            fragments: 0,
            total_wins: 0,
            created_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          })

          await supabase.from("glory").upsert({
            user_id: newUser?.id,
            level: 1,
            wins: 0,
            total_glory_wins: 0,
            created_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          })
        } catch (innerError) {
          console.error("Error creating mastery/glory during OAuth:", innerError)
        }
      }
    } else {
      console.log("User exists, updating profile:", existingUser.id)

      const { error: updateError } = await supabase
        .from("users")
        .update({
          email: authUser.email,
          username: username.substring(0, 20),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id)

      if (updateError) {
        console.error("Profile update error during OAuth:", updateError)
      }
    }

    // Создаем ответ с куками
    const response = NextResponse.redirect(new URL("/", requestUrl.origin))

    // Устанавливаем куки для сессии
    const cookieStore = await cookies()
    
    response.cookies.set({
      name: "sb-access-token",
      value: sessionData.session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: "/",
    })

    response.cookies.set({
      name: "sb-refresh-token",
      value: sessionData.session.refresh_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 дней
      path: "/",
    })

    // Устанавливаем флаг для клиента, что нужно обновить сессию
    response.cookies.set({
      name: "auth_refresh",
      value: "1",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60, // 1 минута
      path: "/",
    })

    console.log("OAuth callback successful, redirecting to home")
    return response

  } catch (error: any) {
    console.error("Auth callback error:", error)
    
    // Более информативное сообщение об ошибке
    const errorMessage = error?.message || "Unexpected authentication error"
    const safeErrorMessage = encodeURIComponent(
      errorMessage.length > 100 ? errorMessage.substring(0, 100) + "..." : errorMessage
    )
    
    return NextResponse.redirect(
      new URL(`/auth/error?message=${safeErrorMessage}`, requestUrl.origin),
    )
  }
}