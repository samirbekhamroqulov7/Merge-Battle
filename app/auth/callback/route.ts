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

    if (sessionError) {
      console.error("Session error:", sessionError)
      throw sessionError
    }
    
    if (!sessionData.session) {
      console.error("No session created")
      throw new Error("Session not created")
    }

    const authUser = sessionData.user

    if (!authUser || !authUser.email) {
      console.error("No user or email in session")
      return NextResponse.redirect(
        new URL(`/auth/error?message=${encodeURIComponent("User session initialization failed")}`, requestUrl.origin),
      )
    }

    console.log("OAuth callback - auth user:", authUser.id, "email:", authUser.email)

    // 1. Получаем или создаем профиль в таблице users
    const username =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.user_metadata?.user_name ||
      authUser.email.split("@")[0] ||
      `User_${Math.random().toString(36).substr(2, 8)}`

    const avatarUrl =
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`

    console.log("Looking for existing user with auth_id:", authUser.id)
    
    // Проверяем существование пользователя
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("id, auth_id, isGuest, username, email")
      .eq("auth_id", authUser.id)
      .maybeSingle()

    if (userError) {
      console.error("Error checking user:", userError)
    }

    let userId: string | undefined
    let userEmail = authUser.email!
    let userUsername = username.substring(0, 20)

    if (!existingUser) {
      console.log("Creating new user profile for:", authUser.id)
      
      // Создаем нового пользователя
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          auth_id: authUser.id,
          email: userEmail,
          username: userUsername,
          avatar_url: avatarUrl,
          avatar_frame: "none",
          nickname_style: "normal",
          language: "ru",
          sound_enabled: true,
          music_enabled: true,
          isGuest: false,
          is_verified: true, // Google аккаунт автоматически подтвержден
          password_hash: null, // OAuth users don't have password
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id, email, username, isGuest")
        .single()

      if (insertError) {
        console.error("Profile creation error during OAuth:", insertError)
        // Пробуем upsert на случай если пользователь уже есть
        const { data: upsertUser, error: upsertError } = await supabase
          .from("users")
          .upsert({
            auth_id: authUser.id,
            email: userEmail,
            username: userUsername,
            avatar_url: avatarUrl,
            isGuest: false,
            is_verified: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'auth_id'
          })
          .select("id, email, username, isGuest")
          .single()

        if (upsertError) {
          console.error("Upsert also failed:", upsertError)
        } else {
          userId = upsertUser?.id
          userEmail = upsertUser?.email || userEmail
          userUsername = upsertUser?.username || userUsername
          console.log("User created via upsert with id:", userId)
        }
      } else {
        userId = newUser?.id
        userEmail = newUser?.email || userEmail
        userUsername = newUser?.username || userUsername
        console.log("New user created with id:", userId)
      }
    } else {
      console.log("User exists, updating profile:", existingUser.id)
      userId = existingUser.id
      userEmail = existingUser.email || userEmail
      userUsername = existingUser.username || userUsername

      // Обновляем профиль
      const { error: updateError } = await supabase
        .from("users")
        .update({
          email: userEmail,
          username: userUsername,
          avatar_url: avatarUrl,
          isGuest: false,
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id)

      if (updateError) {
        console.error("Profile update error during OAuth:", updateError)
      }
    }

    // 2. Создаем игровой аккаунт если пользователь создан
    if (userId) {
      console.log("Creating game account for user:", userId)
      
      try {
        // Проверяем и создаем mastery
        const { data: existingMastery, error: masteryCheckError } = await supabase
          .from("mastery")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle()

        if (masteryCheckError) {
          console.error("Error checking mastery:", masteryCheckError)
        }

        if (!existingMastery) {
          console.log("Creating mastery for user:", userId)
          const { error: masteryError } = await supabase
            .from("mastery")
            .insert({
              user_id: userId,
              level: 1,
              mini_level: 0,
              fragments: 0,
              total_wins: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (masteryError) {
            console.error("Mastery creation error:", masteryError)
            // Пробуем upsert
            await supabase
              .from("mastery")
              .upsert({
                user_id: userId,
                level: 1,
                mini_level: 0,
                fragments: 0,
                total_wins: 0,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'user_id'
              })
          } else {
            console.log("Mastery created successfully")
          }
        }

        // Проверяем и создаем glory
        const { data: existingGlory, error: gloryCheckError } = await supabase
          .from("glory")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle()

        if (gloryCheckError) {
          console.error("Error checking glory:", gloryCheckError)
        }

        if (!existingGlory) {
          console.log("Creating glory for user:", userId)
          const { error: gloryError } = await supabase
            .from("glory")
            .insert({
              user_id: userId,
              level: 1,
              wins: 0,
              total_glory_wins: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (gloryError) {
            console.error("Glory creation error:", gloryError)
            // Пробуем upsert
            await supabase
              .from("glory")
              .upsert({
                user_id: userId,
                level: 1,
                wins: 0,
                total_glory_wins: 0,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'user_id'
              })
          } else {
            console.log("Glory created successfully")
          }
        }

        console.log("Game account creation completed for user:", userId)
      } catch (innerError) {
        console.error("Error creating mastery/glory during OAuth:", innerError)
      }
    } else {
      console.error("FAILED: No userId available to create game account")
    }

    // 3. Создаем ответ с куками
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

    // Устанавливаем флаг для клиента
    response.cookies.set({
      name: "auth_refresh",
      value: "1",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60, // 1 минута
      path: "/",
    })

    console.log("OAuth callback successful, redirecting to home. User ID:", userId)
    return response

  } catch (error: any) {
    console.error("Auth callback error:", error)
    
    const errorMessage = error?.message || "Unexpected authentication error"
    console.error("Detailed error:", error)
    
    const safeErrorMessage = encodeURIComponent(
      errorMessage.length > 100 ? errorMessage.substring(0, 100) + "..." : errorMessage
    )
    
    return NextResponse.redirect(
      new URL(`/auth/error?message=${safeErrorMessage}`, requestUrl.origin),
    )
  }
}