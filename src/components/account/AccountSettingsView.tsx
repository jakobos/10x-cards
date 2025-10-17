import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChangePasswordForm from "./ChangePasswordForm";
import DeleteAccountDialog from "./DeleteAccountDialog";

export default function AccountSettingsView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Ustawienia konta</h1>
        <p className="text-muted-foreground">Zarządzaj swoim kontem i ustawieniami bezpieczeństwa</p>
      </div>

      <ChangePasswordForm />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Strefa niebezpieczna</CardTitle>
          <CardDescription>Nieodwracalne i destrukcyjne operacje na koncie</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Usuń konto</p>
              <p className="text-sm text-muted-foreground">
                Trwale usuń swoje konto i wszystkie powiązane dane. Ta operacja nie może być cofnięta.
              </p>
            </div>
            <DeleteAccountDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
