-- =====================================================
-- СОЗДАНИЕ ФУНКЦИЙ И ТРИГГЕРОВ
-- =====================================================
-- Выполните этот скрипт ТРЕТЬИМ

-- =====================================================
-- ФУНКЦИЯ ОБНОВЛЕНИЯ updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Автоматически обновляет поле updated_at';

-- =====================================================
-- ТРИГГЕРЫ ДЛЯ updated_at
-- =====================================================
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mastery_updated_at
    BEFORE UPDATE ON mastery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_glory_updated_at
    BEFORE UPDATE ON glory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_game_stats_updated_at
    BEFORE UPDATE ON user_game_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_game_progress_updated_at
    BEFORE UPDATE ON user_game_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_stats_updated_at
    BEFORE UPDATE ON player_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ФУНКЦИЯ ОБНОВЛЕНИЯ МАСТЕРСТВА
-- =====================================================
CREATE OR REPLACE FUNCTION update_mastery_on_win(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    current_fragments INTEGER;
    current_level INTEGER;
    current_mini_level INTEGER;
    fragments_needed INTEGER;
BEGIN
    -- Получаем текущие данные
    SELECT fragments, level, mini_level 
    INTO current_fragments, current_level, current_mini_level
    FROM mastery
    WHERE user_id = p_user_id;

    -- Если записи нет, создаем
    IF NOT FOUND THEN
        INSERT INTO mastery (user_id, level, mini_level, fragments, total_wins)
        VALUES (p_user_id, 1, 0, 1, 1);
        RETURN;
    END IF;

    -- Добавляем фрагменты
    current_fragments := current_fragments + 1;
    
    -- Вычисляем нужное количество фрагментов для повышения
    fragments_needed := 5 + (current_mini_level * 2);

    -- Проверяем повышение уровня
    IF current_fragments >= fragments_needed THEN
        current_fragments := current_fragments - fragments_needed;
        current_mini_level := current_mini_level + 1;
        
        -- Если достигли 5 мини-уровней, повышаем основной уровень
        IF current_mini_level >= 5 THEN
            current_level := current_level + 1;
            current_mini_level := 0;
        END IF;
    END IF;

    -- Обновляем данные
    UPDATE mastery
    SET 
        fragments = current_fragments,
        level = current_level,
        mini_level = current_mini_level,
        total_wins = total_wins + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_mastery_on_win IS 'Обновляет мастерство при победе';

-- =====================================================
-- ФУНКЦИЯ ОБНОВЛЕНИЯ СЛАВЫ
-- =====================================================
CREATE OR REPLACE FUNCTION update_glory_on_win(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    current_wins INTEGER;
    current_level INTEGER;
    wins_needed INTEGER;
BEGIN
    -- Получаем текущие данные
    SELECT wins, level 
    INTO current_wins, current_level
    FROM glory
    WHERE user_id = p_user_id;

    -- Если записи нет, создаем
    IF NOT FOUND THEN
        INSERT INTO glory (user_id, level, wins, total_glory_wins)
        VALUES (p_user_id, 1, 1, 1);
        RETURN;
    END IF;

    -- Добавляем победу
    current_wins := current_wins + 1;
    
    -- Вычисляем нужное количество побед для повышения уровня
    wins_needed := 10 + (current_level * 5);

    -- Проверяем повышение уровня
    IF current_wins >= wins_needed THEN
        current_wins := 0;
        current_level := current_level + 1;
    END IF;

    -- Обновляем данные
    UPDATE glory
    SET 
        wins = current_wins,
        level = current_level,
        total_glory_wins = total_glory_wins + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_glory_on_win IS 'Обновляет славу при победе в PvP';

-- =====================================================
-- ФУНКЦИЯ АВТОМАТИЧЕСКОГО СОЗДАНИЯ ПРОФИЛЯ
-- =====================================================
-- Исправлена логика создания профиля с правильным user_id
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_is_guest BOOLEAN;
BEGIN
    -- Проверяем, является ли пользователь гостем
    v_is_guest := COALESCE((NEW.raw_user_meta_data->>'is_guest')::boolean, false);
    
    -- Создаем запись в users и получаем ID
    INSERT INTO users (auth_id, email, username, isGuest)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, 'guest_' || NEW.id || '@brainbattle.com'),
        COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || substring(NEW.id::text, 1, 8)),
        v_is_guest
    )
    ON CONFLICT (auth_id) DO UPDATE 
    SET 
        email = COALESCE(EXCLUDED.email, users.email),
        username = COALESCE(EXCLUDED.username, users.username)
    RETURNING id INTO v_user_id;

    -- Создаем связанные записи только для не-гостей
    IF NOT v_is_guest THEN
        -- Создаем mastery
        INSERT INTO mastery (user_id, level, mini_level, fragments, total_wins)
        VALUES (v_user_id, 1, 0, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;

        -- Создаем glory
        INSERT INTO glory (user_id, level, wins, total_glory_wins)
        VALUES (v_user_id, 1, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;

        -- Создаем player_stats
        INSERT INTO player_stats (user_id, rating, wins, losses, draws)
        VALUES (v_user_id, 1000, 0, 0, 0)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Логируем ошибку но не прерываем процесс регистрации
        RAISE WARNING 'Error in handle_new_user for auth_id %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user IS 'Автоматически создает профиль при регистрации';

-- =====================================================
-- ФУНКЦИЯ ОБНОВЛЕНИЯ РЕЙТИНГА
-- =====================================================
CREATE OR REPLACE FUNCTION update_player_rating(
    p_player_id UUID,
    p_result TEXT,
    p_opponent_rating INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    current_rating INTEGER;
    rating_change INTEGER;
    expected_score FLOAT;
    k_factor INTEGER := 32;
BEGIN
    -- Получаем текущий рейтинг
    SELECT rating INTO current_rating
    FROM player_stats
    WHERE user_id = p_player_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Player with ID % not found', p_player_id;
    END IF;

    -- Вычисляем ожидаемый результат (формула Elo)
    expected_score := 1.0 / (1.0 + POWER(10, (p_opponent_rating - current_rating) / 400.0));

    -- Вычисляем изменение рейтинга
    CASE p_result
        WHEN 'win' THEN
            rating_change := ROUND(k_factor * (1.0 - expected_score));
        WHEN 'loss' THEN
            rating_change := ROUND(k_factor * (0.0 - expected_score));
        WHEN 'draw' THEN
            rating_change := ROUND(k_factor * (0.5 - expected_score));
        ELSE
            RAISE EXCEPTION 'Invalid result: %', p_result;
    END CASE;

    -- Обновляем рейтинг
    UPDATE player_stats
    SET 
        rating = rating + rating_change,
        updated_at = NOW()
    WHERE user_id = p_player_id;

    RETURN rating_change;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_player_rating IS 'Обновляет рейтинг игрока по системе Elo';

-- =====================================================
-- ФУНКЦИЯ СОЗДАНИЯ МАТЧА И ОБНОВЛЕНИЯ СТАТИСТИКИ
-- =====================================================
CREATE OR REPLACE FUNCTION create_match_and_update_stats(
    p_player1_id UUID,
    p_player2_id UUID,
    p_winner_id UUID DEFAULT NULL,
    p_is_draw BOOLEAN DEFAULT FALSE,
    p_game_mode TEXT DEFAULT 'pvp',
    p_duration INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    v_match_id UUID;
    v_player1_rating INTEGER;
    v_player2_rating INTEGER;
BEGIN
    -- Получаем рейтинги игроков
    SELECT rating INTO v_player1_rating
    FROM player_stats WHERE user_id = p_player1_id;
    
    SELECT rating INTO v_player2_rating
    FROM player_stats WHERE user_id = p_player2_id;

    -- Создаем матч
    INSERT INTO matches (
        player1_id, 
        player2_id, 
        winner_id, 
        is_draw, 
        game_mode, 
        duration, 
        player1_rating_before, 
        player2_rating_before
    )
    VALUES (
        p_player1_id,
        p_player2_id,
        p_winner_id,
        p_is_draw,
        p_game_mode,
        p_duration,
        v_player1_rating,
        v_player2_rating
    )
    RETURNING id INTO v_match_id;

    -- Обновляем статистику в зависимости от результата
    IF p_is_draw THEN
        -- Ничья
        PERFORM update_player_rating(p_player1_id, 'draw', v_player2_rating);
        PERFORM update_player_rating(p_player2_id, 'draw', v_player1_rating);
        
        UPDATE player_stats 
        SET draws = draws + 1 
        WHERE user_id IN (p_player1_id, p_player2_id);
        
    ELSIF p_winner_id = p_player1_id THEN
        -- Победа первого игрока
        PERFORM update_player_rating(p_player1_id, 'win', v_player2_rating);
        PERFORM update_player_rating(p_player2_id, 'loss', v_player1_rating);
        
        UPDATE player_stats SET wins = wins + 1 WHERE user_id = p_player1_id;
        UPDATE player_stats SET losses = losses + 1 WHERE user_id = p_player2_id;
        
        PERFORM update_mastery_on_win(p_player1_id);
        IF p_game_mode = 'pvp' THEN
            PERFORM update_glory_on_win(p_player1_id);
        END IF;
        
    ELSIF p_winner_id = p_player2_id THEN
        -- Победа второго игрока
        PERFORM update_player_rating(p_player1_id, 'loss', v_player2_rating);
        PERFORM update_player_rating(p_player2_id, 'win', v_player1_rating);
        
        UPDATE player_stats SET wins = wins + 1 WHERE user_id = p_player2_id;
        UPDATE player_stats SET losses = losses + 1 WHERE user_id = p_player1_id;
        
        PERFORM update_mastery_on_win(p_player2_id);
        IF p_game_mode = 'pvp' THEN
            PERFORM update_glory_on_win(p_player2_id);
        END IF;
    END IF;

    -- Сохраняем рейтинги после матча
    UPDATE matches m
    SET 
        player1_rating_after = (SELECT rating FROM player_stats WHERE user_id = p_player1_id),
        player2_rating_after = (SELECT rating FROM player_stats WHERE user_id = p_player2_id)
    WHERE m.id = v_match_id;

    RETURN v_match_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_match_and_update_stats IS 'Создает матч и обновляет статистику игроков';

-- =====================================================
-- ФУНКЦИЯ ПОИСКА ПРОТИВНИКА
-- =====================================================
CREATE OR REPLACE FUNCTION find_match_opponent(
    p_user_id UUID, 
    p_game_mode TEXT DEFAULT 'pvp'
)
RETURNS TABLE (
    opponent_id UUID,
    opponent_rating INTEGER,
    opponent_username TEXT,
    rating_difference INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH current_user_stats AS (
        SELECT rating FROM player_stats WHERE user_id = p_user_id
    )
    SELECT 
        q.user_id as opponent_id,
        ps.rating as opponent_rating,
        u.username as opponent_username,
        ABS(ps.rating - (SELECT rating FROM current_user_stats)) as rating_difference
    FROM matchmaking_queue q
    JOIN player_stats ps ON q.user_id = ps.user_id
    JOIN users u ON q.user_id = u.id
    WHERE 
        q.user_id != p_user_id
        AND q.game_mode = p_game_mode
        AND ABS(ps.rating - (SELECT rating FROM current_user_stats)) <= 200
    ORDER BY rating_difference, q.joined_at
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_match_opponent IS 'Находит подходящего противника для матча';

-- =====================================================
-- ТРИГГЕР ДЛЯ АВТОМАТИЧЕСКОГО СОЗДАНИЯ ПРОФИЛЯ
-- ⚠️ ВАЖНО: Этот триггер может потребовать прав superuser
-- Если он не создается, используйте скрипт 06-setup-auth-trigger.sql
-- =====================================================
DO $$
BEGIN
    -- Удаляем старый триггер если существует
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Создаем новый триггер
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION handle_new_user();
        
    RAISE NOTICE '✅ Триггер on_auth_user_created успешно создан';
    
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE WARNING '⚠️ Недостаточно прав для создания триггера на auth.users';
        RAISE NOTICE '📋 Выполните скрипт 06-setup-auth-trigger.sql с правами postgres';
    WHEN OTHERS THEN
        RAISE WARNING '⚠️ Ошибка при создании триггера: %', SQLERRM;
        RAISE NOTICE '📋 Выполните скрипт 06-setup-auth-trigger.sql вручную';
END $$;

-- =====================================================
-- ГРАНТЫ ПРАВ
-- =====================================================
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_mastery_on_win(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_glory_on_win(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_player_rating(UUID, TEXT, INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_match_and_update_stats(UUID, UUID, UUID, BOOLEAN, TEXT, INTEGER) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION find_match_opponent(UUID, TEXT) TO anon, authenticated, service_role;
