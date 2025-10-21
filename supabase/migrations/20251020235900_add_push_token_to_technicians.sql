-- Migration: Add push notification token support to technicians table
-- Purpose: Store Expo push notification tokens for mobile app notifications
-- Created: 2025-10-20

-- Add push_token column to technicians table
ALTER TABLE technicians
ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Add push_enabled column to allow users to toggle notifications
ALTER TABLE technicians
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT true;

-- Add last_token_update timestamp to track when token was last updated
ALTER TABLE technicians
ADD COLUMN IF NOT EXISTS last_token_update TIMESTAMPTZ;

-- Create index on push_token for efficient lookups when sending notifications
CREATE INDEX IF NOT EXISTS idx_technicians_push_token
ON technicians(push_token)
WHERE push_token IS NOT NULL AND push_enabled = true;

-- Add comment to document the column
COMMENT ON COLUMN technicians.push_token IS 'Expo push notification token for mobile app';
COMMENT ON COLUMN technicians.push_enabled IS 'User preference for receiving push notifications';
COMMENT ON COLUMN technicians.last_token_update IS 'Timestamp of last push token update';

-- Create function to update last_token_update automatically
CREATE OR REPLACE FUNCTION update_technician_token_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.push_token IS DISTINCT FROM OLD.push_token THEN
    NEW.last_token_update = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_token_update
DROP TRIGGER IF EXISTS technician_token_update_trigger ON technicians;
CREATE TRIGGER technician_token_update_trigger
  BEFORE UPDATE ON technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_token_timestamp();
