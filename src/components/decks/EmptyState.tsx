import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[400px] border-2 border-dashed rounded-lg">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Nie masz jeszcze żadnych talii</h2>
        <p className="text-muted-foreground">Stwórz swoją pierwszą talię, aby rozpocząć naukę</p>
      </div>
      <Button onClick={onCreateClick} size="lg" data-testid="create-deck-button-empty">
        Stwórz nową talię
      </Button>
    </div>
  );
}
