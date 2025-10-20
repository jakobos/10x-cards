import { useFlashcardGeneration } from "@/hooks/useFlashcardGeneration";
import { SourceTextForm } from "./SourceTextForm";
import { CandidateReviewList } from "./CandidateReviewList";
import { EditCandidateDialog } from "./EditCandidateDialog";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";

interface GenerationClientComponentProps {
  deckId: string;
}

/**
 * Main client component for the flashcard generation workflow.
 * Manages state and renders appropriate UI based on current step.
 */
export function GenerationClientComponent({ deckId }: GenerationClientComponentProps) {
  const {
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
  } = useFlashcardGeneration(deckId);

  // Render based on current step
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Input step: Source text form */}
      {step === "input" && (
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Generuj fiszki AI</h1>
            <p className="text-muted-foreground">
              Wklej tekst, z którego chcesz automatycznie wygenerować fiszki. Sztuczna inteligencja zaproponuje fiszki,
              które będziesz mógł przejrzeć i edytować przed zapisaniem.
            </p>
          </div>
          <SourceTextForm isLoading={false} onSubmit={generateCandidates} />
        </div>
      )}

      {/* Loading step: Generating candidates */}
      {step === "loading" && <LoadingSpinner message="Generowanie propozycji fiszek..." />}

      {/* Review step: Review and edit candidates */}
      {step === "review" && (
        <>
          <CandidateReviewList
            candidates={candidates}
            onAccept={acceptCandidate}
            onReject={rejectCandidate}
            onEdit={openEditDialog}
            onSubmit={submitAcceptedCandidates}
            isSubmitting={false}
          />
          <EditCandidateDialog
            isOpen={candidateToEdit !== null}
            candidate={candidateToEdit}
            onSave={saveCandidateEdit}
            onClose={closeEditDialog}
          />
        </>
      )}

      {/* Submitting step: Saving flashcards */}
      {step === "submitting" && (
        <>
          <CandidateReviewList
            candidates={candidates}
            onAccept={acceptCandidate}
            onReject={rejectCandidate}
            onEdit={openEditDialog}
            onSubmit={submitAcceptedCandidates}
            isSubmitting={true}
          />
          <EditCandidateDialog
            isOpen={candidateToEdit !== null}
            candidate={candidateToEdit}
            onSave={saveCandidateEdit}
            onClose={closeEditDialog}
          />
        </>
      )}

      {/* Error step: Display error with retry option */}
      {step === "error" && error && <ErrorDisplay error={error} onRetry={resetToInput} />}
    </div>
  );
}
