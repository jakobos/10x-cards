import { useState } from "react";
import { toast } from "sonner";
import { useDecks } from "@/hooks/useDecks";
import type { DeckListItemDto, PaginatedDecksDto } from "@/types";
import { DeckList } from "./DeckList";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { CreateEditDeckDialog } from "./CreateEditDeckDialog";
import { DeleteDeckDialog } from "./DeleteDeckDialog";
import { Button } from "@/components/ui/button";

interface DecksViewProps {
  initialData: PaginatedDecksDto;
  fetchError?: boolean;
}

export default function DecksView({ initialData, fetchError = false }: DecksViewProps) {
  const { decks, isLoading, isSubmitting, error, createDeck, updateDeck, deleteDeck, refetch } = useDecks({
    initialData,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Pick<DeckListItemDto, "id" | "name"> | null>(null);
  const [deletingDeck, setDeletingDeck] = useState<DeckListItemDto | null>(null);

  const handleCreateDeck = async (name: string) => {
    try {
      await createDeck({ name });
      toast.success("Talia została utworzona");
      setIsCreateDialogOpen(false);
    } catch {
      toast.error("Nie udało się utworzyć talii");
    }
  };

  const handleUpdateDeck = async (name: string) => {
    if (!editingDeck) return;
    try {
      await updateDeck(editingDeck.id, { name });
      toast.success("Nazwa talii została zaktualizowana");
      setEditingDeck(null);
    } catch {
      toast.error("Nie udało się zaktualizować nazwy talii");
    }
  };

  const handleDeleteDeck = async () => {
    if (!deletingDeck) return;
    try {
      await deleteDeck(deletingDeck.id);
      toast.success("Talia została usunięta");
      setDeletingDeck(null);
    } catch {
      toast.error("Nie udało się usunąć talii");
    }
  };

  const handleOpenEditDialog = (deck: DeckListItemDto) => {
    setEditingDeck({ id: deck.id, name: deck.name });
  };

  const handleOpenDeleteDialog = (deck: DeckListItemDto) => {
    setDeletingDeck(deck);
  };

  // Error state (server-side or client-side)
  if ((error && !isLoading) || fetchError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
          <p className="text-destructive text-center">Wystąpił błąd podczas ładowania talii.</p>
          <Button onClick={refetch} variant="outline">
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Moje Talie</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Stwórz nową talię</Button>
      </div>

      {/* Content */}
      {decks.length === 0 ? (
        <EmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
      ) : (
        <DeckList decks={decks} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog} />
      )}

      {/* Dialogs */}
      <CreateEditDeckDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateDeck}
        isSubmitting={isSubmitting}
      />

      <CreateEditDeckDialog
        isOpen={editingDeck !== null}
        onClose={() => setEditingDeck(null)}
        onSubmit={handleUpdateDeck}
        initialDeck={editingDeck ?? undefined}
        isSubmitting={isSubmitting}
      />

      <DeleteDeckDialog
        isOpen={deletingDeck !== null}
        onClose={() => setDeletingDeck(null)}
        onConfirm={handleDeleteDeck}
        deck={deletingDeck}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
