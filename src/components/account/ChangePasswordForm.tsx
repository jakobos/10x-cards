import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validatePassword } from "@/lib/helpers";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Wszystkie pola są wymagane");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Nowe hasła nie są identyczne");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Nowe hasło musi być inne niż obecne");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie.");
      console.error("Change password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zmień hasło</CardTitle>
        <CardDescription>Zaktualizuj swoje hasło, aby zachować bezpieczeństwo konta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</div>}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
              Hasło zostało pomyślnie zmienione
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Obecne hasło</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nowe hasło</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

          <Button type="submit" disabled={loading}>
            {loading ? "Zapisywanie..." : "Zmień hasło"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
