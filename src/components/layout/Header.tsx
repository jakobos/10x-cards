export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4">
        <div className="flex items-center gap-6">
          <a href="/app/decks" className="text-lg font-semibold transition-colors hover:text-foreground/80">
            Moje Talie
          </a>
        </div>
      </div>
    </header>
  );
}
