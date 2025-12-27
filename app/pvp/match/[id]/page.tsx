import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PvpMatch } from "@/components/pvp/pvp-match"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: match } = await supabase
    .from("matches")
    .select(`
      *,
      player1:profiles!player1_id(username, avatar_url),
      player2:profiles!player2_id(username, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (!match) redirect("/pvp")

  // Проверяем, что пользователь участник матча
  if (match.player1_id !== user.id && match.player2_id !== user.id) {
    redirect("/pvp")
  }

  const enrichedMatch = {
    ...match,
    player1_name: match.player1?.username,
    player1_avatar: match.player1?.avatar_url,
    player2_name: match.player2?.username,
    player2_avatar: match.player2?.avatar_url,
  }

  return <PvpMatch matchId={id} initialMatch={enrichedMatch} currentUserId={user.id} />
}
