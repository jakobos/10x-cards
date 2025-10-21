/// <reference types="astro/client" />
/// <reference types="astro/env" />

import type { SupabaseClient } from "./db/supabase.client.ts";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

// Stary interfejs nie jest już potrzebny przy używaniu astro:env
// interface ImportMetaEnv {
//   readonly SUPABASE_URL: string;
//   readonly SUPABASE_KEY: string;
//   readonly OPENROUTER_API_KEY: string;
// }
//
// interface ImportMeta {
//   readonly env: ImportMetaEnv;
// }
