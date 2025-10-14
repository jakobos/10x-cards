import { Button } from "@/components/ui/button";
import { CandidateFlashcard } from "./CandidateFlashcard";
import type { FlashcardCandidateViewModel } from "@/types";
import { CheckCheck } from "lucide-react";

interface CandidateReviewListProps {
  candidates: FlashcardCandidateViewModel[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * List component displaying all flashcard candidates for review.
 * Allows batch submission of accepted candidates.
 */
export function CandidateReviewList({
  candidates,
  onAccept,
  onReject,
  onEdit,
  onSubmit,
  isSubmitting = false,
}: CandidateReviewListProps) {
  const acceptedCount = candidates.filter((c) => c.status === "accepted").length;
  const hasAccepted = acceptedCount > 0;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wygenerowane propozycje fiszek</h2>
          <p className="text-sm text-muted-foreground">
            Przejrzyj, edytuj i wybierz fiszki do dodania ({acceptedCount} z {candidates.length} zaakceptowanych)
          </p>
        </div>
        <Button onClick={onSubmit} disabled={!hasAccepted || isSubmitting} size="lg" className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <span className="mr-2">Zapisywanie...</span>
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
            </>
          ) : (
            <>
              <CheckCheck className="mr-2 h-5 w-5" />
              Zatwierdź wybrane ({acceptedCount})
            </>
          )}
        </Button>
      </div>

      {/* Candidates list */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {candidates.map((candidate) => (
          <CandidateFlashcard
            key={candidate.id}
            candidate={candidate}
            onAccept={() => onAccept(candidate.id)}
            onReject={() => onReject(candidate.id)}
            onEditRequest={() => onEdit(candidate.id)}
          />
        ))}
      </div>

      {/* Bottom submit button (mobile-friendly) */}
      {candidates.length > 3 && (
        <div className="flex justify-center pt-4">
          <Button onClick={onSubmit} disabled={!hasAccepted || isSubmitting} size="lg" className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <span className="mr-2">Zapisywanie...</span>
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
              </>
            ) : (
              <>
                <CheckCheck className="mr-2 h-5 w-5" />
                Zatwierdź wybrane ({acceptedCount})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
