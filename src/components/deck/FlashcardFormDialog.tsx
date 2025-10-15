import { useState, useEffect } from "react";
import type { FlashcardSummaryDto, CreateFlashcardCommand, UpdateFlashcardCommand } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MAX_FLASHCARD_FRONT_LENGTH, MAX_FLASHCARD_BACK_LENGTH } from "@/lib/constants";

interface FlashcardFormDialogProps {
  isOpen: boolean;
  isSaving: boolean;
  initialData?: FlashcardSummaryDto;
  onClose: () => void;
  onSave: (command: CreateFlashcardCommand | UpdateFlashcardCommand) => Promise<void>;
}

export function FlashcardFormDialog({ isOpen, isSaving, initialData, onClose, onSave }: FlashcardFormDialogProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const isEditMode = !!initialData;

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFront(initialData?.front || "");
      setBack(initialData?.back || "");
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: { front?: string; back?: string } = {};

    const trimmedFront = front.trim();
    const trimmedBack = back.trim();

    if (!trimmedFront) {
      newErrors.front = "Przód fiszki jest wymagany";
    } else if (trimmedFront.length > MAX_FLASHCARD_FRONT_LENGTH) {
      newErrors.front = `Przód fiszki nie może przekraczać ${MAX_FLASHCARD_FRONT_LENGTH} znaków`;
    }

    if (!trimmedBack) {
      newErrors.back = "Tył fiszki jest wymagany";
    } else if (trimmedBack.length > MAX_FLASHCARD_BACK_LENGTH) {
      newErrors.back = `Tył fiszki nie może przekraczać ${MAX_FLASHCARD_BACK_LENGTH} znaków`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        const command: UpdateFlashcardCommand = {
          front: front.trim(),
          back: back.trim(),
        };
        await onSave(command);
      } else {
        const command: CreateFlashcardCommand = {
          front: front.trim(),
          back: back.trim(),
          source: "manual",
        };
        await onSave(command);
      }
    } catch {
      // Error is handled by the hook - no need to log here
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  const isFormValid =
    front.trim().length > 0 &&
    back.trim().length > 0 &&
    front.length <= MAX_FLASHCARD_FRONT_LENGTH &&
    back.length <= MAX_FLASHCARD_BACK_LENGTH;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edytuj fiszkę" : "Dodaj nową fiszkę"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Wprowadź zmiany w treści fiszki." : "Wypełnij formularz, aby stworzyć nową fiszkę."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Front field */}
          <div className="space-y-2">
            <Label htmlFor="flashcard-front">
              Przód fiszki <span className="text-destructive">*</span>
            </Label>
            <Input
              id="flashcard-front"
              type="text"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Wpisz pytanie lub termin"
              disabled={isSaving}
              aria-invalid={!!errors.front}
            />
            <div className="flex justify-between items-center">
              {errors.front && <p className="text-sm text-destructive">{errors.front}</p>}
              <p
                className={`text-sm ml-auto ${front.length > MAX_FLASHCARD_FRONT_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
              >
                {front.length}/{MAX_FLASHCARD_FRONT_LENGTH}
              </p>
            </div>
          </div>

          {/* Back field */}
          <div className="space-y-2">
            <Label htmlFor="flashcard-back">
              Tył fiszki <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="flashcard-back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Wpisz odpowiedź lub definicję"
              disabled={isSaving}
              aria-invalid={!!errors.back}
              rows={4}
            />
            <div className="flex justify-between items-center">
              {errors.back && <p className="text-sm text-destructive">{errors.back}</p>}
              <p
                className={`text-sm ml-auto ${back.length > MAX_FLASHCARD_BACK_LENGTH ? "text-destructive" : "text-muted-foreground"}`}
              >
                {back.length}/{MAX_FLASHCARD_BACK_LENGTH}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} disabled={isSaving} variant="outline">
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid || isSaving}>
            {isSaving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
