import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

/**
 * Error display component with user-friendly messages and retry option.
 * Handles different error types based on error message content.
 */
export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  // Determine error type and provide appropriate title and description
  const getErrorDetails = () => {
    const errorLower = error.toLowerCase();

    if (errorLower.includes("401") || errorLower.includes("unauthorized") || errorLower.includes("autoryzacji")) {
      return {
        title: "Brak autoryzacji",
        description: "Twoja sesja mogła wygasnąć. Zaloguj się ponownie.",
        showRetry: false,
      };
    }

    if (errorLower.includes("404") || errorLower.includes("not found") || errorLower.includes("nie znaleziono")) {
      return {
        title: "Nie znaleziono talii",
        description: "Talia, do której próbujesz dodać fiszki, nie istnieje lub została usunięta.",
        showRetry: false,
      };
    }

    if (errorLower.includes("429") || errorLower.includes("rate limit") || errorLower.includes("limit")) {
      return {
        title: "Przekroczono limit zapytań",
        description: "Wykonano zbyt wiele zapytań do AI. Spróbuj ponownie za kilka minut.",
        showRetry: true,
      };
    }

    if (errorLower.includes("400") || errorLower.includes("validation") || errorLower.includes("walidacji")) {
      return {
        title: "Nieprawidłowe dane",
        description: error,
        showRetry: true,
      };
    }

    if (errorLower.includes("500") || errorLower.includes("server error")) {
      return {
        title: "Błąd serwera",
        description: "Wystąpił problem po stronie serwera. Spróbuj ponownie za chwilę.",
        showRetry: true,
      };
    }

    if (errorLower.includes("network") || errorLower.includes("fetch") || errorLower.includes("połączenia")) {
      return {
        title: "Błąd połączenia",
        description: "Nie można połączyć się z serwerem. Sprawdź swoje połączenie internetowe.",
        showRetry: true,
      };
    }

    // Default error
    return {
      title: "Wystąpił błąd",
      description: error,
      showRetry: true,
    };
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-6 px-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
      </div>
      
      <div className="max-w-md space-y-2 text-center">
        <h3 className="text-xl font-semibold">{errorDetails.title}</h3>
        <p className="text-sm text-muted-foreground">{errorDetails.description}</p>
      </div>

      {errorDetails.showRetry && (
        <Button onClick={onRetry} variant="outline" size="lg">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Spróbuj ponownie
        </Button>
      )}
    </div>
  );
}

