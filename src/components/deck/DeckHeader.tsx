import { useState } from "react";
import type { DeckDetailsDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PencilIcon, TrashIcon, PlusIcon, SparklesIcon } from "lucide-react";

interface DeckHeaderProps {
  deck: Pick<DeckDetailsDto, "id" | "name">;
  isEditing: boolean;
  isSaving: boolean;
  onEditToggle: () => void;
  onCancelEdit: () => void;
  onSaveName: (newName: string) => Promise<void>;
  onDeleteDeck: () => void;
  onAddFlashcard: () => void;
}

export function DeckHeader({
  deck,
  isEditing,
  isSaving,
  onEditToggle,
  onCancelEdit,
  onSaveName,
  onDeleteDeck,
  onAddFlashcard,
}: DeckHeaderProps) {
  const [nameValue, setNameValue] = useState(deck.name);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleStartEdit = () => {
    setNameValue(deck.name);
    setLocalError(null);
    onEditToggle();
  };

  const handleCancelEdit = () => {
    setNameValue(deck.name);
    setLocalError(null);
    onCancelEdit();
  };

  const handleSaveName = async () => {
    // Validation
    const trimmedName = nameValue.trim();
    if (!trimmedName) {
      setLocalError("Nazwa talii nie może być pusta");
      return;
    }

    if (trimmedName === deck.name) {
      // No change, just cancel edit mode
      handleCancelEdit();
      return;
    }

    try {
      await onSaveName(trimmedName);
      setLocalError(null);
    } catch (error) {
      // Error is already handled by the hook, but we keep local error for immediate feedback
      setLocalError(error instanceof Error ? error.message : "Nie udało się zapisać nazwy");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="mb-8">
      {/* Title and Edit Section */}
      <div className="mb-6">
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-3xl font-bold h-auto py-2"
                placeholder="Nazwa talii"
                disabled={isSaving}
                aria-invalid={!!localError}
              />
              <Button onClick={handleSaveName} disabled={isSaving || !nameValue.trim()} size="lg">
                {isSaving ? "Zapisywanie..." : "Zapisz"}
              </Button>
              <Button onClick={handleCancelEdit} disabled={isSaving} variant="outline" size="lg">
                Anuluj
              </Button>
            </div>
            {localError && <p className="text-sm text-destructive">{localError}</p>}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            <div className="flex gap-2">
              <Button onClick={handleStartEdit} variant="outline" size="sm">
                <PencilIcon />
                Edytuj nazwę
              </Button>
              <Button onClick={onDeleteDeck} variant="destructive" size="sm">
                <TrashIcon />
                Usuń talię
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onAddFlashcard} size="lg" disabled={isEditing}>
          <PlusIcon />
          Dodaj fiszkę
        </Button>
        <Button
          onClick={() => (window.location.href = `/app/decks/${deck.id}/generate`)}
          variant="secondary"
          size="lg"
          disabled={isEditing}
        >
          <SparklesIcon />
          Generuj z AI
        </Button>
      </div>
    </div>
  );
}
