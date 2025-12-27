"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useSound } from "@/lib/hooks/use-sound"

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  disableSound?: boolean
}

const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, variant = "secondary", size = "md", children, disableSound = false, onClick, ...props }, ref) => {
    const { play } = useSound()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableSound) {
        play("click")
      }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          "relative flex items-center justify-center font-semibold uppercase tracking-wider transition-all duration-200",
          "rounded-xl border-2 shadow-lg",
          "active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          // Variant styles
          variant === "primary" && [
            "bg-primary text-primary-foreground border-primary/50",
            "hover:bg-primary/90 hover:shadow-primary/25",
          ],
          variant === "secondary" && [
            "bg-secondary text-secondary-foreground border-border",
            "hover:bg-secondary/80 hover:border-primary/50",
          ],
          variant === "ghost" && ["bg-transparent text-foreground border-transparent", "hover:bg-secondary/50"],
          // Size styles
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-base min-h-14",
          size === "lg" && "px-8 py-4 text-lg min-h-16",
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  },
)
GameButton.displayName = "GameButton"

export { GameButton }
