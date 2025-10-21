#!/bin/bash

# Setup script for E2E tests

echo "Setting up test environment..."

# 1. Start Supabase local
cd ../../supabase
supabase start

# 2. Seed test data
psql postgresql://postgres:postgres@localhost:54322/postgres << EOF
-- Insert test technician
INSERT INTO persons (id, full_name, email)
VALUES ('test-tech-person-id', 'Test Technician', 'test-tech@chotter.com')
ON CONFLICT DO NOTHING;

-- Create test user in auth.users if not exists
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'test-tech-user-id',
  'test-tech@chotter.com',
  crypt('Test123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Link person to user
UPDATE persons
SET auth_user_id = 'test-tech-user-id'
WHERE email = 'test-tech@chotter.com';

-- Create test appointments
INSERT INTO appointments (
  id,
  person_id,
  scheduled_start,
  scheduled_end,
  status,
  service_type,
  customer_name,
  customer_phone,
  service_address,
  created_at,
  updated_at
)
VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  'test-tech-person-id',
  NOW() + INTERVAL '1 hour',
  NOW() + INTERVAL '2 hours',
  'scheduled',
  'Oil Change',
  'John Doe',
  '415-555-0100',
  '123 Main St, San Francisco, CA 94102',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'test-tech-person-id',
  NOW() + INTERVAL '3 hours',
  NOW() + INTERVAL '4 hours',
  'scheduled',
  'Tire Rotation',
  'Jane Smith',
  '510-555-0200',
  '456 Oak Ave, Oakland, CA 94601',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
EOF

echo "Test data seeded successfully!"

# 3. Start mobile app
cd ../apps/mobile-tech
bun start &

echo "Test environment ready!"
echo "Run tests with: bun run test:e2e"
