import Link from "next/link"
import { AlertCircle, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full p-8 text-center rounded-xl border-2 border-border bg-card shadow-xl shadow-black/20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>

        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-3">Страница не найдена</h2>

        <p className="text-muted-foreground mb-6">
          Извините, страница, которую вы ищете, не существует. Возможно, она была удалена или перемещена.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center w-full px-6 py-3 text-base min-h-14 font-semibold uppercase tracking-wider transition-all duration-200 rounded-xl border-2 shadow-lg bg-primary text-primary-foreground border-primary/50 hover:bg-primary/90 hover:shadow-primary/25 active:scale-95"
        >
          <Home className="w-5 h-5 mr-2" />
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}
