import { test, expect } from "@playwright/test";
import { DecksViewPage } from "./page-objects/DecksViewPage";

/**
 * E2E Tests for Decks View Page
 *
 * Test suite covering the main functionality of the decks list page:
 * - Viewing decks
 * - Creating new decks
 * - Verifying deck creation
 */

/**
 * These tests use global authentication setup from auth.setup.ts
 * The user is automatically logged in via saved storage state
 */
test.describe("Decks View Page", () => {
  let decksPage: DecksViewPage;

  test.beforeEach(async ({ page }) => {
    decksPage = new DecksViewPage(page);
    await decksPage.goto();
  });

  test("should display the decks page", async () => {
    // Arrange & Act - done in beforeEach

    // Assert
    await decksPage.expectPageTitleToBeVisible();
  });

  test("should open create deck dialog when clicking create button", async () => {
    // Arrange - page already loaded in beforeEach

    // Act
    await decksPage.openCreateDeckDialog();

    // Assert
    await decksPage.expectCreateDeckDialogToBeVisible();
  });

  test("should create a new deck successfully", async () => {
    // Arrange
    const deckName = `Test Deck ${Date.now()}`;
    const initialDeckCount = await decksPage.getDeckCount();

    // Act
    await decksPage.createDeck(deckName);

    // Assert
    await decksPage.expectDeckToBeVisible(deckName);
    await decksPage.expectDeckCount(initialDeckCount + 1);
  });

  test("should create a new deck - step by step", async () => {
    // Arrange
    const deckName = `My New Deck ${Date.now()}`;

    // Act
    // 1. Click create deck button
    await decksPage.openCreateDeckDialog();

    // 2. Wait for dialog to open
    await decksPage.expectCreateDeckDialogToBeVisible();

    // 3. Fill in deck name
    await decksPage.fillDeckName(deckName);

    // 4. Submit the form
    await decksPage.submitCreateDeck();

    // Assert
    // 5. Verify the deck appears in the list
    await decksPage.waitForDeckToBeVisible(deckName);
    await decksPage.expectDeckToBeVisible(deckName);
  });

  test("should cancel deck creation", async () => {
    // Arrange - page already loaded

    // Act
    await decksPage.openCreateDeckDialog();
    await decksPage.fillDeckName("This deck should not be created");
    await decksPage.cancelDeckDialog();

    // Assert
    await decksPage.expectCreateDeckDialogToBeHidden();
    // Verify the deck was not created
    await expect(async () => {
      const isVisible = await decksPage.isDeckVisible("This deck should not be created");
      expect(isVisible).toBe(false);
    }).toPass();
  });

  test("should create multiple decks", async () => {
    // Arrange
    const timestamp = Date.now();
    const deckNames = [`Deck 1 - ${timestamp}`, `Deck 2 - ${timestamp}`, `Deck 3 - ${timestamp}`];

    const initialCount = await decksPage.getDeckCount();

    // Act
    for (const deckName of deckNames) {
      await decksPage.createDeck(deckName);
    }

    // Assert
    for (const deckName of deckNames) {
      await decksPage.expectDeckToBeVisible(deckName);
    }

    await decksPage.expectDeckCount(initialCount + deckNames.length);
  });
});
