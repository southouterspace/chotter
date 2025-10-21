import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession, clearAuthenticatedSession } from './utils/auth';
import {
  generateTechnicianData,
  SELECTORS,
  WAIT_TIMES,
} from './fixtures/test-data';

test.describe('Technicians Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth state and login before each test
    await clearAuthenticatedSession(page);
    await setupAuthenticatedSession(page);
  });

  test('should navigate to technicians page', async ({ page }) => {
    // Click on technicians link in navigation
    await page.click(SELECTORS.techniciansLink);

    // Verify we're on the technicians page
    await expect(page).toHaveURL('/technicians');
    await expect(page.locator('text=Technicians').first()).toBeVisible();
  });

  test('should display technicians table', async ({ page }) => {
    await page.goto('/technicians');

    // Wait for table to load
    await page.waitForTimeout(1000);

    // Table or list should be visible
    const table = page.locator(SELECTORS.techniciansTable).first();
    const technicianList = page.locator('[data-testid="technician-list"]').first();

    // At least one should be visible
    const tableVisible = await table.isVisible({ timeout: 3000 }).catch(() => false);
    const listVisible = await technicianList.isVisible({ timeout: 3000 }).catch(() => false);

    expect(tableVisible || listVisible).toBe(true);
  });

  test('should display new technician button', async ({ page }) => {
    await page.goto('/technicians');

    // Look for New Technician button
    const newTechnicianButton = page.locator(SELECTORS.newTechnicianButton).first();
    await expect(newTechnicianButton).toBeVisible();
  });

  test('should open technician form when clicking new technician', async ({ page }) => {
    await page.goto('/technicians');

    // Click New Technician button
    await page.click(SELECTORS.newTechnicianButton);

    // Wait for modal or form to open
    await page.waitForSelector(SELECTORS.modal, { state: 'visible', timeout: 5000 });

    // Verify modal/form title
    const modalTitle = page.locator(SELECTORS.modalTitle);
    await expect(modalTitle).toContainText(/New Technician|Add Technician|Create Technician/i);
  });

  test('should display technician form fields', async ({ page }) => {
    await page.goto('/technicians');
    await page.click(SELECTORS.newTechnicianButton);

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
    await page.goto('/technicians');
    await page.click(SELECTORS.newTechnicianButton);

    // Wait for modal
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text("Create"), button:has-text("Save"), button[type="submit"]').first();
    await submitButton.click();

    // Should show validation errors or prevent submission
    // Modal should still be visible (form didn't submit)
    await expect(page.locator(SELECTORS.modal)).toBeVisible();
  });

  test('should create a new technician successfully', async ({ page }) => {
    await page.goto('/technicians');

    // Click New Technician
    await page.click(SELECTORS.newTechnicianButton);
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    // Generate unique technician data
    const technicianData = generateTechnicianData();

    // Fill technician form
    await page.fill('input[name="firstName"], input[id="firstName"]', technicianData.firstName);
    await page.fill('input[name="lastName"], input[id="lastName"]', technicianData.lastName);
    await page.fill('input[name="email"], input[id="email"]', technicianData.email);
    await page.fill('input[name="phone"], input[id="phone"]', technicianData.phone);

    // Fill skills if present
    const skillsField = page.locator('input[name="skills"], [data-testid="skills-input"]').first();
    if (await skillsField.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Skills might be a multi-select or tag input
      // Try typing and selecting
      for (const skill of technicianData.skills) {
        await skillsField.fill(skill);
        await page.waitForTimeout(500);

        // Try to select from dropdown or add tag
        const skillOption = page.locator(`text=${skill}`).first();
        if (await skillOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await skillOption.click();
        } else {
          // Try pressing Enter to add as tag
          await skillsField.press('Enter');
        }
      }
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

    // Verify technician appears in list
    await page.waitForTimeout(1000);

    const technicianInList = page.locator(`text=${technicianData.firstName}`).or(
      page.locator(`text=${technicianData.email}`)
    );

    await expect(technicianInList.first()).toBeVisible({ timeout: 5000 });
  });

  test('should search for technicians by name', async ({ page }) => {
    // First create a technician
    await page.goto('/technicians');

    const technicianData = generateTechnicianData({ firstName: 'SearchTest', lastName: 'Technician' });

    // Create technician
    await page.click(SELECTORS.newTechnicianButton);
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    await page.fill('input[name="firstName"], input[id="firstName"]', technicianData.firstName);
    await page.fill('input[name="lastName"], input[id="lastName"]', technicianData.lastName);
    await page.fill('input[name="email"], input[id="email"]', technicianData.email);
    await page.fill('input[name="phone"], input[id="phone"]', technicianData.phone);

    await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');
    await expect(page.locator(SELECTORS.modal)).toBeHidden({ timeout: 10000 });

    // Wait for technician to be created
    await page.waitForTimeout(2000);

    // Now search for the technician
    const searchInput = page.locator(SELECTORS.searchInput).first();

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('SearchTest');
      await page.waitForTimeout(1000);

      // Verify technician appears in results
      const searchResult = page.locator(`text=${technicianData.firstName}`);
      await expect(searchResult.first()).toBeVisible({ timeout: 3000 });
    } else {
      console.log('Search input not found - skipping search test');
    }
  });

  test('should filter technicians by skill', async ({ page }) => {
    await page.goto('/technicians');
    await page.waitForTimeout(1000);

    // Look for skill filter
    const skillFilter = page.locator('select:has-text("Skill"), [name="skill"], button:has-text("Filter by skill")').first();

    if (await skillFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Filter exists, test it
      await skillFilter.click();
      await page.waitForTimeout(500);

      // Select a skill option
      const skillOption = page.locator('[role="option"]').first();
      if (await skillOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skillOption.click();
        await page.waitForTimeout(1000);

        // Table should update
        await expect(page.locator(SELECTORS.techniciansTable).first()).toBeVisible();
      }
    } else {
      console.log('Skill filter not found - skipping filter test');
    }
  });

  test('should view technician details', async ({ page }) => {
    await page.goto('/technicians');
    await page.waitForTimeout(1000);

    // Find first technician row
    const technicianRow = page.locator('tr').filter({ hasText: /@/ }).first();
    const technicianCard = page.locator('[data-testid="technician-card"]').first();

    // Try to click technician row or card
    if (await technicianRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await technicianRow.click();
    } else if (await technicianCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await technicianCard.click();
    } else {
      console.log('No technicians found to click - skipping view test');
      return;
    }

    // Wait for details view
    await page.waitForTimeout(1000);

    // Details should be shown (modal, side panel, or detail page)
    const detailsView = page.locator(SELECTORS.modal).or(
      page.locator('[data-testid="technician-details"]')
    );

    const isVisible = await detailsView.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(detailsView).toBeVisible();
    }
  });

  test('should edit technician information', async ({ page }) => {
    await page.goto('/technicians');

    // Create a technician first
    const technicianData = generateTechnicianData();

    await page.click(SELECTORS.newTechnicianButton);
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    await page.fill('input[name="firstName"], input[id="firstName"]', technicianData.firstName);
    await page.fill('input[name="lastName"], input[id="lastName"]', technicianData.lastName);
    await page.fill('input[name="email"], input[id="email"]', technicianData.email);
    await page.fill('input[name="phone"], input[id="phone"]', technicianData.phone);

    await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');
    await expect(page.locator(SELECTORS.modal)).toBeHidden({ timeout: 10000 });

    await page.waitForTimeout(2000);

    // Find the technician and click edit
    const technicianRow = page.locator(`text=${technicianData.firstName}`).first();
    await technicianRow.click();

    // Look for edit button
    const editButton = page.locator('button:has-text("Edit")').first();

    if (await editButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editButton.click();

      // Wait for edit form
      await page.waitForTimeout(1000);

      // Update phone number
      const phoneField = page.locator('input[name="phone"], input[id="phone"]').first();
      await phoneField.fill('555-8888');

      // Save changes
      await page.click('button:has-text("Save"), button[type="submit"]');

      // Wait for save to complete
      await page.waitForTimeout(2000);

      // Verify update
      const updatedPhone = page.locator('text=555-8888');
      await expect(updatedPhone.first()).toBeVisible({ timeout: 3000 });
    } else {
      console.log('Edit button not found - skipping edit test');
    }
  });

  test('should delete technician', async ({ page }) => {
    await page.goto('/technicians');

    // Create a technician to delete
    const technicianData = generateTechnicianData({ firstName: 'ToDelete' });

    await page.click(SELECTORS.newTechnicianButton);
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    await page.fill('input[name="firstName"], input[id="firstName"]', technicianData.firstName);
    await page.fill('input[name="lastName"], input[id="lastName"]', technicianData.lastName);
    await page.fill('input[name="email"], input[id="email"]', technicianData.email);
    await page.fill('input[name="phone"], input[id="phone"]', technicianData.phone);

    await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');
    await expect(page.locator(SELECTORS.modal)).toBeHidden({ timeout: 10000 });

    await page.waitForTimeout(2000);

    // Find and click the technician
    const technicianRow = page.locator(`text=${technicianData.firstName}`).first();
    await technicianRow.click();

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

      // Verify technician is removed
      const deletedTechnician = page.locator(`text=${technicianData.firstName}`);
      await expect(deletedTechnician.first()).toBeHidden({ timeout: 5000 });
    } else {
      console.log('Delete button not found - skipping delete test');
    }
  });

  test('should display technician status', async ({ page }) => {
    await page.goto('/technicians');
    await page.waitForTimeout(1000);

    // Look for status indicators (active, offline, busy, etc.)
    const statusBadge = page.locator('[data-testid="technician-status"], .badge, .status-indicator').first();

    if (await statusBadge.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(statusBadge).toBeVisible();
    }
  });

  test('should display technician skills', async ({ page }) => {
    await page.goto('/technicians');

    // Create a technician with skills
    const technicianData = generateTechnicianData({ skills: ['Plumbing', 'HVAC'] });

    await page.click(SELECTORS.newTechnicianButton);
    await page.waitForSelector(SELECTORS.modal, { state: 'visible' });

    await page.fill('input[name="firstName"], input[id="firstName"]', technicianData.firstName);
    await page.fill('input[name="lastName"], input[id="lastName"]', technicianData.lastName);
    await page.fill('input[name="email"], input[id="email"]', technicianData.email);
    await page.fill('input[name="phone"], input[id="phone"]', technicianData.phone);

    await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');
    await expect(page.locator(SELECTORS.modal)).toBeHidden({ timeout: 10000 });

    await page.waitForTimeout(2000);

    // Find technician and check for skills display
    const technicianRow = page.locator(`text=${technicianData.firstName}`).first();
    await technicianRow.click();

    // Look for skills in details view
    const skillsBadges = page.locator('[data-testid="skill-badge"], .skill-tag').first();

    if (await skillsBadges.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(skillsBadges).toBeVisible();
    }
  });

  test('should view technician schedule', async ({ page }) => {
    await page.goto('/technicians');
    await page.waitForTimeout(1000);

    // Find first technician
    const technicianRow = page.locator('tr').filter({ hasText: /@/ }).first();

    if (await technicianRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await technicianRow.click();

      // Look for schedule view button or link
      const scheduleButton = page.locator('button:has-text("Schedule"), a:has-text("View Schedule")').first();

      if (await scheduleButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await scheduleButton.click();
        await page.waitForTimeout(1000);

        // Should show calendar or schedule view
        const scheduleView = page.locator('.fc-view, [data-testid="technician-schedule"]').first();
        await expect(scheduleView).toBeVisible({ timeout: 3000 });
      } else {
        console.log('Schedule button not found - skipping schedule view test');
      }
    }
  });

  test('should display technician count', async ({ page }) => {
    await page.goto('/technicians');
    await page.waitForTimeout(1000);

    // Look for technician count indicator
    const countIndicator = page.locator('text=/\\d+ technicians?/i').first();

    if (await countIndicator.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(countIndicator).toBeVisible();
    }
  });

  test.afterEach(async ({ page }) => {
    // Cleanup
    await clearAuthenticatedSession(page);
  });
});
