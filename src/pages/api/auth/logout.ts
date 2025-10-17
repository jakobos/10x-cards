import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  const { supabase } = locals;

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(null, {
      status: 200,
    });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(JSON.stringify({ error: "Wystąpił nieoczekiwany błąd" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
