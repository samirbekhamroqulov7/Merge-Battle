import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSession } from "@/lib/auth/session"
import { createUser } from "@/lib/database/users"

export async function POST() {
  try {
    const supabase = await createClient()

    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const guestName = `Guest_${guestId.slice(-4)}`
    const guestEmail = `${guestId}@guest.brainbattle.com`

    const newUser = await createUser({
      auth_id: guestId,
      email: guestEmail,
      username: guestName,
      isGuest: true,
    })

    await createSession(newUser.id, newUser.email, newUser.username, true)

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: guestName,
        isGuest: true,
      },
    })
  } catch (error: unknown) {
    console.error("[v0] Guest auth error:", error)
    return NextResponse.json({ error: "Failed to create guest account" }, { status: 500 })
  }
}
