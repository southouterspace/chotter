-- Migration: Add technician_tags and technician_availability tables
-- Description: Support technician skills/certifications and work schedules
-- Created: Phase 2.6 - Technician Management

-- ============================================================================
-- technician_tags: Store skills and certifications for technicians
-- ============================================================================

CREATE TABLE technician_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  tag_type TEXT NOT NULL CHECK (tag_type IN ('skill', 'certification')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique tags per technician
  CONSTRAINT unique_technician_tag UNIQUE(person_id, tag_type, name)
);

-- Indexes for performance
CREATE INDEX idx_technician_tags_person_id ON technician_tags(person_id);
CREATE INDEX idx_technician_tags_business_id ON technician_tags(business_id);
CREATE INDEX idx_technician_tags_type ON technician_tags(tag_type);
CREATE INDEX idx_technician_tags_name ON technician_tags(name);

-- ============================================================================
-- technician_availability: Store work schedules by day of week
-- ============================================================================

CREATE TABLE technician_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,

  -- Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),

  -- Work hours for this day
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One schedule entry per technician per day
  CONSTRAINT unique_technician_day UNIQUE(person_id, day_of_week),

  -- Ensure end time is after start time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes for performance
CREATE INDEX idx_technician_availability_person_id ON technician_availability(person_id);
CREATE INDEX idx_technician_availability_business_id ON technician_availability(business_id);
CREATE INDEX idx_technician_availability_day ON technician_availability(day_of_week);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_technician_availability_updated_at
  BEFORE UPDATE ON technician_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE technician_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_availability ENABLE ROW LEVEL SECURITY;

-- technician_tags policies
CREATE POLICY "Business members can view technician tags"
  ON technician_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = auth.uid()
        AND p.business_id = technician_tags.business_id
    )
  );

CREATE POLICY "Business admins can manage technician tags"
  ON technician_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = auth.uid()
        AND p.business_id = technician_tags.business_id
        AND p.role = 'admin'
    )
  );

-- technician_availability policies
CREATE POLICY "Business members can view availability"
  ON technician_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = auth.uid()
        AND p.business_id = technician_availability.business_id
    )
  );

CREATE POLICY "Business admins can manage availability"
  ON technician_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = auth.uid()
        AND p.business_id = technician_availability.business_id
        AND p.role = 'admin'
    )
  );

-- Technicians can manage their own availability
CREATE POLICY "Technicians can manage own availability"
  ON technician_availability FOR ALL
  USING (
    person_id = auth.uid()
  );

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE technician_tags IS
  'Skills and certifications for technicians. Each tag represents a skill or certification.';

COMMENT ON COLUMN technician_tags.tag_type IS
  'Type of tag: skill (e.g., HVAC License) or certification (e.g., EPA Certified)';

COMMENT ON TABLE technician_availability IS
  'Weekly work schedule for technicians. One row per day of week per technician.';

COMMENT ON COLUMN technician_availability.day_of_week IS
  'Day of week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
