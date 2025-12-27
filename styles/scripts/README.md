# Инструкция по настройке базы данных Supabase

## Порядок выполнения SQL скриптов

Выполняйте скрипты **СТРОГО** в указанном порядке:

### 1. Очистка базы данных
```sql
-- Файл: 01-cleanup-database.sql
```
Удаляет все существующие таблицы, функции, триггеры и политики RLS.
⚠️ **ВНИМАНИЕ**: Все данные будут удалены!

### 2. Создание таблиц
```sql
-- Файл: 02-create-tables.sql
```
Создает все необходимые таблицы:
- `users` - профили пользователей
- `mastery` - прогресс мастерства
- `glory` - прогресс славы
- `user_purchases` - покупки
- `user_game_stats` - статистика по играм
- `user_game_progress` - сохраненный прогресс
- `user_devices` - информация об устройствах
- `matches` - PvP матчи
- `matchmaking_queue` - очередь матчмейкинга
- `player_stats` - общая PvP статистика

### 3. Создание функций и триггеров
```sql
-- Файл: 03-create-functions-triggers.sql
```
Создает:
- Функции обновления прогресса
- Автоматические триггеры
- Логику обработки побед

### 4. Настройка Row Level Security (RLS)
```sql
-- Файл: 04-setup-rls-policies.sql
```
Включает RLS и создает политики безопасности для всех таблиц.

### 5. Демо данные (опционально)
```sql
-- Файл: 05-seed-demo-data.sql
```
Добавляет тестовые данные для разработки.
⚠️ **Не используйте в production!**

---

## Как выполнить скрипты в Supabase

### Метод 1: Через SQL Editor в Supabase Dashboard
1. Откройте https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в `SQL Editor`
4. Создайте новый запрос
5. Скопируйте содержимое скрипта
6. Нажмите `Run` или `Ctrl+Enter`
7. Повторите для каждого скрипта по порядку

### Метод 2: Через v0 (рекомендуется)
1. v0 может выполнить эти скрипты автоматически
2. Просто скажите: "Выполни SQL скрипты из папки scripts"
3. v0 выполнит их в правильном порядке

---

## Проверка успешной установки

После выполнения всех скриптов проверьте:

```sql
-- Проверка созданных таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Проверка включенного RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Проверка функций
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

Вы должны увидеть:
- ✅ 10 таблиц
- ✅ RLS включен на всех таблицах
- ✅ 4 функции

---

## Настройка Google OAuth

После создания таблиц настройте Google OAuth:

1. Перейдите в `Authentication > Providers`
2. Включите `Google`
3. Добавьте:
   - Client ID
   - Client Secret
4. В разделе `Redirect URLs` добавьте:
   ```
   https://ваш-проект.supabase.co/auth/v1/callback
   ```

---

## Environment Variables

Убедитесь что в вашем проекте есть:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key
NEXT_PUBLIC_SITE_URL=https://ваш-сайт.com
```

---

## Решение проблем

### Ошибка: "permission denied"
Убедитесь что вы используете Service Role key для выполнения скриптов через API.

### Ошибка: "relation already exists"
Запустите скрипт `01-cleanup-database.sql` сначала.

### Ошибка: "function does not exist"
Убедитесь что выполнили скрипты в правильном порядке.

### Бесконечная загрузка после логина
1. Проверьте что таблица `users` создана
2. Проверьте что триггер `on_auth_user_created` работает
3. Проверьте RLS политики

---

## Обновление существующей БД

Если у вас уже есть данные:

1. Сделайте backup через Supabase Dashboard
2. Экспортируйте важные данные
3. Выполните cleanup скрипт
4. Выполните создание таблиц
5. Импортируйте данные обратно

---

## Поддержка

Если возникли проблемы:
1. Проверьте логи в `Database > Logs`
2. Проверьте `Auth > Logs`
3. Используйте SQL Editor для тестовых запросов
