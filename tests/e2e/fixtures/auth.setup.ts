import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";

/**
 * Global authentication setup for E2E tests
 *
 * This setup runs once before all tests and saves the authenticated state.
 * Other tests can reuse this state without logging in again.
 *
 * Best practices:
 * - Runs once per test suite (not before each test)
 * - Saves storage state (cookies, localStorage) to file
 * - Other tests reuse this state for faster execution
 */

const authFile = "tests/e2e/fixtures/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Arrange - Get credentials from environment
  const email = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test file");
  }

  // Act - Login using LoginPage
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await loginPage.waitForLoginSuccess();

  // Assert - Verify successful login
  await expect(page).toHaveURL(/\/app\/decks/);

  // Save authenticated state to file
  await page.context().storageState({ path: authFile });
});
