# API Endpoint Implementation Plan: Flashcards CRUD

## 1. Przegląd punktu końcowego
Ten plan opisuje implementację trzech endpointów REST API do zarządzania zasobami typu "flashcard" (fiszka): tworzenia, aktualizacji i usuwania. Endpointy te stanowią podstawowe operacje CRUD dla fiszek w kontekście określonej talii (`deck`).

## 2. Szczegóły żądania

### Create Flashcard
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/decks/{deckId}/flashcards`
- **Parametry**:
  - **Wymagane**:
    - `deckId` (parametr ścieżki): UUID talii, do której zostanie dodana fiszka.
- **Request Body**:
  ```json
  {
    "front": "string (max 200)",
    "back": "string (max 500)",
    "source": "'manual' | 'ai-full' | 'ai-edited'"
  }
  ```

### Update Flashcard
- **Metoda HTTP**: `PATCH`
- **Struktura URL**: `/api/flashcards/{flashcardId}`
- **Parametry**:
  - **Wymagane**:
    - `flashcardId` (parametr ścieżki): UUID fiszki do zaktualizowania.
- **Request Body**: (Przynajmniej jedno pole jest wymagane)
  ```json
  {
    "front": "string (max 200)",
    "back": "string (max 500)"
  }
  ```

### Delete Flashcard
- **Metoda HTTP**: `DELETE`
- **Struktura URL**: `/api/flashcards/{flashcardId}`
- **Parametry**:
  - **Wymagane**:
    - `flashcardId` (parametr ścieżki): UUID fiszki do usunięcia.

## 3. Wykorzystywane typy
Do implementacji zostaną użyte następujące, zdefiniowane w `src/types.ts`, typy:
-   **Command Models**:
    -   `CreateFlashcardCommand`
    -   `UpdateFlashcardCommand`
-   **DTOs (Data Transfer Objects)**:
    -   `FlashcardDetailsDto`
    -   `UpdatedFlashcardDto`

## 4. Szczegóły odpowiedzi

### Create Flashcard
- **Kod sukcesu**: `201 Created`
- **Ciało odpowiedzi**: `FlashcardDetailsDto`
  ```json
  {
    "id": "uuid-string",
    "deckId": "uuid-string",
    "front": "...",
    "back": "...",
    "source": "...",
    "createdAt": "timestamp"
  }
  ```

### Update Flashcard
- **Kod sukcesu**: `200 OK`
- **Ciało odpowiedzi**: `UpdatedFlashcardDto`
  ```json
  {
    "id": "uuid-string",
    "deckId": "uuid-string",
    "front": "...",
    "back": "...",
    "source": "...",
    "updatedAt": "timestamp"
  }
  ```

### Delete Flashcard
- **Kod sukcesu**: `204 No Content`
- **Ciało odpowiedzi**: Brak.

## 5. Przepływ danych
1.  Żądanie trafia do endpointu API Astro (`/api/...`).
2.  Middleware (`src/middleware/index.ts`) weryfikuje sesję użytkownika. Jeśli jest nieprawidłowa, zwraca `401 Unauthorized`.
3.  Handler endpointu (np. `POST`) parsuje parametry ścieżki i ciało żądania.
4.  Dane wejściowe są walidowane za pomocą predefiniowanego schematu Zod. W przypadku błędu walidacji zwracany jest `400 Bad Request`.
5.  Handler wywołuje odpowiednią metodę z `FlashcardService` (`src/lib/services/flashcard.service.ts`), przekazując klienta Supabase z `context.locals` oraz zwalidowane dane.
6.  Metoda w serwisie wykonuje operację na bazie danych PostgreSQL za pośrednictwem Supabase Client.
7.  Polityki RLS (Row Level Security) na poziomie bazy danych zapewniają, że użytkownik ma uprawnienia do wykonania operacji na danym zasobie.
8.  Serwis zwraca wynik (lub błąd) do handlera endpointu.
9.  Handler formatuje odpowiedź (np. używając DTO) i zwraca ją do klienta z odpowiednim kodem statusu.

## 6. Względy bezpieczeństwa
-   **Uwierzytelnianie**: Każde żądanie musi być uwierzytelnione. Dostęp do endpointów będzie chroniony przez middleware, który weryfikuje token JWT użytkownika Supabase.
-   **Autoryzacja**: Polityki RLS zdefiniowane w `db-plan.md` zostaną wykorzystane do autoryzacji. Użytkownik będzie mógł tworzyć fiszki tylko w swoich taliach oraz modyfikować i usuwać tylko własne fiszki. Próba dostępu do cudzych zasobów spowoduje błąd, który zostanie obsłużony jako `404 Not Found`.
-   **Walidacja danych**: Wszystkie dane wejściowe od klienta będą ściśle walidowane za pomocą Zod, aby zapobiec nieprawidłowym danym i potencjalnym atakom (np. XSS, chociaż w kontekście API jest to mniej krytyczne).

## 7. Obsługa błędów
-   **`400 Bad Request`**: Zwracany, gdy dane wejściowe nie przejdą walidacji Zod (np. brakujące pola, niepoprawny format, przekroczenie limitu znaków).
-   **`401 Unauthorized`**: Zwracany przez middleware, gdy użytkownik nie jest zalogowany.
-   **`404 Not Found`**: Zwracany, gdy zasób (talia lub fiszka) nie istnieje lub użytkownik nie ma do niego uprawnień.
-   **`500 Internal Server Error`**: Zwracany w przypadku nieoczekiwanych błędów serwera, np. problemów z połączeniem z bazą danych.

## 8. Rozważania dotyczące wydajności
-   Operacje CRUD na pojedynczych rekordach są z natury wydajne.
-   Kluczowe jest istnienie indeksów na kluczach obcych (`deck_id`, `generation_id`) w tabeli `flashcards`, co zostało zaplanowane w `db-plan.md`. Zapewni to szybkie wyszukiwanie i łączenie danych.

## 9. Etapy wdrożenia
1.  **Utworzenie schematów walidacji Zod**:
    -   Zdefiniować schematy dla parametrów ścieżki i ciała żądań dla operacji `create`, `update` i `delete`. Umieścić je w nowym pliku `src/lib/validation/flashcard.schemas.ts`.

2.  **Implementacja logiki w `FlashcardService`**:
    -   Dodać metody `createFlashcard`, `updateFlashcard` i `deleteFlashcard` w pliku `src/lib/services/flashcard.service.ts`.
    -   Metody te powinny przyjmować klienta Supabase, ID zasobów i zwalidowane dane (Command Models) jako argumenty.
    -   Implementacja powinna obsługiwać błędy zwracane przez Supabase (np. naruszenie RLS, brak zasobu) i rzucać odpowiednie wyjątki lub zwracać wartości, które endpoint będzie mógł zinterpretować.

3.  **Utworzenie plików endpointów API Astro**:
    -   Utworzyć plik `src/pages/api/decks/[deckId]/flashcards/index.ts` i zaimplementować w nim handler `POST` dla tworzenia fiszki.
    -   Utworzyć plik `src/pages/api/flashcards/[flashcardId].ts` i zaimplementować w nim handlery `PATCH` i `DELETE` dla aktualizacji i usuwania fiszek.

4.  **Implementacja logiki w handlerach API**:
    -   W każdym handlerze:
        -   Pobrać klienta Supabase i dane użytkownika z `context.locals`.
        -   Przeprowadzić walidację danych wejściowych za pomocą przygotowanych schematów Zod.
        -   Wywołać odpowiednią metodę z `FlashcardService`.
        -   Obsłużyć potencjalne błędy i zwrócić odpowiednie kody statusu.
        -   W przypadku sukcesu, sformatować dane wyjściowe za pomocą DTO i zwrócić odpowiedź z poprawnym kodem statusu.
