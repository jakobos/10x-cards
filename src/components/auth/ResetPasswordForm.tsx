import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Adres email jest wymagany");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement Supabase auth integration
      // const { error } = await supabase.auth.resetPasswordForEmail(email, {
      //   redirectTo: `${window.location.origin}/update-password`,
      // });
      // if (error) throw error;

      // Placeholder for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Sprawdź swoją skrzynkę email</CardTitle>
          <CardDescription>Link do resetowania hasła został wysłany</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Jeśli konto z adresem <strong>{email}</strong> istnieje, otrzymasz wiadomość email z linkiem do resetowania
            hasła.
          </p>
          <p className="text-sm text-muted-foreground">Jeśli nie widzisz wiadomości, sprawdź folder spam.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <a href="/login">Wróć do logowania</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Resetuj hasło</CardTitle>
        <CardDescription>Wprowadź swój adres email, aby otrzymać link do resetowania hasła</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Wysyłanie..." : "Wyślij link resetujący"}
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            Pamiętasz hasło?{" "}
            <a href="/login" className="text-primary hover:underline">
              Zaloguj się
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
