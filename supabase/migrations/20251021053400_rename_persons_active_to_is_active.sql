-- =====================================================================================
-- Migration: 20251021053400_rename_persons_active_to_is_active.sql
-- Description: Rename persons.active column to is_active to match auth trigger expectations
-- Dependencies: 00000000000002_business_core_tables.sql, 00000000000008_auth_triggers.sql
-- =====================================================================================
--
-- This migration fixes a schema mismatch where:
-- - The persons table has a column named "active" (BOOLEAN)
-- - The auth triggers (handle_new_user, handle_user_delete, get_user_claims) expect "is_active"
--
-- This mismatch was causing signup failures with error:
-- "Error creating person record: column "is_active" of relation "persons" does not exist"
--
-- We rename the column to is_active to match the trigger expectations.
-- =====================================================================================

-- Rename the column from active to is_active
ALTER TABLE public.persons
  RENAME COLUMN active TO is_active;

-- Drop the old index on active column
DROP INDEX IF EXISTS idx_persons_active;

-- Create new index on is_active column
CREATE INDEX idx_persons_is_active ON persons(is_active) WHERE is_active = true;

-- Update the table comment to reflect the column name change
COMMENT ON COLUMN persons.is_active IS 'Whether the person account is active (soft delete flag)';

-- =====================================================================================
-- END OF MIGRATION
-- =====================================================================================
