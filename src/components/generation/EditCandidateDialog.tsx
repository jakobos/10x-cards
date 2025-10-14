import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardCandidateViewModel } from "@/types";

interface EditCandidateDialogProps {
  isOpen: boolean;
  candidate: FlashcardCandidateViewModel | null;
  onSave: (id: string, newFront: string, newBack: string) => void;
  onClose: () => void;
}

const FRONT_MAX_LENGTH = 200;
const BACK_MAX_LENGTH = 500;

/**
 * Dialog for editing a flashcard candidate's front and back text.
 * Validates text length and disables save button if invalid.
 */
export function EditCandidateDialog({ isOpen, candidate, onSave, onClose }: EditCandidateDialogProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  // Update local state when candidate changes
  useEffect(() => {
    if (candidate) {
      setFront(candidate.front);
      setBack(candidate.back);
    }
  }, [candidate]);

  // Validation
  const isFrontValid = front.trim().length > 0 && front.length <= FRONT_MAX_LENGTH;
  const isBackValid = back.trim().length > 0 && back.length <= BACK_MAX_LENGTH;
  const canSave = isFrontValid && isBackValid;

  const handleSave = () => {
    if (candidate && canSave) {
      onSave(candidate.id, front.trim(), back.trim());
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setFront("");
    setBack("");
  };

  // Validation helpers
  const getFrontValidation = () => {
    if (front.trim().length === 0) {
      return { message: "Przód fiszki nie może być pusty", isError: true };
    }
    if (front.length > FRONT_MAX_LENGTH) {
      return {
        message: `Zbyt długi (${front.length}/${FRONT_MAX_LENGTH})`,
        isError: true,
      };
    }
    return {
      message: `${front.length}/${FRONT_MAX_LENGTH}`,
      isError: false,
    };
  };

  const getBackValidation = () => {
    if (back.trim().length === 0) {
      return { message: "Tył fiszki nie może być pusty", isError: true };
    }
    if (back.length > BACK_MAX_LENGTH) {
      return {
        message: `Zbyt długi (${back.length}/${BACK_MAX_LENGTH})`,
        isError: true,
      };
    }
    return {
      message: `${back.length}/${BACK_MAX_LENGTH}`,
      isError: false,
    };
  };

  const frontValidation = getFrontValidation();
  const backValidation = getBackValidation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
          <DialogDescription>
            Wprowadź zmiany w treści fiszki. Fiszka zostanie automatycznie zaakceptowana po zapisaniu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Front field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="edit-front" className="text-sm font-medium leading-none">
                Przód fiszki
              </label>
              <span className={`text-sm ${frontValidation.isError ? "text-destructive" : "text-muted-foreground"}`}>
                {frontValidation.message}
              </span>
            </div>
            <Textarea
              id="edit-front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="min-h-[100px] resize-y"
              aria-describedby="front-validation"
            />
          </div>

          {/* Back field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="edit-back" className="text-sm font-medium leading-none">
                Tył fiszki
              </label>
              <span className={`text-sm ${backValidation.isError ? "text-destructive" : "text-muted-foreground"}`}>
                {backValidation.message}
              </span>
            </div>
            <Textarea
              id="edit-back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="min-h-[150px] resize-y"
              aria-describedby="back-validation"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
