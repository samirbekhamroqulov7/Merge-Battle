"use client"

import { useState, useCallback, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useRouter } from "next/navigation"
import { GameLayout } from "@/components/games/game-layout"
import { GameResultModal } from "@/components/games/game-result-modal"
import { GameCard } from "@/components/ui/game-card"
import { GameButton } from "@/components/ui/game-button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Clock, Check, X } from "lucide-react"

const WORDS = [
  { word: "LISTEN", anagram: "SILENT" },
  { word: "EARTH", anagram: "HEART" },
  { word: "STATE", anagram: "TASTE" },
  { word: "NIGHT", anagram: "THING" },
  { word: "BELOW", anagram: "ELBOW" },
  { word: "STUDY", anagram: "DUSTY" },
  { word: "CLOUD", anagram: "COULD" },
  { word: "BREAK", anagram: "BAKER" },
  { word: "RACES", anagram: "CARES" },
  { word: "MELON", anagram: "LEMON" },
]

function shuffleWord(word: string): string {
  const arr = word.split("")
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  const shuffled = arr.join("")
  return shuffled === word ? shuffleWord(word) : shuffled
}

export function AnagramsGame() {
  const { t } = useI18n()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shuffledWord, setShuffledWord] = useState("")
  const [userInput, setUserInput] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [gameOver, setGameOver] = useState(false)

  const currentWord = WORDS[currentIndex]

  useEffect(() => {
    setShuffledWord(shuffleWord(currentWord.word))
  }, [currentWord])

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

  const handleSubmit = useCallback(() => {
    if (!isRunning) setIsRunning(true)

    const isCorrect = userInput.toUpperCase() === currentWord.word || userInput.toUpperCase() === currentWord.anagram

    if (isCorrect) {
      setScore((s) => s + 1)
      setFeedback("correct")
    } else {
      setFeedback("wrong")
    }

    setTimeout(() => {
      setFeedback(null)
      setUserInput("")
      if (currentIndex < WORDS.length - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        setGameOver(true)
        setIsRunning(false)
      }
    }, 1000)
  }, [userInput, currentWord, currentIndex, isRunning])

  const handleSkip = () => {
    if (!isRunning) setIsRunning(true)
    setUserInput("")
    if (currentIndex < WORDS.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setGameOver(true)
      setIsRunning(false)
    }
  }

  const resetGame = () => {
    setCurrentIndex(0)
    setUserInput("")
    setScore(0)
    setTimeLeft(60)
    setIsRunning(false)
    setFeedback(null)
    setGameOver(false)
  }

  const getResult = (): "win" | "lose" => {
    return score >= 5 ? "win" : "lose"
  }

  return (
    <GameLayout title={t("games.anagrams")}>
      {/* Stats */}
      <div className="flex items-center gap-6 mb-6">
        <GameCard className="px-4 py-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className={cn("font-mono text-lg", timeLeft <= 10 && "text-red-500")}>{timeLeft}s</span>
        </GameCard>
        <GameCard className="px-4 py-2">
          <span className="font-mono text-lg">
            Score: {score}/{WORDS.length}
          </span>
        </GameCard>
      </div>

      {/* Progress */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-primary">
            {currentIndex + 1}/{WORDS.length}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / WORDS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Scrambled Word */}
      <GameCard
        className={cn(
          "p-6 mb-6 transition-colors",
          feedback === "correct" && "border-green-500 bg-green-500/10",
          feedback === "wrong" && "border-red-500 bg-red-500/10",
        )}
      >
        <div className="flex items-center justify-center gap-2">
          {shuffledWord.split("").map((letter, i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl font-bold text-primary"
            >
              {letter}
            </div>
          ))}
        </div>

        {feedback && (
          <div className="flex items-center justify-center mt-4 gap-2">
            {feedback === "correct" ? (
              <>
                <Check className="w-6 h-6 text-green-500" />
                <span className="text-green-500 font-bold">Correct!</span>
              </>
            ) : (
              <>
                <X className="w-6 h-6 text-red-500" />
                <span className="text-red-500 font-bold">Wrong! It was {currentWord.word}</span>
              </>
            )}
          </div>
        )}
      </GameCard>

      {/* Input */}
      <div className="w-full max-w-sm flex gap-2 mb-4">
        <Input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Your answer..."
          className="text-center text-lg font-bold uppercase bg-secondary"
          maxLength={shuffledWord.length}
          disabled={!!feedback || gameOver}
        />
      </div>

      <div className="flex gap-3">
        <GameButton variant="primary" size="md" onClick={handleSubmit} disabled={!userInput || !!feedback || gameOver}>
          Submit
        </GameButton>
        <GameButton variant="secondary" size="md" onClick={handleSkip} disabled={!!feedback || gameOver}>
          Skip
        </GameButton>
      </div>

      {/* Result Modal */}
      {gameOver && (
        <GameResultModal result={getResult()} onPlayAgain={resetGame} onExit={() => router.push("/classic")} />
      )}
    </GameLayout>
  )
}
