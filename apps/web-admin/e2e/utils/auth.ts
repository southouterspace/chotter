import { Page, expect } from '@playwright/test';

/**
 * Authentication helper utilities for E2E tests
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Default test user credentials
 * Note: These should exist in your test database
 */
export const TEST_USER: LoginCredentials = {
  email: 'admin@test.com',
  password: 'testpassword123',
};

/**
 * Helper function to log in a user
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 */
export async function login(
  page: Page,
  email: string = TEST_USER.email,
  password: string = TEST_USER.password
): Promise<void> {
  // Navigate to login page
  await page.goto('/login');

  // Wait for login form to be visible
  await page.waitForSelector('input[id="email"]', { state: 'visible' });

  // Fill in login form
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for successful login (redirect to dashboard)
  await page.waitForURL('/', { timeout: 10000 });

  // Verify we're on the dashboard by checking for common dashboard elements
  await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 5000 });
}

/**
 * Helper function to log out the current user
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  // Look for user menu/avatar button
  const userMenuButton = page.locator('[role="button"]').filter({ hasText: /account|user|profile/i }).first();

  // If user menu exists, click it
  if (await userMenuButton.isVisible().catch(() => false)) {
    await userMenuButton.click();

    // Wait for dropdown menu
    await page.waitForSelector('text=Sign out', { state: 'visible', timeout: 3000 }).catch(() => {});

    // Click sign out
    const signOutButton = page.locator('text=/sign out|logout/i').first();
    if (await signOutButton.isVisible().catch(() => false)) {
      await signOutButton.click();
    }
  } else {
    // Alternative: Look for direct logout button in navigation
    const logoutButton = page.locator('button:has-text("Sign out"), button:has-text("Logout")').first();
    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
    }
  }

  // Wait for redirect to login page
  await page.waitForURL('/login', { timeout: 5000 });
}

/**
 * Check if user is currently authenticated
 * @param page - Playwright page object
 * @returns true if user is logged in, false otherwise
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Navigate to a protected route
  await page.goto('/');

  // Wait for either redirect to login or dashboard to load
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

  // Check current URL
  const currentUrl = page.url();

  // If redirected to login, user is not authenticated
  if (currentUrl.includes('/login')) {
    return false;
  }

  // If still on dashboard or other protected route, user is authenticated
  return true;
}

/**
 * Setup authentication state for all tests in a describe block
 * Use this in beforeEach hooks
 * @param page - Playwright page object
 */
export async function setupAuthenticatedSession(page: Page): Promise<void> {
  await login(page);
}

/**
 * Clear authentication state for all tests in a describe block
 * Use this in afterEach hooks
 * @param page - Playwright page object
 */
export async function clearAuthenticatedSession(page: Page): Promise<void> {
  // Clear all cookies and local storage
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Wait for authentication to complete
 * Useful when testing authentication flows
 * @param page - Playwright page object
 */
export async function waitForAuthComplete(page: Page): Promise<void> {
  // Wait for either successful login (redirect to /) or error message
  await Promise.race([
    page.waitForURL('/', { timeout: 10000 }),
    page.waitForSelector('.text-destructive', { timeout: 10000 }),
  ]);
}
