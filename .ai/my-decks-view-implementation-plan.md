# Plan implementacji widoku Moje Talie

## 1. Przegląd
Widok "Moje Talie" jest głównym ekranem aplikacji dostępnym dla zalogowanego użytkownika. Jego celem jest umożliwienie przeglądania, tworzenia, edytowania i usuwania talii fiszek. Widok ten stanowi centralny punkt nawigacyjny do zarządzania materiałami do nauki oraz rozpoczynania sesji nauki.

## 2. Routing widoku
Widok będzie dostępny pod chronioną ścieżką `/app/decks`. Dostęp do tej ścieżki będzie wymagał autentykacji użytkownika.

## 3. Struktura komponentów
Komponenty zostaną zaimplementowane w React z użyciem biblioteki `shadcn/ui` i osadzone na stronie Astro.

```
- DecksPage.astro      # Strona Astro, renderuje komponent kliencki
  - DecksView.tsx        # Główny komponent React, zarządza stanem i logiką
    - Header           # Nagłówek z tytułem i przyciskiem "Stwórz talię"
    - LoadingState.tsx # Komponent szkieletowy, wyświetlany podczas ładowania danych
    - EmptyState.tsx   # Komponent wyświetlany, gdy użytkownik nie ma talii
    - DeckList.tsx     # Komponent renderujący listę talii
      - DeckCard.tsx   # Karta reprezentująca pojedynczą talię
        - Button     # Przycisk "Ucz się"
        - DropdownMenu # Menu dla akcji "Edytuj" i "Usuń"
    - CreateEditDeckDialog.tsx # Dialog do tworzenia i edycji talii
    - DeleteDeckDialog.tsx     # Dialog potwierdzający usunięcie talii
```

## 4. Szczegóły komponentów

### `DecksView.tsx`
- **Opis komponentu**: Główny, inteligentny komponent widoku. Odpowiada za pobieranie danych, zarządzanie stanem (ładowanie, błędy, lista talii) oraz obsługę logiki biznesowej (otwieranie dialogów, wywoływanie akcji CRUD).
- **Główne elementy**: Wyświetla warunkowo komponenty `LoadingState`, `EmptyState` lub `DeckList`. Zawiera również logikę do renderowania dialogów `CreateEditDeckDialog` i `DeleteDeckDialog`.
- **Obsługiwane interakcje**: Inicjowanie pobierania talii, otwieranie dialogu tworzenia talii, przekazywanie handlerów do edycji i usuwania do komponentów podrzędnych.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `DeckListItemDto`, `PaginationDto`.
- **Propsy**: Brak.

### `DeckCard.tsx`
- **Opis komponentu**: Prezentacyjny komponent wyświetlający informacje o pojedynczej talii w formie karty.
- **Główne elementy**: Komponent `Card` z `shadcn/ui`, zawierający nazwę talii, liczbę fiszek, przycisk `Button` "Ucz się" oraz `DropdownMenu` z opcjami "Edytuj nazwę" i "Usuń".
- **Obsługiwane interakcje**: `onNavigateToLearn`, `onEdit`, `onDelete`.
- **Obsługiwana walidacja**: Przycisk "Ucz się" jest nieaktywny (`disabled`), gdy `flashcardCount` wynosi 0.
- **Typy**: `DeckListItemDto`.
- **Propsy**:
  ```typescript
  interface DeckCardProps {
    deck: DeckListItemDto;
    onEdit: (deck: DeckListItemDto) => void;
    onDelete: (deck: DeckListItemDto) => void;
  }
  ```

### `CreateEditDeckDialog.tsx`
- **Opis komponentu**: Modal (dialog) z formularzem do tworzenia nowej talii lub edycji nazwy istniejącej.
- **Główne elementy**: Komponent `Dialog` z `shadcn/ui`, zawierający `Input` na nazwę talii i `Button` do zatwierdzenia.
- **Obsługiwane interakcje**: `onSubmit`.
- **Obsługiwana walidacja**:
  - Nazwa talii (`name`) nie może być pusta.
  - Wartość jest trimowana przed walidacją.
- **Typy**: `CreateDeckCommand`, `UpdateDeckCommand`.
- **Propsy**:
  ```typescript
  interface CreateEditDeckDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>;
    initialDeck?: Pick<DeckListItemDto, "id" | "name">; // undefined dla tworzenia
    isSubmitting: boolean;
  }
  ```

### `DeleteDeckDialog.tsx`
- **Opis komponentu**: Modal `AlertDialog` do potwierdzenia operacji usunięcia talii.
- **Główne elementy**: `AlertDialog` z `shadcn/ui`, wyświetlający ostrzeżenie o permanentnym usunięciu talii i wszystkich jej fiszek oraz przyciski "Anuluj" i "Usuń".
- **Obsługiwane interakcje**: `onConfirm`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `DeckListItemDto`.
- **Propsy**:
  ```typescript
  interface DeleteDeckDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    deck: DeckListItemDto | null;
    isSubmitting: boolean;
  }
  ```

## 5. Typy
Implementacja będzie bazować na istniejących typach zdefiniowanych w `src/types.ts`. Główne używane typy to:
- **`DeckListItemDto`**: Obiekt transferu danych dla pojedynczej talii na liście.
  ```typescript
  export type DeckListItemDto = Pick<Deck, "id" | "name"> & {
    createdAt: Deck["created_at"];
    flashcardCount: number;
  };
  ```
- **`PaginatedDecksDto`**: Obiekt odpowiedzi dla paginowanej listy talii.
  ```typescript
  export type PaginatedDecksDto = PaginatedResponseDto<DeckListItemDto>;
  ```
- **`CreateDeckCommand`**: Model polecenia do tworzenia talii.
  ```typescript
  export type CreateDeckCommand = Pick<TablesInsert<"decks">, "name">;
  ```
- **`UpdateDeckCommand`**: Model polecenia do aktualizacji talii.
  ```typescript
  export type UpdateDeckCommand = Pick<TablesUpdate<"decks">, "name">;
  ```

Nie ma potrzeby tworzenia nowych typów DTO ani ViewModel na tym etapie.

## 6. Zarządzanie stanem
Logika i stan widoku zostaną wyizolowane w dedykowanym customowym hooku `useDecks`.

### `useDecks.ts`
- **Cel**: Hermetyzacja logiki pobierania, tworzenia, aktualizacji i usuwania talii, a także zarządzanie stanem ładowania, błędów i danych.
- **Zarządzany stan**:
  - `decks: DeckListItemDto[]`: Lista talii.
  - `pagination: PaginationDto | null`: Informacje o paginacji.
  - `isLoading: boolean`: Status ładowania początkowej listy talii.
  - `isSubmitting: boolean`: Status ładowania dla operacji C/U/D.
  - `error: Error | null`: Obiekt błędu.
- **Eksportowane funkcje**:
  - `createDeck(command: CreateDeckCommand)`
  - `updateDeck(deckId: string, command: UpdateDeckCommand)`
  - `deleteDeck(deckId: string)`

Ten hook będzie używany wewnątrz komponentu `DecksView.tsx`.

## 7. Integracja API
Integracja z API będzie realizowana poprzez `fetch` API wewnątrz hooka `useDecks`.

- **`GET /api/decks`**:
  - **Akcja**: Pobranie listy talii przy pierwszym renderowaniu komponentu.
  - **Typ odpowiedzi**: `PaginatedDecksDto`.

- **`POST /api/decks`**:
  - **Akcja**: Tworzenie nowej talii.
  - **Typ żądania (body)**: `CreateDeckCommand`.
  - **Typ odpowiedzi**: `DeckDto`.
  - **Logika**: Po pomyślnym utworzeniu, nowa talia zostanie dodana do lokalnego stanu, aby uniknąć konieczności ponownego pobierania całej listy.

- **`PATCH /api/decks/{deckId}`**:
  - **Akcja**: Aktualizacja nazwy talii.
  - **Typ żądania (body)**: `UpdateDeckCommand`.
  - **Typ odpowiedzi**: Zaktualizowany obiekt talii (bez `flashcardCount`).
  - **Logika**: Po pomyślnej aktualizacji, nazwa talii w lokalnym stanie zostanie zaktualizowana.

- **`DELETE /api/decks/{deckId}`**:
  - **Akcja**: Usunięcie talii.
  - **Typ odpowiedzi**: `204 No Content`.
  - **Logika**: Po pomyślnym usunięciu, talia zostanie usunięta z lokalnego stanu.

## 8. Interakcje użytkownika
- **Przeglądanie**: Użytkownik widzi listę swoich talii lub stan pusty/ładowania.
- **Tworzenie**: Kliknięcie "Stwórz nową talię" otwiera dialog. Po zatwierdzeniu nowa talia pojawia się na liście.
- **Edycja**: Wybranie opcji "Edytuj nazwę" z menu otwiera ten sam dialog, ale wypełniony aktualną nazwą. Po zatwierdzeniu nazwa na karcie się zmienia.
- **Usuwanie**: Wybranie opcji "Usuń" otwiera dialog potwierdzenia. Po potwierdzeniu karta talii znika z listy.
- **Nawigacja**: Kliknięcie "Ucz się" przenosi użytkownika do widoku nauki (np. `/app/decks/{deckId}`). Kliknięcie na nazwę talii przenosi do widoku szczegółów talii (np. `/app/decks/{deckId}`).

## 9. Warunki i walidacja
- **Formularz tworzenia/edycji talii (`CreateEditDeckDialog`)**:
  - Pole `name` jest wymagane.
  - Przycisk "Zatwierdź" jest nieaktywny, jeśli pole jest puste.
  - Walidacja będzie realizowana po stronie klienta (np. przy użyciu `react-hook-form` z `zodResolver`) przed wysłaniem żądania do API.
- **Karta talii (`DeckCard`)**:
  - Przycisk "Ucz się" jest nieaktywny, jeśli `deck.flashcardCount` jest równe `0`. Posiada `tooltip` wyjaśniający przyczynę.

## 10. Obsługa błędów
- **Błąd pobierania listy talii**: Zamiast listy zostanie wyświetlony komunikat o błędzie z przyciskiem "Spróbuj ponownie", który ponownie uruchomi funkcję pobierania danych.
- **Błędy operacji C/U/D**:
  - W przypadku błędu (np. błąd sieci, błąd serwera 500), dialog pozostanie otwarty.
  - Użytkownik zostanie poinformowany o niepowodzeniu operacji za pomocą globalnego systemu powiadomień (np. toast).
  - Wszelkie optymistyczne aktualizacje UI zostaną cofnięte.
  - Szczegółowe błędy zostaną zalogowane w konsoli deweloperskiej.

## 11. Kroki implementacji
1.  **Utworzenie strony Astro**: Stworzenie pliku `src/pages/app/decks.astro`, który będzie renderował główny komponent React.
2.  **Struktura komponentów**: Utworzenie plików dla wszystkich zdefiniowanych komponentów React (`DecksView`, `DeckList`, `DeckCard`, `CreateEditDeckDialog` itd.) w katalogu `src/components/decks/`.
3.  **Custom Hook**: Implementacja hooka `useDecks` z całą logiką zarządzania stanem i komunikacją z API.
4.  **Komponent `DecksView`**: Implementacja głównego komponentu, wykorzystanie hooka `useDecks` i warunkowe renderowanie stanów (ładowanie, pusty, lista).
5.  **Komponenty prezentacyjne**: Implementacja `DeckList` i `DeckCard` do wyświetlania danych.
6.  **Implementacja dialogów**: Stworzenie `CreateEditDeckDialog` i `DeleteDeckDialog` wraz z logiką formularza i walidacji.
7.  **Połączenie interakcji**: Połączenie akcji użytkownika (kliknięcia przycisków) w `DecksView` i `DeckCard` z funkcjami z hooka `useDecks` w celu otwierania dialogów i wykonywania operacji.
8.  **Obsługa błędów i stanów krawędziowych**: Implementacja wyświetlania komunikatów o błędach, tooltipów i dezaktywacji przycisków.
9.  **Stylowanie**: Dopracowanie wyglądu komponentów przy użyciu `Tailwind CSS` zgodnie z systemem projektowym.

