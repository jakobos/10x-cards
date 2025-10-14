import { useState, useCallback } from "react";
import type {
  GenerationStep,
  FlashcardCandidateViewModel,
  GenerateFlashcardsCommand,
  GenerateFlashcardsResponseDto,
  BatchCreateFlashcardsCommand,
  BatchCreateFlashcardsResponseDto,
} from "@/types";

interface UseFlashcardGenerationReturn {
  // State
  step: GenerationStep;
  candidates: FlashcardCandidateViewModel[];
  error: string | null;
  candidateToEdit: FlashcardCandidateViewModel | null;

  // Actions
  generateCandidates: (sourceText: string) => Promise<void>;
  acceptCandidate: (id: string) => void;
  rejectCandidate: (id: string) => void;
  openEditDialog: (id: string) => void;
  closeEditDialog: () => void;
  saveCandidateEdit: (id: string, newFront: string, newBack: string) => void;
  submitAcceptedCandidates: () => Promise<void>;
  resetToInput: () => void;
}

/**
 * Custom hook for managing the flashcard generation workflow.
 * Handles the complete lifecycle from text input to saving flashcards.
 */
export function useFlashcardGeneration(deckId: string): UseFlashcardGenerationReturn {
  const [step, setStep] = useState<GenerationStep>("input");
  const [candidates, setCandidates] = useState<FlashcardCandidateViewModel[]>([]);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [candidateToEdit, setCandidateToEdit] = useState<FlashcardCandidateViewModel | null>(null);

  /**
   * Generates flashcard candidates from source text via API.
   */
  const generateCandidates = useCallback(
    async (sourceText: string) => {
      setStep("loading");
      setError(null);

      try {
        const command: GenerateFlashcardsCommand = {
          sourceText,
          deckId,
        };

        const response = await fetch("/api/ai/generate-flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: GenerateFlashcardsResponseDto = await response.json();

        // Map candidates to view models with unique IDs and default status
        const viewModels: FlashcardCandidateViewModel[] = data.candidates.map((candidate) => ({
          ...candidate,
          id: crypto.randomUUID(),
          status: "pending" as const,
          isEdited: false,
        }));

        setGenerationId(data.generationId);
        setCandidates(viewModels);
        setStep("review");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas generowania fiszek");
        setStep("error");
      }
    },
    [deckId]
  );

  /**
   * Marks a candidate as accepted.
   */
  const acceptCandidate = useCallback((id: string) => {
    setCandidates((prev) =>
      prev.map((candidate) => (candidate.id === id ? { ...candidate, status: "accepted" as const } : candidate))
    );
  }, []);

  /**
   * Marks a candidate as rejected.
   */
  const rejectCandidate = useCallback((id: string) => {
    setCandidates((prev) =>
      prev.map((candidate) => (candidate.id === id ? { ...candidate, status: "rejected" as const } : candidate))
    );
  }, []);

  /**
   * Opens the edit dialog for a specific candidate.
   */
  const openEditDialog = useCallback(
    (id: string) => {
      const candidate = candidates.find((c) => c.id === id);
      if (candidate) {
        setCandidateToEdit(candidate);
      }
    },
    [candidates]
  );

  /**
   * Closes the edit dialog.
   */
  const closeEditDialog = useCallback(() => {
    setCandidateToEdit(null);
  }, []);

  /**
   * Saves edits to a candidate and marks it as edited.
   */
  const saveCandidateEdit = useCallback((id: string, newFront: string, newBack: string) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              front: newFront,
              back: newBack,
              isEdited: true,
              status: "accepted" as const, // Auto-accept edited candidates
            }
          : candidate
      )
    );
    setCandidateToEdit(null);
  }, []);

  /**
   * Resets the state back to input step.
   */
  const resetToInput = useCallback(() => {
    setStep("input");
    setCandidates([]);
    setGenerationId(null);
    setError(null);
    setCandidateToEdit(null);
  }, []);

  /**
   * Submits accepted candidates to the API for batch creation.
   */
  const submitAcceptedCandidates = useCallback(async () => {
    if (!generationId) {
      setError("Brak ID generacji");
      setStep("error");
      return;
    }

    const acceptedCandidates = candidates.filter((c) => c.status === "accepted");

    if (acceptedCandidates.length === 0) {
      setError("Musisz zaakceptować przynajmniej jedną fiszkę");
      return;
    }

    setStep("submitting");
    setError(null);

    try {
      const command: BatchCreateFlashcardsCommand = {
        generationId,
        flashcards: acceptedCandidates.map((candidate) => ({
          front: candidate.front,
          back: candidate.back,
          source: candidate.isEdited ? ("ai-edited" as const) : ("ai-full" as const),
        })),
      };

      const response = await fetch(`/api/decks/${deckId}/flashcards/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: BatchCreateFlashcardsResponseDto = await response.json();

      // Reset to input state on successful save
      resetToInput();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania fiszek");
      setStep("error");
    }
  }, [deckId, generationId, candidates, resetToInput]);

  return {
    step,
    candidates,
    error,
    candidateToEdit,
    generateCandidates,
    acceptCandidate,
    rejectCandidate,
    openEditDialog,
    closeEditDialog,
    saveCandidateEdit,
    submitAcceptedCandidates,
    resetToInput,
  };
}
