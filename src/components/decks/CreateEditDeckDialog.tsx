import { useState, useEffect } from "react";
import type { DeckListItemDto } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CreateEditDeckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  initialDeck?: Pick<DeckListItemDto, "id" | "name">;
  isSubmitting: boolean;
}

export function CreateEditDeckDialog({
  isOpen,
  onClose,
  onSubmit,
  initialDeck,
  isSubmitting,
}: CreateEditDeckDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const isEditMode = initialDeck !== undefined;

  // Reset form when dialog opens/closes or initialDeck changes
  useEffect(() => {
    if (isOpen) {
      setName(initialDeck?.name ?? "");
      setError("");
    }
  }, [isOpen, initialDeck]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Nazwa talii nie może być pusta");
      return;
    }

    setError("");
    await onSubmit(trimmedName);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edytuj nazwę talii" : "Stwórz nową talię"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Wprowadź nową nazwę dla talii" : "Wprowadź nazwę dla nowej talii"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deck-name">Nazwa talii</Label>
              <Input
                id="deck-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="np. Angielski - podstawy"
                disabled={isSubmitting}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Zapisywanie..." : isEditMode ? "Zapisz" : "Utwórz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
