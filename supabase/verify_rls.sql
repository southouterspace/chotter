-- =====================================================================================
-- RLS Security Verification Script
-- =====================================================================================
-- This script verifies that all Chotter database tables have RLS enabled
-- and counts the policies implemented for comprehensive security coverage.
-- =====================================================================================

-- Display header
\echo '==================================================================='
\echo 'CHOTTER RLS SECURITY VERIFICATION'
\echo '==================================================================='
\echo ''

-- =====================================================================================
-- PART 1: Verify RLS is enabled on all tables
-- =====================================================================================

\echo '1. VERIFYING RLS ENABLED ON ALL TABLES'
\echo '-------------------------------------------------------------------'

SELECT
  tablename AS table_name,
  CASE
    WHEN rowsecurity THEN '✓ ENABLED'
    ELSE '✗ DISABLED'
  END AS rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo '-------------------------------------------------------------------'

-- Count tables with RLS enabled
SELECT
  COUNT(*) AS total_tables,
  SUM(CASE WHEN rowsecurity THEN 1 ELSE 0 END) AS tables_with_rls,
  SUM(CASE WHEN NOT rowsecurity THEN 1 ELSE 0 END) AS tables_without_rls
FROM pg_tables
WHERE schemaname = 'public';

\echo ''

-- =====================================================================================
-- PART 2: Count policies per table
-- =====================================================================================

\echo '2. POLICY COUNT PER TABLE'
\echo '-------------------------------------------------------------------'

SELECT
  tablename AS table_name,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;

\echo ''
\echo '-------------------------------------------------------------------'

-- Total policy count
SELECT
  COUNT(*) AS total_policies,
  COUNT(DISTINCT tablename) AS tables_with_policies
FROM pg_policies
WHERE schemaname = 'public';

\echo ''

-- =====================================================================================
-- PART 3: Policy details by operation type
-- =====================================================================================

\echo '3. POLICIES BY OPERATION TYPE'
\echo '-------------------------------------------------------------------'

SELECT
  tablename AS table_name,
  cmd AS operation,
  policyname AS policy_name,
  CASE
    WHEN permissive = 'PERMISSIVE' THEN '✓ PERMISSIVE'
    ELSE '✗ RESTRICTIVE'
  END AS policy_type
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

\echo ''

-- =====================================================================================
-- PART 4: Tables without policies (security risk!)
-- =====================================================================================

\echo '4. TABLES WITHOUT POLICIES (SECURITY RISK)'
\echo '-------------------------------------------------------------------'

SELECT
  t.tablename AS table_name,
  '⚠️  NO POLICIES' AS warning
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND p.policyname IS NULL
GROUP BY t.tablename;

\echo ''

-- =====================================================================================
-- PART 5: Helper functions verification
-- =====================================================================================

\echo '5. RLS HELPER FUNCTIONS'
\echo '-------------------------------------------------------------------'

SELECT
  proname AS function_name,
  pg_get_function_result(oid) AS return_type,
  CASE
    WHEN provolatile = 'i' THEN 'IMMUTABLE'
    WHEN provolatile = 's' THEN 'STABLE'
    WHEN provolatile = 'v' THEN 'VOLATILE'
  END AS volatility,
  CASE
    WHEN prosecdef THEN '✓ SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode
FROM pg_proc
WHERE proname IN (
  'current_person_id',
  'current_business_id',
  'current_user_role',
  'is_super_admin',
  'is_authenticated'
)
ORDER BY proname;

\echo ''

-- =====================================================================================
-- PART 6: Platform tables summary
-- =====================================================================================

\echo '6. PLATFORM TABLES SECURITY (P1.1)'
\echo '-------------------------------------------------------------------'

SELECT
  t.tablename AS table_name,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'businesses',
    'subscription_tiers',
    'subscriptions',
    'platform_settings',
    'audit_logs',
    'invoice_history',
    'usage_events'
  )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

\echo ''

-- =====================================================================================
-- PART 7: Business tables summary
-- =====================================================================================

\echo '7. BUSINESS TABLES SECURITY (P1.2-P1.4)'
\echo '-------------------------------------------------------------------'

SELECT
  t.tablename AS table_name,
  t.rowsecurity AS rls_enabled,
  COUNT(p.policyname) AS policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'persons', 'customers', 'technicians', 'services', 'tickets', 'routes',
    'media', 'notifications', 'location_history', 'geofence_events',
    'status_history', 'route_events', 'on_call_schedules', 'emergency_requests',
    'payment_settings', 'pricing_rules', 'payments', 'refunds',
    'ai_agents', 'ai_conversations', 'ai_usage_events'
  )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

\echo ''

-- =====================================================================================
-- PART 8: Security summary
-- =====================================================================================

\echo '8. SECURITY COVERAGE SUMMARY'
\echo '-------------------------------------------------------------------'

WITH table_stats AS (
  SELECT
    COUNT(*) AS total_tables,
    SUM(CASE WHEN rowsecurity THEN 1 ELSE 0 END) AS tables_with_rls
  FROM pg_tables
  WHERE schemaname = 'public'
),
policy_stats AS (
  SELECT
    COUNT(*) AS total_policies,
    COUNT(DISTINCT tablename) AS tables_with_policies
  FROM pg_policies
  WHERE schemaname = 'public'
)
SELECT
  t.total_tables AS "Total Tables",
  t.tables_with_rls AS "Tables with RLS",
  p.tables_with_policies AS "Tables with Policies",
  p.total_policies AS "Total Policies",
  CASE
    WHEN t.tables_with_rls = t.total_tables THEN '✓ ALL TABLES SECURED'
    ELSE '⚠️  INCOMPLETE RLS COVERAGE'
  END AS "RLS Coverage Status"
FROM table_stats t, policy_stats p;

\echo ''
\echo '==================================================================='
\echo 'VERIFICATION COMPLETE'
\echo '==================================================================='
\echo ''

-- Expected results:
-- - Total tables: 28 (7 platform + 21 business)
-- - All tables with RLS enabled
-- - Total policies: ~123
-- - No tables without policies
-- - 5 helper functions present
