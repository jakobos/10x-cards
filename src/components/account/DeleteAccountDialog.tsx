import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DeleteAccountDialog() {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "USUŃ KONTO") {
      setError('Wpisz poprawnie "USUŃ KONTO" aby potwierdzić');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Redirect to home page after successful deletion
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd podczas usuwania konta. Spróbuj ponownie.");
      console.error("Delete account error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Usuń konto</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć konto?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Ta operacja jest <strong>nieodwracalna</strong>. Wszystkie Twoje dane, w tym talie kart i fiszki, zostaną
              trwale usunięte.
            </p>

            <div className="space-y-2 pt-4">
              <Label htmlFor="confirmText">
                Wpisz <strong>USUŃ KONTO</strong> aby potwierdzić
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setError("");
                }}
                placeholder="USUŃ KONTO"
                disabled={loading}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading || !confirmText}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Usuwanie..." : "Usuń konto"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
