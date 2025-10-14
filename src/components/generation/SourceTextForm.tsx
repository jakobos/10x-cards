import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SourceTextFormProps {
  isLoading: boolean;
  onSubmit: (sourceText: string) => void;
}

const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

/**
 * Form for inputting source text to generate flashcards.
 * Validates text length and displays character count.
 */
export function SourceTextForm({ isLoading, onSubmit }: SourceTextFormProps) {
  const [sourceText, setSourceText] = useState("");

  const charCount = sourceText.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;
  const canSubmit = isValid && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(sourceText);
    }
  };

  // Determine validation message and styling
  const getValidationInfo = () => {
    if (charCount === 0) {
      return {
        message: `Wprowadź tekst (min. ${MIN_LENGTH} znaków)`,
        className: "text-muted-foreground",
      };
    }
    if (charCount < MIN_LENGTH) {
      return {
        message: `Zbyt krótki tekst. Wymagane jeszcze ${MIN_LENGTH - charCount} znaków`,
        className: "text-destructive",
      };
    }
    if (charCount > MAX_LENGTH) {
      return {
        message: `Zbyt długi tekst. Usuń ${charCount - MAX_LENGTH} znaków`,
        className: "text-destructive",
      };
    }
    return {
      message: `Długość tekstu jest poprawna`,
      className: "text-green-600 dark:text-green-500",
    };
  };

  const validationInfo = getValidationInfo();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="source-text"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Tekst źródłowy
          </label>
          <span className={`text-sm ${validationInfo.className}`}>
            {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </span>
        </div>
        <Textarea
          id="source-text"
          placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          disabled={isLoading}
          className="h-[300px] resize-none"
          aria-describedby="validation-message"
        />
        <p id="validation-message" className={`text-sm ${validationInfo.className}`}>
          {validationInfo.message}
        </p>
      </div>

      <Button type="submit" disabled={!canSubmit} className="w-full sm:w-auto">
        {isLoading && (
          <>
            <span className="mr-2">Generowanie...</span>
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              role="status"
              aria-label="Trwa generowanie"
            />
          </>
        )}
        {!isLoading && "Generuj fiszki"}
      </Button>
    </form>
  );
}
