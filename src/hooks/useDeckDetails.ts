import { useReducer, useCallback } from "react";
import type {
  DeckDetailsDto,
  FlashcardSummaryDto,
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  UpdateDeckCommand,
} from "@/types";

export interface DeckDetailsViewState {
  deck: DeckDetailsDto;
  isLoading: boolean;
  error: string | null;
  isEditingName: boolean;
  isSavingName: boolean;
  dialogs: {
    addFlashcard: { isOpen: boolean; isSaving: boolean };
    editFlashcard: { isOpen: boolean; isSaving: boolean; flashcard: FlashcardSummaryDto | null };
    deleteFlashcard: { isOpen: boolean; isDeleting: boolean; flashcardId: string | null };
    deleteDeck: { isOpen: boolean; isDeleting: boolean };
  };
}

export type Action =
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "START_EDIT_NAME" }
  | { type: "CANCEL_EDIT_NAME" }
  | { type: "START_SAVE_NAME" }
  | { type: "FINISH_SAVE_NAME"; payload: string }
  | { type: "OPEN_ADD_FLASHCARD_DIALOG" }
  | { type: "CLOSE_ADD_FLASHCARD_DIALOG" }
  | { type: "START_SAVE_FLASHCARD" }
  | { type: "FINISH_ADD_FLASHCARD"; payload: FlashcardSummaryDto }
  | { type: "OPEN_EDIT_FLASHCARD_DIALOG"; payload: FlashcardSummaryDto }
  | { type: "CLOSE_EDIT_FLASHCARD_DIALOG" }
  | { type: "FINISH_UPDATE_FLASHCARD"; payload: FlashcardSummaryDto }
  | { type: "OPEN_DELETE_FLASHCARD_DIALOG"; payload: string }
  | { type: "CLOSE_DELETE_FLASHCARD_DIALOG" }
  | { type: "START_DELETE_FLASHCARD" }
  | { type: "FINISH_DELETE_FLASHCARD"; payload: string }
  | { type: "OPEN_DELETE_DECK_DIALOG" }
  | { type: "CLOSE_DELETE_DECK_DIALOG" }
  | { type: "START_DELETE_DECK" };

export function reducer(state: DeckDetailsViewState, action: Action): DeckDetailsViewState {
  switch (action.type) {
    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "START_EDIT_NAME":
      return { ...state, isEditingName: true };

    case "CANCEL_EDIT_NAME":
      return { ...state, isEditingName: false };

    case "START_SAVE_NAME":
      return { ...state, isSavingName: true, error: null };

    case "FINISH_SAVE_NAME":
      return {
        ...state,
        deck: { ...state.deck, name: action.payload },
        isSavingName: false,
        isEditingName: false,
      };

    case "OPEN_ADD_FLASHCARD_DIALOG":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          addFlashcard: { isOpen: true, isSaving: false },
        },
      };

    case "CLOSE_ADD_FLASHCARD_DIALOG":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          addFlashcard: { isOpen: false, isSaving: false },
        },
      };

    case "START_SAVE_FLASHCARD":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          addFlashcard: { ...state.dialogs.addFlashcard, isSaving: true },
          editFlashcard: { ...state.dialogs.editFlashcard, isSaving: true },
        },
        error: null,
      };

    case "FINISH_ADD_FLASHCARD":
      return {
        ...state,
        deck: {
          ...state.deck,
          flashcards: [action.payload, ...state.deck.flashcards],
        },
        dialogs: {
          ...state.dialogs,
          addFlashcard: { isOpen: false, isSaving: false },
        },
      };

    case "OPEN_EDIT_FLASHCARD_DIALOG":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          editFlashcard: { isOpen: true, isSaving: false, flashcard: action.payload },
        },
      };

    case "CLOSE_EDIT_FLASHCARD_DIALOG":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          editFlashcard: { isOpen: false, isSaving: false, flashcard: null },
        },
      };

    case "FINISH_UPDATE_FLASHCARD":
      return {
        ...state,
        deck: {
          ...state.deck,
          flashcards: state.deck.flashcards.map((fc) => (fc.id === action.payload.id ? action.payload : fc)),
        },
        dialogs: {
          ...state.dialogs,
          editFlashcard: { isOpen: false, isSaving: false, flashcard: null },
        },
      };

    case "OPEN_DELETE_FLASHCARD_DIALOG":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          deleteFlashcard: { isOpen: true, isDeleting: false, flashcardId: action.payload },
        },
      };

    case "CLOSE_DELETE_FLASHCARD_DIALOG":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          deleteFlashcard: { isOpen: false, isDeleting: false, flashcardId: null },
        },
      };

    case "START_DELETE_FLASHCARD":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          deleteFlashcard: { ...state.dialogs.deleteFlashcard, isDeleting: true },
        },
        error: null,
      };

    case "FINISH_DELETE_FLASHCARD":
      return {
        ...state,
        deck: {
          ...state.deck,
          flashcards: state.deck.flashcards.filter((fc) => fc.id !== action.payload),
        },
        dialogs: {
          ...state.dialogs,
          deleteFlashcard: { isOpen: false, isDeleting: false, flashcardId: null },
        },
      };

    case "OPEN_DELETE_DECK_DIALOG":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          deleteDeck: { isOpen: true, isDeleting: false },
        },
      };

    case "CLOSE_DELETE_DECK_DIALOG":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          deleteDeck: { isOpen: false, isDeleting: false },
        },
      };

    case "START_DELETE_DECK":
      return {
        ...state,
        dialogs: {
          ...state.dialogs,
          deleteDeck: { ...state.dialogs.deleteDeck, isDeleting: true },
        },
        error: null,
      };

    default:
      return state;
  }
}

export function createInitialState(initialData: DeckDetailsDto): DeckDetailsViewState {
  return {
    deck: initialData,
    isLoading: false,
    error: null,
    isEditingName: false,
    isSavingName: false,
    dialogs: {
      addFlashcard: { isOpen: false, isSaving: false },
      editFlashcard: { isOpen: false, isSaving: false, flashcard: null },
      deleteFlashcard: { isOpen: false, isDeleting: false, flashcardId: null },
      deleteDeck: { isOpen: false, isDeleting: false },
    },
  };
}

export function useDeckDetails(initialData: DeckDetailsDto) {
  const [state, dispatch] = useReducer(reducer, initialData, createInitialState);

  // Deck name actions
  const startEditName = useCallback(() => {
    dispatch({ type: "START_EDIT_NAME" });
  }, []);

  const cancelEditName = useCallback(() => {
    dispatch({ type: "CANCEL_EDIT_NAME" });
  }, []);

  const saveDeckName = useCallback(
    async (newName: string) => {
      dispatch({ type: "START_SAVE_NAME" });

      try {
        const command: UpdateDeckCommand = { name: newName };
        const response = await fetch(`/api/decks/${state.deck.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to update deck name" }));
          throw new Error(errorData.error || "Failed to update deck name");
        }

        dispatch({ type: "FINISH_SAVE_NAME", payload: newName });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update deck name";
        dispatch({ type: "SET_ERROR", payload: message });
        dispatch({ type: "CANCEL_EDIT_NAME" });
        throw error;
      }
    },
    [state.deck.id]
  );

  // Flashcard CRUD actions
  const openAddFlashcardDialog = useCallback(() => {
    dispatch({ type: "OPEN_ADD_FLASHCARD_DIALOG" });
  }, []);

  const closeAddFlashcardDialog = useCallback(() => {
    dispatch({ type: "CLOSE_ADD_FLASHCARD_DIALOG" });
  }, []);

  const createFlashcard = useCallback(
    async (command: CreateFlashcardCommand) => {
      dispatch({ type: "START_SAVE_FLASHCARD" });

      try {
        const response = await fetch(`/api/decks/${state.deck.id}/flashcards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to create flashcard" }));
          throw new Error(errorData.error || "Failed to create flashcard");
        }

        const data = await response.json();
        const newFlashcard: FlashcardSummaryDto = {
          id: data.id,
          front: data.front,
          back: data.back,
          source: data.source,
          createdAt: data.createdAt,
        };

        dispatch({ type: "FINISH_ADD_FLASHCARD", payload: newFlashcard });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create flashcard";
        dispatch({ type: "SET_ERROR", payload: message });
        dispatch({ type: "CLOSE_ADD_FLASHCARD_DIALOG" });
        throw error;
      }
    },
    [state.deck.id]
  );

  const openEditFlashcardDialog = useCallback((flashcard: FlashcardSummaryDto) => {
    dispatch({ type: "OPEN_EDIT_FLASHCARD_DIALOG", payload: flashcard });
  }, []);

  const closeEditFlashcardDialog = useCallback(() => {
    dispatch({ type: "CLOSE_EDIT_FLASHCARD_DIALOG" });
  }, []);

  const updateFlashcard = useCallback(
    async (flashcardId: string, command: UpdateFlashcardCommand) => {
      dispatch({ type: "START_SAVE_FLASHCARD" });

      try {
        const response = await fetch(`/api/flashcards/${flashcardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to update flashcard" }));
          throw new Error(errorData.error || "Failed to update flashcard");
        }

        const data = await response.json();
        const updatedFlashcard: FlashcardSummaryDto = {
          id: data.id,
          front: data.front,
          back: data.back,
          source: data.source,
          createdAt: state.deck.flashcards.find((fc) => fc.id === flashcardId)?.createdAt || new Date().toISOString(),
        };

        dispatch({ type: "FINISH_UPDATE_FLASHCARD", payload: updatedFlashcard });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update flashcard";
        dispatch({ type: "SET_ERROR", payload: message });
        dispatch({ type: "CLOSE_EDIT_FLASHCARD_DIALOG" });
        throw error;
      }
    },
    [state.deck.flashcards]
  );

  const openDeleteFlashcardDialog = useCallback((flashcardId: string) => {
    dispatch({ type: "OPEN_DELETE_FLASHCARD_DIALOG", payload: flashcardId });
  }, []);

  const closeDeleteFlashcardDialog = useCallback(() => {
    dispatch({ type: "CLOSE_DELETE_FLASHCARD_DIALOG" });
  }, []);

  const deleteFlashcard = useCallback(async (flashcardId: string) => {
    dispatch({ type: "START_DELETE_FLASHCARD" });

    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete flashcard" }));
        throw new Error(errorData.error || "Failed to delete flashcard");
      }

      dispatch({ type: "FINISH_DELETE_FLASHCARD", payload: flashcardId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete flashcard";
      dispatch({ type: "SET_ERROR", payload: message });
      dispatch({ type: "CLOSE_DELETE_FLASHCARD_DIALOG" });
      throw error;
    }
  }, []);

  // Deck delete actions
  const openDeleteDeckDialog = useCallback(() => {
    dispatch({ type: "OPEN_DELETE_DECK_DIALOG" });
  }, []);

  const closeDeleteDeckDialog = useCallback(() => {
    dispatch({ type: "CLOSE_DELETE_DECK_DIALOG" });
  }, []);

  const deleteDeck = useCallback(async () => {
    dispatch({ type: "START_DELETE_DECK" });

    try {
      const response = await fetch(`/api/decks/${state.deck.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete deck" }));
        throw new Error(errorData.error || "Failed to delete deck");
      }

      // Redirect to decks list after successful deletion
      window.location.href = "/app/decks";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete deck";
      dispatch({ type: "SET_ERROR", payload: message });
      dispatch({ type: "CLOSE_DELETE_DECK_DIALOG" });
      throw error;
    }
  }, [state.deck.id]);

  return {
    state,
    actions: {
      startEditName,
      cancelEditName,
      saveDeckName,
      openAddFlashcardDialog,
      closeAddFlashcardDialog,
      createFlashcard,
      openEditFlashcardDialog,
      closeEditFlashcardDialog,
      updateFlashcard,
      openDeleteFlashcardDialog,
      closeDeleteFlashcardDialog,
      deleteFlashcard,
      openDeleteDeckDialog,
      closeDeleteDeckDialog,
      deleteDeck,
    },
  };
}
