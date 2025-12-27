"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { translations, type Language } from "./translations"

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

type TranslationKeys = NestedKeyOf<(typeof translations)["en"]>

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKeys) => string
}

const defaultT = (key: TranslationKeys): string => {
  const keys = key.split(".")
  let value: unknown = translations["en"]
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }
  return typeof value === "string" ? value : key
}

const defaultContextValue: I18nContextType = {
  language: "en",
  setLanguage: () => {},
  t: defaultT,
}

const I18nContext = createContext<I18nContextType>(defaultContextValue)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("language") as Language
      if (savedLang && translations[savedLang]) {
        setLanguageState(savedLang)
      }
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang)
    }
  }, [])

  const t = useCallback(
    (key: TranslationKeys): string => {
      const keys = key.split(".")
      let value: unknown = translations[language]
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k]
        } else {
          // Fallback to English
          value = translations["en"]
          for (const fallbackKey of keys) {
            if (value && typeof value === "object" && fallbackKey in value) {
              value = (value as Record<string, unknown>)[fallbackKey]
            }
          }
          break
        }
      }
      return typeof value === "string" ? value : key
    },
    [language],
  )

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  return context
}

export const useLanguage = useI18n
