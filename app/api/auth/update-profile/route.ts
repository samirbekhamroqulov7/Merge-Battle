import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { updateUser } from "@/lib/database/users"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const updates = await request.json()

    // Remove fields that shouldn't be updated directly
    const allowedUpdates = {
      username: updates.username,
      avatar_url: updates.avatar_url,
      avatar_frame: updates.avatar_frame,
      nickname_style: updates.nickname_style,
      language: updates.language,
      sound_enabled: updates.sound_enabled,
      music_enabled: updates.music_enabled,
    }

    // Remove undefined values
    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key as keyof typeof allowedUpdates] === undefined) {
        delete allowedUpdates[key as keyof typeof allowedUpdates]
      }
    })

    await updateUser(session.userId, allowedUpdates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
