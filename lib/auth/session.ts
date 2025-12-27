import { cookies } from "next/headers"

export interface Session {
  userId: string
  email: string
  username: string
  isGuest: boolean
  createdAt: number
  expiresAt: number
}

export async function createSession(userId: string, email: string, username: string, isGuest = false): Promise<string> {
  const session: Session = {
    userId,
    email,
    username,
    isGuest,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  }

  const sessionToken = Buffer.from(JSON.stringify(session)).toString("base64")

  const cookieStore = await cookies()
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  })

  return sessionToken
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return null
    }

    const session: Session = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString())

    if (session.expiresAt < Date.now()) {
      await deleteSession()
      return null
    }

    return session
  } catch {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export async function refreshSession(session: Session): Promise<void> {
  session.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000
  await createSession(session.userId, session.email, session.username, session.isGuest)
}
