-- Migration: Add technician_tags table and JSONB support for certifications
-- This allows storing structured certification data (issue_date, expiry_date, number)
-- Created: 2025-10-20
-- Purpose: Enable P2.6 Technician Certifications feature

-- Create technician_tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS technician_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  tag_type TEXT NOT NULL CHECK (tag_type IN ('skill', 'certification')),
  tag_name TEXT NOT NULL,
  tag_value JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(technician_id, tag_type, tag_name)
);

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_technician_tags_value
ON technician_tags USING GIN (tag_value);

-- Create index for lookups by technician
CREATE INDEX IF NOT EXISTS idx_technician_tags_technician_id
ON technician_tags(technician_id);

-- Create index for lookups by tag type
CREATE INDEX IF NOT EXISTS idx_technician_tags_tag_type
ON technician_tags(tag_type);

-- Add RLS policies
ALTER TABLE technician_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read tags for technicians in their business
CREATE POLICY "Users can read technician tags in their business"
ON technician_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM technicians t
    JOIN persons p ON t.person_id = p.id
    WHERE t.id = technician_tags.technician_id
    AND p.business_id::text = (auth.jwt() ->> 'business_id')
  )
);

-- Policy: Users can insert tags for technicians in their business
CREATE POLICY "Users can insert technician tags in their business"
ON technician_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM technicians t
    JOIN persons p ON t.person_id = p.id
    WHERE t.id = technician_tags.technician_id
    AND p.business_id::text = (auth.jwt() ->> 'business_id')
  )
);

-- Policy: Users can update tags for technicians in their business
CREATE POLICY "Users can update technician tags in their business"
ON technician_tags FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM technicians t
    JOIN persons p ON t.person_id = p.id
    WHERE t.id = technician_tags.technician_id
    AND p.business_id::text = (auth.jwt() ->> 'business_id')
  )
);

-- Policy: Users can delete tags for technicians in their business
CREATE POLICY "Users can delete technician tags in their business"
ON technician_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM technicians t
    JOIN persons p ON t.person_id = p.id
    WHERE t.id = technician_tags.technician_id
    AND p.business_id::text = (auth.jwt() ->> 'business_id')
  )
);

-- Add comments to document the purpose
COMMENT ON TABLE technician_tags IS 'Stores skills and certifications for technicians';
COMMENT ON COLUMN technician_tags.tag_value IS 'Structured data for tags (e.g., certification details: {issue_date, expiry_date, number})';
