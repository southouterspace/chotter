-- =====================================================
-- Chotter Seed Data
-- =====================================================
-- Description: Comprehensive seed data for development and testing
-- with realistic multi-tenant scenarios
-- =====================================================
-- Usage: supabase db reset (applies all migrations + seed)
-- =====================================================

BEGIN;

-- =====================================================
-- 1. SUBSCRIPTION TIERS
-- =====================================================

-- Tier IDs (fixed for referencing in other tables)
-- tier_starter: 11111111-1111-1111-1111-111111111111
-- tier_professional: 22222222-2222-2222-2222-222222222222
-- tier_enterprise: 33333333-3333-3333-3333-333333333333

INSERT INTO subscription_tiers (
  id,
  name,
  slug,
  display_name,
  description,
  monthly_price_cents,
  annual_price_cents,
  stripe_monthly_price_id,
  stripe_annual_price_id,
  features,
  limits,
  sort_order,
  active,
  is_public
) VALUES
-- Starter Tier
(
  '11111111-1111-1111-1111-111111111111',
  'Starter',
  'starter',
  'Starter Plan',
  'Perfect for small businesses getting started with field service management',
  4900,  -- $49.00/month
  47040, -- $392/year (20% discount)
  'price_starter_monthly_test',
  'price_starter_annual_test',
  '{
    "payment_processing": false,
    "ai_agent": false,
    "advanced_analytics": false,
    "custom_branding": false,
    "api_access": false
  }'::jsonb,
  '{
    "appointments_per_month": 100,
    "admin_users": 1,
    "field_technicians": 3,
    "storage_gb": 10
  }'::jsonb,
  1,
  true,
  true
),
-- Professional Tier
(
  '22222222-2222-2222-2222-222222222222',
  'Professional',
  'professional',
  'Professional Plan',
  'Advanced features including payment processing and AI booking agent',
  14900,  -- $149.00/month
  142800, -- $1,190/year (20% discount)
  'price_professional_monthly_test',
  'price_professional_annual_test',
  '{
    "payment_processing": true,
    "ai_agent": true,
    "advanced_analytics": true,
    "custom_branding": true,
    "api_access": true
  }'::jsonb,
  '{
    "appointments_per_month": 500,
    "admin_users": 2,
    "field_technicians": 10,
    "ai_voice_minutes": 500,
    "storage_gb": 50
  }'::jsonb,
  2,
  true,
  true
),
-- Enterprise Tier
(
  '33333333-3333-3333-3333-333333333333',
  'Enterprise',
  'enterprise',
  'Enterprise Plan',
  'Unlimited features for large-scale operations',
  29900,  -- $299.00/month
  286800, -- $2,390/year (20% discount)
  'price_enterprise_monthly_test',
  'price_enterprise_annual_test',
  '{
    "payment_processing": true,
    "ai_agent": true,
    "advanced_analytics": true,
    "custom_branding": true,
    "api_access": true,
    "white_label": true,
    "dedicated_support": true,
    "sla_guarantee": true
  }'::jsonb,
  '{
    "appointments_per_month": 2000,
    "admin_users": 10,
    "field_technicians": 50,
    "ai_voice_minutes": 2000,
    "storage_gb": 500
  }'::jsonb,
  3,
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. PLATFORM SETTINGS
-- =====================================================

INSERT INTO platform_settings (
  id,
  setting_key,
  setting_value,
  setting_type,
  description
) VALUES
-- Grace Period Configuration
(
  gen_random_uuid(),
  'grace_period_overage_threshold',
  '{"percentage": 10}'::jsonb,
  'grace_period',
  'Percentage over plan limit before grace period is triggered (10%)'
),
(
  gen_random_uuid(),
  'grace_period_max_per_year',
  '{"count": 1}'::jsonb,
  'grace_period',
  'Maximum grace periods allowed per business per year'
),
(
  gen_random_uuid(),
  'grace_period_duration_days',
  '{"days": 7}'::jsonb,
  'grace_period',
  'Duration of grace period in days before enforcement'
),
-- Trial Configuration
(
  gen_random_uuid(),
  'trial_duration_days',
  '{"days": 14}'::jsonb,
  'trial_config',
  'Default trial period duration'
),
(
  gen_random_uuid(),
  'trial_reminder_schedule',
  '{"reminders": [{"days_before_end": 7, "channels": ["email"]}, {"days_before_end": 3, "channels": ["email", "sms"]}, {"days_before_end": 1, "channels": ["email", "sms"]}]}'::jsonb,
  'trial_config',
  'Schedule for trial expiration reminders'
),
-- AI Configuration
(
  gen_random_uuid(),
  'ai_default_model',
  '{"provider": "anthropic", "model": "claude-sonnet-4", "version": "20250514"}'::jsonb,
  'ai_config',
  'Default AI model for booking agent'
),
(
  gen_random_uuid(),
  'ai_pricing_per_minute',
  '{"cents": 15}'::jsonb,
  'ai_config',
  'Cost per minute of AI voice conversation ($0.15/min)'
),
-- Feature Flags
(
  gen_random_uuid(),
  'feature_beta_advanced_routing',
  '{"enabled": true, "rollout_percentage": 50}'::jsonb,
  'feature_flag',
  'Beta feature: Advanced route optimization with machine learning'
),
(
  gen_random_uuid(),
  'feature_beta_predictive_maintenance',
  '{"enabled": false}'::jsonb,
  'feature_flag',
  'Beta feature: Predictive maintenance scheduling'
),
-- Notification Templates
(
  gen_random_uuid(),
  'notification_template_appointment_confirmed',
  '{
    "sms": "Hi {{customer_name}}! Your {{service_name}} appointment is confirmed for {{date}} between {{time_window}}. Technician: {{tech_name}}. Reply CANCEL to cancel.",
    "email_subject": "Appointment Confirmed - {{ticket_number}}",
    "email_body": "Your appointment has been confirmed. Details: {{details}}"
  }'::jsonb,
  'notification_config',
  'Template for appointment confirmation notifications'
),
(
  gen_random_uuid(),
  'notification_template_technician_en_route',
  '{
    "sms": "{{tech_name}} is on the way! ETA: {{eta}} minutes. Track: {{tracking_link}}",
    "push": {"title": "Technician En Route", "body": "{{tech_name}} is {{eta}} minutes away"}
  }'::jsonb,
  'notification_config',
  'Template for technician en route notifications'
)
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 3. SAMPLE BUSINESSES
-- =====================================================

-- Business IDs (fixed for referencing)
-- business_acme_hvac: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- business_quickfix: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- business_elite: cccccccc-cccc-cccc-cccc-cccccccccccc

-- Business 1: Acme HVAC (Professional tier, active)
INSERT INTO businesses (
  id,
  name,
  slug,
  subdomain,
  industry,
  contact_email,
  contact_phone,
  address_line1,
  city,
  state,
  postal_code,
  country,
  timezone,
  business_hours,
  logo_url,
  website_url,
  status,
  activated_at,
  settings
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Acme HVAC',
  'acme-hvac',
  'acme',
  'hvac',
  'admin@acmehvac.com',
  '+16195551001',
  '1234 Main Street',
  'San Diego',
  'CA',
  '92101',
  'US',
  'America/Los_Angeles',
  '{
    "monday": {"start": "08:00", "end": "17:00"},
    "tuesday": {"start": "08:00", "end": "17:00"},
    "wednesday": {"start": "08:00", "end": "17:00"},
    "thursday": {"start": "08:00", "end": "17:00"},
    "friday": {"start": "08:00", "end": "17:00"},
    "saturday": {"start": "09:00", "end": "14:00"},
    "sunday": {"start": null, "end": null}
  }'::jsonb,
  'https://placeholder.com/logos/acme-hvac.png',
  'https://www.acmehvac.com',
  'active',
  NOW() - INTERVAL '6 months',
  '{"is_test_data": true, "notification_preferences": {"appointment_reminders": true}}'::jsonb
);

-- Business 2: Quick Fix Plumbing (Starter tier, trial)
INSERT INTO businesses (
  id,
  name,
  slug,
  subdomain,
  industry,
  contact_email,
  contact_phone,
  address_line1,
  city,
  state,
  postal_code,
  country,
  timezone,
  business_hours,
  website_url,
  status,
  trial_started_at,
  trial_ends_at,
  settings
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Quick Fix Plumbing',
  'quickfix-plumbing',
  'quickfix',
  'plumbing',
  'owner@quickfixplumbing.com',
  '+15125552001',
  '456 Oak Avenue',
  'Austin',
  'TX',
  '78701',
  'US',
  'America/Chicago',
  '{
    "monday": {"start": "07:00", "end": "19:00"},
    "tuesday": {"start": "07:00", "end": "19:00"},
    "wednesday": {"start": "07:00", "end": "19:00"},
    "thursday": {"start": "07:00", "end": "19:00"},
    "friday": {"start": "07:00", "end": "19:00"},
    "saturday": {"start": "07:00", "end": "19:00"},
    "sunday": {"start": null, "end": null}
  }'::jsonb,
  'https://www.quickfixplumbing.com',
  'trial',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '13 days',
  '{"is_test_data": true}'::jsonb
);

-- Business 3: Elite Electric (Starter tier, active)
INSERT INTO businesses (
  id,
  name,
  slug,
  subdomain,
  industry,
  contact_email,
  contact_phone,
  address_line1,
  city,
  state,
  postal_code,
  country,
  timezone,
  business_hours,
  status,
  activated_at,
  settings
) VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Elite Electric',
  'elite-electric',
  'elite',
  'electrical',
  'contact@eliteelectric.com',
  '+13055553001',
  '789 Bay Drive',
  'Miami',
  'FL',
  '33101',
  'US',
  'America/New_York',
  '{
    "monday": {"start": "08:00", "end": "18:00"},
    "tuesday": {"start": "08:00", "end": "18:00"},
    "wednesday": {"start": "08:00", "end": "18:00"},
    "thursday": {"start": "08:00", "end": "18:00"},
    "friday": {"start": "08:00", "end": "18:00"},
    "saturday": {"start": null, "end": null},
    "sunday": {"start": null, "end": null}
  }'::jsonb,
  'active',
  NOW() - INTERVAL '3 months',
  '{"is_test_data": true}'::jsonb
);

-- =====================================================
-- 4. SUBSCRIPTIONS
-- =====================================================

-- Acme HVAC - Professional tier
INSERT INTO subscriptions (
  id,
  business_id,
  tier_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  billing_period,
  current_period_start,
  current_period_end,
  grace_periods_used_this_year,
  grace_periods_reset_at,
  current_usage,
  payment_method
) VALUES (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '22222222-2222-2222-2222-222222222222', -- Professional tier
  'cus_test_acme_hvac_123',
  'sub_test_acme_hvac_456',
  'active',
  'monthly',
  DATE_TRUNC('month', CURRENT_DATE),
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
  0,
  DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year',
  '{
    "appointments": 127,
    "admin_users": 1,
    "field_technicians": 3,
    "ai_voice_minutes": 45
  }'::jsonb,
  '{
    "brand": "visa",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2026
  }'::jsonb
);

-- Quick Fix Plumbing - Starter tier (trial)
INSERT INTO subscriptions (
  id,
  business_id,
  tier_id,
  stripe_customer_id,
  status,
  billing_period,
  current_period_start,
  current_period_end,
  trial_start,
  trial_end,
  grace_periods_used_this_year,
  grace_periods_reset_at,
  current_usage
) VALUES (
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111', -- Starter tier
  'cus_test_quickfix_789',
  'trial',
  'monthly',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '13 days',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '13 days',
  0,
  DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year',
  '{
    "appointments": 12,
    "admin_users": 1,
    "field_technicians": 2
  }'::jsonb
);

-- Elite Electric - Starter tier
INSERT INTO subscriptions (
  id,
  business_id,
  tier_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  billing_period,
  current_period_start,
  current_period_end,
  grace_periods_used_this_year,
  grace_periods_reset_at,
  current_usage,
  payment_method
) VALUES (
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111', -- Starter tier
  'cus_test_elite_electric_101',
  'sub_test_elite_electric_102',
  'active',
  'monthly',
  DATE_TRUNC('month', CURRENT_DATE),
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
  0,
  DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year',
  '{
    "appointments": 45,
    "admin_users": 1,
    "field_technicians": 2
  }'::jsonb,
  '{
    "brand": "mastercard",
    "last4": "5555",
    "exp_month": 8,
    "exp_year": 2027
  }'::jsonb
);

-- =====================================================
-- 5. PERSONS (Admins, Technicians, Customers)
-- =====================================================

-- Note: These persons do NOT have supabase_user_id because we're not creating
-- actual auth.users records. In production, the handle_new_user() trigger
-- would create Person records when users sign up.

-- === ACME HVAC PERSONS ===

-- Admin: Sarah Johnson
INSERT INTO persons (
  id,
  business_id,
  email,
  phone,
  first_name,
  last_name,
  role,
  notification_preference,
  timezone,
  is_active
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'admin@acmehvac.com',
  '+16195551001',
  'Sarah',
  'Johnson',
  'admin',
  'both',
  'America/Los_Angeles',
  true
);

-- Update business owner_person_id
UPDATE businesses
SET owner_person_id = 'a0000000-0000-0000-0000-000000000001'
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Technician: Mike Rodriguez (Senior)
INSERT INTO persons (
  id,
  business_id,
  email,
  phone,
  first_name,
  last_name,
  role,
  notification_preference,
  timezone,
  is_active
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'mike.rodriguez@acmehvac.com',
  '+16195551002',
  'Mike',
  'Rodriguez',
  'technician',
  'sms',
  'America/Los_Angeles',
  true
);

-- Technician: David Chen
INSERT INTO persons (
  id,
  business_id,
  email,
  phone,
  first_name,
  last_name,
  role,
  notification_preference,
  timezone,
  is_active
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'david.chen@acmehvac.com',
  '+16195551003',
  'David',
  'Chen',
  'technician',
  'email',
  'America/Los_Angeles',
  true
);

-- Technician: Lisa Martinez
INSERT INTO persons (
  id,
  business_id,
  email,
  phone,
  first_name,
  last_name,
  role,
  notification_preference,
  timezone,
  is_active
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'lisa.martinez@acmehvac.com',
  '+16195551004',
  'Lisa',
  'Martinez',
  'technician',
  'both',
  'America/Los_Angeles',
  true
);

-- Customers for Acme HVAC (Person records)
INSERT INTO persons (id, business_id, email, phone, first_name, last_name, role, notification_preference, is_active) VALUES
('a1000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'robert.williams@email.com', '+16195552001', 'Robert', 'Williams', 'customer', 'sms', true),
('a1000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'jennifer.davis@email.com', '+16195552002', 'Jennifer', 'Davis', 'customer', 'email', true),
('a1000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'michael.brown@email.com', '+16195552003', 'Michael', 'Brown', 'customer', 'both', true),
('a1000000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'maria.garcia@email.com', '+16195552004', 'Maria', 'Garcia', 'customer', 'sms', true),
('a1000000-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'james.miller@email.com', '+16195552005', 'James', 'Miller', 'customer', 'email', true),
('a1000000-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'linda.wilson@email.com', '+16195552006', 'Linda', 'Wilson', 'customer', 'both', true),
('a1000000-0000-0000-0000-000000000007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'david.moore@email.com', '+16195552007', 'David', 'Moore', 'customer', 'sms', true),
('a1000000-0000-0000-0000-000000000008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'barbara.taylor@email.com', '+16195552008', 'Barbara', 'Taylor', 'customer', 'email', true);

-- === QUICK FIX PLUMBING PERSONS ===

-- Admin: Tom Wilson
INSERT INTO persons (
  id,
  business_id,
  email,
  phone,
  first_name,
  last_name,
  role,
  notification_preference,
  timezone,
  is_active
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'owner@quickfixplumbing.com',
  '+15125552001',
  'Tom',
  'Wilson',
  'admin',
  'both',
  'America/Chicago',
  true
);

-- Update business owner_person_id
UPDATE businesses
SET owner_person_id = 'b0000000-0000-0000-0000-000000000001'
WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- Technician: Carlos Garcia
INSERT INTO persons (
  id,
  business_id,
  email,
  phone,
  first_name,
  last_name,
  role,
  notification_preference,
  timezone,
  is_active
) VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'carlos.garcia@quickfixplumbing.com',
  '+15125552002',
  'Carlos',
  'Garcia',
  'technician',
  'sms',
  'America/Chicago',
  true
);

-- Technician: Emma Thompson
INSERT INTO persons (
  id,
  business_id,
  email,
  phone,
  first_name,
  last_name,
  role,
  notification_preference,
  timezone,
  is_active
) VALUES (
  'b0000000-0000-0000-0000-000000000003',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'emma.thompson@quickfixplumbing.com',
  '+15125552003',
  'Emma',
  'Thompson',
  'technician',
  'both',
  'America/Chicago',
  true
);

-- Customers for Quick Fix Plumbing (Person records)
INSERT INTO persons (id, business_id, email, phone, first_name, last_name, role, notification_preference, is_active) VALUES
('b1000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sarah.anderson@email.com', '+15125553001', 'Sarah', 'Anderson', 'customer', 'sms', true),
('b1000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'kevin.martinez@email.com', '+15125553002', 'Kevin', 'Martinez', 'customer', 'email', true),
('b1000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'amanda.lee@email.com', '+15125553003', 'Amanda', 'Lee', 'customer', 'both', true),
('b1000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'daniel.jackson@email.com', '+15125553004', 'Daniel', 'Jackson', 'customer', 'sms', true),
('b1000000-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'patricia.white@email.com', '+15125553005', 'Patricia', 'White', 'customer', 'email', true),
('b1000000-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'christopher.harris@email.com', '+15125553006', 'Christopher', 'Harris', 'customer', 'both', true);

-- =====================================================
-- 6. TECHNICIANS (Extended data)
-- =====================================================

-- Acme HVAC Technicians

-- Mike Rodriguez (Senior HVAC Tech)
INSERT INTO technicians (
  id,
  person_id,
  business_id,
  employee_id,
  skills,
  certifications,
  home_location,
  current_location,
  working_hours,
  max_appointments_per_day,
  vehicle_info,
  hourly_rate_cents,
  active,
  hire_date,
  performance_metrics
) VALUES (
  gen_random_uuid(),
  'a0000000-0000-0000-0000-000000000002',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'EMP-001',
  '["ac_repair", "heating_repair", "installation", "maintenance", "duct_cleaning"]'::jsonb,
  '[
    {"name": "EPA 608 Universal", "issuer": "EPA", "number": "EPA-608-12345", "issued": "2020-06-15", "expires": "2025-06-15"},
    {"name": "NATE Certified", "issuer": "NATE", "number": "NATE-67890", "issued": "2021-03-20", "expires": "2026-03-20"}
  ]'::jsonb,
  ST_SetSRID(ST_MakePoint(-117.0839, 32.8153), 4326)::geography, -- Clairemont, San Diego
  ST_SetSRID(ST_MakePoint(-117.0839, 32.8153), 4326)::geography,
  '{
    "monday": {"start": "07:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "12:30"}]},
    "tuesday": {"start": "07:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "12:30"}]},
    "wednesday": {"start": "07:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "12:30"}]},
    "thursday": {"start": "07:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "12:30"}]},
    "friday": {"start": "07:00", "end": "16:00", "breaks": [{"start": "12:00", "end": "12:30"}]}
  }'::jsonb,
  6,
  '{"make": "Ford", "model": "Transit 250", "year": 2022, "plate": "HVAC-001", "color": "white"}'::jsonb,
  6500,
  true,
  '2020-01-15',
  '{"avg_jobs_per_day": 5.2, "avg_rating": 4.8, "on_time_percentage": 96}'::jsonb
);

-- David Chen (Intermediate HVAC Tech)
INSERT INTO technicians (
  id,
  person_id,
  business_id,
  employee_id,
  skills,
  certifications,
  home_location,
  current_location,
  working_hours,
  max_appointments_per_day,
  vehicle_info,
  hourly_rate_cents,
  active,
  hire_date,
  performance_metrics
) VALUES (
  gen_random_uuid(),
  'a0000000-0000-0000-0000-000000000003',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'EMP-002',
  '["ac_repair", "maintenance", "basic_installation"]'::jsonb,
  '[
    {"name": "EPA 608 Type II", "issuer": "EPA", "number": "EPA-608-54321", "issued": "2022-04-10", "expires": "2027-04-10"}
  ]'::jsonb,
  ST_SetSRID(ST_MakePoint(-117.1611, 32.7157), 4326)::geography, -- Downtown San Diego
  ST_SetSRID(ST_MakePoint(-117.1611, 32.7157), 4326)::geography,
  '{
    "monday": {"start": "08:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
    "tuesday": {"start": "08:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
    "wednesday": {"start": "08:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
    "thursday": {"start": "08:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
    "friday": {"start": "08:00", "end": "17:00", "breaks": [{"start": "12:00", "end": "13:00"}]}
  }'::jsonb,
  5,
  '{"make": "Chevrolet", "model": "Express 3500", "year": 2021, "plate": "HVAC-002", "color": "white"}'::jsonb,
  5000,
  true,
  '2022-03-01',
  '{"avg_jobs_per_day": 4.5, "avg_rating": 4.6, "on_time_percentage": 92}'::jsonb
);

-- Lisa Martinez (HVAC Tech)
INSERT INTO technicians (
  id,
  person_id,
  business_id,
  employee_id,
  skills,
  certifications,
  home_location,
  current_location,
  working_hours,
  max_appointments_per_day,
  vehicle_info,
  hourly_rate_cents,
  active,
  hire_date,
  performance_metrics
) VALUES (
  gen_random_uuid(),
  'a0000000-0000-0000-0000-000000000004',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'EMP-003',
  '["ac_repair", "maintenance", "filter_replacement"]'::jsonb,
  '[
    {"name": "EPA 608 Type I", "issuer": "EPA", "number": "EPA-608-99887", "issued": "2023-01-15", "expires": "2028-01-15"}
  ]'::jsonb,
  ST_SetSRID(ST_MakePoint(-117.2340, 32.8328), 4326)::geography, -- La Jolla
  ST_SetSRID(ST_MakePoint(-117.2340, 32.8328), 4326)::geography,
  '{
    "monday": {"start": "08:00", "end": "17:00"},
    "tuesday": {"start": "08:00", "end": "17:00"},
    "wednesday": {"start": "08:00", "end": "17:00"},
    "thursday": {"start": "08:00", "end": "17:00"},
    "friday": {"start": "08:00", "end": "17:00"}
  }'::jsonb,
  5,
  '{"make": "RAM", "model": "ProMaster 2500", "year": 2023, "plate": "HVAC-003", "color": "white"}'::jsonb,
  4800,
  true,
  '2023-01-10',
  '{"avg_jobs_per_day": 4.8, "avg_rating": 4.7, "on_time_percentage": 94}'::jsonb
);

-- Quick Fix Plumbing Technicians

-- Carlos Garcia (Senior Plumber)
INSERT INTO technicians (
  id,
  person_id,
  business_id,
  employee_id,
  skills,
  certifications,
  home_location,
  current_location,
  working_hours,
  max_appointments_per_day,
  vehicle_info,
  hourly_rate_cents,
  active,
  hire_date,
  performance_metrics
) VALUES (
  gen_random_uuid(),
  'b0000000-0000-0000-0000-000000000002',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'TECH-001',
  '["drain_cleaning", "leak_repair", "water_heater", "pipe_installation", "emergency_services"]'::jsonb,
  '[
    {"name": "Master Plumber License", "issuer": "Texas State Board", "number": "MP-54321", "issued": "2018-05-20", "expires": "2026-05-20"},
    {"name": "Backflow Prevention Certification", "issuer": "TCEQ", "number": "BP-78901", "issued": "2019-08-15", "expires": "2025-08-15"}
  ]'::jsonb,
  ST_SetSRID(ST_MakePoint(-97.7431, 30.2672), 4326)::geography, -- Downtown Austin
  ST_SetSRID(ST_MakePoint(-97.7431, 30.2672), 4326)::geography,
  '{
    "monday": {"start": "06:00", "end": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
    "tuesday": {"start": "06:00", "end": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
    "wednesday": {"start": "06:00", "end": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
    "thursday": {"start": "06:00", "end": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
    "friday": {"start": "06:00", "end": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
    "saturday": {"start": "08:00", "end": "14:00"}
  }'::jsonb,
  7,
  '{"make": "Ford", "model": "F-250", "year": 2021, "plate": "PLB-001", "color": "blue"}'::jsonb,
  7500,
  true,
  '2018-06-01',
  '{"avg_jobs_per_day": 6.1, "avg_rating": 4.9, "on_time_percentage": 95}'::jsonb
);

-- Emma Thompson (Plumber)
INSERT INTO technicians (
  id,
  person_id,
  business_id,
  employee_id,
  skills,
  certifications,
  home_location,
  current_location,
  working_hours,
  max_appointments_per_day,
  vehicle_info,
  hourly_rate_cents,
  active,
  hire_date,
  performance_metrics
) VALUES (
  gen_random_uuid(),
  'b0000000-0000-0000-0000-000000000003',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'TECH-002',
  '["drain_cleaning", "leak_repair", "fixture_installation"]'::jsonb,
  '[
    {"name": "Journeyman Plumber License", "issuer": "Texas State Board", "number": "JP-11223", "issued": "2021-03-10", "expires": "2027-03-10"}
  ]'::jsonb,
  ST_SetSRID(ST_MakePoint(-97.8147, 30.3963), 4326)::geography, -- North Austin
  ST_SetSRID(ST_MakePoint(-97.8147, 30.3963), 4326)::geography,
  '{
    "monday": {"start": "07:00", "end": "18:00"},
    "tuesday": {"start": "07:00", "end": "18:00"},
    "wednesday": {"start": "07:00", "end": "18:00"},
    "thursday": {"start": "07:00", "end": "18:00"},
    "friday": {"start": "07:00", "end": "18:00"},
    "saturday": {"start": "08:00", "end": "14:00"}
  }'::jsonb,
  6,
  '{"make": "Chevrolet", "model": "Silverado 2500", "year": 2022, "plate": "PLB-002", "color": "white"}'::jsonb,
  5500,
  true,
  '2021-04-15',
  '{"avg_jobs_per_day": 5.3, "avg_rating": 4.8, "on_time_percentage": 93}'::jsonb
);

-- =====================================================
-- 7. CUSTOMERS (Extended data with locations)
-- =====================================================

-- Acme HVAC Customers (San Diego area)
INSERT INTO customers (
  id,
  person_id,
  business_id,
  address_line1,
  city,
  state,
  postal_code,
  country,
  location,
  location_verified,
  preferred_contact_method,
  customer_since,
  total_appointments,
  lifetime_value_cents,
  tags,
  metadata
) VALUES
-- Downtown San Diego
(
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '500 Broadway',
  'San Diego',
  'CA',
  '92101',
  'US',
  ST_SetSRID(ST_MakePoint(-117.1611, 32.7157), 4326)::geography,
  true,
  'call',
  '2024-01-15',
  3,
  45000,
  '["Commercial", "Priority"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- La Jolla
(
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000002',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '7863 Girard Ave',
  'La Jolla',
  'CA',
  '92037',
  'US',
  ST_SetSRID(ST_MakePoint(-117.2340, 32.8328), 4326)::geography,
  true,
  'email',
  '2024-03-20',
  2,
  28000,
  '["VIP", "Residential"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- Chula Vista
(
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000003',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '345 Third Avenue',
  'Chula Vista',
  'CA',
  '91910',
  'US',
  ST_SetSRID(ST_MakePoint(-117.0382, 32.6953), 4326)::geography,
  true,
  'sms',
  '2024-02-10',
  5,
  72000,
  '["Residential", "Recurring"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- Point Loma
(
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000004',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '2880 Shelter Island Drive',
  'San Diego',
  'CA',
  '92106',
  'US',
  ST_SetSRID(ST_MakePoint(-117.2241, 32.7338), 4326)::geography,
  true,
  'call',
  '2024-04-05',
  1,
  15000,
  '["Residential"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- Mission Valley
(
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000005',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '1640 Camino Del Rio North',
  'San Diego',
  'CA',
  '92108',
  'US',
  ST_SetSRID(ST_MakePoint(-117.1645, 32.7678), 4326)::geography,
  true,
  'email',
  '2024-05-12',
  4,
  58000,
  '["Commercial", "Recurring"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- Pacific Beach
(
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000006',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '1775 Garnet Avenue',
  'San Diego',
  'CA',
  '92109',
  'US',
  ST_SetSRID(ST_MakePoint(-117.2334, 32.7964), 4326)::geography,
  true,
  'sms',
  '2024-01-28',
  2,
  32000,
  '["Residential"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- Hillcrest
(
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000007',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '1040 University Avenue',
  'San Diego',
  'CA',
  '92103',
  'US',
  ST_SetSRID(ST_MakePoint(-117.1617, 32.7489), 4326)::geography,
  true,
  'call',
  '2024-06-18',
  3,
  41000,
  '["Residential", "Priority"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- Coronado
(
  gen_random_uuid(),
  'a1000000-0000-0000-0000-000000000008',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '1000 Orange Avenue',
  'Coronado',
  'CA',
  '92118',
  'US',
  ST_SetSRID(ST_MakePoint(-117.1831, 32.6859), 4326)::geography,
  true,
  'email',
  '2024-03-08',
  1,
  19000,
  '["Residential", "VIP"]'::jsonb,
  '{"is_test_data": true}'::jsonb
);

-- Quick Fix Plumbing Customers (Austin area)
INSERT INTO customers (
  id,
  person_id,
  business_id,
  address_line1,
  city,
  state,
  postal_code,
  country,
  location,
  location_verified,
  preferred_contact_method,
  customer_since,
  total_appointments,
  lifetime_value_cents,
  tags,
  metadata
) VALUES
-- Downtown Austin
(
  gen_random_uuid(),
  'b1000000-0000-0000-0000-000000000001',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '300 Congress Avenue',
  'Austin',
  'TX',
  '78701',
  'US',
  ST_SetSRID(ST_MakePoint(-97.7431, 30.2672), 4326)::geography,
  true,
  'sms',
  '2025-10-15',
  1,
  12900,
  '["Residential"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- North Austin
(
  gen_random_uuid(),
  'b1000000-0000-0000-0000-000000000002',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11601 Domain Drive',
  'Austin',
  'TX',
  '78758',
  'US',
  ST_SetSRID(ST_MakePoint(-97.8147, 30.3963), 4326)::geography,
  true,
  'call',
  '2025-10-12',
  2,
  28800,
  '["Commercial", "Priority"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- East Austin
(
  gen_random_uuid(),
  'b1000000-0000-0000-0000-000000000003',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '1100 E 11th Street',
  'Austin',
  'TX',
  '78702',
  'US',
  ST_SetSRID(ST_MakePoint(-97.6789, 30.2240), 4326)::geography,
  true,
  'email',
  '2025-10-14',
  1,
  15900,
  '["Residential"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- South Austin
(
  gen_random_uuid(),
  'b1000000-0000-0000-0000-000000000004',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '1500 S Lamar Boulevard',
  'Austin',
  'TX',
  '78704',
  'US',
  ST_SetSRID(ST_MakePoint(-97.7697, 30.2515), 4326)::geography,
  true,
  'sms',
  '2025-10-16',
  1,
  25000,
  '["Emergency"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- West Austin
(
  gen_random_uuid(),
  'b1000000-0000-0000-0000-000000000005',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '2901 Bee Cave Road',
  'Austin',
  'TX',
  '78746',
  'US',
  ST_SetSRID(ST_MakePoint(-97.8209, 30.2711), 4326)::geography,
  true,
  'call',
  '2025-10-13',
  1,
  18000,
  '["Residential", "VIP"]'::jsonb,
  '{"is_test_data": true}'::jsonb
),
-- Central Austin
(
  gen_random_uuid(),
  'b1000000-0000-0000-0000-000000000006',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '4001 N Lamar Boulevard',
  'Austin',
  'TX',
  '78756',
  'US',
  ST_SetSRID(ST_MakePoint(-97.7398, 30.3072), 4326)::geography,
  true,
  'email',
  '2025-10-17',
  0,
  0,
  '["Residential"]'::jsonb,
  '{"is_test_data": true}'::jsonb
);

-- =====================================================
-- 8. SERVICES
-- =====================================================

-- Acme HVAC Services
INSERT INTO services (
  id,
  business_id,
  name,
  slug,
  description,
  category,
  default_duration_minutes,
  duration_buffer_minutes,
  required_skills,
  base_price_cents,
  taxable,
  requires_parts,
  customer_media_required,
  active,
  metadata
) VALUES
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'AC Repair',
  'ac-repair',
  'Air conditioning system diagnosis and repair',
  'Repair',
  60,
  15,
  '["ac_repair"]'::jsonb,
  8900, -- $89.00
  true,
  true,
  false,
  true,
  '{"is_test_data": true}'::jsonb
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'AC Installation',
  'ac-installation',
  'Complete air conditioning system installation',
  'Installation',
  240,
  30,
  '["installation", "ac_repair"]'::jsonb,
  450000, -- $4,500.00
  true,
  true,
  false,
  true,
  '{"is_test_data": true}'::jsonb
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Heating Repair',
  'heating-repair',
  'Furnace and heating system repair',
  'Repair',
  60,
  15,
  '["heating_repair"]'::jsonb,
  7900, -- $79.00
  true,
  true,
  false,
  true,
  '{"is_test_data": true}'::jsonb
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Maintenance Check',
  'maintenance-check',
  'Seasonal HVAC system maintenance and tune-up',
  'Maintenance',
  30,
  10,
  '["maintenance"]'::jsonb,
  4900, -- $49.00
  true,
  false,
  false,
  true,
  '{"is_test_data": true}'::jsonb
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Emergency Service',
  'emergency-service',
  '24/7 emergency HVAC service',
  'Emergency',
  90,
  15,
  '["ac_repair", "heating_repair"]'::jsonb,
  19900, -- $199.00
  true,
  true,
  false,
  true,
  '{"is_test_data": true}'::jsonb
);

-- Quick Fix Plumbing Services
INSERT INTO services (
  id,
  business_id,
  name,
  slug,
  description,
  category,
  default_duration_minutes,
  duration_buffer_minutes,
  required_skills,
  base_price_cents,
  taxable,
  requires_parts,
  customer_media_required,
  active,
  metadata
) VALUES
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Drain Cleaning',
  'drain-cleaning',
  'Professional drain cleaning and unclogging',
  'Repair',
  45,
  15,
  '["drain_cleaning"]'::jsonb,
  12900, -- $129.00
  true,
  false,
  false,
  true,
  '{"is_test_data": true}'::jsonb
),
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Leak Repair',
  'leak-repair',
  'Fix leaking pipes, faucets, and fixtures',
  'Repair',
  60,
  15,
  '["leak_repair"]'::jsonb,
  15900, -- $159.00
  true,
  true,
  true,
  true,
  '{"is_test_data": true}'::jsonb
),
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Water Heater Installation',
  'water-heater-installation',
  'Complete water heater replacement and installation',
  'Installation',
  180,
  30,
  '["water_heater", "pipe_installation"]'::jsonb,
  180000, -- $1,800.00
  true,
  true,
  false,
  true,
  '{"is_test_data": true}'::jsonb
),
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Emergency Service',
  'emergency-service',
  '24/7 emergency plumbing service',
  'Emergency',
  60,
  15,
  '["emergency_services"]'::jsonb,
  25000, -- $250.00
  true,
  true,
  false,
  true,
  '{"is_test_data": true}'::jsonb
),
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Fixture Installation',
  'fixture-installation',
  'Install sinks, toilets, faucets, and other fixtures',
  'Installation',
  90,
  15,
  '["fixture_installation"]'::jsonb,
  22900, -- $229.00
  true,
  true,
  false,
  true,
  '{"is_test_data": true}'::jsonb
);

-- =====================================================
-- 9. TICKETS (Sample appointments in various statuses)
-- =====================================================

-- Helper: Get customer and service IDs for Acme HVAC
-- We'll use the customer_id and service_id from the inserted records

-- === ACME HVAC TICKETS ===

-- Completed Tickets (historical data - past 30-90 days)
INSERT INTO tickets (
  id,
  business_id,
  ticket_number,
  customer_id,
  service_id,
  assigned_technician_id,
  status,
  priority,
  scheduled_date,
  time_window_start,
  time_window_end,
  window_type,
  estimated_duration_minutes,
  actual_start_time,
  actual_end_time,
  customer_notes,
  technician_notes,
  work_summary,
  customer_rating,
  customer_review,
  payment_status,
  total_cost_cents,
  ai_scheduled,
  created_at,
  completed_at
) VALUES
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'TKT-20251001-001',
  (SELECT id FROM customers WHERE person_id = 'a1000000-0000-0000-0000-000000000001'),
  (SELECT id FROM services WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND slug = 'ac-repair'),
  (SELECT id FROM technicians WHERE person_id = 'a0000000-0000-0000-0000-000000000002'),
  'completed',
  'normal',
  CURRENT_DATE - INTERVAL '45 days',
  '09:00:00',
  '12:00:00',
  'time_window',
  60,
  (CURRENT_DATE - INTERVAL '45 days')::timestamp + INTERVAL '9 hours 15 minutes',
  (CURRENT_DATE - INTERVAL '45 days')::timestamp + INTERVAL '10 hours 30 minutes',
  'AC not cooling properly, making strange noise',
  'Replaced compressor capacitor, recharged refrigerant. System running normally.',
  'Diagnosed and repaired AC unit. Replaced faulty capacitor and topped off refrigerant. System tested and working properly.',
  5,
  'Mike was professional and fixed the issue quickly!',
  'captured',
  11500,
  false,
  CURRENT_DATE - INTERVAL '47 days',
  (CURRENT_DATE - INTERVAL '45 days')::timestamp + INTERVAL '10 hours 30 minutes'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'TKT-20251010-002',
  (SELECT id FROM customers WHERE person_id = 'a1000000-0000-0000-0000-000000000002'),
  (SELECT id FROM services WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND slug = 'maintenance-check'),
  (SELECT id FROM technicians WHERE person_id = 'a0000000-0000-0000-0000-000000000003'),
  'completed',
  'normal',
  CURRENT_DATE - INTERVAL '30 days',
  '13:00:00',
  '15:00:00',
  'time_window',
  30,
  (CURRENT_DATE - INTERVAL '30 days')::timestamp + INTERVAL '13 hours 10 minutes',
  (CURRENT_DATE - INTERVAL '30 days')::timestamp + INTERVAL '13 hours 50 minutes',
  'Annual maintenance service',
  'Performed seasonal maintenance, changed filter, cleaned coils',
  'Completed routine maintenance. System in good condition.',
  5,
  'Great service, very thorough!',
  'captured',
  4900,
  false,
  CURRENT_DATE - INTERVAL '35 days',
  (CURRENT_DATE - INTERVAL '30 days')::timestamp + INTERVAL '13 hours 50 minutes'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'TKT-20250915-003',
  (SELECT id FROM customers WHERE person_id = 'a1000000-0000-0000-0000-000000000003'),
  (SELECT id FROM services WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND slug = 'heating-repair'),
  (SELECT id FROM technicians WHERE person_id = 'a0000000-0000-0000-0000-000000000002'),
  'completed',
  'urgent',
  CURRENT_DATE - INTERVAL '60 days',
  '08:00:00',
  '10:00:00',
  'time_window',
  60,
  (CURRENT_DATE - INTERVAL '60 days')::timestamp + INTERVAL '8 hours 5 minutes',
  (CURRENT_DATE - INTERVAL '60 days')::timestamp + INTERVAL '9 hours 20 minutes',
  'Furnace not turning on',
  'Replaced igniter, tested system multiple times',
  'Replaced faulty furnace igniter. System heating properly now.',
  4,
  'Fixed the problem but took longer than expected',
  'captured',
  8900,
  false,
  CURRENT_DATE - INTERVAL '62 days',
  (CURRENT_DATE - INTERVAL '60 days')::timestamp + INTERVAL '9 hours 20 minutes'
);

-- Scheduled Tickets (future dates)
INSERT INTO tickets (
  id,
  business_id,
  ticket_number,
  customer_id,
  service_id,
  assigned_technician_id,
  status,
  priority,
  scheduled_date,
  time_window_start,
  time_window_end,
  window_type,
  estimated_duration_minutes,
  customer_notes,
  payment_status,
  total_cost_cents,
  ai_scheduled,
  created_at
) VALUES
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'TKT-' || TO_CHAR(CURRENT_DATE + 1, 'YYYYMMDD') || '-004',
  (SELECT id FROM customers WHERE person_id = 'a1000000-0000-0000-0000-000000000004'),
  (SELECT id FROM services WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND slug = 'ac-repair'),
  (SELECT id FROM technicians WHERE person_id = 'a0000000-0000-0000-0000-000000000002'),
  'scheduled',
  'normal',
  CURRENT_DATE + INTERVAL '1 day',
  '09:00:00',
  '12:00:00',
  'time_window',
  60,
  'AC making loud noise',
  'pending',
  8900,
  false,
  CURRENT_DATE - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'TKT-' || TO_CHAR(CURRENT_DATE + 1, 'YYYYMMDD') || '-005',
  (SELECT id FROM customers WHERE person_id = 'a1000000-0000-0000-0000-000000000005'),
  (SELECT id FROM services WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND slug = 'maintenance-check'),
  (SELECT id FROM technicians WHERE person_id = 'a0000000-0000-0000-0000-000000000003'),
  'scheduled',
  'normal',
  CURRENT_DATE + INTERVAL '1 day',
  '13:00:00',
  '15:00:00',
  'time_window',
  30,
  'Routine maintenance',
  'pending',
  4900,
  false,
  CURRENT_DATE - INTERVAL '3 days'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'TKT-' || TO_CHAR(CURRENT_DATE + 2, 'YYYYMMDD') || '-006',
  (SELECT id FROM customers WHERE person_id = 'a1000000-0000-0000-0000-000000000006'),
  (SELECT id FROM services WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND slug = 'heating-repair'),
  (SELECT id FROM technicians WHERE person_id = 'a0000000-0000-0000-0000-000000000004'),
  'scheduled',
  'normal',
  CURRENT_DATE + INTERVAL '2 days',
  '10:00:00',
  '13:00:00',
  'time_window',
  60,
  'Heater not working efficiently',
  'pending',
  7900,
  false,
  CURRENT_DATE - INTERVAL '1 day'
);

-- Pending Tickets (awaiting scheduling)
INSERT INTO tickets (
  id,
  business_id,
  ticket_number,
  customer_id,
  service_id,
  status,
  priority,
  customer_notes,
  payment_status,
  total_cost_cents,
  ai_scheduled,
  created_at
) VALUES
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-007',
  (SELECT id FROM customers WHERE person_id = 'a1000000-0000-0000-0000-000000000007'),
  (SELECT id FROM services WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND slug = 'ac-repair'),
  'pending',
  'normal',
  'Need AC checked, not cooling well',
  'not_required',
  8900,
  false,
  CURRENT_DATE - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-008',
  (SELECT id FROM customers WHERE person_id = 'a1000000-0000-0000-0000-000000000008'),
  (SELECT id FROM services WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND slug = 'emergency-service'),
  'pending',
  'emergency',
  'AC completely stopped working, very hot!',
  'not_required',
  19900,
  true,
  CURRENT_DATE - INTERVAL '30 minutes'
);

-- === QUICK FIX PLUMBING TICKETS ===

-- Completed Tickets
INSERT INTO tickets (
  id,
  business_id,
  ticket_number,
  customer_id,
  service_id,
  assigned_technician_id,
  status,
  priority,
  scheduled_date,
  time_window_start,
  time_window_end,
  window_type,
  estimated_duration_minutes,
  actual_start_time,
  actual_end_time,
  customer_notes,
  work_summary,
  customer_rating,
  payment_status,
  total_cost_cents,
  ai_scheduled,
  created_at,
  completed_at
) VALUES
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'TKT-20251015-001',
  (SELECT id FROM customers WHERE person_id = 'b1000000-0000-0000-0000-000000000001'),
  (SELECT id FROM services WHERE business_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND slug = 'drain-cleaning'),
  (SELECT id FROM technicians WHERE person_id = 'b0000000-0000-0000-0000-000000000002'),
  'completed',
  'normal',
  CURRENT_DATE - INTERVAL '2 days',
  '10:00:00',
  '12:00:00',
  'time_window',
  45,
  (CURRENT_DATE - INTERVAL '2 days')::timestamp + INTERVAL '10 hours 15 minutes',
  (CURRENT_DATE - INTERVAL '2 days')::timestamp + INTERVAL '11 hours',
  'Kitchen sink clogged',
  'Cleared clog from kitchen drain line. Tested drainage.',
  5,
  'captured',
  12900,
  false,
  CURRENT_DATE - INTERVAL '4 days',
  (CURRENT_DATE - INTERVAL '2 days')::timestamp + INTERVAL '11 hours'
);

-- Scheduled Tickets
INSERT INTO tickets (
  id,
  business_id,
  ticket_number,
  customer_id,
  service_id,
  assigned_technician_id,
  status,
  priority,
  scheduled_date,
  time_window_start,
  time_window_end,
  window_type,
  estimated_duration_minutes,
  customer_notes,
  payment_status,
  total_cost_cents,
  ai_scheduled,
  created_at
) VALUES
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'TKT-' || TO_CHAR(CURRENT_DATE + 1, 'YYYYMMDD') || '-002',
  (SELECT id FROM customers WHERE person_id = 'b1000000-0000-0000-0000-000000000002'),
  (SELECT id FROM services WHERE business_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND slug = 'leak-repair'),
  (SELECT id FROM technicians WHERE person_id = 'b0000000-0000-0000-0000-000000000002'),
  'scheduled',
  'urgent',
  CURRENT_DATE + INTERVAL '1 day',
  '08:00:00',
  '10:00:00',
  'time_window',
  60,
  'Leaking pipe under bathroom sink',
  'pending',
  15900,
  false,
  CURRENT_DATE - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'TKT-' || TO_CHAR(CURRENT_DATE + 1, 'YYYYMMDD') || '-003',
  (SELECT id FROM customers WHERE person_id = 'b1000000-0000-0000-0000-000000000003'),
  (SELECT id FROM services WHERE business_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND slug = 'drain-cleaning'),
  (SELECT id FROM technicians WHERE person_id = 'b0000000-0000-0000-0000-000000000003'),
  'scheduled',
  'normal',
  CURRENT_DATE + INTERVAL '1 day',
  '13:00:00',
  '15:00:00',
  'time_window',
  45,
  'Slow draining bathtub',
  'pending',
  12900,
  false,
  CURRENT_DATE - INTERVAL '2 hours'
);

-- Pending Tickets
INSERT INTO tickets (
  id,
  business_id,
  ticket_number,
  customer_id,
  service_id,
  status,
  priority,
  customer_notes,
  payment_status,
  total_cost_cents,
  ai_scheduled,
  created_at
) VALUES
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-004',
  (SELECT id FROM customers WHERE person_id = 'b1000000-0000-0000-0000-000000000004'),
  (SELECT id FROM services WHERE business_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND slug = 'emergency-service'),
  'pending',
  'emergency',
  'Burst pipe! Water everywhere!',
  'not_required',
  25000,
  true,
  CURRENT_DATE - INTERVAL '15 minutes'
);

-- =====================================================
-- 10. ROUTES (Sample daily routes for tomorrow)
-- =====================================================

-- Route for Mike Rodriguez (Acme HVAC) - Tomorrow
INSERT INTO routes (
  id,
  business_id,
  technician_id,
  date,
  status,
  ticket_sequence,
  start_location,
  total_distance_miles,
  estimated_duration_minutes,
  estimated_start_time,
  estimated_end_time,
  optimization_version,
  optimization_algorithm,
  optimization_score,
  manual_override
) VALUES (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  (SELECT id FROM technicians WHERE person_id = 'a0000000-0000-0000-0000-000000000002'),
  CURRENT_DATE + INTERVAL '1 day',
  'planned',
  jsonb_build_array(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-' || TO_CHAR(CURRENT_DATE + 1, 'YYYYMMDD') || '-004')
  ),
  ST_SetSRID(ST_MakePoint(-117.0839, 32.8153), 4326)::geography, -- Mike's home
  12.5,
  90,
  '09:00:00',
  '12:00:00',
  1,
  'manual-v1',
  12.5,
  false
);

-- Route for David Chen (Acme HVAC) - Tomorrow
INSERT INTO routes (
  id,
  business_id,
  technician_id,
  date,
  status,
  ticket_sequence,
  start_location,
  total_distance_miles,
  estimated_duration_minutes,
  estimated_start_time,
  estimated_end_time,
  optimization_version,
  optimization_algorithm,
  optimization_score,
  manual_override
) VALUES (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  (SELECT id FROM technicians WHERE person_id = 'a0000000-0000-0000-0000-000000000003'),
  CURRENT_DATE + INTERVAL '1 day',
  'planned',
  jsonb_build_array(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-' || TO_CHAR(CURRENT_DATE + 1, 'YYYYMMDD') || '-005')
  ),
  ST_SetSRID(ST_MakePoint(-117.1611, 32.7157), 4326)::geography, -- David's home
  8.3,
  60,
  '13:00:00',
  '15:00:00',
  1,
  'manual-v1',
  8.3,
  false
);

-- Route for Carlos Garcia (Quick Fix Plumbing) - Tomorrow
INSERT INTO routes (
  id,
  business_id,
  technician_id,
  date,
  status,
  ticket_sequence,
  start_location,
  total_distance_miles,
  estimated_duration_minutes,
  estimated_start_time,
  estimated_end_time,
  optimization_version,
  optimization_algorithm,
  optimization_score,
  manual_override
) VALUES (
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  (SELECT id FROM technicians WHERE person_id = 'b0000000-0000-0000-0000-000000000002'),
  CURRENT_DATE + INTERVAL '1 day',
  'planned',
  jsonb_build_array(
    (SELECT id FROM tickets WHERE ticket_number = 'TKT-' || TO_CHAR(CURRENT_DATE + 1, 'YYYYMMDD') || '-002')
  ),
  ST_SetSRID(ST_MakePoint(-97.7431, 30.2672), 4326)::geography, -- Carlos's home
  15.2,
  90,
  '08:00:00',
  '10:30:00',
  1,
  'manual-v1',
  15.2,
  false
);

-- =====================================================
-- 11. PAYMENT SETTINGS & AI CONFIGURATION
-- =====================================================

-- Payment Settings for Acme HVAC (Professional tier)
INSERT INTO payment_settings (
  id,
  business_id,
  payment_processing_enabled,
  stripe_account_id,
  stripe_onboarding_complete,
  stripe_charges_enabled,
  stripe_payouts_enabled,
  stripe_connected_at,
  stripe_details_submitted,
  default_payment_timing,
  accepted_payment_methods,
  refund_policy_days,
  refund_policy_text,
  test_mode
) VALUES (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  true,
  'acct_test_acme_hvac_stripe_123',
  true,
  true,
  true,
  NOW() - INTERVAL '6 months',
  true,
  'post_service',
  '["card", "ach_debit", "apple_pay", "google_pay"]'::jsonb,
  7,
  'Full refund within 7 days if not satisfied with service. After 7 days, refunds subject to review.',
  true
);

-- Pricing Rules for Acme HVAC
INSERT INTO pricing_rules (
  id,
  business_id,
  name,
  description,
  rule_type,
  service_id,
  conditions,
  adjustment_type,
  adjustment_value,
  active
) VALUES
-- Weekend surcharge
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Weekend Surcharge',
  'Additional charge for weekend services',
  'time_based',
  NULL, -- Applies to all services
  '{"days_of_week": ["saturday", "sunday"]}'::jsonb,
  'percentage',
  15.00,
  true
),
-- After-hours fee
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'After Hours Fee',
  'Additional charge for after-hours service (after 5 PM or before 8 AM)',
  'time_based',
  NULL,
  '{"time_ranges": [{"start": "17:00", "end": "23:59"}, {"start": "00:00", "end": "08:00"}]}'::jsonb,
  'flat_fee',
  5000, -- $50.00
  true
);

-- AI Agent Configuration for Acme HVAC (Professional tier)
INSERT INTO ai_agents (
  id,
  business_id,
  name,
  phone_number,
  voice_config,
  system_prompt,
  available_services,
  booking_rules,
  escalation_rules,
  active
) VALUES (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Acme HVAC Booking Assistant',
  '+16195559999',
  '{
    "provider": "anthropic",
    "model": "claude-sonnet-4",
    "voice": "professional_friendly",
    "language": "en-US",
    "speed": 1.0
  }'::jsonb,
  'You are a helpful booking assistant for Acme HVAC, a professional HVAC service company in San Diego. Your role is to help customers schedule appointments for AC repair, heating repair, installation, and maintenance services. Be friendly, professional, and efficient. Collect customer name, phone number, address, and service needed. Offer available time slots based on technician availability. Confirm all details before booking.',
  (SELECT jsonb_agg(id) FROM services WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND active = true),
  '{
    "min_notice_hours": 2,
    "max_future_days": 30,
    "auto_assign_technician": true,
    "require_customer_confirmation": true,
    "send_confirmation_sms": true
  }'::jsonb,
  '{
    "keywords": ["speak to human", "manager", "supervisor", "complicated"],
    "max_conversation_minutes": 10,
    "transfer_number": "+16195551001"
  }'::jsonb,
  true
);

-- Sample AI Conversations
INSERT INTO ai_conversations (
  id,
  business_id,
  agent_id,
  customer_phone,
  customer_name,
  start_time,
  end_time,
  duration_seconds,
  outcome,
  ticket_id,
  transcript,
  sentiment_score,
  metadata
) VALUES (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  (SELECT id FROM ai_agents WHERE business_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  '+16195552099',
  'John Test Customer',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '4 minutes 32 seconds',
  272,
  'appointment_booked',
  (SELECT id FROM tickets WHERE ticket_number = 'TKT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-007'),
  '[
    {"speaker": "ai", "text": "Thank you for calling Acme HVAC! How can I help you today?", "timestamp": "2025-10-14T14:30:00Z"},
    {"speaker": "customer", "text": "Hi, my AC is not cooling properly", "timestamp": "2025-10-14T14:30:05Z"},
    {"speaker": "ai", "text": "I understand. I can help you schedule an AC repair appointment. May I have your name please?", "timestamp": "2025-10-14T14:30:08Z"},
    {"speaker": "customer", "text": "John Test Customer", "timestamp": "2025-10-14T14:30:12Z"},
    {"speaker": "ai", "text": "Thank you John. And what is your phone number?", "timestamp": "2025-10-14T14:30:14Z"},
    {"speaker": "customer", "text": "619-555-2099", "timestamp": "2025-10-14T14:30:18Z"},
    {"speaker": "ai", "text": "Great. What is your service address?", "timestamp": "2025-10-14T14:30:20Z"},
    {"speaker": "customer", "text": "1040 University Avenue, San Diego", "timestamp": "2025-10-14T14:30:25Z"},
    {"speaker": "ai", "text": "Perfect. I have availability tomorrow between 9 AM and noon, or would you prefer a different time?", "timestamp": "2025-10-14T14:30:30Z"},
    {"speaker": "customer", "text": "Tomorrow morning works", "timestamp": "2025-10-14T14:30:35Z"},
    {"speaker": "ai", "text": "Excellent! I have scheduled your AC repair appointment for tomorrow between 9 AM and 12 PM. You will receive a confirmation text shortly. Is there anything else I can help you with?", "timestamp": "2025-10-14T14:30:40Z"},
    {"speaker": "customer", "text": "No, that is all. Thank you!", "timestamp": "2025-10-14T14:30:45Z"},
    {"speaker": "ai", "text": "You are welcome! We look forward to serving you. Have a great day!", "timestamp": "2025-10-14T14:30:48Z"}
  ]'::jsonb,
  0.85,
  '{"is_test_data": true, "ai_model": "claude-sonnet-4", "cost_cents": 68}'::jsonb
);

-- Sample Payments (for completed tickets)
INSERT INTO payments (
  id,
  business_id,
  ticket_id,
  customer_id,
  stripe_payment_intent_id,
  amount_cents,
  currency,
  status,
  payment_method,
  captured_at,
  metadata
) VALUES
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  (SELECT id FROM tickets WHERE ticket_number = 'TKT-20251001-001'),
  (SELECT id FROM customers WHERE person_id = 'a1000000-0000-0000-0000-000000000001'),
  'pi_test_acme_001',
  11500,
  'usd',
  'captured',
  '{"type": "card", "brand": "visa", "last4": "4242"}'::jsonb,
  (CURRENT_DATE - INTERVAL '45 days')::timestamp + INTERVAL '11 hours',
  '{"is_test_data": true}'::jsonb
),
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  (SELECT id FROM tickets WHERE ticket_number = 'TKT-20251010-002'),
  (SELECT id FROM customers WHERE person_id = 'a1000000-0000-0000-0000-000000000002'),
  'pi_test_acme_002',
  4900,
  'usd',
  'captured',
  '{"type": "card", "brand": "mastercard", "last4": "5555"}'::jsonb,
  (CURRENT_DATE - INTERVAL '30 days')::timestamp + INTERVAL '14 hours',
  '{"is_test_data": true}'::jsonb
);

-- Update route IDs in tickets
UPDATE tickets
SET route_id = (
  SELECT r.id FROM routes r
  WHERE r.technician_id = tickets.assigned_technician_id
  AND r.date = tickets.scheduled_date
  AND r.ticket_sequence::jsonb @> to_jsonb(tickets.id)
)
WHERE tickets.status = 'scheduled'
AND tickets.assigned_technician_id IS NOT NULL;

COMMIT;

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================
-- Summary:
-- - 3 subscription tiers (Starter, Professional, Enterprise)
-- - 10+ platform settings (grace period, trial, AI, feature flags)
-- - 3 businesses (Acme HVAC, Quick Fix Plumbing, Elite Electric)
-- - 3 subscriptions (1 Professional active, 1 Starter trial, 1 Starter active)
-- - 6 admins/technicians
-- - 14 customers with geographic coordinates
-- - 6 technician profiles with skills and certifications
-- - 10 services (5 HVAC, 5 Plumbing)
-- - 15+ tickets in various statuses (pending, scheduled, completed)
-- - 3 routes for tomorrow
-- - Payment settings and pricing rules for Professional tier
-- - AI agent configuration and sample conversation
-- - Sample payment records
-- =====================================================
-- All records are marked with {"is_test_data": true} in metadata
-- for easy identification and cleanup
-- =====================================================
