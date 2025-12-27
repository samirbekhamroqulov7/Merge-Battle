"use client"

import { useEffect, useState, useRef, useCallback } from "react"

export function useMusic() {
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("musicEnabled")
      if (saved !== null) {
        setMusicEnabled(saved === "true")
      }

      audioRef.current = new Audio()
      audioRef.current.loop = true
      audioRef.current.volume = 0.3
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const playMusic = useCallback(
    (track: string) => {
      if (!isClient || !audioRef.current || !musicEnabled) return

      if (currentTrack !== track) {
        audioRef.current.src = track
        setCurrentTrack(track)
      }

      audioRef.current.play().catch(() => {
        // Silently handle autoplay restrictions
      })
    },
    [musicEnabled, currentTrack, isClient],
  )

  const stopMusic = useCallback(() => {
    if (!isClient || !audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
  }, [isClient])

  const toggleMusic = useCallback(() => {
    if (!isClient) return

    const newState = !musicEnabled
    setMusicEnabled(newState)

    if (typeof window !== "undefined") {
      localStorage.setItem("musicEnabled", String(newState))
    }

    if (!newState && audioRef.current) {
      audioRef.current.pause()
    } else if (newState && currentTrack && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [musicEnabled, currentTrack, isClient])

  useEffect(() => {
    if (!isClient || !audioRef.current) return

    if (musicEnabled && currentTrack) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [musicEnabled, currentTrack, isClient])

  return {
    musicEnabled,
    toggleMusic,
    playMusic,
    stopMusic,
    currentTrack,
  }
}
