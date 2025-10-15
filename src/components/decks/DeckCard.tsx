import type { DeckListItemDto } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DeckCardProps {
  deck: DeckListItemDto;
  onEdit: (deck: DeckListItemDto) => void;
  onDelete: (deck: DeckListItemDto) => void;
}

export function DeckCard({ deck, onEdit, onDelete }: DeckCardProps) {
  const isLearningDisabled = deck.flashcardCount === 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <a href={`/app/decks/${deck.id}`} className="block">
          <CardTitle className="cursor-pointer hover:text-primary transition-colors">{deck.name}</CardTitle>
        </a>
        <CardDescription>
          {deck.flashcardCount} {deck.flashcardCount === 1 ? "fiszka" : "fiszek"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-1">
                {isLearningDisabled ? (
                  <Button className="w-full" disabled>
                    Ucz się
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <a href={`/app/decks/${deck.id}`}>Ucz się</a>
                  </Button>
                )}
              </span>
            </TooltipTrigger>
            {isLearningDisabled && (
              <TooltipContent>
                <p>Dodaj fiszki, aby rozpocząć naukę</p>
              </TooltipContent>
            )}
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <span className="sr-only">Więcej opcji</span>⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(deck)}>Edytuj nazwę</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(deck)} className="text-destructive focus:text-destructive">
                Usuń
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
