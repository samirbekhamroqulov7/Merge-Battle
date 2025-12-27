"use client"

import { useState, useCallback, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { GameResultModal } from "@/components/games/game-result-modal"
import { GameCard } from "@/components/ui/game-card"
import { cn } from "@/lib/utils"
import { Clock, Zap, Target, TrendingUp } from "lucide-react"

type Operation = "+" | "-" | "×" | "÷"

interface Problem {
  a: number
  b: number
  operation: Operation
  answer: number
  options: number[]
}

function generateProblem(difficulty: number): Problem {
  const operations: Operation[] = ["+", "-", "×", "÷"]
  const operation = operations[Math.floor(Math.random() * (difficulty > 5 ? 4 : 2))]

  let a: number, b: number, answer: number

  switch (operation) {
    case "+":
      a = Math.floor(Math.random() * (10 * difficulty)) + 1
      b = Math.floor(Math.random() * (10 * difficulty)) + 1
      answer = a + b
      break
    case "-":
      a = Math.floor(Math.random() * (10 * difficulty)) + 10
      b = Math.floor(Math.random() * a) + 1
      answer = a - b
      break
    case "×":
      a = Math.floor(Math.random() * 12) + 1
      b = Math.floor(Math.random() * 12) + 1
      answer = a * b
      break
    case "÷":
      b = Math.floor(Math.random() * 10) + 1
      answer = Math.floor(Math.random() * 10) + 1
      a = b * answer
      break
    default:
      a = 1
      b = 1
      answer = 2
  }

  // Generate wrong options
  const options = [answer]
  while (options.length < 4) {
    const wrong = answer + Math.floor(Math.random() * 20) - 10
    if (wrong !== answer && wrong > 0 && !options.includes(wrong)) {
      options.push(wrong)
    }
  }

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }

  return { a, b, operation, answer, options }
}

export function MathDuelGame() {
  const { t } = useI18n()
  const router = useRouter()
  const [problem, setProblem] = useState<Problem>(() => generateProblem(1))
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [feedback, setFeedback] = useState<number | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [difficulty, setDifficulty] = useState(1)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setGameOver(true)
            setIsRunning(false)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const handleAnswer = useCallback(
    (selectedAnswer: number) => {
      if (!isRunning) setIsRunning(true)
      if (feedback !== null) return

      setFeedback(selectedAnswer)

      const isCorrect = selectedAnswer === problem.answer

      setTimeout(() => {
        if (isCorrect) {
          const newStreak = streak + 1
          setStreak(newStreak)
          setScore((s) => s + (10 + newStreak * 2))
          setTimeLeft((t) => Math.min(t + 3, 60)) // Bonus time

          if (newStreak % 5 === 0) {
            setDifficulty((d) => Math.min(d + 1, 5))
          }
        } else {
          setStreak(0)
        }

        setFeedback(null)
        setProblem(generateProblem(difficulty))
      }, 500)
    },
    [problem, streak, difficulty, isRunning, feedback],
  )

  const resetGame = () => {
    setProblem(generateProblem(1))
    setScore(0)
    setStreak(0)
    setTimeLeft(60)
    setIsRunning(false)
    setFeedback(null)
    setGameOver(false)
    setDifficulty(1)
  }

  const getResult = (): "win" | "lose" => {
    return score >= 100 ? "win" : "lose"
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-6 py-8">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <GameCard
          className={cn(
            "px-5 py-3 flex items-center gap-3 border-2 transition-all",
            timeLeft <= 10
              ? "border-red-500/50 bg-gradient-to-br from-red-500/20 to-orange-500/20 animate-pulse"
              : "border-primary/30",
          )}
        >
          <Clock className={cn("w-5 h-5", timeLeft <= 10 ? "text-red-400" : "text-primary")} />
          <span className={cn("font-mono text-xl font-bold", timeLeft <= 10 && "text-red-400")}>{timeLeft}s</span>
        </GameCard>

        <GameCard className="px-5 py-3 flex items-center gap-3 border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10">
          <Target className="w-5 h-5 text-emerald-400" />
          <span className="font-mono text-xl font-bold text-emerald-400">{score}</span>
        </GameCard>

        {streak > 0 && (
          <GameCard className="px-5 py-3 flex items-center gap-3 border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-lg shadow-amber-500/20 animate-in zoom-in">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-mono text-xl font-bold text-amber-400">{streak}x</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </GameCard>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl -z-10" />

        <GameCard className="p-10 border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-card/90 to-secondary/50 backdrop-blur-sm min-w-[300px]">
          <div className="text-6xl font-bold text-center bg-gradient-to-br from-foreground via-primary to-foreground bg-clip-text text-transparent animate-in zoom-in duration-300">
            {problem.a} {problem.operation} {problem.b} = ?
          </div>
        </GameCard>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md px-4">
        {problem.options.map((option, i) => {
          const isSelected = feedback === option
          const isCorrect = option === problem.answer
          const showResult = feedback !== null

          return (
            <button
              key={i}
              onClick={() => handleAnswer(option)}
              disabled={feedback !== null || gameOver}
              className={cn(
                "relative py-8 rounded-2xl border-2 text-3xl font-bold transition-all duration-300 overflow-hidden group",
                "disabled:pointer-events-none",
                !showResult &&
                  "bg-gradient-to-br from-card to-secondary border-border/50 hover:scale-105 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 active:scale-95",
                showResult &&
                  isCorrect &&
                  "border-green-400 bg-gradient-to-br from-green-500/30 to-emerald-500/30 text-green-400 shadow-xl shadow-green-500/30 animate-in zoom-in",
                showResult &&
                  isSelected &&
                  !isCorrect &&
                  "border-red-400 bg-gradient-to-br from-red-500/30 to-orange-500/30 text-red-400 shadow-xl shadow-red-500/30 animate-in zoom-in",
                showResult && !isSelected && !isCorrect && "opacity-40",
              )}
            >
              {/* Hover glow effect */}
              {!showResult && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}

              <span className="relative z-10">{option}</span>

              {/* Animated background for correct answer */}
              {showResult && isCorrect && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse" />
              )}
            </button>
          )
        })}
      </div>

      {/* Result Modal */}
      {gameOver && (
        <GameResultModal result={getResult()} onPlayAgain={resetGame} onExit={() => router.push("/classic")} />
      )}
    </div>
  )
}
