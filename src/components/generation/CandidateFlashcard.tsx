import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FlashcardCandidateViewModel } from "@/types";
import { Check, X, Pencil } from "lucide-react";

interface CandidateFlashcardProps {
  candidate: FlashcardCandidateViewModel;
  onAccept: () => void;
  onReject: () => void;
  onEditRequest: () => void;
}

/**
 * Card component displaying a single flashcard candidate.
 * Visual appearance changes based on candidate status.
 */
export function CandidateFlashcard({ candidate, onAccept, onReject, onEditRequest }: CandidateFlashcardProps) {
  const { front, back, status, isEdited } = candidate;

  // Determine card styling based on status
  const getCardClassName = () => {
    const baseClass = "transition-all duration-200";
    switch (status) {
      case "accepted":
        return `${baseClass} border-green-500 bg-green-50 dark:bg-green-950/20`;
      case "rejected":
        return `${baseClass} border-red-300 bg-red-50/50 dark:bg-red-950/10 opacity-60`;
      case "pending":
      default:
        return `${baseClass} hover:border-primary/50`;
    }
  };

  return (
    <Card className={getCardClassName()}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-muted-foreground">Przód fiszki</h4>
          {isEdited && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Edytowano
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="rounded-md bg-background p-3">
          <p className="text-sm leading-relaxed">{front}</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Tył fiszki</h4>
          <div className="rounded-md bg-background p-3">
            <p className="text-sm leading-relaxed">{back}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-2">
        {status === "accepted" ? (
          <Button onClick={onReject} variant="outline" size="sm" className="flex-1 sm:flex-initial">
            <X className="mr-1 h-4 w-4" />
            Cofnij akceptację
          </Button>
        ) : status === "rejected" ? (
          <Button onClick={onAccept} variant="outline" size="sm" className="flex-1 sm:flex-initial">
            <Check className="mr-1 h-4 w-4" />
            Przywróć
          </Button>
        ) : (
          <>
            <Button onClick={onAccept} variant="default" size="sm" className="flex-1 sm:flex-initial">
              <Check className="mr-1 h-4 w-4" />
              Akceptuj
            </Button>
            <Button onClick={onReject} variant="outline" size="sm" className="flex-1 sm:flex-initial">
              <X className="mr-1 h-4 w-4" />
              Odrzuć
            </Button>
          </>
        )}
        <Button onClick={onEditRequest} variant="outline" size="sm" className="flex-1 sm:flex-initial">
          <Pencil className="mr-1 h-4 w-4" />
          Edytuj
        </Button>
      </CardFooter>
    </Card>
  );
}
