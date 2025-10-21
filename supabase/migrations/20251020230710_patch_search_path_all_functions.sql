-- =====================================================================================
-- Migration: Patch search_path for all application functions
-- Description: Re-apply SET search_path to all functions to fix Security Advisor warnings
-- Security Level: CRITICAL - Prevents search_path injection attacks
-- =====================================================================================
--
-- This migration uses ALTER FUNCTION to set search_path on all existing functions.
-- This is safer than DROP/CREATE as it preserves function OIDs and doesn't break
-- existing dependencies or permissions.
--
-- All functions get: SET search_path = public, pg_temp
-- This prevents malicious schema manipulation from hijacking function calls.
-- =====================================================================================

-- Helper Functions
ALTER FUNCTION public.current_business_id() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_super_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.current_person_id() SET search_path = public, pg_temp;
ALTER FUNCTION public.current_user_role() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_authenticated() SET search_path = public, pg_temp;

-- Timestamp Trigger Function
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- Auth Trigger Functions
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_claims(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_user_update() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_user_delete() SET search_path = public, pg_temp;

-- Protection Functions
ALTER FUNCTION public.protect_person_critical_fields() SET search_path = public, pg_temp;
ALTER FUNCTION public.protect_business_critical_fields() SET search_path = public, pg_temp;
ALTER FUNCTION public.protect_ticket_critical_fields() SET search_path = public, pg_temp;
ALTER FUNCTION public.protect_route_critical_fields() SET search_path = public, pg_temp;
ALTER FUNCTION public.protect_technician_sensitive_fields() SET search_path = public, pg_temp;

-- Auto-generation Trigger Functions
ALTER FUNCTION public.generate_ticket_number() SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_route_number() SET search_path = public, pg_temp;

-- Geospatial Functions
ALTER FUNCTION public.calculate_distance(double precision, double precision, double precision, double precision) SET search_path = public, pg_temp;
ALTER FUNCTION public.find_customers_within_radius(double precision, double precision, double precision) SET search_path = public, pg_temp;

-- Customer Metrics Trigger Function
ALTER FUNCTION public.update_customer_metrics() SET search_path = public, pg_temp;

-- =====================================================================================
-- END OF MIGRATION
-- =====================================================================================
-- All 20 application functions now have immutable search_path set
-- This should resolve all "Function search_path Mutable" warnings in Supabase Advisor
-- =====================================================================================
