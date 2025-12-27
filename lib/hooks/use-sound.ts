"use client"

import { useCallback, useRef, useEffect, useState } from "react"

interface SoundOptions {
  volume?: number
  loop?: boolean
}

const SOUNDS = {
  click: "/sounds/click.mp3",
  win: "/sounds/win.mp3",
  lose: "/sounds/lose.mp3",
  move: "/sounds/move.mp3",
  match: "/sounds/match.mp3",
  notification: "/sounds/notification.mp3",
} as const

type SoundName = keyof typeof SOUNDS

export function useSound() {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return

    const saved = localStorage.getItem("soundEnabled")
    if (saved !== null) {
      setSoundEnabled(JSON.parse(saved))
    }
  }, [isClient])

  const toggleSound = useCallback(() => {
    if (!isClient || typeof window === "undefined") return

    setSoundEnabled((prev) => {
      const newValue = !prev
      localStorage.setItem("soundEnabled", JSON.stringify(newValue))
      return newValue
    })
  }, [isClient])

  const play = useCallback(
    (name: SoundName, options?: SoundOptions) => {
      if (!isClient || !soundEnabled || typeof window === "undefined") return

      const src = SOUNDS[name]
      let audio = audioRefs.current.get(name)

      if (!audio) {
        audio = new Audio(src)
        audioRefs.current.set(name, audio)
      }

      audio.volume = options?.volume ?? 0.5
      audio.loop = options?.loop ?? false
      audio.currentTime = 0
      audio.play().catch(() => {
        // Silently handle autoplay restrictions
      })
    },
    [soundEnabled, isClient],
  )

  const stop = useCallback(
    (name: SoundName) => {
      if (!isClient) return

      const audio = audioRefs.current.get(name)
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    },
    [isClient],
  )

  return { play, stop, soundEnabled, toggleSound }
}
