# Настройка Supabase для BrainBattle

## Что нужно для работы приложения

Приложение использует **Supabase** для авторизации (включая Google OAuth) и хранения данных пользователей.

## Переменные окружения

Вам нужно добавить в Vercel следующие переменные окружения:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

## Как получить эти значения

1. Войдите в ваш аккаунт Supabase (где уже настроен проект)
2. Откройте Settings → API
3. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Google OAuth

Google OAuth уже должен быть настроен в вашем Supabase проекте. Если нет:

1. В Supabase: Authentication → Providers → Google
2. Включите Google provider
3. Добавьте Client ID и Client Secret из Google Cloud Console
4. В Authorized redirect URIs добавьте: `https://your-project.supabase.co/auth/v1/callback`

## Структура базы данных

Убедитесь, что в вашей Supabase базе данных есть таблицы:
- `users` - профили пользователей
- `mastery` - прогресс мастерства
- `glory` - прогресс славы
- `user_purchases` - покупки
- `user_game_stats` - статистика игр
- `matches` - PvP матчи

## Функции авторизации

### Вход с email/password
```ts
import { signInWithEmail } from '@/lib/supabase/client'
await signInWithEmail(email, password)
```

### Регистрация
```ts
import { signUpWithEmail } from '@/lib/supabase/client'
await signUpWithEmail(email, password, username)
```

### Google OAuth
```ts
import { signInWithGoogle } from '@/lib/supabase/client'
await signInWithGoogle()
```

### Гостевой режим
```ts
import { signInAsGuest } from '@/lib/supabase/client'
await signInAsGuest()
```

## Что было восстановлено

- ✅ Google OAuth авторизация
- ✅ Email/Password регистрация через Supabase
- ✅ Автоматическое создание профиля при OAuth
- ✅ Callback route для обработки OAuth
- ✅ Гостевой режим (без Supabase)

## Troubleshooting

### "Registration failed"
- Проверьте что переменные окружения правильно настроены в Vercel
- Убедитесь что в Supabase включен Email provider (Authentication → Providers → Email)

### Google OAuth не работает
- Проверьте что Google provider включен в Supabase
- Убедитесь что redirect URL правильно настроен в Google Cloud Console

### "Invalid credentials"
- Проверьте правильность email и пароля
- Убедитесь что пользователь зарегистрирован в Supabase
