import type { APIRoute } from "astro";
import { z } from "zod";

import { DEFAULT_USER_ID } from "../../../../../db/supabase.client.ts";
import { createFromAIGeneration } from "../../../../../lib/services/flashcard.service.ts";
import { MAX_FLASHCARD_FRONT_LENGTH, MAX_FLASHCARD_BACK_LENGTH } from "../../../../../lib/constants.ts";
import type {
  BatchCreateFlashcardsCommand,
  BatchCreateFlashcardsResponseDto,
  BatchFlashcardItemDto,
} from "../../../../../types.ts";

// Validation schema for path parameter
const deckIdSchema = z.string().uuid("Invalid deck ID format");

// Validation schema for individual flashcard item
const batchFlashcardItemSchema = z.object({
  front: z
    .string()
    .min(1, "Front text must be at least 1 character")
    .max(MAX_FLASHCARD_FRONT_LENGTH, `Front text must not exceed ${MAX_FLASHCARD_FRONT_LENGTH} characters`),
  back: z
    .string()
    .min(1, "Back text must be at least 1 character")
    .max(MAX_FLASHCARD_BACK_LENGTH, `Back text must not exceed ${MAX_FLASHCARD_BACK_LENGTH} characters`),
  source: z.enum(["ai-full", "ai-edited"], {
    errorMap: () => ({ message: "Source must be either 'ai-full' or 'ai-edited'" }),
  }),
}) satisfies z.ZodType<BatchFlashcardItemDto>;

// Validation schema for the request body
const batchCreateFlashcardsSchema = z.object({
  generationId: z.string().uuid("Invalid generation ID format"),
  flashcards: z
    .array(batchFlashcardItemSchema)
    .min(1, "At least one flashcard is required")
    .max(50, "Cannot create more than 50 flashcards at once"),
}) satisfies z.ZodType<BatchCreateFlashcardsCommand>;

export const prerender = false;

/**
 * POST /api/decks/{deckId}/flashcards/batch
 *
 * Creates multiple flashcards in a specific deck from AI-generated candidates.
 * Each flashcard is associated with a generation session, and the session metrics
 * are updated to track how many cards were accepted with or without edits.
 *
 * @param {string} deckId - Path parameter: UUID of the deck
 * @param {BatchCreateFlashcardsCommand} body - Request body containing generation ID and flashcards
 * @returns {BatchCreateFlashcardsResponseDto} Created count and generation ID
 */
export const POST: APIRoute = async (context) => {
  try {
    // 1. Check if user is authenticated (using DEFAULT_USER_ID for development)
    // TODO: Replace with actual session check when auth is implemented
    // if (!context.locals.session) {
    //   return new Response(
    //     JSON.stringify({
    //       error: "Unauthorized",
    //       message: "You must be logged in to create flashcards",
    //     }),
    //     { status: 401, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    // 2. Validate deckId from path parameters
    const deckIdValidation = deckIdSchema.safeParse(context.params.deckId);

    if (!deckIdValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid deck ID",
          details: deckIdValidation.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const deckId = deckIdValidation.data;

    // 3. Parse and validate request body
    const rawBody = await context.request.json();
    const validationResult = batchCreateFlashcardsSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const command = validationResult.data;

    // 4. Call service to create flashcards
    const createdCount = await createFromAIGeneration(command, deckId, DEFAULT_USER_ID, context.locals.supabase);

    // 5. Return success response
    const response: BatchCreateFlashcardsResponseDto = {
      createdCount,
      generationId: command.generationId,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating flashcards:", error);

    // Handle specific error types
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(
        JSON.stringify({
          error: "Not found",
          message: error.message,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
