"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface AvatarCircleProps {
  src?: string | null
  alt?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function AvatarCircle({ src, alt = "Avatar", size = "lg", className }: AvatarCircleProps) {
  const [error, setError] = React.useState(false)

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  }

  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 48,
    xl: 64,
  }

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden",
        "bg-gradient-to-br from-primary/30 to-accent/30",
        "border-4 border-primary/50 shadow-lg shadow-primary/20",
        sizeClasses[size],
        className,
      )}
    >
      {src && !error ? (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
          crossOrigin="anonymous"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-secondary">
          <User size={iconSizes[size]} className="text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
