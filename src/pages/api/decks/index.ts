import type { APIRoute } from "astro";
import { z } from "zod";

import { DEFAULT_USER_ID } from "../../../db/supabase.client.ts";
import * as DeckService from "../../../lib/services/deck.service.ts";

export const prerender = false;

// Validation schemas
const getDecksQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

const createDeckSchema = z.object({
  name: z.string().trim().min(1, { message: "Deck name cannot be empty." }),
});

/**
 * GET /api/decks
 * Retrieves a paginated list of decks for the authenticated user.
 */
export const GET: APIRoute = async ({ url, locals }) => {
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

    // Validate query parameters
    const queryParams = {
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    };

    const validation = getDecksQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { page, limit } = validation.data;

    // Fetch decks from service
    const result = await DeckService.getDecks(supabase, userId, page, limit);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching decks:", error);

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
 * POST /api/decks
 * Creates a new deck for the authenticated user.
 */
export const POST: APIRoute = async ({ request, locals }) => {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = createDeckSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: validation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command = validation.data;

    // Create deck via service
    const result = await DeckService.createDeck(supabase, userId, command);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating deck:", error);

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
