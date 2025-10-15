import type { DeckDetailsDto, UpdateFlashcardCommand, CreateFlashcardCommand } from "@/types";
import { useDeckDetails } from "@/hooks/useDeckDetails";
import { DeckHeader } from "./DeckHeader";
import { FlashcardList } from "./FlashcardList";
import { FlashcardFormDialog } from "./FlashcardFormDialog";
import { DeleteConfirmationDialog } from "@/components/shared/DeleteConfirmationDialog";

interface DeckDetailsViewProps {
  initialData: DeckDetailsDto;
}

export function DeckDetailsView({ initialData }: DeckDetailsViewProps) {
  const { state, actions } = useDeckDetails(initialData);

  return (
    <div className="container mx-auto max-w-6xl p-6">
      {/* Error display */}
      {state.error && (
        <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">{state.error}</p>
        </div>
      )}

      {/* Deck Header */}
      <DeckHeader
        deck={state.deck}
        isEditing={state.isEditingName}
        isSaving={state.isSavingName}
        onEditToggle={actions.startEditName}
        onCancelEdit={actions.cancelEditName}
        onSaveName={actions.saveDeckName}
        onDeleteDeck={actions.openDeleteDeckDialog}
        onAddFlashcard={actions.openAddFlashcardDialog}
      />

      {/* Flashcard List */}
      <FlashcardList
        flashcards={state.deck.flashcards}
        onEditFlashcard={actions.openEditFlashcardDialog}
        onDeleteFlashcard={actions.openDeleteFlashcardDialog}
      />

      {/* Add Flashcard Dialog */}
      <FlashcardFormDialog
        isOpen={state.dialogs.addFlashcard.isOpen}
        isSaving={state.dialogs.addFlashcard.isSaving}
        onClose={actions.closeAddFlashcardDialog}
        onSave={(command) => actions.createFlashcard(command as CreateFlashcardCommand)}
      />

      {/* Edit Flashcard Dialog */}
      {state.dialogs.editFlashcard.flashcard && (
        <FlashcardFormDialog
          isOpen={state.dialogs.editFlashcard.isOpen}
          isSaving={state.dialogs.editFlashcard.isSaving}
          initialData={state.dialogs.editFlashcard.flashcard}
          onClose={actions.closeEditFlashcardDialog}
          onSave={(command: UpdateFlashcardCommand) => {
            const flashcard = state.dialogs.editFlashcard.flashcard;
            if (flashcard) {
              return actions.updateFlashcard(flashcard.id, command);
            }
            return Promise.resolve();
          }}
        />
      )}

      {/* Delete Flashcard Dialog */}
      <DeleteConfirmationDialog
        isOpen={state.dialogs.deleteFlashcard.isOpen}
        isDeleting={state.dialogs.deleteFlashcard.isDeleting}
        title="Usuń fiszkę"
        description="Czy na pewno chcesz usunąć tę fiszkę? Ta operacja jest nieodwracalna."
        onClose={actions.closeDeleteFlashcardDialog}
        onConfirm={() => {
          if (state.dialogs.deleteFlashcard.flashcardId) {
            actions.deleteFlashcard(state.dialogs.deleteFlashcard.flashcardId);
          }
        }}
      />

      {/* Delete Deck Dialog */}
      <DeleteConfirmationDialog
        isOpen={state.dialogs.deleteDeck.isOpen}
        isDeleting={state.dialogs.deleteDeck.isDeleting}
        title="Usuń talię"
        description="Czy na pewno chcesz usunąć całą talię wraz ze wszystkimi fiszkami? Ta operacja jest nieodwracalna."
        onClose={actions.closeDeleteDeckDialog}
        onConfirm={actions.deleteDeck}
      />
    </div>
  );
}
