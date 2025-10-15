# Plan implementacji widoku Szczegóły Talii

## 1. Przegląd
Widok "Szczegóły Talii" jest kluczowym ekranem do zarządzania zawartością pojedynczej talii fiszek. Umożliwia użytkownikowi przeglądanie wszystkich fiszek w talii, a także wykonywanie pełnych operacji CRUD (tworzenie, odczyt, aktualizacja, usuwanie) zarówno na fiszkach, jak i na samej talii (edycja nazwy, usunięcie całej talii). Widok integruje również nawigację do funkcji generowania fiszek przez AI.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką: `/app/decks/{deckId}`, gdzie `{deckId}` to identyfikator UUID wybranej talii. Strona będzie renderowana po stronie serwera (SSR) przez Astro w celu początkowego pobrania danych.

## 3. Struktura komponentów
Główna strona `DeckDetailsPage.astro` będzie odpowiedzialna za pobranie danych na serwerze i przekazanie ich do interaktywnego komponentu React, który zarządza całym interfejsem użytkownika.

```
/src/pages/app/decks/[deckId].astro
└── /src/layouts/Layout.astro
    └── /src/components/deck/DeckDetailsView.tsx (client:load)
        ├── /src/components/deck/DeckHeader.tsx
        ├── /src/components/deck/FlashcardList.tsx
        |   ├── /src/components/deck/FlashcardListItem.tsx
        |   └── /src/components/shared/Pagination.tsx
        ├── /src/components/deck/FlashcardFormDialog.tsx
        └── /src/components/shared/DeleteConfirmationDialog.tsx
```

## 4. Szczegóły komponentów

### DeckDetailsPage.astro
- **Opis**: Strona Astro, która obsługuje routing, serwerowe pobieranie danych i renderowanie głównego komponentu React.
- **Główne elementy**: Komponent `Layout`, komponent `DeckDetailsView`.
- **Logika**:
  - Pobiera `deckId` z parametrów URL.
  - Wywołuje `GET /api/decks/{deckId}` na serwerze.
  - W przypadku błędu 404, renderuje stronę błędu.
  - Przekazuje pobrane dane jako propsy do `DeckDetailsView`.

### DeckDetailsView.tsx
- **Opis**: Główny, interaktywny komponent React. Zarządza stanem całego widoku, logiką biznesową i interakcjami z API po stronie klienta.
- **Propsy**: `initialData: DeckDetailsDto`

### DeckHeader.tsx
- **Opis**: Wyświetla nazwę talii oraz główne przyciski akcji dla talii. Umożliwia edycję nazwy talii w miejscu.
- **Główne elementy**: `h1` lub `Input` (w trybie edycji), `Button` ("Dodaj fiszkę", "Generuj z AI", "Edytuj nazwę", "Usuń talię").
- **Obsługiwane interakcje**:
  - Przełączenie w tryb edycji nazwy.
  - Zapisanie nowej nazwy.
  - Anulowanie edycji.
  - Otwarcie modalu dodawania fiszki.
  - Otwarcie modalu potwierdzenia usunięcia talii.
  - Nawigacja do strony generowania AI (`/app/decks/{deckId}/generate`).
- **Obsługiwana walidacja**: Nazwa talii nie może być pusta.
- **Typy**: `DeckDetailsDto` (fragment).
- **Propsy**: `deck`, `isEditing`, `onEditToggle`, `onSaveName`, `onDeleteDeck`, `onAddFlashcard`.

### FlashcardList.tsx
- **Opis**: Wyświetla tabelę z listą fiszek należących do talii. Obsługuje paginację po stronie klienta.
- **Główne elementy**: Komponent `Table` z `Shadcn/ui` (`TableHeader`, `TableBody`), `Pagination`. Wiersze tabeli są renderowane przez `FlashcardListItem`.
- **Obsługiwane interakcje**:
  - Otwarcie modalu edycji fiszki (delegowane z `FlashcardListItem`).
  - Otwarcie modalu usunięcia fiszki (delegowane z `FlashcardListItem`).
- **Typy**: `FlashcardSummaryDto[]`.
- **Propsy**: `flashcards`, `onEditFlashcard`, `onDeleteFlashcard`.

### FlashcardFormDialog.tsx
- **Opis**: Modal (dialog) do tworzenia i edycji fiszki. Używany w obu kontekstach.
- **Główne elementy**: `Dialog` z `Shadcn/ui`, `Input` (dla przodu), `Textarea` (dla tyłu), `Button` ("Zapisz"), `Button` ("Anuluj").
- **Obsługiwane interakcje**: Zapisanie formularza, zamknięcie modalu.
- **Obsługiwana walidacja**:
  - `front`: wymagane, `max: 200` znaków.
  - `back`: wymagane, `max: 500` znaków.
- **Typy**: `CreateFlashcardCommand`, `UpdateFlashcardCommand`, `FlashcardSummaryDto` (dla danych początkowych).
- **Propsy**: `isOpen`, `onClose`, `onSave`, `initialData?: FlashcardSummaryDto`, `isSaving`.

### DeleteConfirmationDialog.tsx
- **Opis**: Generyczny modal (`AlertDialog`) do potwierdzania operacji usunięcia (zarówno dla talii, jak i fiszki).
- **Główne elementy**: `AlertDialog` z `Shadcn/ui` z tytułem, opisem i przyciskami akcji.
- **Obsługiwane interakcje**: Potwierdzenie usunięcia, anulowanie.
- **Typy**: brak.
- **Propsy**: `isOpen`, `onClose`, `onConfirm`, `title`, `description`, `isDeleting`.

## 5. Typy
Implementacja będzie bazować na istniejących typach z `src/types.ts`. Nie przewiduje się tworzenia nowych, złożonych typów DTO. Wprowadzony zostanie lokalny typ dla zarządzania stanem widoku.

- **`DeckDetailsDto`**: Główny obiekt danych dla widoku.
- **`FlashcardSummaryDto`**: Obiekt pojedynczej fiszki na liście.
- **`CreateFlashcardCommand`**: Typ danych wysyłanych do API przy tworzeniu fiszki.
- **`UpdateFlashcardCommand`**: Typ danych wysyłanych do API przy aktualizacji fiszki.
- **`UpdateDeckCommand`**: Typ danych wysyłanych do API przy aktualizacji nazwy talii.
- **`DeckDetailsViewState` (nowy, lokalny typ)**:
  ```typescript
  interface DeckDetailsViewState {
    deck: DeckDetailsDto;
    isLoading: boolean;
    error: string | null;
    isEditingName: boolean;
    isSavingName: boolean;
    dialogs: {
      addFlashcard: { isOpen: boolean; isSaving: boolean };
      editFlashcard: { isOpen: boolean; isSaving: boolean; flashcard: FlashcardSummaryDto | null };
      deleteFlashcard: { isOpen: boolean; isDeleting: boolean; flashcardId: string | null };
      deleteDeck: { isOpen: boolean; isDeleting: boolean };
    };
  }
  ```

## 6. Zarządzanie stanem
Całość stanu widoku po stronie klienta będzie zarządzana wewnątrz komponentu `DeckDetailsView.tsx`. Ze względu na złożoność stanu (wiele flag dla modali i statusów ładowania), zalecane jest użycie hooka `useReducer` lub stworzenie dedykowanego custom hooka `useDeckDetails`, który hermetyzuje całą logikę.

**Custom Hook `useDeckDetails(initialData: DeckDetailsDto)`**:
- **Cel**: Separacja logiki biznesowej od prezentacji. Hook będzie zawierał stan (`useReducer`), logikę wywołań API (`fetch`), oraz akcje, które komponent może wywołać (np. `createFlashcard`, `deleteDeck`).
- **Zwracane wartości**: `state` (aktualny stan widoku) oraz `actions` (obiekt z funkcjami do modyfikacji stanu).

## 7. Integracja API
Komponent `DeckDetailsView` będzie komunikował się z następującymi endpointami API:

- `GET /api/decks/{deckId}`: Wywoływany na serwerze do pobrania początkowych danych.
- `PATCH /api/decks/{deckId}`: Wywoływany po zapisaniu nowej nazwy talii.
  - **Request Body**: `UpdateDeckCommand` (`{ name: string }`)
  - **Response**: `DeckDto`
- `DELETE /api/decks/{deckId}`: Wywoływany po potwierdzeniu usunięcia talii.
  - **Response**: `204 No Content`
- `POST /api/decks/{deckId}/flashcards`: Wywoływany po zapisaniu nowej fiszki.
  - **Request Body**: `CreateFlashcardCommand` (`{ front: string, back: string, source: "manual" }`)
  - **Response**: `FlashcardDetailsDto`
- `PATCH /api/flashcards/{flashcardId}`: Wywoływany po zaktualizowaniu istniejącej fiszki.
  - **Request Body**: `UpdateFlashcardCommand` (`{ front?: string, back?: string }`)
  - **Response**: `UpdatedFlashcardDto`
- `DELETE /api/flashcards/{flashcardId}`: Wywoływany po potwierdzeniu usunięcia fiszki.
  - **Response**: `204 No Content`

## 8. Interakcje użytkownika
- **Edycja nazwy talii**: Użytkownik klika "Edytuj", nazwa zamienia się w pole `Input`. Po zmianie i kliknięciu "Zapisz", wysyłane jest żądanie do API. Przycisk zapisu jest nieaktywny, dopóki nazwa nie zostanie zmieniona.
- **Dodawanie fiszki**: Kliknięcie "Dodaj fiszkę" otwiera `FlashcardFormDialog`. Po wypełnieniu i zapisaniu, modal się zamyka, a nowa fiszka pojawia się na liście (zastosowana będzie aktualizacja stanu po odpowiedzi z API).
- **Edycja fiszki**: Kliknięcie "Edytuj" na wierszu fiszki otwiera `FlashcardFormDialog` z wypełnionymi danymi. Zapisanie aktualizuje fiszkę na liście.
- **Usuwanie (talia/fiszka)**: Kliknięcie "Usuń" otwiera `DeleteConfirmationDialog`. Potwierdzenie uruchamia żądanie API. Po pomyślnym usunięciu talii, użytkownik jest przekierowywany na listę talii. Po usunięciu fiszki, jest ona usuwana z listy w widoku.

## 9. Warunki i walidacja
- **Nazwa talii**: Wymagana, nie może być pusta. Przycisk zapisu jest nieaktywny, jeśli pole jest puste.
- **Pola fiszki (`front`, `back`)**:
  - `front`: Wymagane, maksymalnie 200 znaków.
  - `back`: Wymagane, maksymalnie 500 znaków.
  - Przycisk zapisu w `FlashcardFormDialog` jest nieaktywny, jeśli którekolwiek z pól jest puste lub przekracza limit znaków. Komponenty formularza powinny wyświetlać licznik znaków.

## 10. Obsługa błędów
- **Błąd pobierania danych (404)**: Strona Astro powinna przechwycić błąd i wyświetlić standardową stronę 404.
- **Błędy API (np. 400, 500)**:
  - Stan ładowania jest resetowany (np. przycisk "Zapisz" staje się ponownie aktywny).
  - Wewnątrz modalu lub przy użyciu globalnego komponentu `Toast`/`Sonner` wyświetlany jest komunikat o błędzie, informujący użytkownika o niepowodzeniu operacji.
  - Formularze nie są czyszczone, aby użytkownik mógł poprawić dane bez ich ponownego wpisywania.
- **Błąd sieci**: Aplikacja wyświetli ogólny komunikat o problemie z połączeniem.

## 11. Kroki implementacji
1.  **Stworzenie plików**: Utworzenie nowych plików dla komponentów: `DeckDetailsPage.astro`, `DeckDetailsView.tsx`, `DeckHeader.tsx`, `FlashcardList.tsx`, `FlashcardListItem.tsx`, `FlashcardFormDialog.tsx`. `DeleteConfirmationDialog` może być komponentem współdzielonym.
2.  **Strona Astro**: Implementacja `DeckDetailsPage.astro` z logiką pobierania danych po stronie serwera i obsługą błędu 404.
3.  **Komponent główny**: Implementacja szkieletu `DeckDetailsView.tsx`, w tym definicja stanu (przy użyciu `useReducer` lub custom hooka) i przekazanie danych i akcji do komponentów podrzędnych.
4.  **Nagłówek talii**: Implementacja `DeckHeader.tsx` z logiką wyświetlania i edycji nazwy talii oraz przyciskami akcji.
5.  **Lista fiszek**: Implementacja `FlashcardList.tsx` i `FlashcardListItem.tsx` do wyświetlania danych. Dodanie logiki paginacji po stronie klienta.
6.  **Modal formularza**: Implementacja `FlashcardFormDialog.tsx`, w tym walidacja pól formularza przy użyciu `zod` i `react-hook-form`.
7.  **Modal potwierdzenia**: Dostosowanie `DeleteConfirmationDialog.tsx`.
8.  **Integracja API**: Podłączenie wszystkich akcji użytkownika do odpowiednich funkcji wywołujących API, w tym obsługa stanów ładowania.
9.  **Obsługa błędów**: Implementacja wyświetlania komunikatów o błędach dla użytkownika.
10. **Stylowanie i testowanie**: Dopracowanie wyglądu zgodnie z systemem designu (Tailwind, Shadcn/ui) i manualne przetestowanie wszystkich historyjek użytkownika.
