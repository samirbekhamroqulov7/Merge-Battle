"use client"

import { useI18n } from "@/lib/i18n/context"
import { GameButton } from "@/components/ui/game-button"
import { Trophy, X, Minus, Sparkles, RotateCcw, LogOut } from "lucide-react"

interface GameResultModalProps {
  result: "win" | "lose" | "draw"
  onPlayAgain: () => void
  onExit: () => void
}

export function GameResultModal({ result, onPlayAgain, onExit }: GameResultModalProps) {
  const { t } = useI18n()

  const configs = {
    win: {
      icon: Trophy,
      color: "text-emerald-400",
      bg: "bg-gradient-to-br from-emerald-500/30 to-green-500/30",
      border: "border-emerald-400/50",
      shadow: "shadow-emerald-500/30",
      title: t("game.win"),
      particles: true,
    },
    lose: {
      icon: X,
      color: "text-red-400",
      bg: "bg-gradient-to-br from-red-500/20 to-orange-500/20",
      border: "border-red-400/50",
      shadow: "shadow-red-500/20",
      title: t("game.lose"),
      particles: false,
    },
    draw: {
      icon: Minus,
      color: "text-amber-400",
      bg: "bg-gradient-to-br from-amber-500/20 to-yellow-500/20",
      border: "border-amber-400/50",
      shadow: "shadow-amber-500/20",
      title: t("game.draw"),
      particles: false,
    },
  }

  const config = configs[result]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div
        className={`bg-card/95 backdrop-blur-sm border-2 ${config.border} rounded-3xl p-8 w-full max-w-md text-center animate-in zoom-in-95 duration-500 shadow-2xl ${config.shadow} relative overflow-hidden`}
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />

        {/* Victory particles for win */}
        {config.particles && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute text-emerald-400/30 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${12 + Math.random() * 12}px`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Icon container with glow effect */}
        <div className="relative mb-6">
          <div className={`absolute inset-0 ${config.bg} blur-2xl opacity-50`} />
          <div
            className={`relative w-32 h-32 mx-auto rounded-full ${config.bg} flex items-center justify-center border-2 ${config.border} shadow-xl ${config.shadow} animate-in zoom-in duration-700`}
          >
            <Icon className={`w-16 h-16 ${config.color} animate-pulse`} strokeWidth={2.5} />
          </div>
        </div>

        {/* Title with gradient */}
        <h2
          className={`text-5xl font-bold mb-8 ${config.color} animate-in slide-in-from-bottom duration-700 relative z-10`}
        >
          {config.title}
        </h2>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 relative z-10">
          <GameButton
            variant="primary"
            size="lg"
            className="w-full group hover:scale-105 transition-all shadow-lg hover:shadow-xl hover:shadow-primary/30"
            onClick={onPlayAgain}
          >
            <RotateCcw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            {t("game.playAgain")}
          </GameButton>

          <GameButton
            variant="outline"
            size="lg"
            className="w-full border-2 hover:scale-105 transition-all"
            onClick={onExit}
          >
            <LogOut className="w-5 h-5 mr-2" />
            {t("game.exit")}
          </GameButton>
        </div>
      </div>
    </div>
  )
}
