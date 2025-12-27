"use client"

import { useParams } from "next/navigation"
import { GuestGameWrapper } from "@/components/games/guest-game-wrapper"
import { GameLayout } from "@/components/games/game-layout"
import { GameCard } from "@/components/ui/game-card"
import { GameButton } from "@/components/ui/game-button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"

// Импорты компонентов игр
import dynamic from 'next/dynamic'

const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  "chess": dynamic(() => import("@/components/games/chess").then(mod => mod.ChessGame), { ssr: false }),
  "sudoku": dynamic(() => import("@/components/games/sudoku").then(mod => mod.SudokuGame), { ssr: false }),
  "tic-tac-toe": dynamic(() => import("@/components/games/tic-tac-toe").then(mod => mod.TicTacToeGame), { ssr: false }),
  "checkers": dynamic(() => import("@/components/games/checkers").then(mod => mod.CheckersGame), { ssr: false }),
  "puzzle-15": dynamic(() => import("@/components/games/puzzle-15").then(mod => mod.Puzzle15Game), { ssr: false }),
  "math-duel": dynamic(() => import("@/components/games/math-duel").then(mod => mod.MathDuelGame), { ssr: false }),
  "crossword": dynamic(() => import("@/components/games/crossword").then(mod => mod.CrosswordGame), { ssr: false }),
  "anagrams": dynamic(() => import("@/components/games/anagrams").then(mod => mod.AnagramsGame), { ssr: false }),
  "dots": dynamic(() => import("@/components/games/dots").then(mod => mod.DotsGame), { ssr: false }),
  "flags-quiz": dynamic(() => import("@/components/games/flags-quiz").then(mod => mod.FlagsQuizGame), { ssr: false }),
}

const GAME_NAMES: Record<string, string> = {
  "chess": "Шахматы",
  "sudoku": "Судоку",
  "tic-tac-toe": "Крестики-нолики",
  "checkers": "Шашки",
  "puzzle-15": "Пятнашки",
  "math-duel": "Математический поединок",
  "crossword": "Кроссворд",
  "anagrams": "Анаграммы",
  "dots": "Точки",
  "flags-quiz": "Викторина флагов",
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <GamePageContent />
    </Suspense>
  )
}

function GamePageContent() {
  const params = useParams()
  const router = useRouter()
  const gameSlug = params.slug as string
  const GameComponent = GAME_COMPONENTS[gameSlug]
  const gameName = GAME_NAMES[gameSlug] || gameSlug

  if (!GameComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <GameCard className="max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-bold text-primary mb-4">Игра не найдена</h2>
          <p className="text-muted-foreground mb-6">
            Игра &quot;{gameSlug}&quot; не существует или временно недоступна.
          </p>
          <GameButton variant="primary" onClick={() => router.push("/classic")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к играм
          </GameButton>
        </GameCard>
      </div>
    )
  }

  return (
    <GuestGameWrapper gameSlug={gameSlug}>
      <GameLayout gameName={gameName}>
        <GameComponent />
      </GameLayout>
    </GuestGameWrapper>
  )
}
