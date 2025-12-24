import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Re-export all functionality from specialized modules
export * from "./client-auth"
export * from "./client-guest"
export * from "./client-purchases"
export * from "./client-progress"
