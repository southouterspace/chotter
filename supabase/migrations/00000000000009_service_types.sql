-- =====================================================================
-- Service Types Table Migration
-- Creates service_types table for managing bookable services
-- Part of Phase 2 Admin Dashboard (P2.7)
-- =====================================================================

-- Create service_types table
CREATE TABLE IF NOT EXISTS service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,

  -- Pricing (stored in cents)
  base_price INTEGER NOT NULL CHECK (base_price >= 0),

  -- Duration (PostgreSQL interval type)
  estimated_duration INTERVAL NOT NULL,

  -- Skills required for this service
  required_skills TEXT[] DEFAULT '{}',

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Display order for UI
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_service_types_business_id ON service_types(business_id);
CREATE INDEX idx_service_types_is_active ON service_types(is_active);
CREATE INDEX idx_service_types_display_order ON service_types(display_order);

-- Add updated_at trigger
CREATE TRIGGER set_service_types_updated_at
  BEFORE UPDATE ON service_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view service_types for their business
CREATE POLICY "Users can view their business service_types"
  ON service_types
  FOR SELECT
  USING (
    business_id IN (
      SELECT business_id
      FROM persons
      WHERE id = auth.uid()
    )
  );

-- Policy: Admins can insert service_types
CREATE POLICY "Admins can insert service_types"
  ON service_types
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id
      FROM persons
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Admins can update service_types
CREATE POLICY "Admins can update service_types"
  ON service_types
  FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id
      FROM persons
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT business_id
      FROM persons
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Admins can delete service_types
CREATE POLICY "Admins can delete service_types"
  ON service_types
  FOR DELETE
  USING (
    business_id IN (
      SELECT business_id
      FROM persons
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Add comments
COMMENT ON TABLE service_types IS 'Defines bookable service types with pricing, duration, and skill requirements';
COMMENT ON COLUMN service_types.base_price IS 'Base price in cents (divide by 100 for dollars)';
COMMENT ON COLUMN service_types.estimated_duration IS 'Estimated duration as PostgreSQL interval (e.g., 1 hour, 30 minutes)';
COMMENT ON COLUMN service_types.required_skills IS 'Array of skill names required to perform this service';
COMMENT ON COLUMN service_types.display_order IS 'Order in which services appear in UI (lower numbers first)';
