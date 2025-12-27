-- =====================================================
-- НАСТРОЙКА ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Выполните этот скрипт ЧЕТВЕРТЫМ

-- =====================================================
-- ВКЛЮЧЕНИЕ RLS НА ВСЕХ ТАБЛИЦАХ
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE glory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USERS
-- =====================================================
-- Пользователи могут видеть свой профиль
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    USING (auth.uid() = auth_id);

-- Пользователи могут обновлять свой профиль
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = auth_id);

-- Пользователи могут создавать свой профиль
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = auth_id);

-- Все могут видеть публичную информацию профилей
CREATE POLICY "Public can view profiles" ON users
    FOR SELECT
    USING (true);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ MASTERY
-- =====================================================
CREATE POLICY "Users can view own mastery" ON mastery
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mastery" ON mastery
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mastery" ON mastery
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ GLORY
-- =====================================================
CREATE POLICY "Users can view own glory" ON glory
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own glory" ON glory
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own glory" ON glory
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USER_PURCHASES
-- =====================================================
CREATE POLICY "Users can view own purchases" ON user_purchases
    FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own purchases" ON user_purchases
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own purchases" ON user_purchases
    FOR UPDATE
    USING (auth.uid()::text = user_id::text);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USER_GAME_STATS
-- =====================================================
CREATE POLICY "Users can view own game stats" ON user_game_stats
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game stats" ON user_game_stats
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game stats" ON user_game_stats
    FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USER_GAME_PROGRESS
-- =====================================================
CREATE POLICY "Users can view own game progress" ON user_game_progress
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game progress" ON user_game_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game progress" ON user_game_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ USER_DEVICES
-- =====================================================
CREATE POLICY "Users can view own devices" ON user_devices
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices" ON user_devices
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ MATCHES
-- =====================================================
CREATE POLICY "Users can view matches they participate in" ON matches
    FOR SELECT
    USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can insert matches" ON matches
    FOR INSERT
    WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can update matches they participate in" ON matches
    FOR UPDATE
    USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ MATCHMAKING_QUEUE
-- =====================================================
CREATE POLICY "Users can view own queue entries" ON matchmaking_queue
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue entries" ON matchmaking_queue
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own queue entries" ON matchmaking_queue
    FOR DELETE
    USING (auth.uid() = user_id);

-- Система может видеть всю очередь для матчмейкинга
CREATE POLICY "System can view all queue entries" ON matchmaking_queue
    FOR SELECT
    USING (true);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ТАБЛИЦЫ PLAYER_STATS
-- =====================================================
CREATE POLICY "Users can view own player stats" ON player_stats
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own player stats" ON player_stats
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Все могут видеть статистику игроков для рейтингов
CREATE POLICY "Public can view player stats" ON player_stats
    FOR SELECT
    USING (true);

-- Конец настройки RLS
