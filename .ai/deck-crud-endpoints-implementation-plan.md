# API Endpoint Implementation Plan: Decks CRUD

Ten dokument zawiera szczegółowy plan implementacji dla endpointów CRUD (Create, Read, Update, Delete) zasobu `Decks`.

## 1. Endpoint: List Decks

### 1.1. Przegląd punktu końcowego
- **Opis**: Pobiera paginowaną listę talii należących do uwierzytelnionego użytkownika.
- **Struktura Plików**:
    - Route: `src/pages/api/decks/index.ts`
    - Service: `src/lib/services/deck.service.ts`

### 1.2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/decks`
- **Parametry Zapytania**:
    - Wymagane: Brak
    - Opcjonalne:
        - `page` (number, default: 1): Numer strony do pobrania.
        - `limit` (number, default: 20): Liczba talii na stronę.
- **Request Body**: Brak

### 1.3. Wykorzystywane typy
- **DTO**: `PaginatedDecksDto`, `DeckListItemDto`
- **Walidacja Zod**:
    ```typescript
    import { z } from "zod";

    export const getDecksQuerySchema = z.object({
      page: z.coerce.number().int().positive().optional().default(1),
      limit: z.coerce.number().int().positive().optional().default(20),
    });
    ```

### 1.4. Szczegóły odpowiedzi
- **Sukces (`200 OK`)**: Zwraca obiekt zawierający listę talii i informacje o paginacji.
  ```json
  {
    "data": [
      {
        "id": "uuid-string-1",
        "name": "React Hooks",
        "createdAt": "2023-10-27T10:00:00Z",
        "flashcardCount": 15
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 58
    }
  }
  ```
- **Błąd**: Zobacz sekcję "Obsługa błędów".

### 1.5. Przepływ danych
1. Żądanie `GET` trafia do endpointa `/api/decks`.
2. Astro middleware weryfikuje sesję użytkownika. Jeśli jest nieprawidłowa, zwraca `401 Unauthorized`.
3. Handler `GET` w `src/pages/api/decks/index.ts` przejmuje żądanie.
4. Parametry zapytania (`page`, `limit`) są walidowane przy użyciu `getDecksQuerySchema`. W przypadku błędu zwracane jest `400 Bad Request`.
5. Wywoływana jest metoda `DeckService.getDecks(userId, page, limit)`. `userId` jest pobierany z sesji.
6. `DeckService` wykonuje zapytanie do bazy danych Supabase, aby pobrać talie dla danego użytkownika wraz z liczbą kart w każdej talii oraz całkowitą liczbą talii.
7. Serwis mapuje wyniki z bazy danych na `PaginatedDecksDto`.
8. Handler endpointa zwraca zmapowane dane z kodem `200 OK`.

### 1.6. Etapy wdrożenia
1. Utwórz plik serwisu `src/lib/services/deck.service.ts`.
2. W `deck.service.ts` zaimplementuj metodę `getDecks`, która:
   - Przyjmuje `supabaseClient`, `userId`, `page`, `limit`.
   - Oblicza `offset` na podstawie `page` i `limit`.
   - Wykonuje zapytanie RPC do bazy danych w celu pobrania talii wraz z liczbą kart (`flashcard_count`) oraz całkowitą liczbą talii (`total_items`).
   - Oblicza `totalPages`.
   - Mapuje wyniki do formatu `PaginatedDecksDto` i go zwraca.
3. Utwórz plik `src/pages/api/decks/index.ts`.
4. W `index.ts` zaimplementuj handler `GET`, który:
   - Pobiera `supabase` i `session` z `context.locals`.
   - Waliduje parametry zapytania.
   - Wywołuje `DeckService.getDecks`.
   - Zwraca odpowiedź w formacie JSON.

---

## 2. Endpoint: Create Deck

### 2.1. Przegląd punktu końcowego
- **Opis**: Tworzy nową talię dla uwierzytelnionego użytkownika.
- **Struktura Plików**:
    - Route: `src/pages/api/decks/index.ts`
    - Service: `src/lib/services/deck.service.ts`

### 2.2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/decks`
- **Parametry**: Brak
- **Request Body**:
  ```json
  {
    "name": "New Deck Name"
  }
  ```

### 2.3. Wykorzystywane typy
- **DTO**: `DeckDto`
- **Command Model**: `CreateDeckCommand`
- **Walidacja Zod**:
    ```typescript
    import { z } from "zod";

    export const createDeckSchema = z.object({
      name: z.string().trim().min(1, { message: "Deck name cannot be empty." }),
    });
    ```

### 2.4. Szczegóły odpowiedzi
- **Sukces (`201 Created`)**: Zwraca nowo utworzoną talię.
  ```json
  {
    "id": "new-uuid-string",
    "name": "New Deck Name",
    "createdAt": "2023-10-27T11:00:00Z",
    "flashcardCount": 0
  }
  ```
- **Błąd**: Zobacz sekcję "Obsługa błędów".

### 2.5. Przepływ danych
1. Żądanie `POST` trafia do endpointa `/api/decks`.
2. Middleware weryfikuje sesję użytkownika.
3. Handler `POST` w `src/pages/api/decks/index.ts` przejmuje żądanie.
4. Ciało żądania jest walidowane przy użyciu `createDeckSchema`. W przypadku błędu zwracane jest `400 Bad Request`.
5. Wywoływana jest metoda `DeckService.createDeck(userId, createDeckCommand)`.
6. `DeckService` wstawia nowy rekord do tabeli `decks` w bazie danych, powiązując go z `userId`.
7. Serwis mapuje zwrócony z bazy danych rekord na `DeckDto`.
8. Handler endpointa zwraca zmapowane dane z kodem `201 Created`.

### 2.6. Etapy wdrożenia
1. W `deck.service.ts` zaimplementuj metodę `createDeck`, która:
   - Przyjmuje `supabaseClient`, `userId` i `CreateDeckCommand`.
   - Wykonuje operację `insert` na tabeli `decks`.
   - Mapuje wynik na `DeckDto` (z `flashcardCount: 0`) i go zwraca.
2. W `src/pages/api/decks/index.ts` dodaj handler `POST`, który:
   - Pobiera `supabase` i `session` z `context.locals`.
   - Parsuje i waliduje ciało żądania.
   - Wywołuje `DeckService.createDeck`.
   - Zwraca odpowiedź z kodem `201`.

---

## 3. Endpoint: Get Deck Details

### 3.1. Przegląd punktu końcowego
- **Opis**: Pobiera szczegóły konkretnej talii wraz z listą jej kart.
- **Struktura Plików**:
    - Route: `src/pages/api/decks/[deckId].ts`
    - Service: `src/lib/services/deck.service.ts`

### 3.2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/decks/{deckId}`
- **Parametry**:
    - Wymagane: `deckId` (UUID) w ścieżce.
- **Request Body**: Brak

### 3.3. Wykorzystywane typy
- **DTO**: `DeckDetailsDto`, `FlashcardSummaryDto`
- **Walidacja Zod**:
    ```typescript
    import { z } from "zod";

    export const deckIdParamSchema = z.object({
      deckId: z.string().uuid({ message: "Invalid deck ID format." }),
    });
    ```

### 3.4. Szczegóły odpowiedzi
- **Sukces (`200 OK`)**: Zwraca szczegóły talii.
  ```json
  {
    "id": "uuid-string-1",
    "name": "React Hooks",
    "createdAt": "2023-10-27T10:00:00Z",
    "flashcards": [
      {
        "id": "flashcard-uuid-1",
        "front": "What is `useState`?",
        "back": "A Hook that lets you add React state to function components.",
        "source": "manual",
        "createdAt": "2023-10-27T10:05:00Z"
      }
    ]
  }
  ```
- **Błąd**: Zobacz sekcję "Obsługa błędów".

### 3.5. Przepływ danych
1. Żądanie `GET` trafia do endpointa `/api/decks/[deckId]`.
2. Middleware weryfikuje sesję użytkownika.
3. Handler `GET` w `src/pages/api/decks/[deckId].ts` przejmuje żądanie.
4. Parametr `deckId` jest walidowany. W przypadku błędu zwracane jest `400 Bad Request`.
5. Wywoływana jest metoda `DeckService.getDeckDetails(userId, deckId)`.
6. `DeckService` wykonuje zapytanie do bazy, aby pobrać talię i powiązane z nią karty (`flashcards`). Zapytanie musi uwzględniać `userId`, aby RLS zadziałało poprawnie.
7. Jeśli talia nie zostanie znaleziona, serwis rzuca błąd, który jest mapowany na `404 Not Found`.
8. Serwis mapuje wyniki z bazy danych na `DeckDetailsDto`.
9. Handler zwraca dane z kodem `200 OK`.

### 3.6. Etapy wdrożenia
1. W `deck.service.ts` zaimplementuj metodę `getDeckDetails`, która:
   - Przyjmuje `supabaseClient`, `userId` i `deckId`.
   - Wykonuje zapytanie `select` z joinem na `flashcards`.
   - Sprawdza, czy wynik nie jest pusty (jeśli jest, rzuca błąd `NotFound`).
   - Mapuje wynik na `DeckDetailsDto` i go zwraca.
2. Utwórz plik `src/pages/api/decks/[deckId].ts`.
3. W `[deckId].ts` zaimplementuj handler `GET`, który:
   - Pobiera `supabase` i `session` z `context.locals`.
   - Waliduje parametr `deckId` z `context.params`.
   - Wywołuje `DeckService.getDeckDetails`.
   - Obsługuje błąd `NotFound` i zwraca `404`.
   - Zwraca pomyślną odpowiedź.

---

## 4. Endpoint: Update Deck

### 4.1. Przegląd punktu końcowego
- **Opis**: Aktualizuje nazwę konkretnej talii.
- **Struktura Plików**:
    - Route: `src/pages/api/decks/[deckId].ts`
    - Service: `src/lib/services/deck.service.ts`

### 4.2. Szczegóły żądania
- **Metoda HTTP**: `PATCH`
- **Struktura URL**: `/api/decks/{deckId}`
- **Parametry**:
    - Wymagane: `deckId` (UUID) w ścieżce.
- **Request Body**:
  ```json
  {
    "name": "Updated Deck Name"
  }
  ```

### 4.3. Wykorzystywane typy
- **Command Model**: `UpdateDeckCommand`
- **Walidacja Zod**:
    ```typescript
    import { z } from "zod";

    export const updateDeckSchema = z.object({
      name: z.string().trim().min(1, { message: "Deck name cannot be empty." }),
    });
    ```

### 4.4. Szczegóły odpowiedzi
- **Sukces (`200 OK`)**: Zwraca zaktualizowaną talię.
  ```json
  {
    "id": "uuid-string-1",
    "name": "Updated Deck Name",
    "createdAt": "2023-10-27T10:00:00Z",
    "updatedAt": "2023-10-27T11:30:00Z"
  }
  ```
- **Błąd**: Zobacz sekcję "Obsługa błędów".

### 4.5. Przepływ danych
1. Żądanie `PATCH` trafia do endpointa `/api/decks/[deckId]`.
2. Middleware weryfikuje sesję użytkownika.
3. Handler `PATCH` w `[deckId].ts` przejmuje żądanie.
4. Parametr `deckId` i ciało żądania są walidowane.
5. Wywoływana jest metoda `DeckService.updateDeck(userId, deckId, updateDeckCommand)`.
6. `DeckService` wykonuje operację `update` na tabeli `decks`, filtrując po `id` i `user_id`.
7. Jeśli operacja `update` nie zmodyfikowała żadnego wiersza (`count === 0`), oznacza to, że talia nie istnieje lub użytkownik nie ma do niej dostępu. Serwis rzuca błąd `NotFound`.
8. Serwis mapuje zaktualizowane dane na odpowiedni DTO.
9. Handler zwraca dane z kodem `200 OK`.

### 4.6. Etapy wdrożenia
1. W `deck.service.ts` zaimplementuj metodę `updateDeck`, która:
   - Przyjmuje `supabaseClient`, `userId`, `deckId` i `UpdateDeckCommand`.
   - Wykonuje operację `update` na tabeli `decks`.
   - Sprawdza, czy aktualizacja się powiodła; jeśli nie, rzuca błąd `NotFound`.
   - Zwraca zaktualizowany obiekt.
2. W `src/pages/api/decks/[deckId].ts` dodaj handler `PATCH`, który:
   - Pobiera `supabase` i `session` z `context.locals`.
   - Waliduje `deckId` i ciało żądania.
   - Wywołuje `DeckService.updateDeck`.
   - Obsługuje błąd `NotFound`.
   - Zwraca pomyślną odpowiedź.

---

## 5. Endpoint: Delete Deck

### 5.1. Przegląd punktu końcowego
- **Opis**: Usuwa konkretną talię wraz ze wszystkimi jej kartami.
- **Struktura Plików**:
    - Route: `src/pages/api/decks/[deckId].ts`
    - Service: `src/lib/services/deck.service.ts`

### 5.2. Szczegóły żądania
- **Metoda HTTP**: `DELETE`
- **Struktura URL**: `/api/decks/{deckId}`
- **Parametry**:
    - Wymagane: `deckId` (UUID) w ścieżce.
- **Request Body**: Brak

### 5.3. Szczegóły odpowiedzi
- **Sukces (`204 No Content`)**: Pusta odpowiedź.
- **Błąd**: Zobacz sekcję "Obsługa błędów".

### 5.4. Przepływ danych
1. Żądanie `DELETE` trafia do endpointa `/api/decks/[deckId]`.
2. Middleware weryfikuje sesję użytkownika.
3. Handler `DELETE` w `[deckId].ts` przejmuje żądanie.
4. Parametr `deckId` jest walidowany.
5. Wywoływana jest metoda `DeckService.deleteDeck(userId, deckId)`.
6. `DeckService` wykonuje operację `delete` na tabeli `decks`, filtrując po `id` i `user_id`.
7. Jeśli operacja `delete` nie usunęła żadnego wiersza (`count === 0`), serwis rzuca błąd `NotFound`.
8. Handler zwraca pustą odpowiedź z kodem `204 No Content`.

### 5.6. Etapy wdrożenia
1. W `deck.service.ts` zaimplementuj metodę `deleteDeck`, która:
   - Przyjmuje `supabaseClient`, `userId` i `deckId`.
   - Wykonuje operację `delete` na tabeli `decks`.
   - Sprawdza, czy usunięcie się powiodło; jeśli nie, rzuca błąd `NotFound`.
2. W `src/pages/api/decks/[deckId].ts` dodaj handler `DELETE`, który:
   - Pobiera `supabase` i `session` z `context.locals`.
   - Waliduje `deckId`.
   - Wywołuje `DeckService.deleteDeck`.
   - Obsługuje błąd `NotFound`.
   - Zwraca odpowiedź z kodem `204`.

---

## 6. Wspólne aspekty implementacji

### 6.1. Względy bezpieczeństwa
- **Uwierzytelnianie**: Każdy endpoint musi być chroniony przez middleware, które weryfikuje sesję Supabase. Dostęp do `context.locals.session` i `context.locals.supabase` jest kluczowy.
- **Autoryzacja**: Logika po stronie serwera i polityki RLS w bazie danych zapewniają, że użytkownicy mają dostęp tylko do swoich własnych talii. Każda metoda w `DeckService` musi przyjmować `userId` jako argument i używać go w zapytaniach do bazy danych.
- **Walidacja danych**: Użycie `zod` do walidacji wszystkich danych wejściowych (parametry, ciało żądania) chroni przed nieprawidłowymi danymi i potencjalnymi atakami.

### 6.2. Obsługa błędów
- **`400 Bad Request`**: Zwracany, gdy walidacja `zod` się nie powiedzie. Odpowiedź powinna zawierać szczegóły błędu walidacji.
- **`401 Unauthorized`**: Zwracany przez middleware, gdy użytkownik nie jest zalogowany.
- **`404 Not Found`**: Zwracany, gdy zasób (talia) o podanym `deckId` nie istnieje lub nie należy do danego użytkownika.
- **`500 Internal Server Error`**: Zwracany w przypadku nieoczekiwanych błędów serwera (np. problem z połączeniem z bazą danych). Błąd powinien być logowany na serwerze.

### 6.3. Rozważania dotyczące wydajności
- **Paginacja**: Kluczowa dla `GET /decks`, aby uniknąć ładowania dużej liczby danych jednocześnie.
- **Indeksy**: W bazie danych powinny istnieć indeksy na kolumnach `user_id` w tabeli `decks`, co jest już przewidziane w planie bazy danych (`@db-plan.md`).
- **Zapytania**: Zapytanie w `getDeckDetails` powinno efektywnie pobierać zarówno talię, jak i jej karty w jednym zapytaniu, aby uniknąć problemu N+1. Supabase pozwala na zagnieżdżanie zapytań, co należy wykorzystać.
