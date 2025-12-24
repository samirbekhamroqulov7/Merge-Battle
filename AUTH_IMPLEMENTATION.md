# Система авторизации BrainBattle

## Обзор

Полностью функциональная система авторизации с использованием Supabase, включающая:
- ✅ Регистрация без подтверждения email
- ✅ Вход по email/password
- ✅ OAuth через Google
- ✅ Гостевой режим
- ✅ Восстановление пароля по 6-значному коду
- ✅ Модульная архитектура (<200 строк на файл)

## Структура файлов

### Клиентские модули (lib/supabase/)

```
lib/supabase/
├── client.ts              # Главный клиент (8 строк + реэкспорты)
├── client-auth.ts         # Авторизация (110 строк)
├── client-guest.ts        # Гостевой режим (48 строк)
├── client-purchases.ts    # Покупки (180 строк)
├── client-progress.ts     # Прогресс игр (120 строк)
├── server.ts              # Серверный клиент
└── proxy.ts               # Прокси конфиг
```

### API Routes

```
app/api/
├── register/route.ts                         # Регистрация
├── auth/
│   ├── guest/route.ts                       # Создание гостя
│   ├── me/route.ts                          # Текущий пользователь
│   └── reset-password/
│       ├── request/route.ts                 # Запрос кода сброса
│       └── verify/route.ts                  # Проверка кода и сброс
```

### Страницы

```
app/auth/
├── login/page.tsx           # Вход (186 строк)
├── sign-up/page.tsx         # Регистрация (176 строк)
├── reset-password/page.tsx  # Сброс пароля (150 строк)
└── callback/route.ts        # OAuth callback
```

## База данных

### Таблицы

**users** - Профили пользователей
```sql
- id (UUID, primary key)
- auth_id (TEXT, ссылка на supabase auth)
- email (TEXT, unique)
- username (TEXT)
- avatar_url (TEXT)
- avatar_frame (TEXT)
- nickname_style (TEXT)
- language (TEXT)
- sound_enabled (BOOLEAN)
- music_enabled (BOOLEAN)
- isGuest (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**password_reset_codes** - Коды восстановления пароля
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key → users.id)
- email (TEXT)
- code (TEXT, 6 цифр)
- expires_at (TIMESTAMPTZ, +15 минут)
- used (BOOLEAN)
- created_at (TIMESTAMPTZ)
```

**mastery** - Уровень мастерства
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key → users.id)
- level (INTEGER)
- mini_level (INTEGER)
- fragments (INTEGER)
- total_wins (INTEGER)
- created_at (TIMESTAMPTZ)
```

**glory** - Слава в PvP
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key → users.id)
- level (INTEGER)
- wins (INTEGER)
- total_glory_wins (INTEGER)
- created_at (TIMESTAMPTZ)
```

### SQL Скрипты

1. **scripts/01-drop-all-tables.sql** - Удаляет все таблицы
2. **scripts/02-create-tables.sql** - Создает основные таблицы
3. **scripts/03-add-password-reset-table.sql** - Добавляет таблицу для сброса пароля

## API Endpoints

### POST /api/register
Регистрация нового пользователя

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username" // опционально
}
```

**Response (success):**
```json
{
  "success": true,
  "user": { "id": "...", "email": "...", "username": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

**Особенности:**
- Если пользователь существует, автоматически выполняет вход
- Автоматически входит после успешной регистрации
- Создает профиль, mastery и glory записи
- НЕ требует подтверждения email

### POST /api/auth/reset-password/request
Запрос кода для сброса пароля

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Reset code sent to your email",
  "devCode": "123456"  // только в dev режиме
}
```

**Особенности:**
- Генерирует 6-значный код
- Код действителен 15 минут
- В dev режиме возвращает код в response
- В продакшене код должен отправляться на email

### POST /api/auth/reset-password/verify
Проверка кода и сброс пароля

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Особенности:**
- Проверяет код на валидность и срок действия
- Обновляет пароль через Supabase Admin API
- Помечает код как использованный
- Требует минимум 6 символов для пароля

## Использование

### Регистрация

```typescript
import { signUpWithEmail } from '@/lib/supabase/client'

const handleSignUp = async () => {
  try {
    const result = await signUpWithEmail(email, password, username)
    console.log('User registered:', result)
    // Автоматически вошел, перенаправить на главную
    router.push('/')
  } catch (error) {
    console.error('Registration failed:', error.message)
  }
}
```

### Вход

```typescript
import { signInWithEmail } from '@/lib/supabase/client'

const handleLogin = async () => {
  try {
    const result = await signInWithEmail(email, password)
    console.log('User logged in:', result)
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error.message)
  }
}
```

### Google OAuth

```typescript
import { signInWithGoogle } from '@/lib/supabase/client'

const handleGoogleLogin = async () => {
  try {
    await signInWithGoogle()
    // Автоматически перенаправит на Google
  } catch (error) {
    console.error('Google login failed:', error.message)
  }
}
```

### Восстановление пароля

```typescript
import { requestPasswordReset, verifyResetCode } from '@/lib/supabase/client'

// Шаг 1: Запросить код
const handleRequestCode = async () => {
  try {
    const result = await requestPasswordReset(email)
    console.log('Code sent:', result)
    // В dev режиме: result.devCode содержит код
  } catch (error) {
    console.error('Request failed:', error.message)
  }
}

// Шаг 2: Проверить код и сбросить пароль
const handleResetPassword = async () => {
  try {
    await verifyResetCode(email, code, newPassword)
    console.log('Password reset successful')
    router.push('/auth/login?reset=success')
  } catch (error) {
    console.error('Reset failed:', error.message)
  }
}
```

### Гостевой режим

```typescript
import { signInAsGuest } from '@/lib/supabase/client'

const handleGuestLogin = async () => {
  try {
    const result = await signInAsGuest()
    console.log('Guest account created:', result)
    localStorage.setItem('brain_battle_guest_mode', 'true')
    router.push('/')
  } catch (error) {
    console.error('Guest login failed:', error.message)
  }
}
```

### Выход

```typescript
import { signOut } from '@/lib/supabase/client'

const handleLogout = async () => {
  try {
    await signOut()
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error.message)
  }
}
```

## Настройка Supabase

### 1. Environment Variables

Добавьте в `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Отключение подтверждения email

В Supabase Dashboard:
1. Перейдите в **Authentication** → **Providers** → **Email**
2. Отключите опцию **"Confirm email"**
3. Сохраните изменения

### 3. Настройка Google OAuth

В Supabase Dashboard:
1. Перейдите в **Authentication** → **Providers** → **Google**
2. Включите провайдера
3. Добавьте **Client ID** и **Client Secret** из Google Console
4. Добавьте redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 4. Запуск SQL скриптов

Выполните скрипты в порядке:
1. `scripts/01-drop-all-tables.sql`
2. `scripts/02-create-tables.sql`
3. `scripts/03-add-password-reset-table.sql`

## Отладка

Все критические точки имеют логирование с префиксом `[v0]`:

```typescript
console.log('[v0] Registration started for:', email)
console.log('[v0] User created successfully')
console.error('[v0] Registration error:', error)
```

Откройте консоль браузера (F12) для просмотра детальных логов.

### Проверка логов в Vercel

1. Откройте Vercel Dashboard
2. Перейдите в **Deployments** → выберите деплой → **Functions**
3. Выберите API route (например, `/api/register`)
4. Просмотрите логи выполнения

## Безопасность

### Реализовано:
- ✅ Пароли хешируются через Supabase Auth
- ✅ HTTP-only cookies для сессий
- ✅ Коды сброса пароля истекают через 15 минут
- ✅ Коды можно использовать только один раз
- ✅ Row Level Security (RLS) на таблицах
- ✅ Валидация на клиенте и сервере
- ✅ Защита от SQL инъекций (Supabase)

### Требуется добавить:
- ⚠️ Отправка email для сброса пароля (сейчас только логируется)
- ⚠️ Rate limiting для API endpoints
- ⚠️ CAPTCHA для защиты от ботов

## Ограничения

### Гостевой режим:
- Прогресс сохраняется только в localStorage
- Нельзя играть в PvP
- Ограниченный доступ к функциям
- Данные теряются при очистке браузера

### Development режим:
- Коды сброса пароля возвращаются в response
- Demo покупки для товаров ≤$10
- Расширенное логирование

## Миграция с localStorage на базу данных

Если пользователь переходит с гостевого режима на полную регистрацию, данные можно мигрировать:

```typescript
// После успешной регистрации
const guestPurchases = JSON.parse(localStorage.getItem('brain_battle_guest_purchases') || '[]')
const guestProgress = JSON.parse(localStorage.getItem('brain_battle_guest_progress') || '{}')

// Отправить на сервер для миграции в базу данных
await fetch('/api/migrate-guest-data', {
  method: 'POST',
  body: JSON.stringify({ purchases: guestPurchases, progress: guestProgress })
})

// Очистить localStorage
localStorage.removeItem('brain_battle_guest_purchases')
localStorage.removeItem('brain_battle_guest_progress')
```

## TODO для продакшена

1. **Email сервис:**
   - Интегрировать SendGrid/Resend/Mailgun
   - Создать шаблоны email для сброса пароля
   - Удалить `devCode` из response в production

2. **Rate Limiting:**
   - Добавить middleware для ограничения запросов
   - Использовать Upstash Rate Limit или Vercel Edge Config

3. **Мониторинг:**
   - Добавить Sentry для отслеживания ошибок
   - Настроить алерты для критических ошибок авторизации

4. **Тестирование:**
   - Unit тесты для auth функций
   - E2E тесты для flow регистрации/входа
   - Тесты безопасности

5. **Улучшения UX:**
   - Показывать силу пароля при регистрации
   - Автоматический логин после сброса пароля
   - Remember me функция
   - 2FA опция для продвинутых пользователей
