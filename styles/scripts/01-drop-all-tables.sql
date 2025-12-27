-- Drop all existing tables to recreate them correctly
DROP TABLE IF EXISTS player_stats CASCADE;
DROP TABLE IF EXISTS matchmaking_queue CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS user_game_progress CASCADE;
DROP TABLE IF EXISTS user_game_stats CASCADE;
DROP TABLE IF EXISTS user_purchases CASCADE;
DROP TABLE IF EXISTS glory CASCADE;
DROP TABLE IF EXISTS mastery CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_mastery_on_win CASCADE;
DROP FUNCTION IF EXISTS update_glory_on_win CASCADE;
