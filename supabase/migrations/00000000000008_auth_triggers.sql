-- =====================================================
-- Auth Triggers and Functions
-- =====================================================
-- Description: Automatically create Person records when users sign up
-- and provide custom JWT claims for role-based access control
-- Dependencies: Requires persons table from previous migrations
-- =====================================================

-- =====================================================
-- Function: handle_new_user
-- =====================================================
-- Purpose: Automatically create a Person record when a new user signs up
-- Trigger: AFTER INSERT on auth.users
-- Security: SECURITY DEFINER (runs with elevated privileges)
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_metadata jsonb;
  business_uuid uuid;
  user_role text;
BEGIN
  -- Extract metadata from auth.users
  -- Metadata should be passed during signup in raw_user_meta_data
  user_metadata := NEW.raw_user_meta_data;

  -- Get business_id and role from metadata
  -- Default to NULL for business_id (customer without business association)
  -- Default to 'customer' for role
  business_uuid := (user_metadata->>'business_id')::uuid;
  user_role := COALESCE(user_metadata->>'role', 'customer');

  -- Validate role is a valid person_role enum value
  -- If invalid, default to customer
  IF user_role NOT IN ('customer', 'technician', 'admin', 'super_admin') THEN
    user_role := 'customer';
  END IF;

  -- Create person record
  -- This will fail if business_id is provided but doesn't exist (FK constraint)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger: on_auth_user_created
-- =====================================================
-- Purpose: Fire handle_new_user function after user signup
-- =====================================================

-- Drop trigger if exists (for idempotent migrations)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Function: get_user_claims
-- =====================================================
-- Purpose: Retrieve custom JWT claims for a user
-- Used by: Supabase Auth to add custom claims to JWT
-- Returns: JSONB object with person_id, business_id, role, etc.
-- =====================================================

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
  -- This shouldn't happen if trigger works correctly
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Function: handle_user_update
-- =====================================================
-- Purpose: Sync auth.users updates to persons table
-- Trigger: AFTER UPDATE on auth.users
-- Syncs: email, phone changes from auth.users to persons
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update person record when auth.users is updated
  -- Only sync email and phone, metadata is handled separately
  UPDATE public.persons
  SET
    email = NEW.email,
    phone = NEW.phone,
    updated_at = NOW()
  WHERE supabase_user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger: on_auth_user_updated
-- =====================================================
-- Purpose: Fire handle_user_update function after user update
-- =====================================================

-- Drop trigger if exists (for idempotent migrations)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.phone IS DISTINCT FROM NEW.phone)
  EXECUTE FUNCTION public.handle_user_update();

-- =====================================================
-- Function: handle_user_delete
-- =====================================================
-- Purpose: Handle user deletion (soft delete person record)
-- Trigger: AFTER DELETE on auth.users
-- Note: We soft-delete to preserve data integrity and history
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Soft delete the person record
  -- We set is_active to false instead of hard delete
  -- This preserves referential integrity and historical data
  UPDATE public.persons
  SET
    is_active = false,
    updated_at = NOW()
  WHERE supabase_user_id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger: on_auth_user_deleted
-- =====================================================
-- Purpose: Fire handle_user_delete function after user deletion
-- =====================================================

-- Drop trigger if exists (for idempotent migrations)
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- =====================================================
-- Grant Permissions
-- =====================================================
-- Allow authenticated users to read their own claims
-- =====================================================

GRANT EXECUTE ON FUNCTION public.get_user_claims(uuid) TO authenticated;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user() IS
  'Automatically creates a Person record when a new user signs up via Supabase Auth. Extracts metadata from raw_user_meta_data including business_id, role, first_name, and last_name.';

COMMENT ON FUNCTION public.get_user_claims(uuid) IS
  'Retrieves custom JWT claims for a user including person_id, business_id, role, and name. Used by Supabase Auth to populate JWT tokens.';

COMMENT ON FUNCTION public.handle_user_update() IS
  'Syncs email and phone updates from auth.users to the persons table when a user updates their authentication details.';

COMMENT ON FUNCTION public.handle_user_delete() IS
  'Soft-deletes a Person record when a user account is deleted from auth.users by setting is_active to false.';

-- =====================================================
-- End of Migration
-- =====================================================
