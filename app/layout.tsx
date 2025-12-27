import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import { SessionRestorer } from "@/components/session-restorer"
import "./globals.css"

const _geist = Geist({ subsets: ["latin", "cyrillic"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Brain Battle - Multiplayer Brain Games & Puzzles",
  description:
    "Play challenging brain games and puzzles online with friends. Compete in PVP matches, improve your cognitive skills with Chess, Sudoku, Math Duels, Tic-Tac-Toe, and more!",
  keywords: [
    "brain games",
    "puzzle games",
    "multiplayer games",
    "chess online",
    "sudoku",
    "brain battle",
    "cognitive games",
    "pvp games",
    "online games",
    "logic games",
    "strategy games",
    "brain training",
    "mind games",
    "thinking games",
  ],
  authors: [{ name: "Brain Battle Team" }],
  creator: "Brain Battle",
  publisher: "Brain Battle",
  applicationName: "Brain Battle",
  referrer: "origin-when-cross-origin",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Brain Battle",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brain-battle-az-dil.vercel.app",
    siteName: "Brain Battle",
    title: "Brain Battle - Multiplayer Brain Games & Puzzles",
    description:
      "Challenge your mind with multiplayer brain games. Play Chess, Sudoku, Math Duels, and more. Compete in PVP matches and improve your cognitive skills!",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brain Battle - Multiplayer Brain Games & Puzzles",
    description:
      "Challenge your mind with multiplayer brain games. Play Chess, Sudoku, Math Duels, and more. Compete in PVP matches!",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "games",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="canonical" href="https://brain-battle-az-dil.vercel.app" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        <Providers>
          <SessionRestorer />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
