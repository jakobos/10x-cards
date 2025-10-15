import type { FlashcardSummaryDto } from "@/types";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { formatDate } from "@/lib/helpers";

interface FlashcardListItemProps {
  flashcard: FlashcardSummaryDto;
  onEdit: (flashcard: FlashcardSummaryDto) => void;
  onDelete: (flashcardId: string) => void;
}

const sourceLabels: Record<string, string> = {
  manual: "Ręczna",
  "ai-full": "AI (pełna)",
  "ai-edited": "AI (edytowana)",
};

export function FlashcardListItem({ flashcard, onEdit, onDelete }: FlashcardListItemProps) {
  return (
    <TableRow>
      <TableCell className="max-w-xs">
        <div className="truncate" title={flashcard.front}>
          {flashcard.front}
        </div>
      </TableCell>
      <TableCell className="max-w-xs">
        <div className="truncate" title={flashcard.back}>
          {flashcard.back}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{sourceLabels[flashcard.source] || flashcard.source}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(flashcard.createdAt)}</TableCell>
      <TableCell>
        <div className="flex gap-2 justify-end">
          <Button onClick={() => onEdit(flashcard)} variant="outline" size="sm">
            <PencilIcon />
            Edytuj
          </Button>
          <Button onClick={() => onDelete(flashcard.id)} variant="destructive" size="sm">
            <TrashIcon />
            Usuń
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
