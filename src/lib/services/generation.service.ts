import type { SupabaseClient } from "../../db/supabase.client.ts";
import type { FlashcardCandidateDto } from "../../types.ts";
import { openRouterService } from "./openrouter.service.ts";

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
    // 1. Calculate SHA-256 hash of source text
    const encoder = new TextEncoder();
    const sourceTextData = encoder.encode(sourceText);
    const hashBuffer = await crypto.subtle.digest("SHA-256", sourceTextData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sourceTextHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // 2. Call AI service to generate flashcard candidates
    const { candidates, model } = await callAIService(sourceText);

    // 3. Calculate generation duration
    const endTime = performance.now();
    const generationDuration = Math.round(endTime - startTime); // in milliseconds

    // 4. Save generation record to database
    const { data, error } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        deck_id: deckId,
        model,
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
 * Result of the AI service call including candidates and model information.
 */
interface AIServiceResult {
  candidates: FlashcardCandidateDto[];
  model: string;
}

/**
 * Schema for the expected JSON response from the AI model.
 */
const FLASHCARD_GENERATION_SCHEMA = {
  type: "object",
  properties: {
    flashcards: {
      type: "array",
      description: "Array of generated flashcard candidates",
      items: {
        type: "object",
        properties: {
          front: {
            type: "string",
            description: "The question or prompt for the flashcard (front side)",
          },
          back: {
            type: "string",
            description: "The answer or explanation for the flashcard (back side)",
          },
        },
        required: ["front", "back"],
        additionalProperties: false,
      },
      minItems: 3,
      maxItems: 10,
    },
  },
  required: ["flashcards"],
  additionalProperties: false,
};

/**
 * Calls the AI service (OpenRouter) to generate flashcard candidates.
 *
 * @param sourceText - The text to generate flashcards from
 * @returns List of flashcard candidates and the model used
 */
async function callAIService(sourceText: string): Promise<AIServiceResult> {
  const model = "openai/gpt-4o-mini";

  const systemPrompt = `You are an expert educational content creator specializing in creating high-quality flashcards.

Your task is to analyze the provided text and generate flashcards that:
- Focus on key concepts, definitions, and important information
- Are clear, concise, and easy to understand
- Have questions (front) that are specific and unambiguous
- Have answers (back) that are accurate and complete
- Are pedagogically effective for learning and retention

Generate between 5-8 flashcards based on the content richness of the text.`;

  const userPrompt = `Generate flashcards from the following text:

${sourceText}

Create flashcards that capture the most important information from this text.`;

  try {
    const result = await openRouterService.generateJson<{ flashcards: FlashcardCandidateDto[] }>({
      systemPrompt,
      userPrompt,
      jsonSchema: FLASHCARD_GENERATION_SCHEMA,
      model,
      temperature: 0.7,
      maxTokens: 2048,
    });

    return {
      candidates: result.flashcards,
      model,
    };
  } catch (error) {
    // Re-throw the error with additional context
    throw new Error(`AI service call failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
