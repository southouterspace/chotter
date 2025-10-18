-- =====================================================================================
-- Migration: 00000000000002_business_core_tables.sql
-- Description: Core business-level domain tables for multi-tenant field service operations
-- Dependencies: 00000000000001_platform_tables.sql
-- =====================================================================================

-- Enable PostGIS extension for geospatial features
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================================================
-- ENUMS
-- =====================================================================================

-- Person roles across the system
CREATE TYPE person_role AS ENUM (
  'customer',      -- End customers receiving services
  'technician',    -- Field technicians performing services
  'admin',         -- Business administrators
  'super_admin'    -- Platform-level super administrators
);

-- Ticket status lifecycle
CREATE TYPE ticket_status AS ENUM (
  'pending',       -- Created but not yet scheduled
  'scheduled',     -- Assigned to technician and scheduled
  'confirmed',     -- Customer confirmed the appointment
  'en_route',      -- Technician is traveling to location
  'in_progress',   -- Work has started
  'completed',     -- Work finished successfully
  'cancelled',     -- Appointment cancelled
  'on_hold'        -- Temporarily paused
);

-- Ticket priority levels
CREATE TYPE ticket_priority AS ENUM (
  'emergency',     -- Immediate response needed
  'urgent',        -- Same-day service
  'normal',        -- Standard priority
  'low'            -- Can be scheduled flexibly
);

-- Time window types for appointments
CREATE TYPE time_window_type AS ENUM (
  'time_window',   -- Customer wants service between X and Y time
  'by_time',       -- Customer wants service by a specific time
  'flexible',      -- Customer is flexible on timing
  'emergency'      -- Emergency service, ASAP
);

-- Payment status tracking
CREATE TYPE payment_status AS ENUM (
  'not_required',  -- No payment needed
  'pending',       -- Payment not yet processed
  'authorized',    -- Payment authorized but not captured
  'captured',      -- Payment successfully captured
  'refunded',      -- Payment refunded
  'failed'         -- Payment failed
);

-- Preferred contact methods
CREATE TYPE contact_method AS ENUM (
  'call',          -- Phone call
  'sms',           -- Text message
  'email'          -- Email
);

-- Route optimization status
CREATE TYPE route_status AS ENUM (
  'draft',         -- Route being planned
  'optimized',     -- Route optimized by algorithm
  'in_progress',   -- Technician is following route
  'completed',     -- All stops completed
  'cancelled'      -- Route cancelled
);

-- =====================================================================================
-- CORE ENTITY: PERSONS
-- Base table for all human users (customers, technicians, admins)
-- =====================================================================================

CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant isolation
  business_id UUID REFERENCES businesses(id) ON DELETE RESTRICT,
  -- Note: business_id is nullable for customers who may not have a direct business affiliation
  -- or for super_admins who operate across all businesses

  -- Supabase Auth integration
  supabase_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Note: nullable for customers without accounts (one-time bookings)

  -- Contact information
  email TEXT,
  phone TEXT, -- E.164 format: +1234567890

  -- Personal details
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,

  -- Role-based access
  role person_role NOT NULL,

  -- Preferences
  timezone TEXT DEFAULT 'America/Los_Angeles', -- IANA timezone

  -- Status
  active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT persons_email_check
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT persons_phone_check
    CHECK (phone IS NULL OR phone ~ '^\+[1-9]\d{1,14}$'),
  CONSTRAINT persons_contact_required
    CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Indexes for persons
CREATE INDEX idx_persons_business_id ON persons(business_id) WHERE business_id IS NOT NULL;
CREATE INDEX idx_persons_supabase_user_id ON persons(supabase_user_id) WHERE supabase_user_id IS NOT NULL;
CREATE INDEX idx_persons_email ON persons(email) WHERE email IS NOT NULL;
CREATE INDEX idx_persons_phone ON persons(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_persons_role ON persons(role);
CREATE INDEX idx_persons_business_role ON persons(business_id, role) WHERE business_id IS NOT NULL;
CREATE INDEX idx_persons_active ON persons(active) WHERE active = true;

COMMENT ON TABLE persons IS 'Base entity for all human users (customers, technicians, admins)';
COMMENT ON COLUMN persons.supabase_user_id IS 'Links to Supabase Auth - nullable for customers without accounts';
COMMENT ON COLUMN persons.business_id IS 'Nullable for customers and super_admins';
COMMENT ON COLUMN persons.phone IS 'E.164 format international phone number';

-- =====================================================================================
-- CORE ENTITY: CUSTOMERS
-- Extends Person with customer-specific data and location
-- =====================================================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to Person (one-to-one)
  person_id UUID UNIQUE NOT NULL REFERENCES persons(id) ON DELETE CASCADE,

  -- Multi-tenant isolation
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,

  -- Address and location
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT, -- 2-letter state code
  postal_code TEXT,
  country TEXT DEFAULT 'US', -- ISO 3166-1 alpha-2

  -- PostGIS location (lat/lng) for proximity calculations
  location geography(Point, 4326),
  location_verified BOOLEAN DEFAULT false, -- Geocoded address confirmed

  -- Communication preferences
  preferred_contact_method contact_method DEFAULT 'sms',
  communication_preferences JSONB DEFAULT '{"sms": true, "email": true, "voice": false}'::jsonb,

  -- Business metadata
  notes TEXT, -- Internal business notes about customer
  customer_since DATE DEFAULT CURRENT_DATE,

  -- Cached metrics (updated via triggers)
  total_appointments INTEGER DEFAULT 0,
  average_rating_given DECIMAL(3,2), -- Average rating they gave to technicians
  lifetime_value_cents INTEGER DEFAULT 0,

  -- Flexible data
  tags JSONB DEFAULT '[]'::jsonb, -- e.g., ["VIP", "Fleet Customer", "Cash Only"]
  metadata JSONB DEFAULT '{}'::jsonb, -- Custom fields defined by business

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT customers_state_check CHECK (state ~ '^[A-Z]{2}$'),
  CONSTRAINT customers_country_check CHECK (country ~ '^[A-Z]{2}$'),
  CONSTRAINT customers_rating_check
    CHECK (average_rating_given IS NULL OR (average_rating_given >= 1.00 AND average_rating_given <= 5.00))
);

-- Indexes for customers
CREATE INDEX idx_customers_person_id ON customers(person_id);
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_location ON customers USING GIST (location); -- Spatial index for proximity queries
CREATE INDEX idx_customers_tags ON customers USING GIN (tags); -- GIN index for JSONB array queries
CREATE INDEX idx_customers_customer_since ON customers(customer_since);

COMMENT ON TABLE customers IS 'Customer profiles with location and service history';
COMMENT ON COLUMN customers.location IS 'PostGIS geography point (lat/lng) for proximity calculations';
COMMENT ON COLUMN customers.location_verified IS 'True if geocoded address has been confirmed';
COMMENT ON COLUMN customers.tags IS 'JSONB array of business-defined tags for segmentation';

-- =====================================================================================
-- CORE ENTITY: TECHNICIANS
-- Extends Person with technician-specific data, skills, and scheduling
-- =====================================================================================

CREATE TABLE technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to Person (one-to-one)
  person_id UUID UNIQUE NOT NULL REFERENCES persons(id) ON DELETE CASCADE,

  -- Multi-tenant isolation
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,

  -- Employment details
  employee_id TEXT, -- External HR system ID
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  termination_date DATE,

  -- Skills and certifications
  skills JSONB DEFAULT '[]'::jsonb,
  -- e.g., ["ASE Certified", "Brake Specialist", "HVAC EPA 608"]

  certifications JSONB DEFAULT '[]'::jsonb,
  -- e.g., [{"name": "ASE Master", "issuer": "ASE", "number": "123456", "expires": "2026-12-31"}]

  -- Location tracking
  home_location geography(Point, 4326), -- Starting point for routes
  current_location geography(Point, 4326), -- Real-time position from mobile app
  current_location_updated_at TIMESTAMPTZ,

  -- Scheduling and capacity
  working_hours JSONB DEFAULT '{}'::jsonb,
  -- e.g., {"monday": {"start": "08:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}}

  on_call_schedule JSONB DEFAULT '[]'::jsonb,
  -- e.g., [{"start": "2025-10-20T17:00:00Z", "end": "2025-10-21T08:00:00Z"}]

  max_appointments_per_day INTEGER DEFAULT 8,

  -- Vehicle information
  vehicle_info JSONB,
  -- e.g., {"make": "Ford", "model": "Transit", "year": 2022, "plate": "ABC123", "color": "white"}

  -- Cost and performance
  hourly_rate_cents INTEGER, -- For cost calculations

  performance_metrics JSONB DEFAULT '{}'::jsonb,
  -- e.g., {"avg_jobs_per_day": 5.2, "avg_rating": 4.7, "on_time_percentage": 94}

  -- Geographic preferences
  preferred_zones JSONB,
  -- e.g., [{"name": "North County", "radius_miles": 20, "center": {"lat": 33.1581, "lng": -117.3506}}]

  -- Status
  active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT technicians_termination_date_check
    CHECK (termination_date IS NULL OR termination_date >= hire_date),
  CONSTRAINT technicians_max_appointments_check
    CHECK (max_appointments_per_day > 0 AND max_appointments_per_day <= 20)
);

-- Indexes for technicians
CREATE INDEX idx_technicians_person_id ON technicians(person_id);
CREATE INDEX idx_technicians_business_id ON technicians(business_id);
CREATE INDEX idx_technicians_active ON technicians(business_id, active);
CREATE INDEX idx_technicians_skills ON technicians USING GIN (skills); -- GIN index for skill matching
CREATE INDEX idx_technicians_home_location ON technicians USING GIST (home_location);
CREATE INDEX idx_technicians_current_location ON technicians USING GIST (current_location);

COMMENT ON TABLE technicians IS 'Technician profiles with skills, location tracking, and scheduling';
COMMENT ON COLUMN technicians.skills IS 'JSONB array of skill names for capability matching';
COMMENT ON COLUMN technicians.current_location IS 'Real-time location updated from mobile app every 30s';
COMMENT ON COLUMN technicians.working_hours IS 'JSONB schedule defining availability per day of week';

-- =====================================================================================
-- CORE ENTITY: SERVICES
-- Service catalog with pricing and requirements
-- =====================================================================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant isolation
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,

  -- Service identification
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly name
  description TEXT,
  category TEXT, -- e.g., "Maintenance", "Repair", "Diagnostic", "Emergency"

  -- Timing
  default_duration_minutes INTEGER NOT NULL,
  duration_buffer_minutes INTEGER DEFAULT 15, -- Travel/cleanup buffer

  -- Requirements
  required_skills JSONB DEFAULT '[]'::jsonb,
  -- e.g., ["ASE Certified", "Brake Specialist"]

  required_certifications JSONB DEFAULT '[]'::jsonb,
  -- e.g., ["EPA 608 Certification"]

  -- Pricing
  base_price_cents INTEGER, -- Base service price (nullable for quote-only services)
  taxable BOOLEAN DEFAULT true,

  -- Service characteristics
  requires_parts BOOLEAN DEFAULT false,
  customer_media_required BOOLEAN DEFAULT false,
  customer_media_prompt TEXT, -- e.g., "Please upload photos of the dashboard warning lights"

  -- Status and ordering
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT services_duration_check
    CHECK (default_duration_minutes > 0 AND default_duration_minutes <= 480),
  CONSTRAINT services_buffer_check
    CHECK (duration_buffer_minutes >= 0 AND duration_buffer_minutes <= 120),
  CONSTRAINT services_base_price_check
    CHECK (base_price_cents IS NULL OR base_price_cents >= 0),
  CONSTRAINT services_slug_format_check
    CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Indexes for services
CREATE UNIQUE INDEX idx_services_business_slug ON services(business_id, slug);
CREATE INDEX idx_services_business_id ON services(business_id);
CREATE INDEX idx_services_active ON services(business_id, active) WHERE active = true;
CREATE INDEX idx_services_category ON services(business_id, category);
CREATE INDEX idx_services_required_skills ON services USING GIN (required_skills);
CREATE INDEX idx_services_display_order ON services(business_id, display_order);

COMMENT ON TABLE services IS 'Service catalog with pricing, duration, and skill requirements';
COMMENT ON COLUMN services.slug IS 'URL-friendly identifier, unique within business';
COMMENT ON COLUMN services.duration_buffer_minutes IS 'Buffer time for travel and cleanup between appointments';

-- =====================================================================================
-- CORE ENTITY: TICKETS
-- Service requests and appointments (the core operational entity)
-- =====================================================================================

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant isolation
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,

  -- Human-readable identifier
  ticket_number TEXT UNIQUE NOT NULL,
  -- Format: TKT-YYYYMMDD-NNN (will be auto-generated via trigger)

  -- Relationships
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  assigned_technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  route_id UUID, -- Will reference routes table (created below)

  -- Status and priority
  status ticket_status NOT NULL DEFAULT 'pending',
  priority ticket_priority NOT NULL DEFAULT 'normal',

  -- Scheduling
  scheduled_date DATE,
  time_window_start TIME,
  time_window_end TIME,
  window_type time_window_type DEFAULT 'flexible',

  -- Early arrival preferences
  allow_early_arrival BOOLEAN DEFAULT false,
  earliest_acceptable_time TIME,
  early_arrival_notification_required BOOLEAN DEFAULT true,

  -- Duration
  estimated_duration_minutes INTEGER NOT NULL,

  -- Actual times
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,

  -- Location check-in/out (for compliance and verification)
  check_in_location geography(Point, 4326),
  check_out_location geography(Point, 4326),

  -- Notes and details
  customer_notes TEXT, -- From customer
  technician_notes TEXT, -- Internal notes
  work_summary TEXT, -- Post-completion summary

  -- Parts tracking
  parts_used JSONB DEFAULT '[]'::jsonb,
  -- e.g., [{"part_id": "uuid", "name": "Brake Pads", "quantity": 2, "cost_cents": 5000}]

  -- Customer feedback
  customer_rating INTEGER, -- 1-5 stars
  customer_review TEXT,

  -- Payment
  payment_status payment_status DEFAULT 'not_required',
  payment_id UUID, -- Will reference payments table (future)
  total_cost_cents INTEGER,

  -- AI integration
  ai_scheduled BOOLEAN DEFAULT false,
  ai_conversation_id UUID, -- Will reference ai_conversations table (future)
  ai_optimization_score DECIMAL(5,2), -- Routing efficiency score

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Constraints
  CONSTRAINT tickets_duration_check
    CHECK (estimated_duration_minutes > 0),
  CONSTRAINT tickets_time_window_check
    CHECK (time_window_end IS NULL OR time_window_start IS NULL OR time_window_start < time_window_end),
  CONSTRAINT tickets_actual_time_check
    CHECK (actual_end_time IS NULL OR actual_start_time IS NULL OR actual_start_time < actual_end_time),
  CONSTRAINT tickets_rating_check
    CHECK (customer_rating IS NULL OR (customer_rating >= 1 AND customer_rating <= 5)),
  CONSTRAINT tickets_cost_check
    CHECK (total_cost_cents IS NULL OR total_cost_cents >= 0),
  CONSTRAINT tickets_scheduled_date_check
    CHECK (status != 'scheduled' OR scheduled_date IS NOT NULL),
  CONSTRAINT tickets_completed_at_check
    CHECK (status != 'completed' OR completed_at IS NOT NULL),
  CONSTRAINT tickets_cancelled_at_check
    CHECK (status != 'cancelled' OR cancelled_at IS NOT NULL)
);

-- Critical indexes for tickets (heavily queried table)
CREATE UNIQUE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_business_id ON tickets(business_id);
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_service_id ON tickets(service_id);
CREATE INDEX idx_tickets_assigned_technician_id ON tickets(assigned_technician_id) WHERE assigned_technician_id IS NOT NULL;
CREATE INDEX idx_tickets_route_id ON tickets(route_id) WHERE route_id IS NOT NULL;
CREATE INDEX idx_tickets_status ON tickets(business_id, status);
CREATE INDEX idx_tickets_priority ON tickets(business_id, priority) WHERE priority IN ('emergency', 'urgent');
CREATE INDEX idx_tickets_scheduled_date ON tickets(business_id, scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX idx_tickets_payment_status ON tickets(payment_status) WHERE payment_status != 'not_required';

-- Composite indexes for common queries
CREATE INDEX idx_tickets_dashboard ON tickets(business_id, status, scheduled_date)
  WHERE status IN ('pending', 'scheduled', 'confirmed');
CREATE INDEX idx_tickets_technician_route ON tickets(assigned_technician_id, scheduled_date, status)
  WHERE assigned_technician_id IS NOT NULL;
CREATE INDEX idx_tickets_created_at ON tickets(business_id, created_at DESC);

-- Spatial indexes for location-based queries
CREATE INDEX idx_tickets_check_in_location ON tickets USING GIST (check_in_location) WHERE check_in_location IS NOT NULL;

COMMENT ON TABLE tickets IS 'Core operational entity: service requests and appointments';
COMMENT ON COLUMN tickets.ticket_number IS 'Auto-generated human-readable ID: TKT-YYYYMMDD-NNN';
COMMENT ON COLUMN tickets.window_type IS 'How the customer prefers to schedule: time window, by time, flexible, or emergency';
COMMENT ON COLUMN tickets.allow_early_arrival IS 'Customer opt-in for technician to arrive before scheduled window';

-- =====================================================================================
-- CORE ENTITY: ROUTES
-- Daily route assignments for technicians
-- =====================================================================================

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant isolation
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,

  -- Route identification
  route_number TEXT NOT NULL, -- e.g., "RT-20251017-T001"
  route_date DATE NOT NULL,

  -- Assignment
  assigned_technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,

  -- Route details
  waypoints JSONB DEFAULT '[]'::jsonb,
  -- Ordered array of stops: [{"ticket_id": "uuid", "order": 1, "eta": "2025-10-17T09:00:00Z", "location": {"lat": 32.7157, "lng": -117.1611}}]

  -- Optimization metrics
  total_distance_meters INTEGER, -- Total driving distance
  total_duration_minutes INTEGER, -- Total estimated time including service
  optimization_status route_status DEFAULT 'draft',
  optimized_at TIMESTAMPTZ,
  optimized_by TEXT, -- 'ai' or 'manual' or user_id

  -- Route execution
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT routes_distance_check
    CHECK (total_distance_meters IS NULL OR total_distance_meters >= 0),
  CONSTRAINT routes_duration_check
    CHECK (total_duration_minutes IS NULL OR total_duration_minutes > 0),
  CONSTRAINT routes_date_check
    CHECK (route_date >= CURRENT_DATE - INTERVAL '7 days') -- Don't allow routes more than 7 days in past
);

-- Add foreign key to tickets now that routes table exists
ALTER TABLE tickets
  ADD CONSTRAINT tickets_route_id_fkey
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL;

-- Indexes for routes
CREATE UNIQUE INDEX idx_routes_route_number ON routes(route_number);
CREATE INDEX idx_routes_business_id ON routes(business_id);
CREATE INDEX idx_routes_technician_date ON routes(assigned_technician_id, route_date);
CREATE INDEX idx_routes_date ON routes(business_id, route_date);
CREATE INDEX idx_routes_status ON routes(business_id, optimization_status);
CREATE INDEX idx_routes_waypoints ON routes USING GIN (waypoints);

COMMENT ON TABLE routes IS 'Daily route assignments for technicians with optimized waypoints';
COMMENT ON COLUMN routes.waypoints IS 'JSONB array of stops in optimized order with ETAs and locations';
COMMENT ON COLUMN routes.optimization_status IS 'Status of route optimization: draft, optimized, in_progress, completed, cancelled';

-- =====================================================================================
-- TRIGGERS: Auto-update updated_at timestamp
-- =====================================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- TRIGGERS: Auto-generate ticket numbers
-- =====================================================================================

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  sequence_num INTEGER;
  new_ticket_number TEXT;
BEGIN
  -- Only generate if ticket_number is not already set
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    -- Get date part (YYYYMMDD)
    date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

    -- Get the next sequence number for today
    -- Count existing tickets created today for this business
    SELECT COALESCE(COUNT(*) + 1, 1) INTO sequence_num
    FROM tickets
    WHERE business_id = NEW.business_id
      AND DATE(created_at) = CURRENT_DATE;

    -- Format: TKT-YYYYMMDD-NNN
    new_ticket_number := 'TKT-' || date_part || '-' || LPAD(sequence_num::TEXT, 3, '0');

    NEW.ticket_number := new_ticket_number;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- =====================================================================================
-- TRIGGERS: Auto-generate route numbers
-- =====================================================================================

CREATE OR REPLACE FUNCTION generate_route_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  tech_suffix TEXT;
  sequence_num INTEGER;
  new_route_number TEXT;
BEGIN
  -- Only generate if route_number is not already set
  IF NEW.route_number IS NULL OR NEW.route_number = '' THEN
    -- Get date part (YYYYMMDD)
    date_part := TO_CHAR(NEW.route_date, 'YYYYMMDD');

    -- Get technician suffix (first 4 chars of technician_id)
    tech_suffix := SUBSTRING(NEW.assigned_technician_id::TEXT FROM 1 FOR 4);

    -- Get the next sequence number for this technician on this date
    SELECT COALESCE(COUNT(*) + 1, 1) INTO sequence_num
    FROM routes
    WHERE assigned_technician_id = NEW.assigned_technician_id
      AND route_date = NEW.route_date;

    -- Format: RT-YYYYMMDD-XXXX-N
    new_route_number := 'RT-' || date_part || '-' || UPPER(tech_suffix) || '-' || sequence_num::TEXT;

    NEW.route_number := new_route_number;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_route_number_trigger
  BEFORE INSERT ON routes
  FOR EACH ROW
  EXECUTE FUNCTION generate_route_number();

-- =====================================================================================
-- TRIGGERS: Update customer metrics when tickets change
-- =====================================================================================

CREATE OR REPLACE FUNCTION update_customer_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total_appointments count
  UPDATE customers
  SET total_appointments = (
    SELECT COUNT(*)
    FROM tickets
    WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
      AND status = 'completed'
  )
  WHERE id = COALESCE(NEW.customer_id, OLD.customer_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_metrics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_metrics();

-- =====================================================================================
-- HELPER FUNCTIONS: PostGIS utilities
-- =====================================================================================

-- Function to calculate distance between two geography points (in meters)
CREATE OR REPLACE FUNCTION calculate_distance(point1 geography, point2 geography)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ST_Distance(point1, point2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_distance IS 'Calculate distance between two geography points in meters';

-- Function to find customers within radius of a point
CREATE OR REPLACE FUNCTION find_customers_within_radius(
  center_point geography,
  radius_meters NUMERIC,
  business_uuid UUID
)
RETURNS TABLE (
  customer_id UUID,
  distance_meters NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    ST_Distance(c.location, center_point) AS distance_meters
  FROM customers c
  WHERE c.business_id = business_uuid
    AND c.location IS NOT NULL
    AND ST_DWithin(c.location, center_point, radius_meters)
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION find_customers_within_radius IS 'Find customers within specified radius of a point';

-- =====================================================================================
-- SUMMARY
-- =====================================================================================

-- Migration complete! Created:
-- - PostGIS extension enabled
-- - 8 ENUM types for type safety
-- - 6 core tables: persons, customers, technicians, services, tickets, routes
-- - 35+ indexes including spatial (GIST) and JSONB (GIN) indexes
-- - Auto-update triggers for updated_at timestamps
-- - Auto-generation triggers for ticket_number and route_number
-- - Customer metrics trigger for real-time statistics
-- - 2 helper functions for PostGIS operations
