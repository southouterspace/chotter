# Admin Dashboard E2E Tests

This directory contains end-to-end tests for the Chotter Admin Dashboard using Playwright.

## Overview

The E2E test suite covers critical user flows including:

- **Authentication** (`auth.spec.ts`) - Login, logout, and protected routes
- **Appointments** (`appointments.spec.ts`) - Creating and managing appointments
- **Customers** (`customers.spec.ts`) - Customer CRUD operations
- **Technicians** (`technicians.spec.ts`) - Technician management and skills

## Prerequisites

1. **Supabase Local Instance**: Tests require a local Supabase instance running
2. **Test User**: An admin user with credentials `admin@test.com` / `testpassword123`
3. **Node.js/Bun**: Bun runtime for package management
4. **Playwright Browsers**: Installed via `bunx playwright install`

## Running Tests

### Local Development

```bash
# From the web-admin directory
cd apps/web-admin

# Run all tests (headless)
bun run test:e2e

# Run tests with UI mode (interactive)
bun run test:e2e:ui

# Run tests in headed mode (see browser)
bun run test:e2e:headed

# Debug tests
bun run test:e2e:debug

# View test report
bun run test:e2e:report
```

### Run Specific Test Files

```bash
# Run only auth tests
bunx playwright test e2e/auth.spec.ts

# Run only customer tests
bunx playwright test e2e/customers.spec.ts

# Run tests in a specific browser
bunx playwright test --project=chromium
bunx playwright test --project=firefox
bunx playwright test --project=webkit
```

### Watch Mode

```bash
# Run tests in watch mode (re-run on file changes)
bunx playwright test --watch
```

## Test Setup

### Before Running Tests

1. **Start Supabase**:
   ```bash
   cd supabase
   supabase start
   ```

2. **Create Test User** (if not exists):
   ```bash
   supabase db execute "
     INSERT INTO auth.users (
       id, email, encrypted_password, email_confirmed_at,
       created_at, updated_at, raw_app_meta_data,
       raw_user_meta_data, role
     ) VALUES (
       gen_random_uuid(), 'admin@test.com',
       crypt('testpassword123', gen_salt('bf')),
       now(), now(), now(),
       '{\"provider\":\"email\",\"providers\":[\"email\"]}',
       '{}', 'authenticated'
     ) ON CONFLICT (email) DO NOTHING;
   "
   ```

3. **Start Dev Server**:
   ```bash
   cd apps/web-admin
   bun run dev
   ```

4. **Run Tests**:
   ```bash
   bun run test:e2e
   ```

## Test Structure

### Utilities (`utils/`)

- **`auth.ts`** - Authentication helpers (login, logout, session management)

### Fixtures (`fixtures/`)

- **`test-data.ts`** - Test data generators and common selectors

### Test Files

Each test file follows this structure:

```typescript
import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession, clearAuthenticatedSession } from './utils/auth';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Clear auth and login
    await clearAuthenticatedSession(page);
    await setupAuthenticatedSession(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
  });

  test.afterEach(async ({ page }) => {
    // Cleanup
    await clearAuthenticatedSession(page);
  });
});
```

## Configuration

Test configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Browsers**: Chromium, Firefox, WebKit
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: On failure
- **Videos**: On first retry

## CI/CD

Tests run automatically in GitHub Actions:

- **Trigger**: On push to `main` or `phase-2-admin-dashboard` branches
- **Also runs**: On pull requests to `main`
- **Services**: Postgres database via Docker
- **Workflow**: `.github/workflows/admin-e2e-tests.yml`

## Writing New Tests

### Best Practices

1. **Use Test Data Generators**:
   ```typescript
   import { generateCustomerData } from './fixtures/test-data';
   const customer = generateCustomerData({ firstName: 'John' });
   ```

2. **Use Common Selectors**:
   ```typescript
   import { SELECTORS } from './fixtures/test-data';
   await page.click(SELECTORS.newCustomerButton);
   ```

3. **Clean Up After Tests**:
   ```typescript
   test.afterEach(async ({ page }) => {
     // Delete test data created during test
     await clearAuthenticatedSession(page);
   });
   ```

4. **Handle Dynamic Content**:
   ```typescript
   // Wait for elements with proper timeouts
   await page.waitForSelector('.customer-row', { timeout: 5000 });

   // Use flexible selectors with fallbacks
   const button = page.locator('button:has-text("Submit")').or(
     page.locator('[type="submit"]')
   );
   ```

5. **Make Tests Resilient**:
   ```typescript
   // Check if element exists before interacting
   const modal = page.locator('[role="dialog"]');
   if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
     await modal.click();
   }
   ```

## Debugging

### Debug Failing Tests

```bash
# Run with debug flag
bun run test:e2e:debug

# Run specific test with trace
bunx playwright test e2e/auth.spec.ts --trace on

# Open trace viewer
bunx playwright show-trace trace.zip
```

### UI Mode

```bash
# Interactive test runner with time travel debugging
bun run test:e2e:ui
```

### Headed Mode

```bash
# See browser actions in real-time
bun run test:e2e:headed
```

## Troubleshooting

### Tests Timing Out

- Increase timeout in `playwright.config.ts` or individual tests:
  ```typescript
  test('slow test', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
  });
  ```

### Elements Not Found

- Check if element selectors match the actual DOM
- Use Playwright Inspector: `bunx playwright test --debug`
- Add explicit waits: `await page.waitForSelector('.element')`

### Authentication Issues

- Ensure test user exists in database
- Check Supabase is running: `supabase status`
- Verify environment variables in `.env`

### Database State

- Reset database between test runs:
  ```bash
  cd supabase
  supabase db reset
  ```

## Test Coverage Goals

According to the development plan (P2.11):

- ✅ All E2E tests pass
- ✅ Tests cover critical user flows
- ✅ Tests run in CI pipeline
- 🎯 Test coverage > 80% of user journeys

## Contributing

When adding new features to the admin dashboard:

1. Write E2E tests for the new feature
2. Follow existing test structure and patterns
3. Use test data generators for dynamic data
4. Ensure tests clean up after themselves
5. Run full test suite before committing: `bun run test:e2e`

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Debugging Guide](https://playwright.dev/docs/debug)
- [Chotter Development Plan](/ref/chotter-dev-plan-phases-2-9.md)
