-- Add deck_id column to the generations table, making it non-nullable.
ALTER TABLE public.generations
ADD COLUMN deck_id UUID NOT NULL;

-- Add a foreign key constraint to ensure deck_id references a valid deck.
-- ON DELETE CASCADE means that if a deck is deleted, all its related generation
-- logs will also be deleted, maintaining data integrity.
ALTER TABLE public.generations
ADD CONSTRAINT generations_deck_id_fkey
FOREIGN KEY (deck_id)
REFERENCES public.decks(id)
ON DELETE CASCADE;

-- Create an index on the new deck_id column to optimize query performance,
-- especially for lookups based on the deck.
CREATE INDEX idx_generations_deck_id ON public.generations(deck_id);
