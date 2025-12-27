"use client"

import type React from "react"

import { useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { useUser } from "@/lib/hooks/use-user"
import { GameButton } from "@/components/ui/game-button"
import { GameCard } from "@/components/ui/game-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Send, CheckCircle, Mail } from "lucide-react"

interface HelpModalProps {
  onClose: () => void
}

export function HelpModal({ onClose }: HelpModalProps) {
  const { t } = useI18n()
  const { profile } = useUser()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const mailtoLink = `mailto:samirhamroqulov7@gmail.com?subject=${encodeURIComponent(
      subject || "Brain Battle Support Request",
    )}&body=${encodeURIComponent(
      `From: ${profile?.username || "Guest User"}\n\nMessage:\n${message}\n\n---\nSent from Brain Battle`,
    )}`

    window.location.href = mailtoLink

    setIsSubmitted(true)
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <GameCard variant="elevated" className="w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary">{t("settings.help")}</h2>
                <p className="text-sm text-muted-foreground">{t("settings.helpDescription")}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-foreground">
                  {t("settings.subject")}
                </Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder={t("settings.subjectPlaceholder")}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">
                  {t("settings.message")}
                </Label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder={t("settings.messagePlaceholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>

              <div className="bg-muted/30 border border-border rounded-lg p-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>samirhamroqulov7@gmail.com</span>
                </p>
              </div>

              <GameButton type="submit" variant="primary" size="md" className="w-full">
                <Send className="w-5 h-5 mr-2" />
                {t("settings.sendMessage")}
              </GameButton>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-primary">{t("settings.messageSent")}</h3>
            <p className="text-sm text-muted-foreground text-center">{t("settings.messageSentDescription")}</p>
          </div>
        )}
      </GameCard>
    </div>
  )
}
