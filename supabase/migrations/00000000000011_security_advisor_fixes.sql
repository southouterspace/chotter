-- =====================================================================================
-- Migration: 00000000000011_security_advisor_fixes.sql
-- Description: Fix all Supabase Security Advisor warnings and errors
-- Dependencies: All previous migrations
-- Security Level: CRITICAL - Fixes search_path vulnerabilities and RLS gaps
-- =====================================================================================
--
-- This migration addresses the following security issues:
--
-- 1. CRITICAL ERROR - RLS Disabled:
--    - spatial_ref_sys (PostGIS reference table)
--
-- 2. WARN - Function search_path Mutable (20 functions):
--    - All functions need SET search_path = public, pg_temp
--    - This prevents search_path injection attacks
--
-- 3. WARN - Extension in Public Schema:
--    - PostGIS extension (documented as acceptable for this use case)
--
-- Reference: https://supabase.com/docs/guides/database/database-linter
-- =====================================================================================

-- =====================================================================================
-- PART 1: RLS DISABLED ERROR ON SPATIAL_REF_SYS
-- =====================================================================================
-- IMPORTANT: The spatial_ref_sys table is owned by the PostGIS extension and CANNOT
-- be modified by the application or migrations. This is a known limitation when using
-- PostGIS on managed database platforms like Supabase.
--
-- The security advisor warning can be safely ACCEPTED for this specific table because:
--   1. It's a read-only reference table with no sensitive data
--   2. It's managed by the PostGIS extension, not our application
--   3. Modifying it requires superuser privileges not available to Supabase projects
--   4. Any attempts to ALTER this table result in "must be owner of table" errors
--
-- The table contains standard spatial reference system definitions (like EPSG:4326
-- for WGS84) and is inherently read-only for application purposes. While the
-- Supabase advisor flags this as an error, it's a false positive for PostGIS
-- system tables.
--
-- References:
-- - https://github.com/supabase/supabase/discussions/9849
-- - https://postgis.net/docs/using_postgis_dbmanagement.html#spatial_ref_sys
-- =====================================================================================

-- =====================================================================================
-- PART 2: FIX FUNCTION SEARCH_PATH MUTABLE WARNINGS
-- =====================================================================================
-- All functions are recreated with SET search_path = public, pg_temp
-- This prevents search_path injection attacks where malicious users could
-- create functions with the same name in a different schema to hijack calls
--
-- Note: We drop CASCADE to ensure any dependent objects are also dropped
-- =====================================================================================

-- Drop all functions that need to be recreated
-- This ensures clean recreation without signature conflicts
DROP FUNCTION IF EXISTS public.current_business_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.current_person_id() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_authenticated() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_claims(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_update() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_delete() CASCADE;
DROP FUNCTION IF EXISTS public.protect_person_critical_fields() CASCADE;
DROP FUNCTION IF EXISTS public.protect_business_critical_fields() CASCADE;
DROP FUNCTION IF EXISTS public.protect_ticket_critical_fields() CASCADE;
DROP FUNCTION IF EXISTS public.protect_route_critical_fields() CASCADE;
DROP FUNCTION IF EXISTS public.protect_technician_sensitive_fields() CASCADE;
DROP FUNCTION IF EXISTS public.generate_ticket_number() CASCADE;
DROP FUNCTION IF EXISTS public.generate_route_number() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_distance(double precision, double precision, double precision, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.find_customers_within_radius(double precision, double precision, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.update_customer_metrics() CASCADE;

-- ---------------------------------------------------------------------
-- Helper Functions (from 00000000000006_rls_platform.sql)
-- ---------------------------------------------------------------------

-- Get current business_id from JWT claims
CREATE OR REPLACE FUNCTION public.current_business_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'business_id')::uuid,
    NULL
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.current_business_id() IS 'Extract business_id from JWT claims for multi-tenant isolation';

-- Check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'role') = 'super_admin',
    false
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.is_super_admin() IS 'Check if current user has super_admin role';

-- Get current user's person_id
CREATE OR REPLACE FUNCTION public.current_person_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'person_id')::uuid,
    NULL
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.current_person_id() IS 'Extract person_id from JWT claims';

-- Get current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'anonymous'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.current_user_role() IS 'Extract user role from JWT claims';

-- Check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
  SELECT current_person_id() IS NOT NULL;
$$ LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.is_authenticated() IS 'Check if user is authenticated (has person_id in JWT)';

-- ---------------------------------------------------------------------
-- Timestamp Trigger Function (from 00000000000001_platform_tables.sql)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates updated_at column on row modification';

-- ---------------------------------------------------------------------
-- Auth Trigger Functions (from 00000000000008_auth_triggers.sql)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata jsonb;
  business_uuid uuid;
  user_role text;
BEGIN
  -- Extract metadata from auth.users
  user_metadata := NEW.raw_user_meta_data;

  -- Get business_id and role from metadata
  business_uuid := (user_metadata->>'business_id')::uuid;
  user_role := COALESCE(user_metadata->>'role', 'customer');

  -- Validate role is a valid person_role enum value
  IF user_role NOT IN ('customer', 'technician', 'admin', 'super_admin') THEN
    user_role := 'customer';
  END IF;

  -- Create person record
  INSERT INTO public.persons (
    id,
    supabase_user_id,
    business_id,
    email,
    phone,
    first_name,
    last_name,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    business_uuid,
    NEW.email,
    NEW.phone,
    user_metadata->>'first_name',
    user_metadata->>'last_name',
    user_role::person_role,
    true,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'Invalid business_id provided: %', business_uuid;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating person record: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Automatically creates a Person record when a new user signs up via Supabase Auth';

CREATE OR REPLACE FUNCTION public.get_user_claims(user_id uuid)
RETURNS jsonb AS $$
DECLARE
  person_record RECORD;
  claims jsonb;
BEGIN
  -- Get person record for the user
  SELECT
    p.id,
    p.business_id,
    p.role,
    p.first_name,
    p.last_name,
    p.is_active
  INTO person_record
  FROM public.persons p
  WHERE p.supabase_user_id = user_id
  LIMIT 1;

  -- If no person record found, return empty claims
  IF NOT FOUND THEN
    RETURN '{}'::jsonb;
  END IF;

  -- Build claims object
  claims := jsonb_build_object(
    'person_id', person_record.id,
    'business_id', person_record.business_id,
    'role', person_record.role,
    'first_name', person_record.first_name,
    'last_name', person_record.last_name,
    'is_active', person_record.is_active
  );

  RETURN claims;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.get_user_claims(uuid) IS
  'Retrieves custom JWT claims for a user including person_id, business_id, role, and name';

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update person record when auth.users is updated
  UPDATE public.persons
  SET
    email = NEW.email,
    phone = NEW.phone,
    updated_at = NOW()
  WHERE supabase_user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.handle_user_update() IS
  'Syncs email and phone updates from auth.users to the persons table';

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Soft delete the person record
  UPDATE public.persons
  SET
    is_active = false,
    updated_at = NOW()
  WHERE supabase_user_id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.handle_user_delete() IS
  'Soft-deletes a Person record when a user account is deleted from auth.users';

-- ---------------------------------------------------------------------
-- Protection Functions (from 00000000000007_rls_business.sql)
-- ---------------------------------------------------------------------
-- These functions protect critical fields from unauthorized modification
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_person_critical_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Only super_admins can modify business_id and role
  IF OLD.business_id IS DISTINCT FROM NEW.business_id OR OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT is_super_admin() THEN
      RAISE EXCEPTION 'Only super admins can modify business_id or role';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.protect_person_critical_fields() IS
  'Prevent modification of business_id and role except by super_admins';

CREATE OR REPLACE FUNCTION public.protect_business_critical_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Only super_admins can modify status, trial dates, and owner
  IF NOT is_super_admin() THEN
    IF OLD.status IS DISTINCT FROM NEW.status OR
       OLD.trial_started_at IS DISTINCT FROM NEW.trial_started_at OR
       OLD.trial_ends_at IS DISTINCT FROM NEW.trial_ends_at OR
       OLD.activated_at IS DISTINCT FROM NEW.activated_at OR
       OLD.suspended_at IS DISTINCT FROM NEW.suspended_at OR
       OLD.cancelled_at IS DISTINCT FROM NEW.cancelled_at OR
       OLD.owner_person_id IS DISTINCT FROM NEW.owner_person_id THEN
      RAISE EXCEPTION 'Only super admins can modify critical business fields';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.protect_business_critical_fields() IS
  'Prevent modification of critical business fields except by super_admins';

CREATE OR REPLACE FUNCTION public.protect_ticket_critical_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modification of business_id and ticket_number
  IF OLD.business_id IS DISTINCT FROM NEW.business_id OR
     OLD.ticket_number IS DISTINCT FROM NEW.ticket_number THEN
    RAISE EXCEPTION 'Cannot modify business_id or ticket_number';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.protect_ticket_critical_fields() IS
  'Prevent modification of ticket business_id and ticket_number';

CREATE OR REPLACE FUNCTION public.protect_route_critical_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modification of business_id and route_number
  IF OLD.business_id IS DISTINCT FROM NEW.business_id OR
     OLD.route_number IS DISTINCT FROM NEW.route_number THEN
    RAISE EXCEPTION 'Cannot modify business_id or route_number';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.protect_route_critical_fields() IS
  'Prevent modification of route business_id and route_number';

CREATE OR REPLACE FUNCTION public.protect_technician_sensitive_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Only admins can modify technician-specific fields
  IF current_user_role() NOT IN ('admin', 'super_admin') THEN
    IF OLD.is_active IS DISTINCT FROM NEW.is_active OR
       OLD.hourly_rate_cents IS DISTINCT FROM NEW.hourly_rate_cents THEN
      RAISE EXCEPTION 'Only admins can modify technician status and rate';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.protect_technician_sensitive_fields() IS
  'Protect technician sensitive fields (status, rate) from unauthorized modification';

-- ---------------------------------------------------------------------
-- Auto-generation Trigger Functions (from 00000000000002_business_core_tables.sql)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  sequence_num INTEGER;
  new_ticket_number TEXT;
BEGIN
  -- Only generate if ticket_number is not already set
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    -- Get date part (YYYYMMDD)
    date_part := TO_CHAR(NEW.created_at, 'YYYYMMDD');

    -- Get the next sequence number for this business on this date
    SELECT COALESCE(COUNT(*) + 1, 1) INTO sequence_num
    FROM tickets
    WHERE business_id = NEW.business_id
      AND created_at::DATE = NEW.created_at::DATE;

    -- Format: TKT-YYYYMMDD-NNN
    new_ticket_number := 'TKT-' || date_part || '-' || LPAD(sequence_num::TEXT, 3, '0');

    NEW.ticket_number := new_ticket_number;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.generate_ticket_number() IS
  'Auto-generate unique ticket numbers in format TKT-YYYYMMDD-NNN';

CREATE OR REPLACE FUNCTION public.generate_route_number()
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
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.generate_route_number() IS
  'Auto-generate unique route numbers in format RT-YYYYMMDD-XXXX-N';

-- ---------------------------------------------------------------------
-- Geospatial Functions (from 00000000000003_supporting_tables.sql)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
  -- Calculate distance using PostGIS ST_Distance
  -- Returns distance in meters
  RETURN ST_Distance(
    ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
    ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.calculate_distance(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) IS
  'Calculate distance in meters between two lat/lon coordinates using PostGIS';

CREATE OR REPLACE FUNCTION public.find_customers_within_radius(
  center_lat DOUBLE PRECISION,
  center_lon DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION
)
RETURNS TABLE(customer_id UUID, distance_meters DOUBLE PRECISION) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS customer_id,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(c.location_longitude, c.location_latitude), 4326)::geography
    ) AS distance_meters
  FROM public.customers c
  WHERE c.business_id = current_business_id()
    AND c.location_latitude IS NOT NULL
    AND c.location_longitude IS NOT NULL
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(c.location_longitude, c.location_latitude), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.find_customers_within_radius(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) IS
  'Find customers within a specified radius (in meters) of a center point';

-- ---------------------------------------------------------------------
-- Customer Metrics Trigger Functions (from 00000000000002_business_core_tables.sql)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_customer_metrics()
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
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

COMMENT ON FUNCTION public.update_customer_metrics() IS
  'Automatically update customer metrics (total_appointments) when ticket status changes';

-- =====================================================================================
-- PART 3: RECREATE TRIGGERS THAT WERE DROPPED
-- =====================================================================================
-- When we dropped functions with CASCADE, many triggers were also dropped
-- We need to recreate them here
-- =====================================================================================

-- Auth triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.phone IS DISTINCT FROM NEW.phone)
  EXECUTE FUNCTION public.handle_user_update();

CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- Protection triggers
CREATE TRIGGER protect_persons_critical_fields
  BEFORE UPDATE ON persons
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_person_critical_fields();

CREATE TRIGGER protect_businesses_critical_fields
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_business_critical_fields();

CREATE TRIGGER protect_tickets_critical_fields
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_ticket_critical_fields();

CREATE TRIGGER protect_routes_critical_fields
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_route_critical_fields();

CREATE TRIGGER protect_technicians_sensitive_fields
  BEFORE UPDATE ON technicians
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_technician_sensitive_fields();

-- Auto-generation triggers
CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_ticket_number();

CREATE TRIGGER generate_route_number_trigger
  BEFORE INSERT ON routes
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_route_number();

-- Customer metrics trigger
CREATE TRIGGER update_customer_metrics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_metrics();

-- =====================================================================================
-- PART 4: DOCUMENTATION FOR POSTGIS EXTENSION IN PUBLIC SCHEMA
-- =====================================================================================

COMMENT ON EXTENSION postgis IS 'PostGIS extension installed in public schema per standard PostGIS practice. While the Supabase linter recommends moving extensions out of public schema, PostGIS is designed to be installed in public and moving it can cause issues. This is an accepted exception to the linter rule. See: https://supabase.com/docs/guides/database/extensions/postgis';

-- =====================================================================================
-- END OF MIGRATION
-- =====================================================================================
-- Security advisor issues addressed:
-- ✓ All 20 functions now have immutable search_path (WARN level fixed)
-- ✓ PostGIS extension documented as acceptable in public schema (WARN level documented)
-- ✓ All triggers recreated after function drops
-- ⚠ spatial_ref_sys RLS cannot be enabled (PostGIS system table, requires superuser)
--   This ERROR level warning must be ACCEPTED as a known limitation of PostGIS on
--   managed platforms. The table is read-only reference data with no security risk.
-- =====================================================================================
