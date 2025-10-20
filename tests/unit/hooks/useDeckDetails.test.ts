import { describe, it, expect } from "vitest";
import type { DeckDetailsDto, FlashcardSummaryDto } from "@/types";
import { reducer, createInitialState } from "@/hooks/useDeckDetails";

/**
 * Test suite for useDeckDetails hook
 * Focuses on testing the reducer logic which contains core business rules
 *
 * Key business rules tested:
 * - State immutability (no mutations of original state)
 * - Proper dialog state management
 * - Flashcards list operations (add, update, delete)
 * - Error and loading states
 * - Edge cases (empty lists, single items, boundary conditions)
 */

// Mock data factories
const createMockFlashcard = (overrides?: Partial<FlashcardSummaryDto>): FlashcardSummaryDto => ({
  id: "flashcard-1",
  front: "Test Question",
  back: "Test Answer",
  source: "manual" as const,
  createdAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

const createMockDeck = (overrides?: Partial<DeckDetailsDto>): DeckDetailsDto => ({
  id: "deck-1",
  name: "Test Deck",
  createdAt: "2024-01-01T00:00:00Z",
  flashcards: [],
  ...overrides,
});

describe("useDeckDetails", () => {
  describe("reducer", () => {
    describe("Error and Loading States", () => {
      it("should set error message", () => {
        const state = createInitialState(createMockDeck());
        const newState = reducer(state, { type: "SET_ERROR", payload: "Test error" });

        expect(newState.error).toBe("Test error");
        expect(state.error).toBeNull(); // Original state unchanged
      });

      it("should clear error by setting null", () => {
        const state = createInitialState(createMockDeck());
        const stateWithError = { ...state, error: "Existing error" };
        const newState = reducer(stateWithError, { type: "SET_ERROR", payload: null });

        expect(newState.error).toBeNull();
      });

      it("should set loading state to true", () => {
        const state = createInitialState(createMockDeck());
        const newState = reducer(state, { type: "SET_LOADING", payload: true });

        expect(newState.isLoading).toBe(true);
        expect(state.isLoading).toBe(false); // Original unchanged
      });

      it("should set loading state to false", () => {
        const state = createInitialState(createMockDeck());
        const loadingState = { ...state, isLoading: true };
        const newState = reducer(loadingState, { type: "SET_LOADING", payload: false });

        expect(newState.isLoading).toBe(false);
      });
    });

    describe("Deck Name Editing", () => {
      it("should enable name editing mode", () => {
        const state = createInitialState(createMockDeck());
        const newState = reducer(state, { type: "START_EDIT_NAME" });

        expect(newState.isEditingName).toBe(true);
      });

      it("should cancel name editing mode", () => {
        const state = createInitialState(createMockDeck());
        const editingState = { ...state, isEditingName: true };
        const newState = reducer(editingState, { type: "CANCEL_EDIT_NAME" });

        expect(newState.isEditingName).toBe(false);
      });

      it("should start saving name and clear error", () => {
        const state = createInitialState(createMockDeck());
        const stateWithError = { ...state, error: "Previous error" };
        const newState = reducer(stateWithError, { type: "START_SAVE_NAME" });

        expect(newState.isSavingName).toBe(true);
        expect(newState.error).toBeNull();
      });

      it("should finish saving name and update deck name", () => {
        const state = createInitialState(createMockDeck({ name: "Old Name" }));
        const savingState = { ...state, isSavingName: true, isEditingName: true };
        const newState = reducer(savingState, { type: "FINISH_SAVE_NAME", payload: "New Name" });

        expect(newState.deck.name).toBe("New Name");
        expect(state.deck.name).toBe("Old Name"); // Original unchanged
      });

      it("should exit editing mode after finishing save", () => {
        const state = createInitialState(createMockDeck());
        const savingState = { ...state, isSavingName: true, isEditingName: true };
        const newState = reducer(savingState, { type: "FINISH_SAVE_NAME", payload: "New Name" });

        expect(newState.isEditingName).toBe(false);
      });

      it("should reset isSavingName flag after finish", () => {
        const state = createInitialState(createMockDeck());
        const savingState = { ...state, isSavingName: true };
        const newState = reducer(savingState, { type: "FINISH_SAVE_NAME", payload: "New Name" });

        expect(newState.isSavingName).toBe(false);
      });
    });

    describe("Add Flashcard Dialog", () => {
      it("should open add flashcard dialog", () => {
        const state = createInitialState(createMockDeck());
        const newState = reducer(state, { type: "OPEN_ADD_FLASHCARD_DIALOG" });

        expect(newState.dialogs.addFlashcard.isOpen).toBe(true);
        expect(newState.dialogs.addFlashcard.isSaving).toBe(false);
      });

      it("should close add flashcard dialog", () => {
        const state = createInitialState(createMockDeck());
        const openState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            addFlashcard: { isOpen: true, isSaving: false },
          },
        };
        const newState = reducer(openState, { type: "CLOSE_ADD_FLASHCARD_DIALOG" });

        expect(newState.dialogs.addFlashcard.isOpen).toBe(false);
      });

      it("should reset isSaving flag when closing dialog", () => {
        const state = createInitialState(createMockDeck());
        const savingState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            addFlashcard: { isOpen: true, isSaving: true },
          },
        };
        const newState = reducer(savingState, { type: "CLOSE_ADD_FLASHCARD_DIALOG" });

        expect(newState.dialogs.addFlashcard.isSaving).toBe(false);
      });
    });

    describe("Add Flashcard Operation", () => {
      it("should add new flashcard to the beginning of the list", () => {
        const existingFlashcard = createMockFlashcard({ id: "existing-1", front: "Existing" });
        const state = createInitialState(createMockDeck({ flashcards: [existingFlashcard] }));
        const newFlashcard = createMockFlashcard({ id: "new-1", front: "New" });
        const newState = reducer(state, { type: "FINISH_ADD_FLASHCARD", payload: newFlashcard });

        expect(newState.deck.flashcards).toHaveLength(2);
        expect(newState.deck.flashcards[0].id).toBe("new-1");
        expect(newState.deck.flashcards[1].id).toBe("existing-1");
      });

      it("should close dialog after adding flashcard", () => {
        const state = createInitialState(createMockDeck());
        const openState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            addFlashcard: { isOpen: true, isSaving: true },
          },
        };
        const newFlashcard = createMockFlashcard();
        const newState = reducer(openState, { type: "FINISH_ADD_FLASHCARD", payload: newFlashcard });

        expect(newState.dialogs.addFlashcard.isOpen).toBe(false);
        expect(newState.dialogs.addFlashcard.isSaving).toBe(false);
      });

      it("should preserve existing flashcards when adding new one", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1", front: "Q1" });
        const flashcard2 = createMockFlashcard({ id: "fc-2", front: "Q2" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2] }));
        const newFlashcard = createMockFlashcard({ id: "fc-3", front: "Q3" });
        const newState = reducer(state, { type: "FINISH_ADD_FLASHCARD", payload: newFlashcard });

        expect(newState.deck.flashcards).toHaveLength(3);
        expect(newState.deck.flashcards.find((fc) => fc.id === "fc-1")).toBeTruthy();
        expect(newState.deck.flashcards.find((fc) => fc.id === "fc-2")).toBeTruthy();
        expect(newState.deck.flashcards.find((fc) => fc.id === "fc-3")).toBeTruthy();
      });

      it("should add flashcard to empty list", () => {
        const state = createInitialState(createMockDeck({ flashcards: [] }));
        const newFlashcard = createMockFlashcard();
        const newState = reducer(state, { type: "FINISH_ADD_FLASHCARD", payload: newFlashcard });

        expect(newState.deck.flashcards).toHaveLength(1);
        expect(newState.deck.flashcards[0].id).toBe(newFlashcard.id);
      });
    });

    describe("Edit Flashcard Dialog", () => {
      it("should open edit dialog with flashcard data", () => {
        const state = createInitialState(createMockDeck());
        const flashcard = createMockFlashcard();
        const newState = reducer(state, { type: "OPEN_EDIT_FLASHCARD_DIALOG", payload: flashcard });

        expect(newState.dialogs.editFlashcard.isOpen).toBe(true);
        expect(newState.dialogs.editFlashcard.isSaving).toBe(false);
        expect(newState.dialogs.editFlashcard.flashcard).toEqual(flashcard);
      });

      it("should close edit dialog and clear flashcard data", () => {
        const flashcard = createMockFlashcard();
        const state = createInitialState(createMockDeck());
        const openState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            editFlashcard: { isOpen: true, isSaving: false, flashcard },
          },
        };
        const newState = reducer(openState, { type: "CLOSE_EDIT_FLASHCARD_DIALOG" });

        expect(newState.dialogs.editFlashcard.isOpen).toBe(false);
        expect(newState.dialogs.editFlashcard.flashcard).toBeNull();
      });

      it("should reset isSaving flag when closing edit dialog", () => {
        const flashcard = createMockFlashcard();
        const state = createInitialState(createMockDeck());
        const savingState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            editFlashcard: { isOpen: true, isSaving: true, flashcard },
          },
        };
        const newState = reducer(savingState, { type: "CLOSE_EDIT_FLASHCARD_DIALOG" });

        expect(newState.dialogs.editFlashcard.isSaving).toBe(false);
      });
    });

    describe("Update Flashcard Operation", () => {
      it("should update flashcard in the list", () => {
        const flashcard = createMockFlashcard({ id: "fc-1", front: "Old Question" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard] }));
        const updatedFlashcard = { ...flashcard, front: "New Question" };
        const newState = reducer(state, { type: "FINISH_UPDATE_FLASHCARD", payload: updatedFlashcard });

        expect(newState.deck.flashcards[0].front).toBe("New Question");
        expect(state.deck.flashcards[0].front).toBe("Old Question"); // Original unchanged
      });

      it("should preserve other flashcards when updating one", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1", front: "Q1" });
        const flashcard2 = createMockFlashcard({ id: "fc-2", front: "Q2" });
        const flashcard3 = createMockFlashcard({ id: "fc-3", front: "Q3" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2, flashcard3] }));
        const updatedFlashcard = { ...flashcard2, front: "Updated Q2" };
        const newState = reducer(state, { type: "FINISH_UPDATE_FLASHCARD", payload: updatedFlashcard });

        expect(newState.deck.flashcards).toHaveLength(3);
        expect(newState.deck.flashcards[0].front).toBe("Q1");
        expect(newState.deck.flashcards[1].front).toBe("Updated Q2");
        expect(newState.deck.flashcards[2].front).toBe("Q3");
      });

      it("should close dialog after updating flashcard", () => {
        const flashcard = createMockFlashcard();
        const state = createInitialState(createMockDeck({ flashcards: [flashcard] }));
        const openState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            editFlashcard: { isOpen: true, isSaving: true, flashcard },
          },
        };
        const newState = reducer(openState, { type: "FINISH_UPDATE_FLASHCARD", payload: flashcard });

        expect(newState.dialogs.editFlashcard.isOpen).toBe(false);
        expect(newState.dialogs.editFlashcard.isSaving).toBe(false);
        expect(newState.dialogs.editFlashcard.flashcard).toBeNull();
      });

      it("should handle updating first flashcard in list", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1", front: "First" });
        const flashcard2 = createMockFlashcard({ id: "fc-2", front: "Second" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2] }));
        const updatedFlashcard = { ...flashcard1, front: "Updated First" };
        const newState = reducer(state, { type: "FINISH_UPDATE_FLASHCARD", payload: updatedFlashcard });

        expect(newState.deck.flashcards[0].front).toBe("Updated First");
        expect(newState.deck.flashcards[1].front).toBe("Second");
      });

      it("should handle updating last flashcard in list", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1", front: "First" });
        const flashcard2 = createMockFlashcard({ id: "fc-2", front: "Last" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2] }));
        const updatedFlashcard = { ...flashcard2, front: "Updated Last" };
        const newState = reducer(state, { type: "FINISH_UPDATE_FLASHCARD", payload: updatedFlashcard });

        expect(newState.deck.flashcards[0].front).toBe("First");
        expect(newState.deck.flashcards[1].front).toBe("Updated Last");
      });

      it("should handle updating middle flashcard in list", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1", front: "First" });
        const flashcard2 = createMockFlashcard({ id: "fc-2", front: "Middle" });
        const flashcard3 = createMockFlashcard({ id: "fc-3", front: "Last" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2, flashcard3] }));
        const updatedFlashcard = { ...flashcard2, front: "Updated Middle" };
        const newState = reducer(state, { type: "FINISH_UPDATE_FLASHCARD", payload: updatedFlashcard });

        expect(newState.deck.flashcards[0].front).toBe("First");
        expect(newState.deck.flashcards[1].front).toBe("Updated Middle");
        expect(newState.deck.flashcards[2].front).toBe("Last");
      });
    });

    describe("Delete Flashcard Dialog", () => {
      it("should open delete dialog with flashcard ID", () => {
        const state = createInitialState(createMockDeck());
        const newState = reducer(state, { type: "OPEN_DELETE_FLASHCARD_DIALOG", payload: "flashcard-id" });

        expect(newState.dialogs.deleteFlashcard.isOpen).toBe(true);
        expect(newState.dialogs.deleteFlashcard.isDeleting).toBe(false);
        expect(newState.dialogs.deleteFlashcard.flashcardId).toBe("flashcard-id");
      });

      it("should close delete dialog and clear flashcard ID", () => {
        const state = createInitialState(createMockDeck());
        const openState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            deleteFlashcard: { isOpen: true, isDeleting: false, flashcardId: "flashcard-id" },
          },
        };
        const newState = reducer(openState, { type: "CLOSE_DELETE_FLASHCARD_DIALOG" });

        expect(newState.dialogs.deleteFlashcard.isOpen).toBe(false);
        expect(newState.dialogs.deleteFlashcard.flashcardId).toBeNull();
      });

      it("should set isDeleting flag when starting delete", () => {
        const state = createInitialState(createMockDeck());
        const openState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            deleteFlashcard: { isOpen: true, isDeleting: false, flashcardId: "fc-1" },
          },
        };
        const newState = reducer(openState, { type: "START_DELETE_FLASHCARD" });

        expect(newState.dialogs.deleteFlashcard.isDeleting).toBe(true);
      });

      it("should clear error when starting delete", () => {
        const state = createInitialState(createMockDeck());
        const stateWithError = { ...state, error: "Previous error" };
        const newState = reducer(stateWithError, { type: "START_DELETE_FLASHCARD" });

        expect(newState.error).toBeNull();
      });
    });

    describe("Delete Flashcard Operation", () => {
      it("should remove flashcard from list", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1" });
        const flashcard2 = createMockFlashcard({ id: "fc-2" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2] }));
        const newState = reducer(state, { type: "FINISH_DELETE_FLASHCARD", payload: "fc-1" });

        expect(newState.deck.flashcards).toHaveLength(1);
        expect(newState.deck.flashcards[0].id).toBe("fc-2");
      });

      it("should preserve other flashcards when deleting one", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1", front: "Q1" });
        const flashcard2 = createMockFlashcard({ id: "fc-2", front: "Q2" });
        const flashcard3 = createMockFlashcard({ id: "fc-3", front: "Q3" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2, flashcard3] }));
        const newState = reducer(state, { type: "FINISH_DELETE_FLASHCARD", payload: "fc-2" });

        expect(newState.deck.flashcards).toHaveLength(2);
        expect(newState.deck.flashcards[0].id).toBe("fc-1");
        expect(newState.deck.flashcards[1].id).toBe("fc-3");
      });

      it("should close dialog after deleting flashcard", () => {
        const flashcard = createMockFlashcard();
        const state = createInitialState(createMockDeck({ flashcards: [flashcard] }));
        const openState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            deleteFlashcard: { isOpen: true, isDeleting: true, flashcardId: flashcard.id },
          },
        };
        const newState = reducer(openState, { type: "FINISH_DELETE_FLASHCARD", payload: flashcard.id });

        expect(newState.dialogs.deleteFlashcard.isOpen).toBe(false);
        expect(newState.dialogs.deleteFlashcard.isDeleting).toBe(false);
        expect(newState.dialogs.deleteFlashcard.flashcardId).toBeNull();
      });

      it("should handle deleting only flashcard", () => {
        const flashcard = createMockFlashcard({ id: "only-one" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard] }));
        const newState = reducer(state, { type: "FINISH_DELETE_FLASHCARD", payload: "only-one" });

        expect(newState.deck.flashcards).toHaveLength(0);
      });

      it("should handle deleting first flashcard", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1" });
        const flashcard2 = createMockFlashcard({ id: "fc-2" });
        const flashcard3 = createMockFlashcard({ id: "fc-3" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2, flashcard3] }));
        const newState = reducer(state, { type: "FINISH_DELETE_FLASHCARD", payload: "fc-1" });

        expect(newState.deck.flashcards).toHaveLength(2);
        expect(newState.deck.flashcards[0].id).toBe("fc-2");
      });

      it("should handle deleting last flashcard", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1" });
        const flashcard2 = createMockFlashcard({ id: "fc-2" });
        const flashcard3 = createMockFlashcard({ id: "fc-3" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2, flashcard3] }));
        const newState = reducer(state, { type: "FINISH_DELETE_FLASHCARD", payload: "fc-3" });

        expect(newState.deck.flashcards).toHaveLength(2);
        expect(newState.deck.flashcards[1].id).toBe("fc-2");
      });

      it("should return empty array when deleting from single-item list", () => {
        const flashcard = createMockFlashcard({ id: "single" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard] }));
        const newState = reducer(state, { type: "FINISH_DELETE_FLASHCARD", payload: "single" });

        expect(newState.deck.flashcards).toEqual([]);
        expect(newState.deck.flashcards).toHaveLength(0);
      });

      it("should handle deleting non-existent flashcard gracefully", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1" });
        const flashcard2 = createMockFlashcard({ id: "fc-2" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2] }));
        const newState = reducer(state, { type: "FINISH_DELETE_FLASHCARD", payload: "non-existent" });

        // Should not remove anything if ID doesn't exist
        expect(newState.deck.flashcards).toHaveLength(2);
      });
    });

    describe("Delete Deck Dialog", () => {
      it("should open delete deck dialog", () => {
        const state = createInitialState(createMockDeck());
        const newState = reducer(state, { type: "OPEN_DELETE_DECK_DIALOG" });

        expect(newState.dialogs.deleteDeck.isOpen).toBe(true);
        expect(newState.dialogs.deleteDeck.isDeleting).toBe(false);
      });

      it("should close delete deck dialog", () => {
        const state = createInitialState(createMockDeck());
        const openState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            deleteDeck: { isOpen: true, isDeleting: false },
          },
        };
        const newState = reducer(openState, { type: "CLOSE_DELETE_DECK_DIALOG" });

        expect(newState.dialogs.deleteDeck.isOpen).toBe(false);
      });

      it("should set isDeleting flag when starting deck delete", () => {
        const state = createInitialState(createMockDeck());
        const openState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            deleteDeck: { isOpen: true, isDeleting: false },
          },
        };
        const newState = reducer(openState, { type: "START_DELETE_DECK" });

        expect(newState.dialogs.deleteDeck.isDeleting).toBe(true);
      });

      it("should clear error when starting deck delete", () => {
        const state = createInitialState(createMockDeck());
        const stateWithError = { ...state, error: "Previous error" };
        const newState = reducer(stateWithError, { type: "START_DELETE_DECK" });

        expect(newState.error).toBeNull();
      });
    });

    describe("Save Flashcard Operation", () => {
      it("should set isSaving flag for both add and edit dialogs", () => {
        const state = createInitialState(createMockDeck());
        const newState = reducer(state, { type: "START_SAVE_FLASHCARD" });

        expect(newState.dialogs.addFlashcard.isSaving).toBe(true);
        expect(newState.dialogs.editFlashcard.isSaving).toBe(true);
      });

      it("should clear error when starting save", () => {
        const state = createInitialState(createMockDeck());
        const stateWithError = { ...state, error: "Previous error" };
        const newState = reducer(stateWithError, { type: "START_SAVE_FLASHCARD" });

        expect(newState.error).toBeNull();
      });

      it("should preserve existing dialog open states when saving", () => {
        const state = createInitialState(createMockDeck());
        const openState = {
          ...state,
          dialogs: {
            ...state.dialogs,
            addFlashcard: { isOpen: true, isSaving: false },
            editFlashcard: { isOpen: false, isSaving: false, flashcard: null },
          },
        };
        const newState = reducer(openState, { type: "START_SAVE_FLASHCARD" });

        expect(newState.dialogs.addFlashcard.isOpen).toBe(true);
        expect(newState.dialogs.editFlashcard.isOpen).toBe(false);
      });
    });

    describe("State Immutability", () => {
      it("should not mutate original state object", () => {
        const state = createInitialState(createMockDeck());
        const originalState = JSON.parse(JSON.stringify(state));
        const newState = reducer(state, { type: "SET_ERROR", payload: "New error" });

        expect(state).toEqual(originalState);
        expect(newState).not.toBe(state);
      });

      it("should not mutate flashcards array when adding", () => {
        const flashcard = createMockFlashcard();
        const state = createInitialState(createMockDeck({ flashcards: [flashcard] }));
        const originalFlashcards = state.deck.flashcards;
        const newFlashcard = createMockFlashcard({ id: "new" });
        const newState = reducer(state, { type: "FINISH_ADD_FLASHCARD", payload: newFlashcard });

        expect(newState.deck.flashcards).not.toBe(originalFlashcards);
        expect(originalFlashcards).toHaveLength(1); // Original unchanged
      });

      it("should not mutate flashcards array when updating", () => {
        const flashcard = createMockFlashcard({ id: "fc-1", front: "Original" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard] }));
        const originalFlashcards = state.deck.flashcards;
        const updatedFlashcard = { ...flashcard, front: "Updated" };
        const newState = reducer(state, { type: "FINISH_UPDATE_FLASHCARD", payload: updatedFlashcard });

        expect(newState.deck.flashcards).not.toBe(originalFlashcards);
        expect(originalFlashcards[0].front).toBe("Original"); // Original unchanged
      });

      it("should not mutate flashcards array when deleting", () => {
        const flashcard1 = createMockFlashcard({ id: "fc-1" });
        const flashcard2 = createMockFlashcard({ id: "fc-2" });
        const state = createInitialState(createMockDeck({ flashcards: [flashcard1, flashcard2] }));
        const originalFlashcards = state.deck.flashcards;
        const newState = reducer(state, { type: "FINISH_DELETE_FLASHCARD", payload: "fc-1" });

        expect(newState.deck.flashcards).not.toBe(originalFlashcards);
        expect(originalFlashcards).toHaveLength(2); // Original unchanged
      });

      it("should not mutate deck object when updating name", () => {
        const state = createInitialState(createMockDeck({ name: "Original" }));
        const originalDeck = state.deck;
        const newState = reducer(state, { type: "FINISH_SAVE_NAME", payload: "Updated" });

        expect(newState.deck).not.toBe(originalDeck);
        expect(originalDeck.name).toBe("Original"); // Original unchanged
      });

      it("should not mutate dialogs object", () => {
        const state = createInitialState(createMockDeck());
        const originalDialogs = state.dialogs;
        const newState = reducer(state, { type: "OPEN_ADD_FLASHCARD_DIALOG" });

        expect(newState.dialogs).not.toBe(originalDialogs);
      });
    });

    describe("Default Case", () => {
      it("should return unchanged state for unknown action", () => {
        const state = createInitialState(createMockDeck());
        // @ts-expect-error - Testing invalid action type
        const newState = reducer(state, { type: "UNKNOWN_ACTION" });

        expect(newState).toBe(state); // Should return same reference
      });
    });
  });

  describe("createInitialState", () => {
    it("should create initial state with provided deck data", () => {
      const deck = createMockDeck({ id: "test-deck", name: "Test Deck Name" });
      const state = createInitialState(deck);

      expect(state.deck).toEqual(deck);
      expect(state.deck.id).toBe("test-deck");
      expect(state.deck.name).toBe("Test Deck Name");
    });

    it("should initialize all dialogs as closed", () => {
      const deck = createMockDeck();
      const state = createInitialState(deck);

      expect(state.dialogs.addFlashcard.isOpen).toBe(false);
      expect(state.dialogs.editFlashcard.isOpen).toBe(false);
      expect(state.dialogs.deleteFlashcard.isOpen).toBe(false);
      expect(state.dialogs.deleteDeck.isOpen).toBe(false);
    });

    it("should initialize all saving/deleting flags as false", () => {
      const deck = createMockDeck();
      const state = createInitialState(deck);

      expect(state.dialogs.addFlashcard.isSaving).toBe(false);
      expect(state.dialogs.editFlashcard.isSaving).toBe(false);
      expect(state.dialogs.deleteFlashcard.isDeleting).toBe(false);
      expect(state.dialogs.deleteDeck.isDeleting).toBe(false);
    });

    it("should initialize all flags as false", () => {
      const deck = createMockDeck();
      const state = createInitialState(deck);

      expect(state.isLoading).toBe(false);
      expect(state.isEditingName).toBe(false);
      expect(state.isSavingName).toBe(false);
    });

    it("should initialize error as null", () => {
      const deck = createMockDeck();
      const state = createInitialState(deck);

      expect(state.error).toBeNull();
    });

    it("should preserve deck flashcards in initial state", () => {
      const flashcard1 = createMockFlashcard({ id: "fc-1" });
      const flashcard2 = createMockFlashcard({ id: "fc-2" });
      const deck = createMockDeck({ flashcards: [flashcard1, flashcard2] });
      const state = createInitialState(deck);

      expect(state.deck.flashcards).toHaveLength(2);
      expect(state.deck.flashcards[0].id).toBe("fc-1");
      expect(state.deck.flashcards[1].id).toBe("fc-2");
    });

    it("should initialize edit flashcard dialog with null flashcard", () => {
      const deck = createMockDeck();
      const state = createInitialState(deck);

      expect(state.dialogs.editFlashcard.flashcard).toBeNull();
    });

    it("should initialize delete flashcard dialog with null flashcardId", () => {
      const deck = createMockDeck();
      const state = createInitialState(deck);

      expect(state.dialogs.deleteFlashcard.flashcardId).toBeNull();
    });

    it("should handle deck with empty flashcards array", () => {
      const deck = createMockDeck({ flashcards: [] });
      const state = createInitialState(deck);

      expect(state.deck.flashcards).toEqual([]);
      expect(state.deck.flashcards).toHaveLength(0);
    });
  });
});
