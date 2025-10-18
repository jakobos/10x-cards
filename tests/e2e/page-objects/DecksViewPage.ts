import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the Decks View page (/app/decks)
 *
 * This page allows users to:
 * - View their deck list
 * - Create new decks
 * - Edit deck names
 * - Delete decks
 */
export class DecksViewPage {
  readonly page: Page;

  // Locators - Main page elements
  readonly pageTitle: Locator;
  readonly createDeckButtonHeader: Locator;
  readonly createDeckButtonEmpty: Locator;
  readonly deckList: Locator;

  // Locators - Create/Edit Deck Dialog
  readonly createDeckDialog: Locator;
  readonly editDeckDialog: Locator;
  readonly deckNameInput: Locator;
  readonly createDeckSubmitButton: Locator;
  readonly saveDeckButton: Locator;
  readonly cancelDeckDialogButton: Locator;

  // Locators - Deck Cards
  readonly deckCards: Locator;
  readonly deckCardTitles: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main page elements
    this.pageTitle = page.locator("h1").filter({ hasText: "Moje Talie" });
    this.createDeckButtonHeader = page.getByTestId("create-deck-button-header");
    this.createDeckButtonEmpty = page.getByTestId("create-deck-button-empty");
    this.deckList = page.getByTestId("deck-list");

    // Dialog elements
    this.createDeckDialog = page.getByTestId("create-deck-dialog");
    this.editDeckDialog = page.getByTestId("edit-deck-dialog");
    this.deckNameInput = page.getByTestId("deck-name-input");
    this.createDeckSubmitButton = page.getByTestId("create-deck-submit-button");
    this.saveDeckButton = page.getByTestId("save-deck-button");
    this.cancelDeckDialogButton = page.getByTestId("cancel-deck-dialog-button");

    // Deck card elements
    this.deckCards = page.getByTestId("deck-card");
    this.deckCardTitles = page.getByTestId("deck-card-title");
  }

  /**
   * Navigate to the Decks View page
   */
  async goto() {
    await this.page.goto("/app/decks", { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle");
    // Wait for React components to hydrate
    await this.pageTitle.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Open the Create Deck dialog
   * Clicks whichever button is visible (header or empty state)
   */
  async openCreateDeckDialog() {
    // Try to click the header button first (when decks exist)
    if (await this.createDeckButtonHeader.isVisible()) {
      await this.createDeckButtonHeader.click();
    } else {
      // Otherwise click the empty state button (when no decks exist)
      await this.createDeckButtonEmpty.click();
    }
    await this.createDeckDialog.waitFor({ state: "visible" });
  }

  /**
   * Fill in the deck name in the dialog
   * @param name - The name for the deck
   */
  async fillDeckName(name: string) {
    await this.deckNameInput.fill(name);
  }

  /**
   * Submit the create deck form
   */
  async submitCreateDeck() {
    await this.createDeckSubmitButton.click();
  }

  /**
   * Submit the edit deck form
   */
  async submitEditDeck() {
    await this.saveDeckButton.click();
  }

  /**
   * Cancel the deck dialog
   */
  async cancelDeckDialog() {
    await this.cancelDeckDialogButton.click();
  }

  /**
   * Create a new deck with the given name
   * This is a high-level method that combines multiple steps
   *
   * @param name - The name for the new deck
   */
  async createDeck(name: string) {
    await this.openCreateDeckDialog();
    await this.fillDeckName(name);
    await this.submitCreateDeck();

    // Wait for dialog to close
    await this.createDeckDialog.waitFor({ state: "hidden" });
  }

  /**
   * Get a deck card by its name
   * @param name - The name of the deck
   */
  getDeckCardByName(name: string): Locator {
    return this.deckCards.filter({ has: this.page.getByTestId("deck-card-title").filter({ hasText: name }) });
  }

  /**
   * Get a deck card title by name
   * @param name - The name of the deck
   */
  getDeckCardTitleByName(name: string): Locator {
    return this.deckCardTitles.filter({ hasText: name });
  }

  /**
   * Get a deck card by its ID
   * @param deckId - The ID of the deck
   */
  getDeckCardById(deckId: string): Locator {
    return this.page.locator(`[data-test-id="deck-card"][data-deck-id="${deckId}"]`);
  }

  /**
   * Check if a deck with the given name is visible
   * @param name - The name of the deck
   */
  async isDeckVisible(name: string): Promise<boolean> {
    const deck = this.getDeckCardTitleByName(name);
    return await deck.isVisible();
  }

  /**
   * Wait for a deck with the given name to be visible
   * @param name - The name of the deck
   */
  async waitForDeckToBeVisible(name: string) {
    await this.getDeckCardTitleByName(name).waitFor({ state: "visible" });
  }

  /**
   * Get the count of visible decks
   * Returns 0 if no decks exist (empty state is shown)
   */
  async getDeckCount(): Promise<number> {
    // Check if the empty state button is visible (no decks)
    const isEmptyState = await this.createDeckButtonEmpty.isVisible();
    if (isEmptyState) {
      return 0;
    }

    // Otherwise, count the deck cards
    await this.deckList.waitFor({ state: "visible" });
    return await this.deckCards.count();
  }

  /**
   * Assert that a deck with the given name exists and is visible
   * @param name - The name of the deck
   */
  async expectDeckToBeVisible(name: string) {
    await expect(this.getDeckCardTitleByName(name)).toBeVisible();
  }

  /**
   * Assert that the deck list contains the expected number of decks
   * @param count - Expected number of decks
   */
  async expectDeckCount(count: number) {
    await expect(this.deckCards).toHaveCount(count);
  }

  /**
   * Assert that the create deck dialog is visible
   */
  async expectCreateDeckDialogToBeVisible() {
    await expect(this.createDeckDialog).toBeVisible();
  }

  /**
   * Assert that the create deck dialog is hidden
   */
  async expectCreateDeckDialogToBeHidden() {
    await expect(this.createDeckDialog).toBeHidden();
  }

  /**
   * Assert that the page title is visible
   */
  async expectPageTitleToBeVisible() {
    await expect(this.pageTitle).toBeVisible();
  }

  /**
   * Assert that the deck list is visible
   */
  async expectDeckListToBeVisible() {
    await expect(this.deckList).toBeVisible();
  }
}
