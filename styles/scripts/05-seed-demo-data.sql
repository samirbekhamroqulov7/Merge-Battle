-- =====================================================
-- ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ (ОПЦИОНАЛЬНО)
-- =====================================================
-- Выполните этот скрипт ПЯТЫМ если хотите тестовые данные
-- ВНИМАНИЕ: Используйте только в development среде!

-- Этот скрипт можно пропустить в production

-- Создание тестового пользователя (замените UUID на реальный из auth.users)
-- INSERT INTO users (auth_id, email, username, avatar_url, isGuest)
-- VALUES (
--     'ВАSH_AUTH_UUID_ЗДЕСЬ',
--     'test@example.com',
--     'TestUser',
--     'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
--     false
-- );

-- Добавление мастерства для тестового пользователя
-- INSERT INTO mastery (user_id, level, mini_level, fragments, total_wins)
-- VALUES ('ВАШ_AUTH_UUID_ЗДЕСЬ', 5, 2, 3, 25);

-- Добавление славы для тестового пользователя
-- INSERT INTO glory (user_id, level, wins, total_glory_wins)
-- VALUES ('ВАШ_AUTH_UUID_ЗДЕСЬ', 3, 5, 15);

-- Демо данные готовы
SELECT 'Демонстрационные данные созданы (если раскомментировали)' AS status;
