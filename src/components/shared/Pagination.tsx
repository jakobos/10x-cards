import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="text-sm text-muted-foreground">
        Strona {currentPage} z {totalPages}
      </div>
      <div className="flex gap-2">
        <Button onClick={handlePrevious} disabled={currentPage === 1} variant="outline" size="sm">
          <ChevronLeftIcon />
          Poprzednia
        </Button>
        <Button onClick={handleNext} disabled={currentPage === totalPages} variant="outline" size="sm">
          Następna
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
