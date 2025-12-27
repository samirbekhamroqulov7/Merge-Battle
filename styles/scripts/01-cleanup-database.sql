-- =====================================================
-- СКРИПТ ПОЛНОЙ ОЧИСТКИ БАЗЫ ДАННЫХ
-- =====================================================
-- Этот скрипт удаляет все таблицы, функции, триггеры и политики RLS
-- Выполните этот скрипт ПЕРВЫМ для полной очистки

-- Удаление всех политик RLS
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Public can view profiles" ON users;

DROP POLICY IF EXISTS "Users can view own mastery" ON mastery;
DROP POLICY IF EXISTS "Users can update own mastery" ON mastery;
DROP POLICY IF EXISTS "Users can insert own mastery" ON mastery;

DROP POLICY IF EXISTS "Users can view own glory" ON glory;
DROP POLICY IF EXISTS "Users can update own glory" ON glory;
DROP POLICY IF EXISTS "Users can insert own glory" ON glory;

DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON user_purchases;
DROP POLICY IF EXISTS "Users can update own purchases" ON user_purchases;

DROP POLICY IF EXISTS "Users can view own game stats" ON user_game_stats;
DROP POLICY IF EXISTS "Users can insert own game stats" ON user_game_stats;
DROP POLICY IF EXISTS "Users can update own game stats" ON user_game_stats;

DROP POLICY IF EXISTS "Users can view own game progress" ON user_game_progress;
DROP POLICY IF EXISTS "Users can insert own game progress" ON user_game_progress;
DROP POLICY IF EXISTS "Users can update own game progress" ON user_game_progress;

DROP POLICY IF EXISTS "Users can view own devices" ON user_devices;
DROP POLICY IF EXISTS "Users can insert own devices" ON user_devices;

DROP POLICY IF EXISTS "Users can view matches they participate in" ON matches;
DROP POLICY IF EXISTS "Users can insert matches" ON matches;
DROP POLICY IF EXISTS "Users can update matches they participate in" ON matches;

DROP POLICY IF EXISTS "Users can view own queue entries" ON matchmaking_queue;
DROP POLICY IF EXISTS "Users can insert own queue entries" ON matchmaking_queue;
DROP POLICY IF EXISTS "Users can delete own queue entries" ON matchmaking_queue;
DROP POLICY IF EXISTS "System can view all queue entries" ON matchmaking_queue;

DROP POLICY IF EXISTS "Users can view own player stats" ON player_stats;
DROP POLICY IF EXISTS "Users can update own player stats" ON player_stats;
DROP POLICY IF EXISTS "Public can view player stats" ON player_stats;

-- Удаление функций
DROP FUNCTION IF EXISTS update_mastery_on_win(uuid);
DROP FUNCTION IF EXISTS update_glory_on_win(uuid);
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_new_user();

-- Удаление триггеров
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_mastery_updated_at ON mastery;
DROP TRIGGER IF EXISTS update_glory_updated_at ON glory;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Удаление таблиц (в правильном порядке из-за внешних ключей)
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS user_game_progress CASCADE;
DROP TABLE IF EXISTS user_game_stats CASCADE;
DROP TABLE IF EXISTS user_purchases CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS matchmaking_queue CASCADE;
DROP TABLE IF EXISTS player_stats CASCADE;
DROP TABLE IF EXISTS glory CASCADE;
DROP TABLE IF EXISTS mastery CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Удаление индексов (если остались)
DROP INDEX IF EXISTS idx_users_auth_id;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_mastery_user_id;
DROP INDEX IF EXISTS idx_glory_user_id;
DROP INDEX IF EXISTS idx_user_purchases_user_id;
DROP INDEX IF EXISTS idx_user_game_stats_user_id;
DROP INDEX IF EXISTS idx_user_game_progress_user_id;
DROP INDEX IF EXISTS idx_matches_player1_id;
DROP INDEX IF EXISTS idx_matches_player2_id;
DROP INDEX IF EXISTS idx_matchmaking_queue_user_id;
DROP INDEX IF EXISTS idx_player_stats_user_id;

-- Очистка завершена
