import { createHash } from "node:crypto";

import type { SupabaseClient } from "../../db/supabase.client.ts";
import type { FlashcardCandidateDto } from "../../types.ts";

/**
 * Result of flashcard generation
 */
export interface GenerateCandidatesResult {
  generationId: string;
  candidates: FlashcardCandidateDto[];
}

/**
 * Generates flashcard candidates from source text using AI.
 * Records the generation in the database for metrics tracking.
 *
 * @param sourceText - The text to generate flashcards from
 * @param deckId - The ID of the deck to associate the generation with
 * @param userId - The ID of the authenticated user
 * @param supabase - Supabase client instance
 * @returns Generation ID and list of flashcard candidates
 */
export async function generateCandidates(
  sourceText: string,
  deckId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<GenerateCandidatesResult> {
  const startTime = performance.now();

  try {
    // 1. Calculate MD5 hash of source text
    const sourceTextHash = createHash("md5").update(sourceText).digest("hex");

    // 2. Call AI service to generate flashcard candidates
    // For development, use mock data instead of calling external AI service
    const candidates = await callAIService();

    // 3. Calculate generation duration
    const endTime = performance.now();
    const generationDuration = Math.round(endTime - startTime); // in milliseconds

    // 4. Save generation record to database
    const { data, error } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        deck_id: deckId,
        model: "mock-model", // TODO: Replace with actual model name
        generated_count: candidates.length,
        source_text_hash: sourceTextHash,
        source_text_length: sourceText.length,
        generation_duration: generationDuration,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to save generation record: ${error.message}`);
    }

    return {
      generationId: data.id,
      candidates,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate flashcard candidates: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Calls the AI service to generate flashcard candidates.
 * Currently returns mock data for development.
 *
 * @returns List of flashcard candidates
 */
async function callAIService(): Promise<FlashcardCandidateDto[]> {
  // TODO: Implement actual AI service call to OpenRouter
  // For now, return mock data for development

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock flashcard candidates
  return [
    {
      front: "What is the main topic of the provided text?",
      back: "This is a mock answer based on the source text.",
    },
    {
      front: "What are the key concepts mentioned?",
      back: "These are mock key concepts from the text.",
    },
    {
      front: "How would you summarize the main idea?",
      back: "This is a mock summary of the text.",
    },
  ];
}
