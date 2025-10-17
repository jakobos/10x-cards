import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance } from "../db/supabase.client.ts";

const PROTECTED_PATHS = ["/app"];
const PUBLIC_AUTH_PATHS = ["/login", "/register", "/reset-password", "/update-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers,
  });

  context.locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    context.locals.user = {
      email: user.email,
      id: user.id,
    };
  }

  const currentPath = context.url.pathname;

  // Redirect authenticated users away from public auth pages
  if (user && PUBLIC_AUTH_PATHS.includes(currentPath)) {
    return context.redirect("/app/decks");
  }

  // Redirect unauthenticated users from protected pages to login
  if (!user && PROTECTED_PATHS.some((path) => currentPath.startsWith(path))) {
    return context.redirect("/login");
  }

  return next();
});
