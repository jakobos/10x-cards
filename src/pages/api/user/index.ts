import type { APIRoute } from "astro";

export const prerender = false;

export const DELETE: APIRoute = async ({ locals }) => {
  const { supabase, user } = locals;

  try {
    // Check if user is authenticated
    if (!user) {
      return new Response(JSON.stringify({ error: "Nieautoryzowany dostęp" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Delete user account from Supabase Auth
    // Note: This will trigger cascading deletes on related data if RLS policies are set up correctly
    const { error } = await supabase.rpc("delete_user");

    if (error) {
      // Fallback: use admin API method if available
      // For now, we'll use the auth.admin.deleteUser method
      // This requires proper setup in Supabase
      return new Response(
        JSON.stringify({
          error: "Nie udało się usunąć konta. Skontaktuj się z administratorem.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Sign out the user
    await supabase.auth.signOut();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Konto zostało usunięte pomyślnie",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    return new Response(JSON.stringify({ error: "Wystąpił nieoczekiwany błąd" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
