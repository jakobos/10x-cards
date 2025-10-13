import { z } from "zod";

/**
 * Schema for validating flashcard ID parameter
 */
export const flashcardIdParamSchema = z.object({
  flashcardId: z.string().uuid({ message: "Invalid flashcard ID format." }),
});

/**
 * Schema for creating a new flashcard
 */
export const createFlashcardSchema = z.object({
  front: z
    .string()
    .trim()
    .min(1, { message: "Front cannot be empty." })
    .max(200, { message: "Front cannot exceed 200 characters." }),
  back: z
    .string()
    .trim()
    .min(1, { message: "Back cannot be empty." })
    .max(500, { message: "Back cannot exceed 500 characters." }),
  source: z.enum(["manual", "ai-full", "ai-edited"], {
    errorMap: () => ({ message: "Source must be 'manual', 'ai-full', or 'ai-edited'." }),
  }),
});

/**
 * Schema for updating a flashcard
 * At least one field must be provided
 */
export const updateFlashcardSchema = z
  .object({
    front: z
      .string()
      .trim()
      .min(1, { message: "Front cannot be empty." })
      .max(200, { message: "Front cannot exceed 200 characters." })
      .optional(),
    back: z
      .string()
      .trim()
      .min(1, { message: "Back cannot be empty." })
      .max(500, { message: "Back cannot exceed 500 characters." })
      .optional(),
  })
  .refine((data) => data.front !== undefined || data.back !== undefined, {
    message: "At least one field (front or back) must be provided.",
  });

/**
 * Schema for validating deck ID parameter (used in create flashcard endpoint)
 */
export const deckIdParamSchema = z.object({
  deckId: z.string().uuid({ message: "Invalid deck ID format." }),
});
