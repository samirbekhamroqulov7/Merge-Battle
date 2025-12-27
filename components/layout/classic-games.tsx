"use client"

import { useI18n } from "@/lib/i18n/context"
import { GameCard } from "@/components/ui/game-card"
import { GameButton } from "@/components/ui/game-button"
import { useRouter } from "next/navigation"
import {
  Grid3X3,
  LayoutGrid,
  Hash,
  Crown,
  Circle,
  FileText,
  Shuffle,
  Calculator,
  PenTool,
  Flag,
  ArrowLeft,
} from "lucide-react"

const games = [
  { slug: "tic-tac-toe", icon: Grid3X3, nameKey: "games.ticTacToe", color: "text-amber-400" },
  { slug: "puzzle-15", icon: LayoutGrid, nameKey: "games.puzzle15", color: "text-yellow-500" },
  { slug: "sudoku", icon: Hash, nameKey: "games.sudoku", color: "text-amber-300" },
  { slug: "chess", icon: Crown, nameKey: "games.chess", color: "text-red-400" },
  { slug: "checkers", icon: Circle, nameKey: "games.checkers", color: "text-red-500" },
  { slug: "crossword", icon: FileText, nameKey: "games.crossword", color: "text-blue-400" },
  { slug: "anagrams", icon: Shuffle, nameKey: "games.anagrams", color: "text-amber-400" },
  { slug: "math-duel", icon: Calculator, nameKey: "games.mathDuel", color: "text-green-400" },
  { slug: "dots", icon: PenTool, nameKey: "games.dots", color: "text-purple-400" },
  { slug: "flags-quiz", icon: Flag, nameKey: "games.flagsQuiz", color: "text-emerald-400" },
]

export function ClassicGames() {
  const { t } = useI18n()
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-4">
          <GameButton variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="w-5 h-5" />
          </GameButton>
          <h1 className="text-2xl font-bold text-primary uppercase tracking-wider">{t("nav.classic")}</h1>
        </div>
      </div>

      {/* Games Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {games.map((game) => {
            const Icon = game.icon
            return (
              <GameCard
                key={game.slug}
                variant="interactive"
                className="aspect-square p-4 flex flex-col items-center justify-center gap-3"
                onClick={() => router.push(`/game/${game.slug}`)}
              >
                <div className="w-16 h-16 rounded-xl bg-secondary/50 flex items-center justify-center">
                  <Icon className={`w-10 h-10 ${game.color}`} />
                </div>
                <span className="text-sm font-semibold text-center text-foreground">
                  {t(game.nameKey as Parameters<typeof t>[0])}
                </span>
              </GameCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
