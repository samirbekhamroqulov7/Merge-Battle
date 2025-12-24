-- Add table for password reset codes

-- Drop table if exists
DROP TABLE IF EXISTS password_reset_codes CASCADE;

-- Create password reset codes table
CREATE TABLE password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_password_reset_email ON password_reset_codes(email);
CREATE INDEX idx_password_reset_code ON password_reset_codes(code);
CREATE INDEX idx_password_reset_expires ON password_reset_codes(expires_at);

-- Auto-delete expired codes after 24 hours
CREATE OR REPLACE FUNCTION delete_expired_reset_codes()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM password_reset_codes
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_expired_reset_codes
AFTER INSERT ON password_reset_codes
EXECUTE FUNCTION delete_expired_reset_codes();
