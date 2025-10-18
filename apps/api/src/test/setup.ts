import { beforeAll, afterAll, beforeEach } from 'vitest';

/**
 * Global test setup
 * Runs before all tests
 */
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');

  // Ensure we're in test mode
  process.env.NODE_ENV = 'test';

  // Set test environment variables if not already set
  if (!process.env.SUPABASE_URL) {
    console.warn('⚠️  SUPABASE_URL not set in test environment');
  }
  if (!process.env.SUPABASE_ANON_KEY) {
    console.warn('⚠️  SUPABASE_ANON_KEY not set in test environment');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set in test environment');
  }
});

/**
 * Global test cleanup
 * Runs after all tests
 */
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  // Add any cleanup logic here (close connections, etc.)
});

/**
 * Reset between tests
 * Runs before each test
 */
beforeEach(async () => {
  // Reset any test state between tests if needed
  // For now, we don't need to do anything here
});
