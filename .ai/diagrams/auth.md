```mermaid
sequenceDiagram
    autonumber
    
    participant Użytkownik as Przeglądarka
    participant Frontend as Astro (Frontend)
    participant Middleware as Astro (Middleware)
    participant Supabase as Supabase Auth

    Note over Przeglądarka, Supabase: Scenariusz 1: Logowanie i dostęp do chronionej strony

    Przeglądarka->>Frontend: Wypełnia i wysyła formularz logowania
    activate Frontend
    Frontend->>Supabase: signInWithPassword(email, password)
    activate Supabase
    Supabase-->>Frontend: Zwraca sesję (Access & Refresh Token)
    deactivate Supabase
    Note right of Frontend: Supabase Auth Helper zapisuje sesję w cookie httpOnly
    Frontend-->>Przeglądarka: Przekierowanie na /app/decks
    deactivate Frontend

    Przeglądarka->>Middleware: Żądanie GET /app/decks (z cookie sesyjnym)
    activate Middleware
    Middleware->>Supabase: getUser(request.cookies)
    activate Supabase
    Supabase-->>Middleware: Zwraca dane zalogowanego użytkownika
    deactivate Supabase
    
    alt Sesja jest ważna
        Middleware-->>Przeglądarka: Renderuje stronę /app/decks (kod 200)
    else Sesja jest nieważna
        Middleware-->>Przeglądarka: Przekierowanie na /login (kod 302)
    end
    deactivate Middleware

    Note over Przeglądarka, Supabase: Scenariusz 2: Rejestracja nowego użytkownika

    Przeglądarka->>Frontend: Wypełnia formularz rejestracji
    activate Frontend
    Frontend->>Supabase: signUp(email, password)
    activate Supabase
    Supabase-->>Frontend: Zwraca pomyślną odpowiedź
    deactivate Supabase
    par Wysyłka maila
        Supabase->>Przeglądarka: Wyślij email z linkiem weryfikacyjnym
    and Odpowiedź do UI
        Frontend-->>Przeglądarka: Wyświetl komunikat "Sprawdź email"
    end
    deactivate Frontend
    
    Przeglądarka->>Supabase: Użytkownik klika link weryfikacyjny
    activate Supabase
    Supabase->>Supabase: Weryfikuje token i aktywuje konto
    Supabase-->>Przeglądarka: Przekierowanie na stronę logowania
    deactivate Supabase

    Note over Przeglądarka, Supabase: Scenariusz 3: Automatyczne odświeżenie sesji
    
    Przeglądarka->>Middleware: Żądanie do zasobu z wygasłym Access Token
    activate Middleware
    Middleware->>Supabase: Próba weryfikacji starego tokenu
    activate Supabase
    Supabase-->>Middleware: Odpowiedź, że token wygasł
    deactivate Supabase
    Note right of Middleware: Supabase Auth Helper używa Refresh Tokena
    Middleware->>Supabase: Żądanie o nowy Access Token
    activate Supabase
    Supabase-->>Middleware: Zwraca nowy Access Token i aktualizuje sesję
    deactivate Supabase
    Middleware-->>Przeglądarka: Dostęp przyznany, zwraca zasób
    deactivate Middleware