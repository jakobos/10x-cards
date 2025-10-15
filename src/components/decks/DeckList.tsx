import type { DeckListItemDto } from "@/types";
import { DeckCard } from "./DeckCard";

interface DeckListProps {
  decks: DeckListItemDto[];
  onEdit: (deck: DeckListItemDto) => void;
  onDelete: (deck: DeckListItemDto) => void;
}

export function DeckList({ decks, onEdit, onDelete }: DeckListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
