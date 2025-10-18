import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Use happy-dom as the test environment (faster than jsdom)
    environment: "happy-dom",

    // Global test configuration
    globals: true,

    // Setup files to run before tests
    setupFiles: ["./tests/setup/vitest.setup.ts"],

    // Include and exclude patterns
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".astro", "playwright", "**/e2e/**"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "**/*.d.ts", "**/*.config.*", "**/mockData", "**/.astro", "dist"],
    },

    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/db": path.resolve(__dirname, "./src/db"),
    },
  },
});
