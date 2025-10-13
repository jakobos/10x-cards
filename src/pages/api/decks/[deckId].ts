import type { APIRoute } from "astro";
import { z } from "zod";

import { DEFAULT_USER_ID } from "../../../db/supabase.client.ts";
import * as DeckService from "../../../lib/services/deck.service.ts";

export const prerender = false;

// Validation schemas
const deckIdParamSchema = z.object({
  deckId: z.string().uuid({ message: "Invalid deck ID format." }),
});

const updateDeckSchema = z.object({
  name: z.string().trim().min(1, { message: "Deck name cannot be empty." }),
});

/**
 * GET /api/decks/[deckId]
 * Retrieves detailed information about a specific deck, including its flashcards.
 */
export const GET: APIRoute = async ({ params, locals }) => {
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

    // Validate deckId parameter
    const validation = deckIdParamSchema.safeParse(params);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid deck ID",
          details: validation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { deckId } = validation.data;

    // Fetch deck details from service
    const result = await DeckService.getDeckDetails(supabase, userId, deckId);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching deck details:", error);

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
 * PATCH /api/decks/[deckId]
 * Updates the name of a specific deck.
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

    // Validate deckId parameter
    const paramValidation = deckIdParamSchema.safeParse(params);

    if (!paramValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid deck ID",
          details: paramValidation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { deckId } = paramValidation.data;

    // Parse and validate request body
    const body = await request.json();
    const bodyValidation = updateDeckSchema.safeParse(body);

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

    // Update deck via service
    const result = await DeckService.updateDeck(supabase, userId, deckId, command);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating deck:", error);

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
 * DELETE /api/decks/[deckId]
 * Deletes a specific deck and all its flashcards.
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

    // Validate deckId parameter
    const validation = deckIdParamSchema.safeParse(params);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid deck ID",
          details: validation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { deckId } = validation.data;

    // Delete deck via service
    await DeckService.deleteDeck(supabase, userId, deckId);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting deck:", error);

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
