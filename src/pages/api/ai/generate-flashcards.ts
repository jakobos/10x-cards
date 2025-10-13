import type { APIRoute } from "astro";
import { z } from "zod";

import { DEFAULT_USER_ID } from "../../../db/supabase.client.ts";
import { aiRateLimiter } from "../../../lib/rate-limiter.ts";
import { generateCandidates } from "../../../lib/services/generation.service.ts";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDto } from "../../../types.ts";

// Validation schema for the request body
const generateFlashcardsSchema = z.object({
  sourceText: z
    .string()
    .min(1000, "Source text must be at least 1000 characters")
    .max(10000, "Source text must not exceed 10000 characters"),
  deckId: z.string().uuid("Invalid deck ID format"),
}) satisfies z.ZodType<GenerateFlashcardsCommand>;

export const prerender = false;

/**
 * POST /api/ai/generate-flashcards
 *
 * Generates flashcard candidates from source text using AI.
 * Uses DEFAULT_USER_ID for development (no auth required at this stage).
 *
 * @param {GenerateFlashcardsCommand} body - Request body containing source text
 * @returns {GenerateFlashcardsResponseDto} Generation ID and flashcard candidates
 */
export const POST: APIRoute = async (context) => {
  try {
    // 1. Check rate limit (5 requests per 10 minutes)
    if (aiRateLimiter.isRateLimited(DEFAULT_USER_ID)) {
      const remaining = aiRateLimiter.getRemainingRequests(DEFAULT_USER_ID);
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          remaining,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": remaining.toString(),
          },
        }
      );
    }

    // 2. Parse and validate request body
    const rawBody = await context.request.json();
    const validationResult = generateFlashcardsSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { sourceText, deckId } = validationResult.data;

    // 3. Call AI service to generate flashcard candidates
    const result = await generateCandidates(sourceText, deckId, DEFAULT_USER_ID, context.locals.supabase);

    // 4. Return response
    const response: GenerateFlashcardsResponseDto = {
      generationId: result.generationId,
      candidates: result.candidates,
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error generating flashcards:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
