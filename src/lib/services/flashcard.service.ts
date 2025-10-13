import type { SupabaseClient } from "../../db/supabase.client.ts";
import type {
  BatchCreateFlashcardsCommand,
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  FlashcardDetailsDto,
  UpdatedFlashcardDto,
  FlashcardSource,
} from "../../types.ts";

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

/**
 * Creates a single flashcard in a deck.
 *
 * @param command - Create command with flashcard data
 * @param deckId - ID of the deck to add the flashcard to
 * @param userId - ID of the authenticated user
 * @param supabase - Supabase client instance
 * @returns Created flashcard details
 * @throws Error if deck not found or doesn't belong to user
 */
export async function createFlashcard(
  command: CreateFlashcardCommand,
  deckId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<FlashcardDetailsDto> {
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

  // 2. Insert the flashcard
  const { data: flashcard, error: insertError } = await supabase
    .from("flashcards")
    .insert({
      deck_id: deckId,
      front: command.front,
      back: command.back,
      source: command.source,
      generation_id: null, // Manual creation has no generation
    })
    .select("id, deck_id, front, back, source, created_at")
    .single();

  if (insertError || !flashcard) {
    throw new Error(`Failed to create flashcard: ${insertError?.message || "Unknown error"}`);
  }

  // 3. Return formatted DTO
  return {
    id: flashcard.id,
    deckId: flashcard.deck_id,
    front: flashcard.front,
    back: flashcard.back,
    source: flashcard.source as FlashcardSource,
    createdAt: flashcard.created_at,
  };
}

/**
 * Updates an existing flashcard.
 *
 * @param flashcardId - ID of the flashcard to update
 * @param command - Update command with new flashcard data
 * @param userId - ID of the authenticated user
 * @param supabase - Supabase client instance
 * @returns Updated flashcard details
 * @throws Error if flashcard not found or doesn't belong to user
 */
export async function updateFlashcard(
  flashcardId: string,
  command: UpdateFlashcardCommand,
  userId: string,
  supabase: SupabaseClient
): Promise<UpdatedFlashcardDto> {
  // 1. Verify flashcard exists and belongs to user (via deck ownership)
  const { data: flashcard, error: flashcardError } = await supabase
    .from("flashcards")
    .select("id, deck_id, decks!inner(user_id)")
    .eq("id", flashcardId)
    .single();

  if (flashcardError || !flashcard) {
    throw new Error(`Flashcard not found`);
  }

  // Check if the deck belongs to the user
  const deck = flashcard.decks as unknown as { user_id: string };
  if (!deck || deck.user_id !== userId) {
    throw new Error(`Flashcard not found or does not belong to user`);
  }

  // 2. Prepare update data
  const updateData: { front?: string; back?: string } = {};
  if (command.front !== undefined) {
    updateData.front = command.front;
  }
  if (command.back !== undefined) {
    updateData.back = command.back;
  }

  // 3. Update the flashcard
  const { data: updatedFlashcard, error: updateError } = await supabase
    .from("flashcards")
    .update(updateData)
    .eq("id", flashcardId)
    .select("id, deck_id, front, back, source, updated_at")
    .single();

  if (updateError || !updatedFlashcard) {
    throw new Error(`Failed to update flashcard: ${updateError?.message || "Unknown error"}`);
  }

  // 4. Return formatted DTO
  return {
    id: updatedFlashcard.id,
    deckId: updatedFlashcard.deck_id,
    front: updatedFlashcard.front,
    back: updatedFlashcard.back,
    source: updatedFlashcard.source as FlashcardSource,
    updatedAt: updatedFlashcard.updated_at,
  };
}

/**
 * Deletes a flashcard.
 *
 * @param flashcardId - ID of the flashcard to delete
 * @param userId - ID of the authenticated user
 * @param supabase - Supabase client instance
 * @throws Error if flashcard not found or doesn't belong to user
 */
export async function deleteFlashcard(flashcardId: string, userId: string, supabase: SupabaseClient): Promise<void> {
  // 1. Verify flashcard exists and belongs to user (via deck ownership)
  const { data: flashcard, error: flashcardError } = await supabase
    .from("flashcards")
    .select("id, deck_id, decks!inner(user_id)")
    .eq("id", flashcardId)
    .single();

  if (flashcardError || !flashcard) {
    throw new Error(`Flashcard not found`);
  }

  // Check if the deck belongs to the user
  const deck = flashcard.decks as unknown as { user_id: string };
  if (!deck || deck.user_id !== userId) {
    throw new Error(`Flashcard not found or does not belong to user`);
  }

  // 2. Delete the flashcard
  const { error: deleteError } = await supabase.from("flashcards").delete().eq("id", flashcardId);

  if (deleteError) {
    throw new Error(`Failed to delete flashcard: ${deleteError.message}`);
  }
}
