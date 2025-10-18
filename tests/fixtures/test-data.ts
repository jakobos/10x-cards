import { faker } from "@faker-js/faker";
import type { Database } from "@/db/database.types";

/**
 * Test data factories using faker for generating realistic test data
 */

type Deck = Database["public"]["Tables"]["decks"]["Row"];
type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Generate a fake profile for testing
 */
export function createMockProfile(overrides?: Partial<Profile>): Profile {
  return {
    id: faker.string.uuid(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Generate a fake deck for testing
 */
export function createMockDeck(overrides?: Partial<Deck>): Deck {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    user_id: faker.string.uuid(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Generate a fake flashcard for testing
 */
export function createMockFlashcard(overrides?: Partial<Flashcard>): Flashcard {
  return {
    id: faker.string.uuid(),
    front: faker.lorem.sentence(),
    back: faker.lorem.paragraph(),
    deck_id: faker.string.uuid(),
    generation_id: null,
    source: "",
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Generate multiple mock items
 */
export function createMockArray<T>(factory: (index: number) => T, count: number): T[] {
  return Array.from({ length: count }, (_, index) => factory(index));
}
