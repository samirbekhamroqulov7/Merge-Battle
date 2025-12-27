import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserById } from "@/lib/database/users"
import { getMasteryByUserId, getGloryByUserId } from "@/lib/database/mastery"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null })
    }

    const user = await getUserById(session.userId)

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // Get mastery and glory if not guest
    let mastery = null
    let glory = null

    if (!user.isGuest) {
      ;[mastery, glory] = await Promise.all([getMasteryByUserId(user.id), getGloryByUserId(user.id)])
    }

    return NextResponse.json({
      user: {
        id: user.id,
        auth_id: user.auth_id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
        avatar_frame: user.avatar_frame,
        nickname_style: user.nickname_style,
        language: user.language,
        sound_enabled: user.sound_enabled,
        music_enabled: user.music_enabled,
        isGuest: user.isGuest,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      mastery,
      glory,
    })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}
