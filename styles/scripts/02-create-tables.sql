-- =====================================================
-- СОЗДАНИЕ ОСНОВНЫХ ТАБЛИЦ
-- =====================================================
-- Выполните этот скрипт ВТОРЫМ после очистки

-- Включение расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (ПРОФИЛИ)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    password_hash TEXT,
    avatar_url TEXT,
    avatar_frame TEXT DEFAULT 'none',
    nickname_style TEXT DEFAULT 'normal',
    language TEXT DEFAULT 'ru',
    sound_enabled BOOLEAN DEFAULT true,
    music_enabled BOOLEAN DEFAULT true,
    isGuest BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Индексы для таблицы users
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

COMMENT ON TABLE users IS 'Профили пользователей с настройками';
COMMENT ON COLUMN users.auth_id IS 'Уникальный ID пользователя';
COMMENT ON COLUMN users.password_hash IS 'Хеш пароля пользователя';
COMMENT ON COLUMN users.isGuest IS 'Гостевой аккаунт или полноценный';

-- =====================================================
-- ТАБЛИЦА ТОКЕНОВ СБРОСА ПАРОЛЯ
-- =====================================================
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

COMMENT ON TABLE password_reset_tokens IS 'Токены для сброса пароля';

-- =====================================================
-- ТАБЛИЦА МАСТЕРСТВА (MASTERY)
-- =====================================================
CREATE TABLE mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    mini_level INTEGER DEFAULT 0,
    fragments INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT mastery_user_id_key UNIQUE (user_id),
    CONSTRAINT mastery_level_check CHECK (level >= 1 AND level <= 100),
    CONSTRAINT mastery_mini_level_check CHECK (mini_level >= 0 AND mini_level <= 5),
    CONSTRAINT mastery_fragments_check CHECK (fragments >= 0)
);

CREATE INDEX idx_mastery_user_id ON mastery(user_id);

COMMENT ON TABLE mastery IS 'Прогресс мастерства игрока в классических играх';

-- =====================================================
-- ТАБЛИЦА СЛАВЫ (GLORY)
-- =====================================================
CREATE TABLE glory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    wins INTEGER DEFAULT 0,
    total_glory_wins INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT glory_user_id_key UNIQUE (user_id),
    CONSTRAINT glory_level_check CHECK (level >= 1 AND level <= 100),
    CONSTRAINT glory_wins_check CHECK (wins >= 0)
);

CREATE INDEX idx_glory_user_id ON glory(user_id);

COMMENT ON TABLE glory IS 'Прогресс славы игрока в PvP режиме';

-- =====================================================
-- ТАБЛИЦА ПОКУПОК
-- =====================================================
CREATE TABLE user_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    stripe_session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT user_purchases_item_type_check CHECK (item_type IN ('avatar', 'frame', 'nickname_style', 'other')),
    CONSTRAINT user_purchases_status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    CONSTRAINT user_purchases_price_check CHECK (price >= 0)
);

CREATE INDEX idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX idx_user_purchases_status ON user_purchases(status);

COMMENT ON TABLE user_purchases IS 'История покупок пользователей';

-- =====================================================
-- ТАБЛИЦА СТАТИСТИКИ ПО ИГРАМ
-- =====================================================
CREATE TABLE user_game_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_game_stats_unique_user_game UNIQUE (user_id, game_id),
    CONSTRAINT user_game_stats_wins_check CHECK (wins >= 0),
    CONSTRAINT user_game_stats_losses_check CHECK (losses >= 0),
    CONSTRAINT user_game_stats_draws_check CHECK (draws >= 0)
);

CREATE INDEX idx_user_game_stats_user_id ON user_game_stats(user_id);
CREATE INDEX idx_user_game_stats_game_id ON user_game_stats(game_id);

COMMENT ON TABLE user_game_stats IS 'Статистика игрока по каждой игре';

-- =====================================================
-- ТАБЛИЦА ПРОГРЕССА В ИГРАХ
-- =====================================================
CREATE TABLE user_game_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_state JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_game_progress_user_id ON user_game_progress(user_id);

COMMENT ON TABLE user_game_progress IS 'Сохраненный прогресс в играх';

-- =====================================================
-- ТАБЛИЦА УСТРОЙСТВ ПОЛЬЗОВАТЕЛЕЙ
-- =====================================================
CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_info JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);

COMMENT ON TABLE user_devices IS 'Информация об устройствах пользователей';

-- =====================================================
-- ТАБЛИЦА МАТЧЕЙ (PVP)
-- =====================================================
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_type TEXT NOT NULL,
    player1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'waiting',
    winner_id UUID,
    game_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    CONSTRAINT matches_status_check CHECK (status IN ('waiting', 'in_progress', 'completed', 'abandoned')),
    CONSTRAINT matches_different_players CHECK (player1_id != player2_id)
);

CREATE INDEX idx_matches_player1_id ON matches(player1_id);
CREATE INDEX idx_matches_player2_id ON matches(player2_id);
CREATE INDEX idx_matches_status ON matches(status);

COMMENT ON TABLE matches IS 'PvP матчи между игроками';

-- =====================================================
-- ТАБЛИЦА ОЧЕРЕДИ МАТЧМЕЙКИНГА
-- =====================================================
CREATE TABLE matchmaking_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL,
    rating INTEGER DEFAULT 1000,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT matchmaking_queue_user_id_key UNIQUE (user_id)
);

CREATE INDEX idx_matchmaking_queue_user_id ON matchmaking_queue(user_id);
CREATE INDEX idx_matchmaking_queue_game_type ON matchmaking_queue(game_type);

COMMENT ON TABLE matchmaking_queue IS 'Очередь для поиска противников';

-- =====================================================
-- ТАБЛИЦА СТАТИСТИКИ ИГРОКОВ (PVP)
-- =====================================================
CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER DEFAULT 1000,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT player_stats_user_id_key UNIQUE (user_id)
);

CREATE INDEX idx_player_stats_user_id ON player_stats(user_id);
CREATE INDEX idx_player_stats_rating ON player_stats(rating);

COMMENT ON TABLE player_stats IS 'Общая PvP статистика игрока';
