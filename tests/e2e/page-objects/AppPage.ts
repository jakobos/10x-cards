import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for authenticated app pages
 *
 * This represents common elements found on all authenticated pages
 */
export class AppPage {
  readonly page: Page;

  // Locators - Header elements
  readonly appHeader: Locator;
  readonly decksLink: Locator;
  readonly userMenuTrigger: Locator;
  readonly userEmailLabel: Locator;
  readonly accountSettingsLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header elements
    this.appHeader = page.getByTestId("app-header");
    this.decksLink = page.getByTestId("decks-link");
    this.userMenuTrigger = page.getByTestId("user-menu-trigger");
    this.userEmailLabel = page.getByTestId("user-email-label");
    this.accountSettingsLink = page.getByTestId("account-settings-link");
    this.logoutButton = page.getByTestId("logout-button");
  }

  /**
   * Open the user menu dropdown
   */
  async openUserMenu() {
    await this.userMenuTrigger.click();
    await this.userEmailLabel.waitFor({ state: "visible" });
  }

  /**
   * Logout from the application
   */
  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
    await this.page.waitForURL("**/");
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Assert that the app header is visible (user is logged in)
   */
  async expectAppHeaderToBeVisible() {
    await expect(this.appHeader).toBeVisible();
  }

  /**
   * Assert that the user menu trigger is visible
   */
  async expectUserMenuTriggerToBeVisible() {
    await expect(this.userMenuTrigger).toBeVisible();
  }

  /**
   * Assert that the user email is displayed in the menu
   * @param email - Expected email address
   */
  async expectUserEmailToBeDisplayed(email: string) {
    await this.openUserMenu();
    await expect(this.userEmailLabel).toContainText(email);
  }

  /**
   * Assert that the decks link is visible
   */
  async expectDecksLinkToBeVisible() {
    await expect(this.decksLink).toBeVisible();
  }
}
