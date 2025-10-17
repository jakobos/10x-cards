import type { APIRoute } from "astro";
import { validatePassword } from "@/lib/helpers";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase } = locals;

  try {
    const { email, password, confirmPassword } = await request.json();

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      return new Response(JSON.stringify({ error: "Wszystkie pola są wymagane" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return new Response(JSON.stringify({ error: passwordError }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ error: "Hasła nie są identyczne" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/login`,
      },
    });

    if (error) {
      // Handle specific Supabase errors
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        return new Response(JSON.stringify({ error: "Użytkownik z tym adresem email już istnieje" }), {
          status: 409,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: "Wystąpił nieoczekiwany błąd" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
