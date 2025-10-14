import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

/**
 * Loading spinner component with optional message.
 * Displayed during AI flashcard generation.
 */
export function LoadingSpinner({ message = "Generowanie fiszek..." }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
      <div className="text-center">
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">To może potrwać kilka sekund</p>
      </div>
    </div>
  );
}

