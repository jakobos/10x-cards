import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon, SettingsIcon, LogOutIcon } from "lucide-react";

interface HeaderProps {
  userEmail?: string;
}

export default function Header({ userEmail }: HeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Nie udało się wylogować");
      }

      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <a
            href="/app/decks"
            data-testid="decks-link"
            className="text-lg font-semibold transition-colors hover:text-foreground/80"
          >
            Moje Talie
          </a>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="user-menu-trigger" className="rounded-full">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Menu użytkownika</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {userEmail && (
                <>
                  <DropdownMenuLabel data-testid="user-email-label">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Moje konto</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <a
                  href="/app/account-settings"
                  data-testid="account-settings-link"
                  className="flex items-center cursor-pointer"
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Ustawienia konta</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                data-testid="logout-button"
                disabled={isLoggingOut}
                variant="destructive"
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Wylogowywanie..." : "Wyloguj"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
