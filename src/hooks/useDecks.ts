import { useState, useCallback } from "react";
import type {
  DeckListItemDto,
  PaginationDto,
  CreateDeckCommand,
  UpdateDeckCommand,
  PaginatedDecksDto,
  DeckDto,
} from "@/types";

interface UseDecksProps {
  initialData: PaginatedDecksDto;
}

interface UseDecksReturn {
  decks: DeckListItemDto[];
  pagination: PaginationDto | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: Error | null;
  createDeck: (command: CreateDeckCommand) => Promise<void>;
  updateDeck: (deckId: string, command: UpdateDeckCommand) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useDecks({ initialData }: UseDecksProps): UseDecksReturn {
  const [decks, setDecks] = useState<DeckListItemDto[]>(initialData.data);
  const [pagination, setPagination] = useState<PaginationDto | null>(initialData.pagination);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDecks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/decks");

      if (!response.ok) {
        throw new Error(`Failed to fetch decks: ${response.statusText}`);
      }

      const data: PaginatedDecksDto = await response.json();
      setDecks(data.data);
      setPagination(data.pagination);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(error);
      // eslint-disable-next-line no-console
      console.error("Error fetching decks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDeck = useCallback(async (command: CreateDeckCommand) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          typeof errorData === "object" &&
          errorData !== null &&
          "error" in errorData &&
          typeof errorData.error === "string"
            ? errorData.error
            : `Failed to create deck: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const newDeck: DeckDto = await response.json();

      // Add new deck to the local state
      setDecks((prevDecks) => [newDeck, ...prevDecks]);

      // Update pagination
      setPagination((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          totalItems: prev.totalItems + 1,
        };
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(error);
      // eslint-disable-next-line no-console
      console.error("Error creating deck:", error);
      throw error; // Re-throw to allow component to handle
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateDeck = useCallback(async (deckId: string, command: UpdateDeckCommand) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          typeof errorData === "object" &&
          errorData !== null &&
          "error" in errorData &&
          typeof errorData.error === "string"
            ? errorData.error
            : `Failed to update deck: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const updatedDeck = await response.json();

      // Update deck in local state
      setDecks((prevDecks) =>
        prevDecks.map((deck) => (deck.id === deckId ? { ...deck, name: updatedDeck.name } : deck))
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(error);
      // eslint-disable-next-line no-console
      console.error("Error updating deck:", error);
      throw error; // Re-throw to allow component to handle
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteDeck = useCallback(async (deckId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          typeof errorData === "object" &&
          errorData !== null &&
          "error" in errorData &&
          typeof errorData.error === "string"
            ? errorData.error
            : `Failed to delete deck: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Remove deck from local state
      setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));

      // Update pagination
      setPagination((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          totalItems: prev.totalItems - 1,
        };
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error occurred");
      setError(error);
      // eslint-disable-next-line no-console
      console.error("Error deleting deck:", error);
      throw error; // Re-throw to allow component to handle
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    decks,
    pagination,
    isLoading,
    isSubmitting,
    error,
    createDeck,
    updateDeck,
    deleteDeck,
    refetch: fetchDecks,
  };
}
