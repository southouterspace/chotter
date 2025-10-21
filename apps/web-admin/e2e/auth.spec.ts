import { test, expect } from '@playwright/test';
import { login, logout, isAuthenticated, clearAuthenticatedSession, TEST_USER } from './utils/auth';
import { TEST_USERS } from './fixtures/test-data';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state before each test
    await clearAuthenticatedSession(page);
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Verify login page elements are present
    await expect(page.locator('text=Admin Login')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without filling fields
    await page.click('button[type="submit"]');

    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[id="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[id="email"]', TEST_USERS.invalid.email);
    await page.fill('input[id="password"]', TEST_USERS.invalid.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error message
    const errorMessage = page.locator('.text-destructive, [role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in valid credentials
    await page.fill('input[id="email"]', TEST_USER.email);
    await page.fill('input[id="password"]', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/', { timeout: 10000 });

    // Verify we're on the dashboard
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
  });

  test('should redirect to dashboard when already authenticated', async ({ page }) => {
    // First, log in
    await login(page);

    // Try to navigate to login page
    await page.goto('/login');

    // Should be redirected to dashboard
    await page.waitForURL('/', { timeout: 5000 });
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/customers');

    // Should be redirected to login page
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page.locator('text=Admin Login')).toBeVisible();
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Log in
    await login(page);

    // Reload the page
    await page.reload();

    // Should still be authenticated
    await expect(page.locator('text=Dashboard').first()).toBeVisible();

    // Navigate to another protected route
    await page.goto('/customers');
    await expect(page).toHaveURL('/customers');
  });

  test('should logout successfully', async ({ page }) => {
    // Log in first
    await login(page);

    // Verify we're on dashboard
    await expect(page.locator('text=Dashboard').first()).toBeVisible();

    // Attempt to logout
    await logout(page);

    // Should be redirected to login page
    await expect(page).toHaveURL('/login');

    // Verify we can't access protected routes
    await page.goto('/customers');
    await page.waitForURL('/login', { timeout: 5000 });
  });

  test('should display user info when logged in', async ({ page }) => {
    // Log in
    await login(page);

    // Look for user info in the UI (email or user icon)
    // This depends on your UI implementation
    const userInfo = page.locator(`text=${TEST_USER.email}`).or(
      page.locator('[role="button"]').filter({ hasText: /account|user|profile/i })
    );

    // At least one should be visible
    const count = await userInfo.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should protect all main routes', async ({ page }) => {
    const protectedRoutes = [
      '/',
      '/schedule',
      '/customers',
      '/technicians',
      '/services',
      '/routes',
      '/settings',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should redirect to login
      await page.waitForURL('/login', { timeout: 5000 });

      // Clear any navigation state
      await clearAuthenticatedSession(page);
    }
  });

  test('should allow access to all routes when authenticated', async ({ page }) => {
    // Log in first
    await login(page);

    const protectedRoutes = [
      { path: '/', text: 'Dashboard' },
      { path: '/schedule', text: 'Schedule' },
      { path: '/customers', text: 'Customers' },
      { path: '/technicians', text: 'Technicians' },
      { path: '/services', text: 'Services' },
      { path: '/routes', text: 'Routes' },
      { path: '/settings', text: 'Settings' },
    ];

    for (const route of protectedRoutes) {
      await page.goto(route.path);

      // Should stay on the route
      await expect(page).toHaveURL(route.path, { timeout: 5000 });

      // Should show expected content
      await expect(page.locator(`text=${route.text}`).first()).toBeVisible();
    }
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="email"]', TEST_USER.email);
    await page.fill('input[id="password"]', TEST_USER.password);

    // Click submit and immediately check for loading state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check if button shows loading text or is disabled
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBe(true);
  });
});
