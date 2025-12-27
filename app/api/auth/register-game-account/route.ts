import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserById, updateUser } from "@/lib/database/users"
import { createMastery, createGlory } from "@/lib/database/mastery"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { username } = await request.json()

    if (!username || username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 })
    }

    const user = await getUserById(session.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user to convert from guest to registered account
    await updateUser(user.id, {
      username,
      isGuest: false,
    })

    // Create mastery and glory if they don't exist
    if (user.isGuest) {
      await Promise.all([createMastery(user.id), createGlory(user.id)])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Register game account error:", error)
    return NextResponse.json({ error: "Failed to register game account" }, { status: 500 })
  }
}
