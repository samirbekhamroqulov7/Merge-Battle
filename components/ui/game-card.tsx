"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GameCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive"
}

const GameCard = React.forwardRef<HTMLDivElement, GameCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border-2 border-border bg-card",
          variant === "elevated" && "shadow-xl shadow-black/20",
          variant === "interactive" && [
            "cursor-pointer transition-all duration-200",
            "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
            "active:scale-[0.98]",
          ],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
GameCard.displayName = "GameCard"

export { GameCard }
