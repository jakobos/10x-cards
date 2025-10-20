import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Obecne hasło jest wymagane"),
  newPassword: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
});

export const POST: APIRoute = async ({ request, locals }) => {
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

    const body = await request.json();

    // Validate input
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return new Response(JSON.stringify({ error: firstError.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return new Response(JSON.stringify({ error: "Nowe hasło musi być inne niż obecne" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || "", // Handle potential null case
      password: currentPassword,
    });

    if (signInError) {
      return new Response(JSON.stringify({ error: "Nieprawidłowe obecne hasło" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return new Response(JSON.stringify({ error: "Nie udało się zmienić hasła" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Hasło zostało zmienione pomyślnie" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Wystąpił nieoczekiwany błąd" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
