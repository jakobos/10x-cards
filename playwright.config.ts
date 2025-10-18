import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["list"]],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:4321",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Video on failure */
    video: "retain-on-failure",

    /* Navigation timeout */
    navigationTimeout: 30000,

    /* Action timeout */
    actionTimeout: 15000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs once to authenticate and save state
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Chromium authenticated - for tests requiring logged in user
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use saved authentication state from setup
        storageState: "tests/e2e/fixtures/.auth/user.json",
      },
      dependencies: ["setup"],
      // Run all tests except those that don't need auth
      testIgnore: ["**/teardown.ts"],
    },

    // Teardown project - runs once after all tests to clean up database
    {
      name: "teardown",
      testMatch: /.*teardown\.ts/,
      dependencies: ["chromium"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev:e2e",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
