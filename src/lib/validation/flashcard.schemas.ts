import { z } from "zod";
import { MAX_FLASHCARD_FRONT_LENGTH, MAX_FLASHCARD_BACK_LENGTH } from "@/lib/constants";

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
    .max(MAX_FLASHCARD_FRONT_LENGTH, { message: `Front cannot exceed ${MAX_FLASHCARD_FRONT_LENGTH} characters.` }),
  back: z
    .string()
    .trim()
    .min(1, { message: "Back cannot be empty." })
    .max(MAX_FLASHCARD_BACK_LENGTH, { message: `Back cannot exceed ${MAX_FLASHCARD_BACK_LENGTH} characters.` }),
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
      .max(MAX_FLASHCARD_FRONT_LENGTH, { message: `Front cannot exceed ${MAX_FLASHCARD_FRONT_LENGTH} characters.` })
      .optional(),
    back: z
      .string()
      .trim()
      .min(1, { message: "Back cannot be empty." })
      .max(MAX_FLASHCARD_BACK_LENGTH, { message: `Back cannot exceed ${MAX_FLASHCARD_BACK_LENGTH} characters.` })
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
