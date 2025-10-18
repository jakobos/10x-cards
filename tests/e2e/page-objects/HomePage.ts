import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the Home page (/)
 *
 * This page is the landing page for unauthenticated users
 */
export class HomePage {
  readonly page: Page;

  // Locators - Header navigation
  readonly loginLink: Locator;
  readonly registerLink: Locator;

  // Locators - Page content
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header navigation
    this.loginLink = page.getByTestId("login-link");
    this.registerLink = page.getByTestId("register-link");

    // Page content
    this.pageTitle = page.locator("h1").filter({ hasText: "10x Cards" });
  }

  /**
   * Navigate to the Home page
   */
  async goto() {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle");
    // Wait for React hydration
    await this.pageTitle.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Click on the login link in the header
   */
  async clickLoginLink() {
    await this.loginLink.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Click on the register link in the header
   */
  async clickRegisterLink() {
    await this.registerLink.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Assert that the page title is visible
   */
  async expectPageTitleToBeVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * Assert that the login link is visible
   */
  async expectLoginLinkToBeVisible() {
    await expect(this.loginLink).toBeVisible();
  }
}
