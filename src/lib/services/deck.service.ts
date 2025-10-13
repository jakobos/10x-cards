import type { SupabaseClient } from "../../db/supabase.client.ts";
import type { CreateDeckCommand, DeckDetailsDto, DeckDto, PaginatedDecksDto, UpdateDeckCommand } from "../../types.ts";

/**
 * Retrieves a paginated list of decks for a user.
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param page - Page number (1-based)
 * @param limit - Number of items per page
 * @returns Paginated list of decks with flashcard counts
 */
export async function getDecks(
  supabase: SupabaseClient,
  userId: string,
  page: number,
  limit: number
): Promise<PaginatedDecksDto> {
  const offset = (page - 1) * limit;

  // Fetch decks with flashcard count using aggregation
  const {
    data: decks,
    error: decksError,
    count: totalItems,
  } = await supabase
    .from("decks")
    .select(
      `
      id,
      name,
      created_at,
      flashcards:flashcards(id)
    `,
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (decksError) {
    throw new Error(`Failed to fetch decks: ${decksError.message}`);
  }

  const totalPages = Math.ceil((totalItems || 0) / limit);

  // Map results to DTO format
  const decksList = (decks || []).map((deck) => ({
    id: deck.id,
    name: deck.name,
    createdAt: deck.created_at,
    flashcardCount: Array.isArray(deck.flashcards) ? deck.flashcards.length : 0,
  }));

  return {
    data: decksList,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalItems || 0,
    },
  };
}

/**
 * Creates a new deck for a user.
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param command - Deck creation data
 * @returns Newly created deck
 */
export async function createDeck(
  supabase: SupabaseClient,
  userId: string,
  command: CreateDeckCommand
): Promise<DeckDto> {
  const { data, error } = await supabase
    .from("decks")
    .insert({
      user_id: userId,
      name: command.name,
    })
    .select("id, name, created_at")
    .single();

  if (error) {
    throw new Error(`Failed to create deck: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to create deck: No data returned");
  }

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    flashcardCount: 0,
  };
}

/**
 * Retrieves detailed information about a specific deck, including its flashcards.
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param deckId - ID of the deck to retrieve
 * @returns Deck details with flashcards
 * @throws Error if deck not found or doesn't belong to user
 */
export async function getDeckDetails(
  supabase: SupabaseClient,
  userId: string,
  deckId: string
): Promise<DeckDetailsDto> {
  const { data, error } = await supabase
    .from("decks")
    .select(
      `
      id,
      name,
      created_at,
      flashcards:flashcards(
        id,
        front,
        back,
        source,
        created_at
      )
    `
    )
    .eq("id", deckId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Deck not found or does not belong to user");
  }

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    flashcards: (data.flashcards || []).map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      source: card.source,
      createdAt: card.created_at,
    })),
  };
}

/**
 * Updates a deck's name.
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param deckId - ID of the deck to update
 * @param command - Update data
 * @returns Updated deck information
 * @throws Error if deck not found or doesn't belong to user
 */
export async function updateDeck(
  supabase: SupabaseClient,
  userId: string,
  deckId: string,
  command: UpdateDeckCommand
): Promise<{ id: string; name: string; createdAt: string; updatedAt: string }> {
  const { data, error, count } = await supabase
    .from("decks")
    .update({ name: command.name })
    .eq("id", deckId)
    .eq("user_id", userId)
    .select("id, name, created_at, updated_at")
    .single();

  if (error || count === 0 || !data) {
    throw new Error("Deck not found or does not belong to user");
  }

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Deletes a deck and all its flashcards.
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the authenticated user
 * @param deckId - ID of the deck to delete
 * @throws Error if deck not found or doesn't belong to user
 */
export async function deleteDeck(supabase: SupabaseClient, userId: string, deckId: string): Promise<void> {
  const { error, count } = await supabase.from("decks").delete().eq("id", deckId).eq("user_id", userId);

  if (error || count === 0) {
    throw new Error("Deck not found or does not belong to user");
  }
}
