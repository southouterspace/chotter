-- =====================================================================================
-- Migration: 20251021000000_add_checked_in_at_to_tickets.sql
-- Description: Add checked_in_at timestamp column to tickets table for P3.6
-- Dependencies: 00000000000002_business_core_tables.sql
-- =====================================================================================

-- Add checked_in_at timestamp column
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tickets_checked_in_at
ON tickets(checked_in_at)
WHERE checked_in_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN tickets.checked_in_at IS 'Timestamp when technician checked in at job site (P3.6)';

-- =====================================================================================
-- SUMMARY
-- =====================================================================================
-- Added:
-- - checked_in_at TIMESTAMPTZ column to tickets table
-- - Index on checked_in_at for query performance
-- - Column comment for documentation
