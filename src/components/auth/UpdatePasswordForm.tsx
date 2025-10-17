import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { validatePassword } from "@/lib/helpers";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have valid session/token from the email link
    const checkToken = async () => {
      try {
        // TODO: Implement Supabase auth integration
        // Check for hash params or session
        // const { data } = await supabase.auth.getSession();
        // setIsValidToken(!!data.session);

        // Placeholder - check for hash params
        const hash = window.location.hash;
        setIsValidToken(hash.includes("access_token") || hash.includes("type=recovery"));
      } catch (err) {
        setIsValidToken(false);
        console.error("Token validation error:", err);
      }
    };

    checkToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Wszystkie pola są wymagane");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement Supabase auth integration
      // const { error } = await supabase.auth.updateUser({ password });
      // if (error) throw error;

      console.log("Password update attempt");
      // Placeholder for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login?message=password-updated";
      }, 2000);
    } catch (err) {
      setError("Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie.");
      console.error("Password update error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isValidToken === false) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Link wygasł</CardTitle>
          <CardDescription>Ten link do resetowania hasła wygasł lub jest nieprawidłowy</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aby zresetować hasło, wyślij nową prośbę o reset hasła.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <a href="/reset-password">Wyślij nowy link</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Hasło zostało zmienione</CardTitle>
          <CardDescription>Twoje hasło zostało pomyślnie zaktualizowane</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Za chwilę zostaniesz przekierowany na stronę logowania...</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <a href="/login">Przejdź do logowania</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Ustaw nowe hasło</CardTitle>
        <CardDescription>Wprowadź nowe hasło dla swojego konta</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="password">Nowe hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">Minimum 8 znaków, w tym jedna wielka litera i jedna cyfra</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Powtórz nowe hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Zapisywanie..." : "Zmień hasło"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
