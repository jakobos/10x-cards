# Plan implementacji widoku - Globalna nawigacja i układ

## 1. Przegląd
Ten dokument opisuje plan wdrożenia globalnego układu i systemu nawigacji dla zalogowanych użytkowników aplikacji. Celem jest stworzenie spójnego interfejsu, który zapewni łatwy dostęp do kluczowych sekcji aplikacji, obsługę sesji użytkownika oraz kontekstową nawigację w widokach zagnieżdżonych. Układ będzie składał się z głównego nagłówka i dynamicznego komponentu "breadcrumbs" (okruszki chleba).

## 2. Routing widoku
Globalny układ będzie zastosowany do wszystkich stron wewnątrz aplikacji dostępnych po zalogowaniu, czyli wszystkich ścieżek pod adresem `/app/*`. Komponent `AppLayout.astro` będzie pełnił rolę layoutu dla tych stron, zabezpieczając je przed dostępem nieautoryzowanych użytkowników i renderując spójne elementy UI.

## 3. Struktura komponentów
Hierarchia komponentów dla globalnego układu będzie następująca:

```
src/layouts/AppLayout.astro
|
+-- src/components/layout/Header.tsx
|   |
|   +-- (Link "Moje Talie")
|   |
|   +-- src/components/layout/UserNav.tsx
|       |
|       +-- (Shadcn/ui DropdownMenu)
|           |
|           +-- (Link do "Ustawień Konta")
|           |
|           +-- (Przycisk "Wyloguj")
|
+-- src/components/layout/Breadcrumbs.astro
|   |
|   +-- (Dynamicznie generowane linki)
|
+-- <slot /> (Zawartość strony)
```

## 4. Szczegóły komponentów

### `AppLayout.astro`
- **Opis komponentu**: Główny layout dla wszystkich stron aplikacji wymagających autoryzacji. Będzie odpowiedzialny za weryfikację sesji użytkownika na serwerze, przekierowanie do strony logowania w przypadku braku sesji oraz renderowanie globalnych komponentów UI (`Header`, `Breadcrumbs`) i treści właściwej strony (`<slot />`). **Automatycznie generuje breadcrumbs na podstawie URL path.**
- **Główne elementy**: Komponenty `Header`, `Breadcrumbs` oraz `<slot />` Astro.
- **Obsługiwane interakcje**: Brak, komponent strukturalny.
- **Obsługiwana walidacja**: Sprawdzenie istnienia aktywnej sesji użytkownika. W przypadku jej braku, nastąpi przekierowanie na stronę logowania.
- **Typy**: `Session` z `@supabase/supabase-js`, `BreadcrumbItem` (generowany wewnętrznie).
- **Propsy**: `title?: string`, `deckName?: string` (opcjonalne, używane do wyświetlania nazwy talii w breadcrumbs).

### `Header.tsx`
- **Opis komponentu**: Komponent React renderujący główny nagłówek aplikacji. Zawiera link do listy talii oraz menu użytkownika.
- **Główne elementy**: `<a>` (HTML), komponent `UserNav`.
- **Obsługiwane interakcje**: Kliknięcie linku "Moje Talie".
- **Obsługiwana walidacja**: Brak.
- **Typy**: `User` z `@supabase/supabase-js`.
- **Propsy**: `user: User`.

### `UserNav.tsx`
- **Opis komponentu**: Interaktywny komponent React (z `client:visible`), który wyświetla menu użytkownika. Używa komponentów `DropdownMenu` z biblioteki `shadcn/ui`. Po kliknięciu avatara/ikony użytkownika rozwija menu z linkiem do ustawień konta i przyciskiem wylogowania.
- **Główne elementy**: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator` z `shadcn/ui`.
- **Obsługiwane interakcje**:
    - Kliknięcie w `DropdownMenuTrigger` rozwija/zwija menu.
    - Kliknięcie w opcję "Ustawienia Konta" nawiguje do `/app/settings`.
    - Kliknięcie w przycisk "Wyloguj" uruchamia proces wylogowania.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `User` z `@supabase/supabase-js`.
- **Propsy**: `user: User`.

### `Breadcrumbs.astro`
- **Opis komponentu**: Komponent Astro, który renderuje nawigację okruszkową (breadcrumbs) na podstawie danych otrzymanych z propsów. Ułatwia orientację w zagnieżdżonych widokach.
- **Główne elementy**: Lista linków `<a>` (HTML) oddzielonych separatorem.
- **Obsługiwane interakcje**: Kliknięcie w link nawigacyjny.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `BreadcrumbItem[]`.
- **Propsy**: `items: BreadcrumbItem[]`.

## 5. Typy

### `User` (z `@supabase/supabase-js`)
Obiekt reprezentujący zalogowanego użytkownika, dostarczany przez Supabase.
- `id: string`
- `email?: string`
- `user_metadata: { [key: string]: any }` (może zawierać np. `avatar_url`, `full_name`)

### `BreadcrumbItem` (ViewModel)
Niestandardowy typ do reprezentowania pojedynczego elementu w nawigacji breadcrumbs.
- `label: string` - Etykieta tekstowa do wyświetlenia (np. "Moje Talie").
- `href?: string` - Opcjonalny URL. Ostatni element nawigacji zazwyczaj nie jest linkiem.

## 6. Zarządzanie stanem
Stan sesji użytkownika jest zarządzany przez Supabase. Layout `AppLayout.astro` będzie pobierał stan sesji po stronie serwera przy każdym żądaniu strony.
- **Pobieranie sesji**: W skrypcie `AppLayout.astro` zostanie użyta funkcja `Astro.locals.supabase.auth.getSession()` do pobrania aktualnej sesji.
- **Przekazywanie danych**: Obiekt `user` z sesji zostanie przekazany jako prop do komponentu `Header.tsx`, a następnie do `UserNav.tsx`.
- **Stan po stronie klienta**: Jedyną operacją modyfikującą stan sesji po stronie klienta będzie wylogowanie w `UserNav.tsx`, które wywoła `supabase.auth.signOut()`.

Nie ma potrzeby tworzenia złożonych customowych hooków do zarządzania stanem na tym etapie.

## 7. Integracja API
Integracja dotyczy wyłącznie API autoryzacji Supabase.

- **Weryfikacja sesji (Server-Side)**:
    - **Endpoint**: `Astro.locals.supabase.auth.getSession()`
    - **Logika**: Wywoływane w `AppLayout.astro`. Jeśli `session` ma wartość `null`, następuje przekierowanie `Astro.redirect('/login')`.
- **Wylogowanie (Client-Side)**:
    - **Endpoint**: `supabase.auth.signOut()`
    - **Logika**: Wywoływane w komponencie `UserNav.tsx` po kliknięciu przycisku "Wyloguj". Po pomyślnym wylogowaniu, użytkownik jest przekierowywany na stronę główną (`/`).

## 8. Interakcje użytkownika
- **Nawigacja do listy talii**: Użytkownik klika link "Moje Talie" w nagłówku i zostaje przeniesiony na stronę `/app/decks`.
- **Otwarcie menu użytkownika**: Użytkownik klika na swój awatar/ikonę w nagłówku, co powoduje rozwinięcie menu kontekstowego.
- **Nawigacja do ustawień**: Użytkownik klika link "Ustawienia Konta" w menu, co przenosi go na stronę `/app/settings`.
- **Wylogowanie**: Użytkownik klika przycisk "Wyloguj" w menu. Aplikacja kończy jego sesję i przekierowuje na stronę główną.
- **Nawigacja "okruszkowa"**: Użytkownik klika na link w komponencie `Breadcrumbs`, co przenosi go do odpowiedniego widoku nadrzędnego.

## 9. Warunki i walidacja
Głównym warunkiem jest **autoryzacja użytkownika**.
- **Komponent**: `AppLayout.astro`.
- **Walidacja**: Przed renderowaniem jakiejkolwiek strony chronionej, skrypt serwerowy layoutu sprawdza obecność i ważność sesji Supabase.
- **Wpływ na interfejs**: Brak sesji uniemożliwia dostęp do stron w katalogu `/app/*` i powoduje natychmiastowe przekierowanie do formularza logowania.

## 10. Obsługa błędów
- **Błąd wylogowania**: W przypadku problemów z siecią lub błędów po stronie Supabase podczas wylogowywania, operacja `supabase.auth.signOut()` może zwrócić błąd.
    - **Obsługa**: Należy obsłużyć błąd w bloku `catch` w `UserNav.tsx`. Użytkownikowi powinno zostać wyświetlone powiadomienie (toast) z informacją o niepowodzeniu, np. "Wylogowanie nie powiodło się. Spróbuj ponownie." (z użyciem biblioteki `sonner`).
- **Błąd pobierania sesji**: Jeśli wystąpi błąd podczas pobierania sesji na serwerze, należy to potraktować jako brak sesji i przekierować użytkownika na stronę logowania.

## 11. Kroki implementacji

### ✅ Zrealizowane kroki (Faza 1 - bez autoryzacji)
1.  **✅ Dodanie typów**:
    - Dodano typ `BreadcrumbItem` do `src/types.ts`.
2.  **✅ Stworzenie komponentów**: Utworzono pliki dla nowych komponentów:
    - `src/layouts/AppLayout.astro`
    - `src/components/layout/Header.tsx`
    - `src/components/layout/Breadcrumbs.astro`
3.  **✅ Implementacja `AppLayout.astro`**:
    - Zaimplementowano strukturę HTML/Astro z komponentami `Header` i `Breadcrumbs` oraz `<slot />`.
    - **Automatyczne generowanie breadcrumbs** na podstawie `Astro.url.pathname`:
      - `/app/decks` → `[{ label: "Moje Talie" }]`
      - `/app/decks/[deckId]` → `[{ label: "Moje Talie", href: "/app/decks" }, { label: deckName }]`
      - `/app/decks/[deckId]/generate` → `[{ label: "Moje Talie", href: "/app/decks" }, { label: deckName, href: "/app/decks/${deckId}" }, { label: "Generuj fiszki AI" }]`
    - Propsy: `title` i opcjonalny `deckName` (zamiast `breadcrumbs`).
    - ⚠️ **Pominięto**: Weryfikacja sesji i przekierowanie (zostanie dodane w fazie autoryzacji).
4.  **✅ Implementacja `Header.tsx`**:
    - Utworzono sticky nagłówek z linkiem "Moje Talie".
    - ⚠️ **Pominięto**: Komponent `UserNav` (zostanie dodany w fazie autoryzacji).
5.  **✅ Implementacja `Breadcrumbs.astro`**:
    - Utworzono logikę renderowania listy linków na podstawie propsa `items`.
    - Ostylowano komponent używając Tailwind CSS z separatorami.
    - Dodano odpowiednią semantykę ARIA dla dostępności.
6.  **✅ Aktualizacja stron**: Zmodyfikowano wszystkie strony w katalogu `/app`:
    - `src/pages/app/decks.astro` - używa `AppLayout` bez dodatkowych propsów (breadcrumbs generowane automatycznie)
    - `src/pages/app/decks/[deckId].astro` - przekazuje `deckName={deck.name}` do `AppLayout`
    - `src/pages/app/decks/[deckId]/generate.astro` - przekazuje `deckName={deck.name}` do `AppLayout`
7.  **✅ Styling**: Użyto Tailwind CSS do ostylowania wszystkich nowych komponentów.

### 🔮 Zaplanowane kroki (Faza 2 - autoryzacja)
Zostaną zrealizowane w późniejszym etapie:
- **Weryfikacja sesji w `AppLayout.astro`**: Dodanie logiki sprawdzania sesji Supabase i przekierowania do `/login`.
- **Implementacja `UserNav.tsx`**: Komponent menu użytkownika z dropdown menu, opcjami ustawień i wylogowania.
- **Strona logowania**: Utworzenie strony `/login` dla niezalogowanych użytkowników.

