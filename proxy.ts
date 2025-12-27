import { NextResponse, type NextRequest } from "next/server"
import { getSession, refreshSession } from "@/lib/auth/session"

export async function proxy(request: NextRequest) {
  const session = await getSession()

  // If session exists and is close to expiring, refresh it
  if (session) {
    const timeUntilExpiry = session.expiresAt - Date.now()
    const oneDayInMs = 24 * 60 * 60 * 1000

    // Refresh if less than 1 day until expiry
    if (timeUntilExpiry < oneDayInMs) {
      await refreshSession(session)
    }
  }

  return NextResponse.next({
    request,
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
