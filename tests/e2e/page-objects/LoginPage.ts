import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the Login page (/login)
 *
 * This page allows users to:
 * - Log in to their account
 * - Navigate to registration
 * - Navigate to password reset
 */
export class LoginPage {
  readonly page: Page;

  // Locators - Page elements
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginSubmitButton: Locator;
  readonly loginError: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Form elements
    this.loginForm = page.getByTestId("login-form");
    this.emailInput = page.getByTestId("email-input");
    this.passwordInput = page.getByTestId("password-input");
    this.loginSubmitButton = page.getByTestId("login-submit-button");
    this.loginError = page.getByTestId("login-error");
    this.pageTitle = page.locator("h1").filter({ hasText: "Witaj ponownie" });
  }

  /**
   * Navigate to the Login page
   */
  async goto() {
    await this.page.goto("/login", { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle");
    // Wait for React form to be ready
    await this.loginForm.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Fill in the email field
   * @param email - The email to fill in
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill in the password field
   * @param password - The password to fill in
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the login form
   */
  async submitLogin() {
    await this.loginSubmitButton.click();
  }

  /**
   * Login with credentials
   * This is a high-level method that combines multiple steps
   *
   * @param email - The email to login with
   * @param password - The password to login with
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submitLogin();
  }

  /**
   * Wait for successful login redirect
   * By default waits for redirect to /app/decks
   */
  async waitForLoginSuccess(expectedUrl = "/app/decks") {
    await this.page.waitForURL(`**${expectedUrl}`);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Assert that the login form is visible
   */
  async expectLoginFormToBeVisible() {
    await expect(this.loginForm).toBeVisible();
  }

  /**
   * Assert that the page title is visible
   */
  async expectPageTitleToBeVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * Assert that an error message is visible
   * @param errorMessage - Optional specific error message to check
   */
  async expectErrorToBeVisible(errorMessage?: string) {
    await expect(this.loginError).toBeVisible();
    if (errorMessage) {
      await expect(this.loginError).toContainText(errorMessage);
    }
  }

  /**
   * Assert that no error is visible
   */
  async expectNoError() {
    await expect(this.loginError).toBeHidden();
  }
}
