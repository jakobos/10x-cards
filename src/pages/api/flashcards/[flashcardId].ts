import type { APIRoute } from "astro";

import { DEFAULT_USER_ID } from "../../../db/supabase.client.ts";
import { crudRateLimiter } from "../../../lib/rate-limiter.ts";
import * as FlashcardService from "../../../lib/services/flashcard.service.ts";
import { flashcardIdParamSchema, updateFlashcardSchema } from "../../../lib/validation/flashcard.schemas.ts";

export const prerender = false;

/**
 * PATCH /api/flashcards/[flashcardId]
 * Updates an existing flashcard.
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const supabase = locals.supabase;

    // TODO: Get userId from session when authentication is implemented
    // const session = locals.session;
    // if (!session) {
    //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
    //     status: 401,
    //     headers: { "Content-Type": "application/json" },
    //   });
    // }
    // const userId = session.user.id;

    const userId = DEFAULT_USER_ID;

    // Check rate limit
    if (crudRateLimiter.isRateLimited(userId)) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate flashcardId parameter
    const paramValidation = flashcardIdParamSchema.safeParse(params);

    if (!paramValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: paramValidation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { flashcardId } = paramValidation.data;

    // Parse and validate request body
    const body = await request.json();
    const bodyValidation = updateFlashcardSchema.safeParse(body);

    if (!bodyValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: bodyValidation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command = bodyValidation.data;

    // Update flashcard via service
    const result = await FlashcardService.updateFlashcard(flashcardId, command, userId, supabase);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating flashcard:", error);

    // Handle NotFound error
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(
        JSON.stringify({
          error: "Not found",
          message: error.message,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * DELETE /api/flashcards/[flashcardId]
 * Deletes a specific flashcard.
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;

    // TODO: Get userId from session when authentication is implemented
    // const session = locals.session;
    // if (!session) {
    //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
    //     status: 401,
    //     headers: { "Content-Type": "application/json" },
    //   });
    // }
    // const userId = session.user.id;

    const userId = DEFAULT_USER_ID;

    // Check rate limit
    if (crudRateLimiter.isRateLimited(userId)) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate flashcardId parameter
    const validation = flashcardIdParamSchema.safeParse(params);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: validation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { flashcardId } = validation.data;

    // Delete flashcard via service
    await FlashcardService.deleteFlashcard(flashcardId, userId, supabase);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting flashcard:", error);

    // Handle NotFound error
    if (error instanceof Error && error.message.includes("not found")) {
      return new Response(
        JSON.stringify({
          error: "Not found",
          message: error.message,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
