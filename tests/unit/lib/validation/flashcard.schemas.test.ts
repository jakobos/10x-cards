import { describe, it, expect } from "vitest";
import {
  createFlashcardSchema,
  updateFlashcardSchema,
  flashcardIdParamSchema,
  deckIdParamSchema,
} from "@/lib/validation/flashcard.schemas";
import { MAX_FLASHCARD_FRONT_LENGTH, MAX_FLASHCARD_BACK_LENGTH } from "@/lib/constants";

describe("flashcard.schemas", () => {
  describe("createFlashcardSchema", () => {
    describe("valid data", () => {
      it("should validate correct flashcard data", () => {
        const data = {
          front: "Question",
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should accept flashcard with source "ai-full"', () => {
        const data = {
          front: "Question",
          back: "Answer",
          source: "ai-full",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should accept flashcard with source "ai-edited"', () => {
        const data = {
          front: "Question",
          back: "Answer",
          source: "ai-edited",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should accept all valid source values", () => {
        const sources = ["manual", "ai-full", "ai-edited"] as const;

        sources.forEach((source) => {
          const data = {
            front: "Question",
            back: "Answer",
            source,
          };

          const result = createFlashcardSchema.safeParse(data);
          expect(result.success).toBe(true);
        });
      });
    });

    describe("whitespace handling", () => {
      it("should trim whitespace from front and back", () => {
        const data = {
          front: "  Question  ",
          back: "  Answer  ",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.front).toBe("Question");
          expect(result.data.back).toBe("Answer");
        }
      });

      it("should trim tabs and newlines", () => {
        const data = {
          front: "\t\nQuestion\n\t",
          back: "\tAnswer\n",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.front).toBe("Question");
          expect(result.data.back).toBe("Answer");
        }
      });

      it("should reject front with only whitespace", () => {
        const data = {
          front: "   ",
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("cannot be empty");
        }
      });

      it("should reject back with only whitespace", () => {
        const data = {
          front: "Question",
          back: "   ",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("cannot be empty");
        }
      });
    });

    describe("empty fields validation", () => {
      it("should reject empty front", () => {
        const data = {
          front: "",
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("cannot be empty");
        }
      });

      it("should reject empty back", () => {
        const data = {
          front: "Question",
          back: "",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("cannot be empty");
        }
      });
    });

    describe("length validation - front", () => {
      it("should accept front at max length", () => {
        const data = {
          front: "x".repeat(MAX_FLASHCARD_FRONT_LENGTH),
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should reject front exceeding max length", () => {
        const data = {
          front: "x".repeat(MAX_FLASHCARD_FRONT_LENGTH + 1),
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("cannot exceed");
        }
      });

      it("should accept front with single character", () => {
        const data = {
          front: "Q",
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should reject front exceeding max length by 1", () => {
        const data = {
          front: "x".repeat(MAX_FLASHCARD_FRONT_LENGTH + 1),
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("length validation - back", () => {
      it("should accept back at max length", () => {
        const data = {
          front: "Question",
          back: "x".repeat(MAX_FLASHCARD_BACK_LENGTH),
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should reject back exceeding max length", () => {
        const data = {
          front: "Question",
          back: "x".repeat(MAX_FLASHCARD_BACK_LENGTH + 1),
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("cannot exceed");
        }
      });

      it("should accept back with single character", () => {
        const data = {
          front: "Question",
          back: "A",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should reject back exceeding max length by 1", () => {
        const data = {
          front: "Question",
          back: "x".repeat(MAX_FLASHCARD_BACK_LENGTH + 1),
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("source validation", () => {
      it("should reject invalid source value", () => {
        const data = {
          front: "Question",
          back: "Answer",
          source: "invalid-source",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("manual");
        }
      });

      it("should reject empty source", () => {
        const data = {
          front: "Question",
          back: "Answer",
          source: "",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject source with wrong case", () => {
        const data = {
          front: "Question",
          back: "Answer",
          source: "Manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("missing fields", () => {
      it("should reject missing required fields", () => {
        const data = { front: "Question" };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject missing front", () => {
        const data = {
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject missing back", () => {
        const data = {
          front: "Question",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject missing source", () => {
        const data = {
          front: "Question",
          back: "Answer",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject completely empty object", () => {
        const data = {};

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("special characters", () => {
      it("should accept front with special characters", () => {
        const data = {
          front: "What is 2 + 2? (basic math)",
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should accept back with HTML entities", () => {
        const data = {
          front: "Question",
          back: "Answer with <b>HTML</b> & entities",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should accept emojis in front and back", () => {
        const data = {
          front: "🤔 What is this?",
          back: "😊 It's an emoji!",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should accept unicode characters", () => {
        const data = {
          front: "Co to znaczy ąćęłńóśźż?",
          back: "Polskie znaki diakrytyczne",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe("type validation", () => {
      it("should reject non-string front", () => {
        const data = {
          front: 123,
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject non-string back", () => {
        const data = {
          front: "Question",
          back: 123,
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject null front", () => {
        const data = {
          front: null,
          back: "Answer",
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject undefined back", () => {
        const data = {
          front: "Question",
          back: undefined,
          source: "manual",
        };

        const result = createFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateFlashcardSchema", () => {
    describe("valid partial updates", () => {
      it("should validate update with front only", () => {
        const data = { front: "Updated Question" };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should validate update with back only", () => {
        const data = { back: "Updated Answer" };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should validate update with both fields", () => {
        const data = {
          front: "Updated Question",
          back: "Updated Answer",
        };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe("at least one field requirement", () => {
      it("should reject update with no fields", () => {
        const data = {};

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("At least one field");
        }
      });

      it("should reject update with only undefined fields", () => {
        const data = {
          front: undefined,
          back: undefined,
        };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("whitespace handling", () => {
      it("should trim whitespace from front", () => {
        const data = { front: "  Updated Question  " };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.front).toBe("Updated Question");
        }
      });

      it("should trim whitespace from back", () => {
        const data = { back: "  Updated Answer  " };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.back).toBe("Updated Answer");
        }
      });

      it("should reject empty string for front after trim", () => {
        const data = { front: "   " };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("cannot be empty");
        }
      });

      it("should reject empty string for back after trim", () => {
        const data = { back: "   " };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("cannot be empty");
        }
      });
    });

    describe("empty fields validation", () => {
      it("should reject explicit empty string for front", () => {
        const data = { front: "" };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject explicit empty string for back", () => {
        const data = { back: "" };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("length validation", () => {
      it("should accept front at max length", () => {
        const data = {
          front: "x".repeat(MAX_FLASHCARD_FRONT_LENGTH),
        };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should reject front exceeding max length", () => {
        const data = {
          front: "x".repeat(MAX_FLASHCARD_FRONT_LENGTH + 1),
        };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept back at max length", () => {
        const data = {
          back: "x".repeat(MAX_FLASHCARD_BACK_LENGTH),
        };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should reject back exceeding max length", () => {
        const data = {
          back: "x".repeat(MAX_FLASHCARD_BACK_LENGTH + 1),
        };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("special characters", () => {
      it("should accept special characters in update", () => {
        const data = {
          front: "Updated: What is 2 + 2?",
          back: "Answer: 4 (four)",
        };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should accept unicode in update", () => {
        const data = {
          front: "Zaktualizowane pytanie: ąćęłńóśźż",
        };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe("type validation", () => {
      it("should reject non-string front", () => {
        const data = { front: 123 };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject non-string back", () => {
        const data = { back: true };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject null values", () => {
        const data = { front: null };

        const result = updateFlashcardSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("flashcardIdParamSchema", () => {
    describe("valid UUIDs", () => {
      it("should validate valid UUID v4", () => {
        const data = {
          flashcardId: "123e4567-e89b-12d3-a456-426614174000",
        };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should validate another valid UUID", () => {
        const data = {
          flashcardId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should validate UUID with all lowercase", () => {
        const data = {
          flashcardId: "abcdef12-3456-7890-abcd-ef1234567890",
        };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should validate UUID with uppercase letters", () => {
        const data = {
          flashcardId: "ABCDEF12-3456-7890-ABCD-EF1234567890",
        };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe("invalid UUIDs", () => {
      it("should reject invalid UUID format", () => {
        const data = { flashcardId: "not-a-uuid" };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Invalid");
        }
      });

      it("should reject UUID without dashes", () => {
        const data = {
          flashcardId: "123e4567e89b12d3a456426614174000",
        };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject UUID with wrong number of characters", () => {
        const data = {
          flashcardId: "123e4567-e89b-12d3-a456-42661417400",
        };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject UUID with extra characters", () => {
        const data = {
          flashcardId: "123e4567-e89b-12d3-a456-426614174000x",
        };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject empty string", () => {
        const data = { flashcardId: "" };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject UUID with invalid characters", () => {
        const data = {
          flashcardId: "123e4567-e89b-12d3-a456-42661417400z",
        };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("type validation", () => {
      it("should reject non-string ID", () => {
        const data = { flashcardId: 123 };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject null ID", () => {
        const data = { flashcardId: null };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject undefined ID", () => {
        const data = { flashcardId: undefined };

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject missing flashcardId field", () => {
        const data = {};

        const result = flashcardIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("deckIdParamSchema", () => {
    describe("valid UUIDs", () => {
      it("should validate valid UUID v4", () => {
        const data = {
          deckId: "123e4567-e89b-12d3-a456-426614174000",
        };

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should validate another valid UUID", () => {
        const data = {
          deckId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        };

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("should validate UUID with mixed case", () => {
        const data = {
          deckId: "AbCdEf12-3456-7890-ABCD-ef1234567890",
        };

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe("invalid UUIDs", () => {
      it("should reject invalid UUID format", () => {
        const data = { deckId: "not-a-uuid" };

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Invalid");
        }
      });

      it("should reject UUID without dashes", () => {
        const data = {
          deckId: "9b1deb4d3b7d4bad9bdd2b0d7b3dcb6d",
        };

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject UUID with wrong structure", () => {
        const data = {
          deckId: "9b1deb4d-3b7d4bad-9bdd-2b0d7b3dcb6d",
        };

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject empty string", () => {
        const data = { deckId: "" };

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("type validation", () => {
      it("should reject non-string ID", () => {
        const data = { deckId: 12345 };

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject null ID", () => {
        const data = { deckId: null };

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject boolean ID", () => {
        const data = { deckId: true };

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject missing deckId field", () => {
        const data = {};

        const result = deckIdParamSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });
});
