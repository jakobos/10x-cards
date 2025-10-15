import { useState, useMemo } from "react";
import type { FlashcardSummaryDto } from "@/types";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
import { FlashcardListItem } from "./FlashcardListItem";
import { Pagination } from "@/components/shared/Pagination";

interface FlashcardListProps {
  flashcards: FlashcardSummaryDto[];
  onEditFlashcard: (flashcard: FlashcardSummaryDto) => void;
  onDeleteFlashcard: (flashcardId: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function FlashcardList({ flashcards, onEditFlashcard, onDeleteFlashcard }: FlashcardListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(flashcards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedFlashcards = useMemo(() => {
    return flashcards.slice(startIndex, endIndex);
  }, [flashcards, startIndex, endIndex]);

  // Reset to page 1 if current page exceeds total pages (e.g., after deletion)
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  if (flashcards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          Brak fiszek w tej talii. Dodaj nową fiszkę lub wygeneruj je za pomocą AI.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Przód</TableHead>
              <TableHead className="w-[30%]">Tył</TableHead>
              <TableHead className="w-[15%]">Źródło</TableHead>
              <TableHead className="w-[15%]">Data utworzenia</TableHead>
              <TableHead className="w-[10%] text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFlashcards.map((flashcard) => (
              <FlashcardListItem
                key={flashcard.id}
                flashcard={flashcard}
                onEdit={onEditFlashcard}
                onDelete={onDeleteFlashcard}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
