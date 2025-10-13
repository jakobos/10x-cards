# API Endpoint Implementation Plan: Batch Create AI-Generated Flashcards

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia masowe tworzenie fiszek w określonej talii na podstawie listy kandydatów wygenerowanych przez AI. Każda nowo utworzona fiszka jest powiązana z sesją generowania (`generationId`), a metryki tej sesji są aktualizowane w celu śledzenia, ile fiszek zostało zaakceptowanych z edycją, a ile bez. Operacja jest transakcyjna, aby zapewnić spójność danych.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/decks/{deckId}/flashcards/batch`
- **Parametry ścieżki**:
  - Wymagane:
    - `deckId` (UUID): Identyfikator talii, do której dodawane są fiszki.
- **Ciało żądania (Request Body)**:
  - Struktura:
    ```json
    {
      "generationId": "string (uuid)",
      "flashcards": [
        {
          "front": "string",
          "back": "string",
          "source": "ai-full" | "ai-edited"
        }
      ]
    }
    ```
  - Walidacja (Zod):
    - `generationId`: Musi być poprawnym UUID.
    - `flashcards`: Musi być tablicą zawierającą od 1 do 50 elementów.
    - `flashcards[].front`: `string`, wymagany, min. 1 znak, max. 200 znaków.
    - `flashcards[].back`: `string`, wymagany, min. 1 znak, max. 500 znaków.
    - `flashcards[].source`: `string`, musi być `'ai-full'` lub `'ai-edited'`.

## 3. Wykorzystywane typy
- `BatchCreateFlashcardsCommand` (`src/types.ts`): Model komendy dla ciała żądania.
- `BatchFlashcardItemDto` (`src/types.ts`): DTO dla pojedynczego elementu w tablicy `flashcards`.
- `BatchCreateFlashcardsResponseDto` (`src/types.ts`): DTO dla odpowiedzi w przypadku sukcesu.

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu**:
  - **Kod**: `201 Created`
  - **Ciało odpowiedzi**:
    ```json
    {
      "createdCount": 2,
      "generationId": "existing-generation-uuid"
    }
    ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Nieprawidłowe dane wejściowe.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `404 Not Found`: Talia lub sesja generowania nie istnieje lub nie należy do użytkownika.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1.  Żądanie `POST` trafia do endpointa Astro (`src/pages/api/decks/[deckId]/flashcards/batch.ts`).
2.  Middleware weryfikuje sesję użytkownika. Jeśli sesja jest nieprawidłowa, zwraca `401`.
3.  Endpoint wywołuje walidator Zod w celu sprawdzenia poprawności `deckId` i ciała żądania. W przypadku błędu zwraca `401`.
4.  Endpoint wywołuje metodę serwisu, np. `FlashcardService.createFromAIGeneration()`, przekazując `deckId`, dane z ciała żądania oraz `userId` z sesji.
5.  Serwis rozpoczyna transakcję bazodanową.
6.  Serwis weryfikuje, czy talia (`deckId`) i sesja generowania (`generationId`) istnieją i należą do danego `userId`. Jeśli nie, transakcja jest wycofywana i zwracany jest błąd `404`.
7.  Serwis oblicza liczbę fiszek z `source: 'ai-full'` (`accepted_unedited_count`) i `source: 'ai-edited'` (`accepted_edited_count`).
8.  Serwis wstawia nowe fiszki do tabeli `flashcards`, powiązując je z `deckId` i `generationId`.
9.  Serwis aktualizuje rekord w tabeli `generations`, ustawiając `accepted_unedited_count` i `accepted_edited_count`.
10. Transakcja jest zatwierdzana.
11. Serwis zwraca liczbę utworzonych fiszek.
12. Endpoint formatuje odpowiedź `201 Created` i zwraca ją do klienta.
13. W przypadku błędu na którymkolwiek etapie w serwisie, transakcja jest wycofywana, a błąd jest propagowany w górę i zwracany jako `500`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp do endpointa jest chroniony i wymaga aktywnej sesji użytkownika, która jest weryfikowana przez middleware Astro (`Astro.locals.session`). Aktualnie do celów developmentu używamy `DEFAULT_USER_ID` z `src/db/supabase.client.ts`.
- **Autoryzacja**: Logika w serwisie musi jawnie sprawdzać, czy `deckId` oraz `generationId` należą do uwierzytelnionego użytkownika (`auth.uid()`). Polityki Row Level Security (RLS) w bazie danych stanowią dodatkową, głębszą warstwę ochrony.
- **Walidacja danych wejściowych**: Użycie `zod` do ścisłej walidacji typów, formatów i limitów długości chroni przed wstrzykiwaniem nieprawidłowych danych i potencjalnymi błędami.

## 7. Rozważania dotyczące wydajności
- **Transakcja bazodanowa**: Wszystkie operacje zapisu (wstawianie fiszek, aktualizacja metryk generowania) muszą być wykonane w ramach jednej transakcji, aby zapewnić spójność danych i zminimalizować liczbę oddzielnych zapytań do bazy danych.
- **Operacje masowe**: Użycie metody `.insert()` z tablicą obiektów w Supabase Client jest wydajniejsze niż wstawianie każdego rekordu w osobnej pętli.
- **Indeksy**: Istniejące indeksy na kluczach obcych (`deck_id`, `generation_id`, `user_id`) w tabelach `flashcards` i `generations` są wystarczające do zapewnienia wysokiej wydajności zapytań weryfikujących.

## 8. Etapy wdrożenia
1.  **Utworzenie pliku endpointa**: Stwórz nowy plik `src/pages/api/decks/[deckId]/flashcards/batch.ts`.
2.  **Zdefiniowanie schemy walidacji**: W pliku endpointa zdefiniuj schemę `zod` do walidacji `deckId` i ciała żądania.
3.  **Implementacja handlera `POST`**:
    - Dodaj `export const prerender = false;`.
    - Zaimplementuj funkcję `POST({ params, request, locals })`.
    - Sprawdź istnienie sesji użytkownika w `locals.session`.
    - Przeprowadź walidację danych wejściowych za pomocą zdefiniowanej schemy `zod`.
    - W bloku `try...catch` wywołaj metodę serwisu.
4.  **Utworzenie serwisu**: Stwórz nowy plik `src/lib/services/flashcard.service.ts`.
5.  **Implementacja logiki w serwisie**:
    - Stwórz klasę `FlashcardService` z metodą `async createFromAIGeneration(command: BatchCreateFlashcardsCommand, deckId: string, userId: string)`.
    - Wewnątrz metody użyj `supabase.rpc('run_in_transaction', ...)` lub podobnego mechanizmu transakcyjnego, jeśli jest dostępny, albo wykonuj operacje sekwencyjnie z ręcznym wycofywaniem w razie błędu.
    - Zweryfikuj przynależność `deckId` i `generationId` do `userId`.
    - Przygotuj dane do wstawienia do tabeli `flashcards`.
    - Oblicz metryki `accepted_unedited_count` i `accepted_edited_count`.
    - Wykonaj operacje `insert` na `flashcards` i `update` na `generations`.
6.  **Obsługa błędów**: Zaimplementuj globalną obsługę błędów w endpoincie, która będzie łapać błędy z serwisu i mapować je na odpowiednie kody statusu HTTP (`404`, `500`).
7.  **Zwrócenie odpowiedzi**: W przypadku sukcesu, zwróć odpowiedź `201 Created` z danymi zgodnymi z `BatchCreateFlashcardsResponseDto`.
