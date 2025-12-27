"use client"

import { ReactNode } from "react"

interface GameLayoutProps {
  children: ReactNode
  gameName: string
}

export function GameLayout({ children, gameName }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
