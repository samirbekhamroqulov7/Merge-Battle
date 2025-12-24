# Чеклист для деплоя

## Перед деплоем

### 1. Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` установлен
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` установлен
- [ ] `SUPABASE_SERVICE_ROLE_KEY` установлен (для admin API)
- [ ] `NEXT_PUBLIC_SITE_URL` установлен (продакшен URL)

### 2. Supabase настройки
- [ ] Email подтверждение отключено (Authentication → Providers → Email)
- [ ] Google OAuth настроен (если используется)
- [ ] Redirect URLs добавлены в Supabase
  - `https://yourdomain.com/auth/callback`
  - `http://localhost:3000/auth/callback` (для разработки)

### 3. База данных
- [ ] SQL скрипты выполнены:
  - `01-drop-all-tables.sql` (только если нужно сбросить все)
  - `02-create-tables.sql`
  - `03-add-password-reset-table.sql`
- [ ] Row Level Security (RLS) включен на всех таблицах
- [ ] Тестовые данные удалены (если были)

### 4. Код
- [ ] `console.log('[v0] ...')` логи удалены или отключены в продакшене
- [ ] `devCode` удален из response в `/api/auth/reset-password/request`
- [ ] Все `TODO` в коде проверены
- [ ] Error handling проверен во всех критических местах

### 5. Email сервис (если настроен)
- [ ] Email провайдер настроен (SendGrid/Resend/etc)
- [ ] Email шаблоны созданы
- [ ] Тестовая отправка email работает
- [ ] От кого/тема email настроены

## После деплоя

### 1. Функциональное тестирование
- [ ] Регистрация нового пользователя работает
- [ ] Вход существующего пользователя работает
- [ ] Google OAuth работает (если настроен)
- [ ] Гостевой режим работает
- [ ] Восстановление пароля работает
- [ ] Выход из аккаунта работает

### 2. Тестирование ошибок
- [ ] Неверный email при входе
- [ ] Неверный пароль при входе
- [ ] Регистрация с существующим email
- [ ] Слабый пароль (< 6 символов)
- [ ] Невалидный email формат
- [ ] Истекший код сброса пароля
- [ ] Неверный код сброса пароля

### 3. Производительность
- [ ] API routes отвечают < 1 секунды
- [ ] Страницы загружаются быстро
- [ ] Нет утечек памяти
- [ ] Логи не переполняют систему

### 4. Безопасность
- [ ] HTTPS включен
- [ ] CORS настроен правильно
- [ ] Нет утечки sensitive данных в логах
- [ ] Rate limiting работает (если настроен)
- [ ] SQL injection невозможна

### 5. Мониторинг
- [ ] Sentry или другой error tracking настроен
- [ ] Алерты для критических ошибок настроены
- [ ] Логи доступны и читаемы
- [ ] Метрики производительности отслеживаются

## В случае проблем

### Проблема: "Registration failed"
**Проверить:**
1. Логи в Vercel Functions → `/api/register`
2. Supabase Database → проверить таблицу `users`
3. Supabase Auth → проверить настройки email подтверждения
4. Environment variables корректны

### Проблема: "Invalid or expired reset code"
**Проверить:**
1. Таблица `password_reset_codes` существует
2. Код не истек (< 15 минут)
3. Код не использован ранее
4. Email совпадает

### Проблема: Google OAuth не работает
**Проверить:**
1. Google Client ID и Secret корректны в Supabase
2. Redirect URL добавлен в Google Console
3. Redirect URL добавлен в Supabase
4. Google OAuth включен в Supabase

### Проблема: "User not authenticated"
**Проверить:**
1. Cookie сохраняются в браузере
2. Session не истекла
3. Supabase URL и keys корректны
4. Middleware не блокирует auth cookies

## Откат (Rollback)

Если что-то пошло не так:

1. **Откатить код:**
   ```bash
   git revert HEAD
   git push
   ```

2. **Откатить базу данных:**
   - Восстановить из бэкапа Supabase
   - Или выполнить старые SQL скрипты

3. **Проверить что работает:**
   - Старая авторизация восстановлена
   - Пользователи могут войти
   - Данные не потеряны

## Контакты поддержки

- Supabase Support: https://supabase.com/support
- Vercel Support: https://vercel.com/help
- GitHub Issues: [ссылка на ваш репозиторий]
