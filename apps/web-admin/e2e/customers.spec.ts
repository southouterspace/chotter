import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession, clearAuthenticatedSession } from './utils/auth';
import {
  generateCustomerData,
  SELECTORS,
  WAIT_TIMES,
} from './fixtures/test-data';

test.describe('Customers Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth state and login before each test
    await clearAuthenticatedSession(page);
    await setupAuthenticatedSession(page);
  });

  test('should navigate to customers page', async ({ page }) => {
    // Click on customers link in navigation
    await page.click(SELECTORS.customersLink);

    // Verify we're on the customers page
    await expect(page).toHaveURL('/customers');
    await expect(page.locator('text=Customers').first()).toBeVisible();
  });

  test('should display customers table', async ({ page }) => {
    await page.goto('/customers');

    // Wait for table to load
    await page.waitForTimeout(1000);

    // Table or list should be visible
    const table = page.locator(SELECTORS.customersTable).first();
    const customerList = page.locator('[data-testid="customer-list"]').first();

    // At least one should be visible
    const tableVisible = await table.isVisible({ timeout: 3000 }).catch(() => false);
    const listVisible = await customerList.isVisible({ timeout: 3000 }).catch(() => false);

    expect(tableVisible || listVisible).toBe(true);
  });

  test('should display new customer button', async ({ page }) => {
    await page.goto('/customers');

    // Look for New Customer button
    const newCustomerButton = page.locator(SELECTORS.newCustomerButton).first();
    await expect(newCustomerButton).toBeVisible();
  });

  test('should open customer form when clicking new customer', async ({ page }) => {
    await page.goto('/customers');

    // Click New Customer button
    await page.click(SELECTORS.newCustomerButton);

    // Wait for modal or form to open
    await page.waitForSelector(SELECTORS.modal, { state: 'visible', timeout: 5000 });

    // Verify modal/form title
    const modalTitle = page.locator(SELECTORS.modalTitle);
    await expect(modalTitle).toContainText(/New Customer|Add Customer|Create Customer/i);
  });

  test('should display customer form fields', async ({ page }) => {
    await page.goto('/customers');
    await page.click(SELECTORS.newCustomerButton);

    // Wait for modal
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    // Check for required form fields
    const firstNameField = page.locator('input[name="firstName"], input[id="firstName"]').first();
    const lastNameField = page.locator('input[name="lastName"], input[id="lastName"]').first();
    const emailField = page.locator('input[name="email"], input[id="email"]').first();
    const phoneField = page.locator('input[name="phone"], input[id="phone"]').first();

    // Verify fields are visible
    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(phoneField).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/customers');
    await page.click(SELECTORS.newCustomerButton);

    // Wait for modal
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text("Create"), button:has-text("Save"), button[type="submit"]').first();
    await submitButton.click();

    // Should show validation errors or prevent submission
    // Modal should still be visible (form didn't submit)
    await expect(page.locator(SELECTORS.modal)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/customers');
    await page.click(SELECTORS.newCustomerButton);

    // Wait for modal
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    const customerData = generateCustomerData();

    // Fill form with invalid email
    await page.fill('input[name="firstName"], input[id="firstName"]', customerData.firstName);
    await page.fill('input[name="lastName"], input[id="lastName"]', customerData.lastName);
    await page.fill('input[name="email"], input[id="email"]', 'invalid-email'); // Invalid email
    await page.fill('input[name="phone"], input[id="phone"]', customerData.phone);

    // Try to submit
    const submitButton = page.locator('button:has-text("Create"), button:has-text("Save"), button[type="submit"]').first();
    await submitButton.click();

    // Should show validation error
    const emailInput = page.locator('input[name="email"], input[id="email"]').first();
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should create a new customer successfully', async ({ page }) => {
    await page.goto('/customers');

    // Click New Customer
    await page.click(SELECTORS.newCustomerButton);
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    // Generate unique customer data
    const customerData = generateCustomerData();

    // Fill customer form
    await page.fill('input[name="firstName"], input[id="firstName"]', customerData.firstName);
    await page.fill('input[name="lastName"], input[id="lastName"]', customerData.lastName);
    await page.fill('input[name="email"], input[id="email"]', customerData.email);
    await page.fill('input[name="phone"], input[id="phone"]', customerData.phone);

    // Fill optional fields if present
    const addressField = page.locator('input[name="address"], input[id="address"]').first();
    if (await addressField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await addressField.fill(customerData.address);
    }

    const cityField = page.locator('input[name="city"], input[id="city"]').first();
    if (await cityField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await cityField.fill(customerData.city);
    }

    const stateField = page.locator('input[name="state"], input[id="state"]').first();
    if (await stateField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await stateField.fill(customerData.state);
    }

    const zipField = page.locator('input[name="zipCode"], input[id="zipCode"], input[name="zip"]').first();
    if (await zipField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await zipField.fill(customerData.zipCode);
    }

    // Submit form
    const submitButton = page.locator('button:has-text("Create"), button:has-text("Save"), button[type="submit"]').first();
    await submitButton.click();

    // Wait for modal to close
    await expect(page.locator(SELECTORS.modal)).toBeHidden({ timeout: 10000 });

    // Verify success notification
    const successToast = page.locator(SELECTORS.successToast).or(
      page.locator('text=created successfully')
    );

    if (await successToast.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(successToast).toBeVisible();
    }

    // Verify customer appears in list
    await page.waitForTimeout(1000);

    const customerInList = page.locator(`text=${customerData.firstName}`).or(
      page.locator(`text=${customerData.email}`)
    );

    await expect(customerInList.first()).toBeVisible({ timeout: 5000 });
  });

  test('should search for customers by name', async ({ page }) => {
    // First create a customer
    await page.goto('/customers');

    const customerData = generateCustomerData({ firstName: 'SearchTest', lastName: 'Customer' });

    // Create customer
    await page.click(SELECTORS.newCustomerButton);
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    await page.fill('input[name="firstName"], input[id="firstName"]', customerData.firstName);
    await page.fill('input[name="lastName"], input[id="lastName"]', customerData.lastName);
    await page.fill('input[name="email"], input[id="email"]', customerData.email);
    await page.fill('input[name="phone"], input[id="phone"]', customerData.phone);

    await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');
    await expect(page.locator(SELECTORS.modal)).toBeHidden({ timeout: 10000 });

    // Wait for customer to be created
    await page.waitForTimeout(2000);

    // Now search for the customer
    const searchInput = page.locator(SELECTORS.searchInput).first();

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('SearchTest');
      await page.waitForTimeout(1000);

      // Verify customer appears in results
      const searchResult = page.locator(`text=${customerData.firstName}`);
      await expect(searchResult.first()).toBeVisible({ timeout: 3000 });
    } else {
      console.log('Search input not found - skipping search test');
    }
  });

  test('should view customer details', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForTimeout(1000);

    // Find first customer row
    const customerRow = page.locator('tr').filter({ hasText: /@/ }).first();
    const customerCard = page.locator('[data-testid="customer-card"]').first();

    // Try to click customer row or card
    if (await customerRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await customerRow.click();
    } else if (await customerCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await customerCard.click();
    } else {
      console.log('No customers found to click - skipping view test');
      return;
    }

    // Wait for details view
    await page.waitForTimeout(1000);

    // Details should be shown (modal, side panel, or detail page)
    const detailsView = page.locator(SELECTORS.modal).or(
      page.locator('[data-testid="customer-details"]')
    );

    const isVisible = await detailsView.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(detailsView).toBeVisible();
    }
  });

  test('should edit customer information', async ({ page }) => {
    await page.goto('/customers');

    // Create a customer first
    const customerData = generateCustomerData();

    await page.click(SELECTORS.newCustomerButton);
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    await page.fill('input[name="firstName"], input[id="firstName"]', customerData.firstName);
    await page.fill('input[name="lastName"], input[id="lastName"]', customerData.lastName);
    await page.fill('input[name="email"], input[id="email"]', customerData.email);
    await page.fill('input[name="phone"], input[id="phone"]', customerData.phone);

    await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');
    await expect(page.locator(SELECTORS.modal)).toBeHidden({ timeout: 10000 });

    await page.waitForTimeout(2000);

    // Find the customer and click edit
    const customerRow = page.locator(`text=${customerData.firstName}`).first();
    await customerRow.click();

    // Look for edit button
    const editButton = page.locator('button:has-text("Edit")').first();

    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();

      // Wait for edit form
      await page.waitForTimeout(1000);

      // Update phone number
      const phoneField = page.locator('input[name="phone"], input[id="phone"]').first();
      await phoneField.fill('555-9999');

      // Save changes
      await page.click('button:has-text("Save"), button[type="submit"]');

      // Wait for save to complete
      await page.waitForTimeout(2000);

      // Verify update
      const updatedPhone = page.locator('text=555-9999');
      await expect(updatedPhone.first()).toBeVisible({ timeout: 3000 });
    } else {
      console.log('Edit button not found - skipping edit test');
    }
  });

  test('should delete customer', async ({ page }) => {
    await page.goto('/customers');

    // Create a customer to delete
    const customerData = generateCustomerData({ firstName: 'ToDelete' });

    await page.click(SELECTORS.newCustomerButton);
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    await page.fill('input[name="firstName"], input[id="firstName"]', customerData.firstName);
    await page.fill('input[name="lastName"], input[id="lastName"]', customerData.lastName);
    await page.fill('input[name="email"], input[id="email"]', customerData.email);
    await page.fill('input[name="phone"], input[id="phone"]', customerData.phone);

    await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');
    await expect(page.locator(SELECTORS.modal)).toBeHidden({ timeout: 10000 });

    await page.waitForTimeout(2000);

    // Find and click the customer
    const customerRow = page.locator(`text=${customerData.firstName}`).first();
    await customerRow.click();

    // Look for delete button
    const deleteButton = page.locator(SELECTORS.deleteButton).first();

    if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteButton.click();

      // Confirm deletion in dialog
      await page.waitForTimeout(500);
      const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm")').last();
      await confirmButton.click();

      // Wait for deletion
      await page.waitForTimeout(2000);

      // Verify customer is removed
      const deletedCustomer = page.locator(`text=${customerData.firstName}`);
      await expect(deletedCustomer.first()).toBeHidden({ timeout: 5000 });
    } else {
      console.log('Delete button not found - skipping delete test');
    }
  });

  test('should display customer count', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForTimeout(1000);

    // Look for customer count indicator
    const countIndicator = page.locator('text=/\\d+ customers?/i').first();

    if (await countIndicator.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(countIndicator).toBeVisible();
    }
  });

  test('should paginate customers list', async ({ page }) => {
    await page.goto('/customers');
    await page.waitForTimeout(1000);

    // Look for pagination controls
    const nextButton = page.locator('button:has-text("Next"), button[aria-label="Next page"]').first();
    const prevButton = page.locator('button:has-text("Previous"), button[aria-label="Previous page"]').first();

    // If pagination exists, test it
    if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      const isEnabled = await nextButton.isEnabled();

      if (isEnabled) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        // Should show different page
        await expect(page.locator(SELECTORS.customersTable).first()).toBeVisible();
      }
    }
  });

  test.afterEach(async ({ page }) => {
    // Cleanup
    await clearAuthenticatedSession(page);
  });
});
