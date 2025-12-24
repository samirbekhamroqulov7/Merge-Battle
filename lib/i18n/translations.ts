import { enTranslations } from "./translations-en"
import { ruTranslations } from "./translations-ru"
import { uzTranslations } from "./translations-uz"
import { kkTranslations } from "./translations-kk"
import { trTranslations } from "./translations-tr"
import { arTranslations } from "./translations-ar"
import { faTranslations } from "./translations-fa"
import { deTranslations } from "./translations-de"
import { frTranslations } from "./translations-fr"
import { esTranslations } from "./translations-es"
import { ptTranslations } from "./translations-pt"

export const translations = {
  en: enTranslations,
  ru: ruTranslations,
  uz: uzTranslations,
  kk: kkTranslations,
  tr: trTranslations,
  ar: arTranslations,
  fa: faTranslations,
  de: deTranslations,
  fr: frTranslations,
  es: esTranslations,
  pt: ptTranslations,
}

export const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "uz", name: "Uzbek", nativeName: "O'zbek" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақша" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
]

export type LanguageCode = (typeof languages)[number]["code"]
export type TranslationKey = keyof (typeof translations)["en"]
