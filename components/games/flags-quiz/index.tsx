"use client"

import { useState, useCallback, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { GameLayout } from "@/components/games/game-layout"
import { GameResultModal } from "@/components/games/game-result-modal"
import { GameCard } from "@/components/ui/game-card"
import { cn } from "@/lib/utils"
import { Clock, MapPin } from "lucide-react"

interface Country {
  name: string
  capital: string
  flag: string
}

const COUNTRIES: Country[] = [
  { name: "United States", capital: "Washington D.C.", flag: "🇺🇸" },
  { name: "United Kingdom", capital: "London", flag: "🇬🇧" },
  { name: "France", capital: "Paris", flag: "🇫🇷" },
  { name: "Germany", capital: "Berlin", flag: "🇩🇪" },
  { name: "Japan", capital: "Tokyo", flag: "🇯🇵" },
  { name: "China", capital: "Beijing", flag: "🇨🇳" },
  { name: "Russia", capital: "Moscow", flag: "🇷🇺" },
  { name: "Brazil", capital: "Brasília", flag: "🇧🇷" },
  { name: "India", capital: "New Delhi", flag: "🇮🇳" },
  { name: "Australia", capital: "Canberra", flag: "🇦🇺" },
  { name: "Canada", capital: "Ottawa", flag: "🇨🇦" },
  { name: "Italy", capital: "Rome", flag: "🇮🇹" },
  { name: "Spain", capital: "Madrid", flag: "🇪🇸" },
  { name: "Mexico", capital: "Mexico City", flag: "🇲🇽" },
  { name: "South Korea", capital: "Seoul", flag: "🇰🇷" },
  { name: "Turkey", capital: "Ankara", flag: "🇹🇷" },
  { name: "Egypt", capital: "Cairo", flag: "🇪🇬" },
  { name: "South Africa", capital: "Pretoria", flag: "🇿🇦" },
  { name: "Argentina", capital: "Buenos Aires", flag: "🇦🇷" },
  { name: "Poland", capital: "Warsaw", flag: "🇵🇱" },
]

type QuestionType = "flag" | "capital"

interface Question {
  type: QuestionType
  country: Country
  options: Country[]
}

function generateQuestion(usedCountries: Set<string>): Question | null {
  const available = COUNTRIES.filter((c) => !usedCountries.has(c.name))
  if (available.length < 4) return null

  const shuffled = [...available].sort(() => Math.random() - 0.5)
  const correct = shuffled[0]
  const wrongOptions = shuffled.slice(1, 4)
  const allOptions = [correct, ...wrongOptions].sort(() => Math.random() - 0.5)

  return {
    type: Math.random() > 0.5 ? "flag" : "capital",
    country: correct,
    options: allOptions,
  }
}

export function FlagsQuizGame() {
  const { t } = useI18n()
  const router = useRouter()
  const [usedCountries, setUsedCountries] = useState<Set<string>>(new Set())
  const [question, setQuestion] = useState<Question | null>(() => generateQuestion(new Set()))
  const [score, setScore] = useState(0)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [timeLeft, setTimeLeft] = useState(10)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [totalQuestions] = useState(10)

  useEffect(() => {
    if (gameOver || feedback) return

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleTimeout()
          return 10
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameOver, feedback, question])

  const handleTimeout = () => {
    setFeedback("timeout")
    setTimeout(() => nextQuestion(), 1500)
  }

  const nextQuestion = useCallback(() => {
    if (questionNumber >= totalQuestions) {
      setGameOver(true)
      return
    }

    const newUsed = new Set(usedCountries)
    if (question) newUsed.add(question.country.name)
    setUsedCountries(newUsed)

    const newQuestion = generateQuestion(newUsed)
    if (!newQuestion) {
      setGameOver(true)
      return
    }

    setQuestion(newQuestion)
    setQuestionNumber((n) => n + 1)
    setTimeLeft(10)
    setFeedback(null)
  }, [question, questionNumber, totalQuestions, usedCountries])

  const handleAnswer = useCallback(
    (selectedCountry: Country) => {
      if (feedback || !question) return

      const isCorrect = selectedCountry.name === question.country.name

      if (isCorrect) {
        setScore((s) => s + 1)
        setFeedback("correct")
      } else {
        setFeedback(question.country.name)
      }

      setTimeout(() => nextQuestion(), 1500)
    },
    [question, feedback, nextQuestion],
  )

  const resetGame = () => {
    setUsedCountries(new Set())
    setQuestion(generateQuestion(new Set()))
    setScore(0)
    setQuestionNumber(1)
    setTimeLeft(10)
    setFeedback(null)
    setGameOver(false)
  }

  const getResult = (): "win" | "lose" => {
    return score >= totalQuestions / 2 ? "win" : "lose"
  }

  if (!question) return null

  return (
    <GameLayout title={t("games.flagsQuiz")}>
      {/* Stats */}
      <div className="flex items-center gap-4 mb-6">
        <GameCard className="px-4 py-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className={cn("font-mono text-lg", timeLeft <= 3 && "text-red-500 animate-pulse")}>{timeLeft}s</span>
        </GameCard>
        <GameCard className="px-4 py-2">
          <span className="font-mono text-lg">
            {score}/{questionNumber - 1}
          </span>
        </GameCard>
        <GameCard className="px-4 py-2">
          <span className="font-mono text-sm text-muted-foreground">
            Q{questionNumber}/{totalQuestions}
          </span>
        </GameCard>
      </div>

      {/* Question */}
      <GameCard className="p-6 mb-6 text-center">
        {question.type === "flag" ? (
          <>
            <div className="text-8xl mb-4">{question.country.flag}</div>
            <p className="text-lg text-muted-foreground">What country is this flag from?</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold text-primary">{question.country.capital}</span>
            </div>
            <p className="text-lg text-muted-foreground">Which country has this capital?</p>
          </>
        )}
      </GameCard>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {question.options.map((option) => {
          const isCorrect = option.name === question.country.name
          const showFeedback = feedback !== null

          return (
            <button
              key={option.name}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback || gameOver}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-center",
                "bg-card border-border",
                "hover:border-primary/50 active:scale-95",
                "disabled:pointer-events-none",
                showFeedback && isCorrect && "border-green-500 bg-green-500/20",
                showFeedback && !isCorrect && feedback === option.name && "border-red-500 bg-red-500/20",
              )}
            >
              <div className="text-3xl mb-1">{option.flag}</div>
              <div className="text-sm font-medium">{option.name}</div>
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {feedback && feedback !== "correct" && feedback !== "timeout" && (
        <div className="mt-4 text-center">
          <span className="text-red-500">Correct answer: {feedback}</span>
        </div>
      )}

      {/* Result Modal */}
      {gameOver && (
        <GameResultModal result={getResult()} onPlayAgain={resetGame} onExit={() => router.push("/classic")} />
      )}
    </GameLayout>
  )
}
