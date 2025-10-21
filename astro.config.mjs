// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  env: {
    schema: {
      // Public server variables - mogą być odczytane po stronie serwera
      SUPABASE_URL: envField.string({
        context: "server",
        access: "public",
      }),
      // Supabase anon key - zazwyczaj może być publiczny (używany w kliencie)
      SUPABASE_KEY: envField.string({
        context: "server",
        access: "public",
      }),
      // Secret - klucze API powinny być zawsze secret
      OPENROUTER_API_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
    },
    // Opcjonalnie: waliduj sekrety przy starcie aplikacji
    validateSecrets: true,
  },
});
