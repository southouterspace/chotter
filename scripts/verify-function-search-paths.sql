-- =====================================================================================
-- Script to verify all functions have SET search_path configured
-- Run this in the Supabase SQL Editor to check function definitions
-- =====================================================================================

-- Query to show all user-defined functions and their search_path settings
SELECT
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS parameters,
  CASE
    WHEN p.proconfig IS NOT NULL THEN
      array_to_string(p.proconfig, ', ')
    ELSE
      'NO SEARCH_PATH SET'
  END AS search_path_config,
  CASE
    WHEN p.proconfig IS NOT NULL AND
         array_to_string(p.proconfig, ', ') LIKE '%search_path%'
    THEN '✓ FIXED'
    ELSE '✗ NEEDS FIX'
  END AS status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'  -- Only functions (not aggregates or window functions)
ORDER BY
  CASE
    WHEN p.proconfig IS NOT NULL AND
         array_to_string(p.proconfig, ', ') LIKE '%search_path%'
    THEN 1
    ELSE 0
  END,
  p.proname;
