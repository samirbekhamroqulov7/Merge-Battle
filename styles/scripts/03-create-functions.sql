-- Create helper functions for game statistics

-- Function to update mastery on win
CREATE OR REPLACE FUNCTION update_mastery_on_win(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE mastery
  SET 
    fragments = fragments + 10,
    total_wins = total_wins + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Level up logic
  UPDATE mastery
  SET 
    level = level + 1,
    fragments = fragments - 100,
    mini_level = 0
  WHERE user_id = p_user_id AND fragments >= 100;
END;
$$ LANGUAGE plpgsql;

-- Function to update glory on win
CREATE OR REPLACE FUNCTION update_glory_on_win(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE glory
  SET 
    wins = wins + 1,
    total_glory_wins = total_glory_wins + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Level up logic
  UPDATE glory
  SET 
    level = level + 1,
    wins = 0
  WHERE user_id = p_user_id AND wins >= 10;
END;
$$ LANGUAGE plpgsql;
