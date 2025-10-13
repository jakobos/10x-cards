import type { SupabaseClient } from "../../db/supabase.client.ts";
import type { BatchCreateFlashcardsCommand } from "../../types.ts";

/**
 * Creates multiple flashcards from AI-generated candidates.
 * Updates the generation metrics to track accepted cards.
 *
 * @param command - Batch creation command with generation ID and flashcards
 * @param deckId - ID of the deck to add flashcards to
 * @param userId - ID of the authenticated user
 * @param supabase - Supabase client instance
 * @returns Number of successfully created flashcards
 * @throws Error if deck or generation not found or doesn't belong to user
 */
export async function createFromAIGeneration(
  command: BatchCreateFlashcardsCommand,
  deckId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<number> {
  // 1. Verify deck exists and belongs to user
  const { data: deck, error: deckError } = await supabase
    .from("decks")
    .select("id, user_id")
    .eq("id", deckId)
    .eq("user_id", userId)
    .single();

  if (deckError || !deck) {
    throw new Error(`Deck not found or does not belong to user`);
  }

  // 2. Verify generation exists and belongs to user and deck
  const { data: generation, error: generationError } = await supabase
    .from("generations")
    .select("id, user_id, deck_id")
    .eq("id", command.generationId)
    .eq("user_id", userId)
    .eq("deck_id", deckId)
    .single();

  if (generationError || !generation) {
    throw new Error(`Generation not found or does not belong to user and deck`);
  }

  // 3. Calculate metrics: count cards by source
  const acceptedUneditedCount = command.flashcards.filter((card) => card.source === "ai-full").length;
  const acceptedEditedCount = command.flashcards.filter((card) => card.source === "ai-edited").length;

  // 4. Prepare flashcard data for batch insert
  const flashcardsToInsert = command.flashcards.map((card) => ({
    deck_id: deckId,
    generation_id: command.generationId,
    front: card.front,
    back: card.back,
    source: card.source,
  }));

  // 5. Insert flashcards (batch operation)
  const { error: insertError } = await supabase.from("flashcards").insert(flashcardsToInsert).select();

  if (insertError) {
    throw new Error(`Failed to insert flashcards: ${insertError.message}`);
  }

  // 6. Update generation metrics
  const { error: updateError } = await supabase
    .from("generations")
    .update({
      accepted_unedited_count: acceptedUneditedCount,
      accepted_edited_count: acceptedEditedCount,
    })
    .eq("id", command.generationId);

  if (updateError) {
    // Metrics update failed, but flashcards were created
    // Log the error but don't rollback the flashcard creation
    // eslint-disable-next-line no-console
    console.error(`Failed to update generation metrics: ${updateError.message}`);
  }

  // 7. Return the count of created flashcards
  return command.flashcards.length;
}
