/* eslint-disable no-console */
import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/db/database.types";

/**
 * Global teardown for E2E tests
 *
 * This teardown runs once after all tests and cleans up test data from Supabase.
 * It removes all decks created during testing for the test user.
 *
 * Best practices:
 * - Runs once after all tests complete
 * - Signs in as the test user to clean up their data
 * - Uses RLS policies to ensure only test user's data is deleted
 * - Cleans up test data to prevent database pollution
 * - Cascading deletes handle related flashcards and generations automatically
 */

teardown("cleanup database", async () => {
  // Arrange - Get configuration from environment
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testEmail = process.env.E2E_USERNAME;
  const testPassword = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be set in .env.test file");
  }

  if (!testEmail || !testPassword) {
    throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test file");
  }

  console.log("\n🧹 Starting database cleanup...");

  // Create Supabase client
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Sign in as test user
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error("Error signing in:", signInError);
    throw signInError;
  }

  console.log(`📧 Signed in as test user: ${testEmail}`);

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(`Failed to get authenticated user: ${userError?.message}`);
  }

  // Act - Delete all decks for test user
  // Note: Cascading deletes will automatically remove:
  // - flashcards (on delete cascade)
  // - generations will have their flashcard references set to null (on delete set null)
  const { data: deletedDecks, error: deleteError } = await supabase
    .from("decks")
    .delete()
    .eq("user_id", user.id)
    .select();

  if (deleteError) {
    throw new Error(`Failed to delete test decks: ${deleteError.message}`);
  }

  // Assert - Report cleanup results
  const deckCount = deletedDecks?.length || 0;
  console.log(`✅ Deleted ${deckCount} test deck(s)`);
  console.log("🎉 Database cleanup completed successfully\n");

  // Sign out
  await supabase.auth.signOut();
});
