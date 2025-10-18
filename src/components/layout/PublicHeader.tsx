import { Button } from "@/components/ui/button";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <a href="/" className="text-lg font-semibold transition-colors hover:text-foreground/80">
          10x Cards
        </a>
        <nav className="flex items-center gap-4">
          <a
            href="/login"
            data-testid="login-link"
            className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Zaloguj się
          </a>
          <Button asChild size="sm">
            <a href="/register" data-testid="register-link">
              Zarejestruj się
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
