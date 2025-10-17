# Specyfikacja Techniczna: Moduł Uwierzytelniania Użytkowników

## Wprowadzenie

Niniejszy dokument opisuje architekturę i implementację modułu uwierzytelniania dla aplikacji "Generator Fiszek AI". Specyfikacja opiera się na wymaganiach zawartych w PRD (US-001, US-002, US-003, US-003a, US-003b, US-004) oraz na zdefiniowanym stosie technologicznym (Astro, React, Supabase).

## 1. Architektura Interfejsu Użytkownika

### 1.1. Zmiany w strukturze stron i layoutów

Wprowadzone zostaną nowe strony i modyfikacje w istniejących layoutach w celu rozróżnienia widoków dla użytkowników zalogowanych (auth) i niezalogowanych (non-auth).

**Nowe strony (w `./src/pages`):**

*   `login.astro`: Strona logowania.
*   `register.astro`: Strona rejestracji.
*   `reset-password.astro`: Strona do wysyłania linku resetującego hasło.
*   `update-password.astro`: Strona do ustawiania nowego hasła po kliknięciu w link resetujący.
*   `app/account-settings.astro`: Strona z ustawieniami konta (zmiana hasła, usunięcie konta).

**Modyfikacje Layoutów (w `./src/layouts`):**

*   `Layout.astro` (Publiczny): Będzie używany dla stron publicznych (`/`, `/login`, `/register`, `/reset-password`, `/update-password`). Nie będzie zawierał elementów nawigacyjnych specyficznych dla zalogowanego użytkownika. W nagłówku znajdą się linki "Zaloguj się" i "Zarejestruj się".
*   `AppLayout.astro` (Prywatny): Będzie używany dla wszystkich stron aplikacji wymagających uwierzytelnienia (`/app/*`). Będzie zawierał główną nawigację aplikacji, w tym menu użytkownika z opcjami "Ustawienia konta" i "Wyloguj".

### 1.2. Komponenty React

Cała logika formularzy, walidacji po stronie klienta i interakcji z API Supabase Auth zostanie zamknięta w komponentach React. Zostanie utworzony nowy katalog `src/components/auth`.

**Nowe komponenty (w `./src/components/auth`):**

*   `RegisterForm.tsx`:
    *   **Odpowiedzialność**: Formularz rejestracji z polami na email i hasło.
    *   **Interakcja**: Wywołuje funkcję `supabase.auth.signUp()` z Supabase JS client.
    *   **Walidacja**: Sprawdza poprawność formatu emaila, wymagania co do siły hasła (zgodnie z US-003b). Błędy (np. "Użytkownik już istnieje") będą wyświetlane pod odpowiednimi polami.
    *   **Scenariusze**:
        *   Sukces: Użytkownik jest informowany o konieczności potwierdzenia adresu email, a następnie przekierowywany na stronę logowania z komunikatem.
        *   Błąd: Wyświetla stosowny komunikat błędu.

*   `LoginForm.tsx`:
    *   **Odpowiedzialność**: Formularz logowania z polami na email i hasło.
    *   **Interakcja**: Wywołuje `supabase.auth.signInWithPassword()`.
    *   **Walidacja**: Sprawdza, czy pola nie są puste.
    *   **Scenariusze**:
        *   Sukces: Użytkownik jest przekierowywany do `/app/decks`.
        *   Błąd: Wyświetla komunikat "Nieprawidłowy email lub hasło".

*   `ResetPasswordForm.tsx`:
    *   **Odpowiedzialność**: Formularz z polem na email do wysłania linku resetującego.
    *   **Interakcja**: Wywołuje `supabase.auth.resetPasswordForEmail()`.
    *   **Scenariusze**:
        *   Sukces: Wyświetla komunikat "Jeśli konto istnieje, link do resetowania hasła został wysłany na podany adres email."
        *   Błąd: Obsługuje błędy sieciowe, ale nie informuje, czy email istnieje w bazie, ze względów bezpieczeństwa.

*   `UpdatePasswordForm.tsx`:
    *   **Odpowiedzialność**: Formularz do ustawienia nowego hasła. Dostępny tylko poprzez link z emaila.
    *   **Interakcja**: Wywołuje `supabase.auth.updateUser()` z nowym hasłem. Sesja użytkownika jest pobierana z parametrów URL (magic link).
    *   **Walidacja**: Sprawdza siłę nowego hasła i czy oba pola z hasłem są identyczne.
    *   **Scenariusze**:
        *   Sukces: Wyświetla komunikat "Hasło zostało zmienione." i przekierowuje na stronę logowania.
        *   Błąd: Wyświetla komunikat o błędzie (np. "Link wygasł").

*   `AccountSettingsView.tsx`:
    *   **Odpowiedzialność**: Komponent-kontener dla ustawień konta, zawierający dwa poniższe komponenty.
    *   **Lokalizacja**: `/src/components/account/AccountSettingsView.tsx`

*   `ChangePasswordForm.tsx`:
    *   **Odpowiedzialność**: Formularz zmiany hasła dla zalogowanego użytkownika (stare hasło, nowe hasło, powtórz nowe hasło).
    *   **Interakcja**: Wysyła dane do dedykowanego endpointu API (`/api/user/change-password`), który po stronie serwera zweryfikuje stare hasło i wywoła `supabase.auth.updateUser()`.
    *   **Walidacja**: Jak w `UpdatePasswordForm.tsx`, dodatkowo waliduje pole "Obecne hasło".

*   `DeleteAccountDialog.tsx`:
    *   **Odpowiedzialność**: Komponent modalny z potwierdzeniem usunięcia konta.
    *   **Interakcja**: Po potwierdzeniu wysyła żądanie `DELETE` do endpointu `/api/user`.
    *   **Scenariusze**:
        *   Sukces: Użytkownik jest wylogowywany i przekierowywany na stronę główną.
        *   Błąd: Wyświetla komunikat o błędzie.

### 1.3. Integracja Astro i React

*   Strony `.astro` będą odpowiedzialne za renderowanie layoutu i osadzanie w nim odpowiednich komponentów React (`<LoginForm client:load />`).
*   Przekierowania po udanych akcjach (logowanie, rejestracja) będą realizowane po stronie klienta za pomocą `window.location.href` wewnątrz komponentów React.

## 2. Logika Backendowa

### 2.1. Middleware (Ochrona tras)

Plik `src/middleware/index.ts` zostanie rozbudowany o logikę sprawdzania sesji użytkownika.

*   **Mechanizm**: Middleware będzie uruchamiany dla każdego żądania. Sprawdzi obecność i ważność tokena sesji (przechowywanego w `httpOnly` cookie) przy użyciu `supabase.auth.getUser()`.
*   **Logika**:
    *   Jeśli użytkownik próbuje uzyskać dostęp do ścieżki `/app/*` i nie ma ważnej sesji, zostanie przekierowany na `/login`.
    *   Jeśli użytkownik z ważną sesją próbuje uzyskać dostęp do `/login` lub `/register`, zostanie przekierowany do `/app/decks`.
*   **Przechowywanie sesji**: Sesja Supabase będzie synchronizowana z ciasteczkami po stronie serwera, co pozwoli na bezpieczne operacje w endpointach API i podczas renderowania stron po stronie serwera (SSR).

### 2.2. Endpointy API

Większość operacji autoryzacyjnych jest obsługiwana przez API Supabase po stronie klienta. Dedykowane endpointy API będą potrzebne dla operacji wymagających podwyższonych uprawnień lub walidacji po stronie serwera.

*   **`POST /api/auth/callback`**:
    *   **Odpowiedzialność**: Endpoint wymagany przez Supabase Server-Side Auth Helpers do wymiany kodu autoryzacyjnego na sesję i zapisania jej w ciasteczku.
*   **`POST /api/user/change-password`**:
    *   **Odpowiedzialność**: Bezpieczna zmiana hasła zalogowanego użytkownika.
    *   **Logika**:
        1.  Pobiera sesję użytkownika z ciasteczka.
        2.  Weryfikuje `stare hasło` poprzez próbę zalogowania z nim.
        3.  Jeśli weryfikacja jest poprawna, wywołuje `supabase.auth.updateUser()` z nowym hasłem.
        4.  Zwraca odpowiedni status HTTP (200 OK lub 400/401 w przypadku błędu).
*   **`DELETE /api/user`**:
    *   **Odpowiedzialność**: Bezpieczne usuwanie konta użytkownika.
    *   **Logika**:
        1.  Pobiera sesję użytkownika z ciasteczka, aby uzyskać jego ID.
        2.  Wywołuje `supabase.auth.admin.deleteUser(userId)` używając klucza `service_role` po stronie serwera. To gwarantuje usunięcie użytkownika z `auth.users` oraz kaskadowe usunięcie powiązanych z nim danych.
        3.  Zwraca status 204 No Content.

### 2.3. Renderowanie Server-Side (SSR)

Dzięki konfiguracji `output: "server"` i adapterowi `node`, Astro może renderować strony dynamicznie, uwzględniając stan zalogowania użytkownika.

*   **Przykład**: Strona `/app/decks.astro` będzie mogła na serwerze pobrać sesję użytkownika z `Astro.locals`, a następnie pobrać jego talie kart bezpośrednio z bazy danych Supabase, zanim strona zostanie wysłana do przeglądarki. Zapobiegnie to "mruganiu" interfejsu.

## 3. System Autentykacji (Integracja z Supabase Auth)

### 3.1. Konfiguracja Supabase

*   **Email Confirmation**: W ustawieniach Supabase Auth zostanie włączona opcja "Enable email confirmations".
*   **Szablony Email**: Zostaną dostosowane szablony emaili dla potwierdzenia rejestracji i resetowania hasła, aby zawierały linki kierujące do odpowiednich stron w aplikacji (`/update-password`).
*   **Row Level Security (RLS)**: Wszystkie istniejące i przyszłe tabele (`decks`, `flashcards`) będą miały włączone RLS. Polityki bezpieczeństwa zapewnią, że użytkownik może odczytywać i modyfikować tylko własne dane.

### 3.2. Klient Supabase

*   **Inicjalizacja**: Klient Supabase (`/src/db/supabase.client.ts`) zostanie skonfigurowany do użycia z pakietem `@supabase/auth-helpers-astro`, który automatyzuje zarządzanie sesją w ciasteczkach w środowisku serwerowym Astro.
*   **Zmienne środowiskowe**: Klucze `SUPABASE_URL` i `SUPABASE_ANON_KEY` będą przechowywane w zmiennych środowiskowych. Dla operacji administracyjnych w endpointach API użyty zostanie `SUPABASE_SERVICE_ROLE_KEY`.

### 3.3. Przepływ uwierzytelniania

1.  **Rejestracja**: Użytkownik wypełnia formularz, komponent wywołuje `supabase.auth.signUp()`, a Supabase wysyła email z linkiem potwierdzającym.
2.  **Logowanie**: Użytkownik wypełnia formularz, komponent wywołuje `supabase.auth.signInWithPassword()`, a Auth Helpers zapisują sesję w `httpOnly` cookie.
3.  **Wylogowanie**: Użytkownik klika "Wyloguj", wywoływana jest funkcja `supabase.auth.signOut()`, a ciasteczko sesji jest usuwane.
4.  **Odzyskiwanie hasła**: Użytkownik podaje email, `supabase.auth.resetPasswordForEmail()` wysyła link. Po kliknięciu, użytkownik trafia na stronę `/update-password`, gdzie formularz wywołuje `supabase.auth.updateUser()` z nowym hasłem.

