# Plan implementacji widoku Generowania Fiszek AI

## 1. Przegląd
Widok "Generowanie Fiszek AI" ma na celu umożliwienie użytkownikom automatycznego tworzenia fiszek na podstawie dostarczonego tekstu. Proces składa się z trzech głównych kroków: wklejenie tekstu źródłowego, wygenerowanie propozycji fiszek przez AI, a następnie przegląd, edycja i akceptacja wybranych propozycji, które zostaną zapisane w konkretnej talii. Widok zarządza całym tym przepływem, obsługując stany ładowania, błędy oraz interakcje użytkownika.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką, która zawiera identyfikator talii, do której zostaną dodane nowe fiszki.
- **Ścieżka**: `/app/decks/{deckId}/generate`
- **Ochrona**: Ścieżka powinna być chroniona i dostępna tylko dla zalogowanych użytkowników.

## 3. Struktura komponentów
Komponenty zostaną zaimplementowane w React i osadzone na stronie Astro. Głównym komponentem będzie `GenerationClientComponent`, który będzie zarządzał stanem i logiką.

```
- GenerationView (Strona Astro: `src/pages/app/decks/[deckId]/generate.astro`)
  - GenerationClientComponent (Komponent React)
    - SourceTextForm (Formularz z polem na tekst i przyciskiem "Generuj")
      - Textarea (z Shadcn/ui)
      - Button (z Shadcn/ui)
    - CandidateReviewList (Lista wygenerowanych kandydatów do przeglądu)
      - CandidateFlashcard[] (Karta dla pojedynczego kandydata)
        - Card (z Shadcn/ui)
        - Button (z Shadcn/ui, "Akceptuj", "Edytuj", "Odrzuć")
      - Button (z Shadcn/ui, "Zatwierdź wybrane")
    - EditCandidateDialog (Modal do edycji kandydata)
      - Dialog (z Shadcn/ui)
      - Input/Textarea (z Shadcn/ui)
      - Button (z Shadcn/ui)
    - LoadingSpinner (Wskaźnik ładowania)
    - ErrorDisplay (Komponent do wyświetlania błędów)
```

## 4. Szczegóły komponentów

### GenerationClientComponent
- **Opis komponentu**: Główny komponent-kontener, który zarządza całym procesem generowania fiszek. Renderuje odpowiednie komponenty podrzędne w zależności od aktualnego kroku (`input`, `loading`, `review`, `submitting`, `error`).
- **Główne elementy**: Logika zarządzania stanem (za pomocą hooka `useFlashcardGeneration`), renderowanie warunkowe komponentów `SourceTextForm`, `CandidateReviewList`, `LoadingSpinner`, `ErrorDisplay`.
- **Obsługiwane interakcje**: Przekazuje funkcje obsługi zdarzeń do komponentów podrzędnych.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Stan i akcje z hooka `useFlashcardGeneration`.
- **Propsy**: `deckId: string`.

### SourceTextForm
- **Opis komponentu**: Formularz do wprowadzania tekstu źródłowego przez użytkownika.
- **Główne elementy**: `Textarea` na tekst, `Button` do rozpoczęcia generowania, licznik znaków oraz komunikaty walidacyjne.
- **Obsługiwane interakcje**: `onSubmit(sourceText: string)`.
- **Obsługiwana walidacja**:
    - Długość tekstu musi mieścić się w przedziale 1000-10000 znaków. Przycisk "Generuj" jest nieaktywny, jeśli warunek nie jest spełniony.
- **Typy**: `GenerateFlashcardsCommand`.
- **Propsy**: `isLoading: boolean`, `onSubmit: (sourceText: string) => void`.

### CandidateReviewList
- **Opis komponentu**: Wyświetla listę kandydatów na fiszki zwróconych przez AI.
- **Główne elementy**: Mapa po liście kandydatów renderująca komponenty `CandidateFlashcard`, przycisk "Zatwierdź wybrane" do zapisania zaakceptowanych fiszek.
- **Obsługiwane interakcje**: Przekazuje zdarzenia z `CandidateFlashcard` do komponentu nadrzędnego. `onSubmit()` po kliknięciu przycisku "Zatwierdź wybrane".
- **Obsługiwana walidacja**:
    - Przycisk "Zatwierdź wybrane" jest aktywny tylko wtedy, gdy co najmniej jeden kandydat ma status `accepted`.
- **Typy**: `FlashcardCandidateViewModel[]`.
- **Propsy**: `candidates: FlashcardCandidateViewModel[]`, `onAccept: (id: string) => void`, `onReject: (id: string) => void`, `onEdit: (id: string) => void`, `onSubmit: () => void`.

### CandidateFlashcard
- **Opis komponentu**: Karta wyświetlająca pojedynczą propozycję fiszki (przód i tył).
- **Główne elementy**: Komponent `Card` z Shadcn/ui, wyświetlenie tekstu fiszki, trzy przyciski akcji: "Akceptuj", "Edytuj", "Odrzuć". Wygląd karty (np. kolor ramki) zmienia się w zależności od jej statusu.
- **Obsługiwane interakcje**: `onAccept()`, `onReject()`, `onEditRequest()`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `FlashcardCandidateViewModel`.
- **Propsy**: `candidate: FlashcardCandidateViewModel`, `onAccept: () => void`, `onReject: () => void`, `onEditRequest: () => void`.

### EditCandidateDialog
- **Opis komponentu**: Modal (dialog) do edycji treści przodu i tyłu kandydata na fiszkę.
- **Główne elementy**: Komponent `Dialog` z Shadcn/ui, dwa pola `Textarea` na przód i tył, przyciski "Zapisz" i "Anuluj".
- **Obsługiwane interakcje**: `onSave(newFront: string, newBack: string)`, `onCancel()`.
- **Obsługiwana walidacja**:
    - Tekst z przodu nie może być pusty i nie może przekraczać 200 znaków.
    - Tekst z tyłu nie może być pusty i nie może przekraczać 500 znaków.
    - Przycisk "Zapisz" jest nieaktywny, jeśli walidacja się nie powiodła.
- **Typy**: `FlashcardCandidateDto`.
- **Propsy**: `isOpen: boolean`, `candidate: FlashcardCandidateViewModel`, `onSave: (id: string, newFront: string, newBack: string) => void`, `onClose: () => void`.

## 5. Typy
Do obsługi widoku potrzebne będą istniejące typy DTO oraz nowe typy ViewModel do zarządzania stanem UI.

### Istniejące DTO (z `src/types.ts`)
- `FlashcardCandidateDto`: `{ front: string, back: string }`
- `GenerateFlashcardsCommand`: `{ sourceText: string, deckId: string }`
- `GenerateFlashcardsResponseDto`: `{ generationId: string, candidates: FlashcardCandidateDto[] }`
- `BatchCreateFlashcardsCommand`: `{ generationId: string, flashcards: BatchFlashcardItemDto[] }`
- `BatchFlashcardItemDto`: `{ front: string, back: string, source: "ai-full" | "ai-edited" }`

### Nowe typy ViewModel
- **`CandidateStatus`**: Typ wyliczeniowy do śledzenia statusu propozycji fiszki w interfejsie.
  ```typescript
  export type CandidateStatus = "pending" | "accepted" | "rejected";
  ```
- **`FlashcardCandidateViewModel`**: Rozszerza DTO o dane potrzebne w UI.
  ```typescript
  export interface FlashcardCandidateViewModel extends FlashcardCandidateDto {
    id: string; // Unikalny identyfikator po stronie klienta (np. uuid v4)
    status: CandidateStatus; // Aktualny status kandydata
    isEdited: boolean; // Flaga określająca, czy kandydat został zmodyfikowany przez użytkownika
  }
  ```

## 6. Zarządzanie stanem
Logika i stan widoku zostaną zebrane w dedykowanym customowym hooku `useFlashcardGeneration` w celu separacji logiki od prezentacji.

- **`useFlashcardGeneration(deckId: string)`**:
  - **Cel**: Zarządzanie całym cyklem życia procesu generowania, od wprowadzenia tekstu, przez komunikację z API, aż po finalne zapisanie fiszek.
  - **Zarządzany stan**:
    - `step: 'input' | 'loading' | 'review' | 'submitting' | 'error'`: Aktualny etap procesu.
    - `candidates: FlashcardCandidateViewModel[]`: Lista propozycji fiszek z ich stanem UI.
    - `generationId: string | null`: ID sesji generowania zwrócone z pierwszego API.
    - `error: string | null`: Komunikat błędu do wyświetlenia.
    - `candidateToEdit: FlashcardCandidateViewModel | null`: Kandydat aktualnie edytowany w modalu.
  - **Udostępniane funkcje**: `generateCandidates`, `acceptCandidate`, `rejectCandidate`, `openEditDialog`, `saveCandidateEdit`, `submitAcceptedCandidates`.

## 7. Integracja API

### 1. Generowanie kandydatów na fiszki
- **Endpoint**: `POST /api/ai/generate-flashcards`
- **Typ żądania**: `GenerateFlashcardsCommand`
- **Typ odpowiedzi**: `GenerateFlashcardsResponseDto`
- **Wywołanie**: Po kliknięciu "Generuj" w `SourceTextForm`. Hook `useFlashcardGeneration` wysyła żądanie.
- **Obsługa odpowiedzi**: W przypadku sukcesu (200), hook zapisuje `generationId`, mapuje otrzymane `candidates` na `FlashcardCandidateViewModel` (z domyślnym statusem `pending`) i przełącza widok na krok `review`. W przypadku błędu, zapisuje komunikat i przełącza na krok `error`.

### 2. Zapisywanie zaakceptowanych fiszek
- **Endpoint**: `POST /api/decks/{deckId}/flashcards/batch`
- **Typ żądania**: `BatchCreateFlashcardsCommand`
- **Typ odpowiedzi**: `BatchCreateFlashcardsResponseDto`
- **Wywołanie**: Po kliknięciu "Zatwierdź wybrane" w `CandidateReviewList`.
- **Obsługa odpowiedzi**: Hook filtruje kandydatów ze statusem `accepted`, tworzy ciało żądania (ustawiając pole `source` na `ai-edited` jeśli `isEdited` jest `true`), a następnie wysyła żądanie. W przypadku sukcesu (201), nawigacja przekierowuje użytkownika do widoku talii (`/app/decks/{deckId}`). W przypadku błędu, wyświetlany jest odpowiedni komunikat.

## 8. Interakcje użytkownika
1. Użytkownik wprowadza tekst do `Textarea`. Przycisk "Generuj" staje się aktywny po spełnieniu kryteriów długości.
2. Użytkownik klika "Generuj", co pokazuje stan ładowania, a następnie listę kandydatów.
3. Na liście kandydatów, użytkownik może:
    - Kliknąć "Akceptuj": karta zmienia wygląd, a przycisk "Zatwierdź wybrane" staje się aktywny (jeśli to pierwszy zaakceptowany).
    - Kliknąć "Odrzuć": karta jest wizualnie deakcentowana (np. wyszarzona).
    - Kliknąć "Edytuj": otwiera się modal `EditCandidateDialog`.
4. W modalu edycji, użytkownik modyfikuje tekst, a po zapisaniu zmian, karta na liście jest aktualizowana.
5. Po zaakceptowaniu co najmniej jednej fiszki, użytkownik klika "Zatwierdź wybrane", co inicjuje zapis i po sukcesie przekierowuje go do widoku talii.

## 9. Warunki i walidacja
- **Formularz tekstu źródłowego**:
    - **Warunek**: Długość tekstu `sourceText` musi być w zakresie [1000, 10000].
    - **Interfejs**: Przycisk "Generuj" jest `disabled`, dopóki warunek nie jest spełniony. Wyświetlany jest licznik znaków.
- **Lista kandydatów**:
    - **Warunek**: `candidates.some(c => c.status === 'accepted')` jest `true`.
    - **Interfejs**: Przycisk "Zatwierdź wybrane" jest `disabled`, dopóki warunek nie jest spełniony.
- **Modal edycji**:
    - **Warunek**: `front.length > 0 && front.length <= 200` ORAZ `back.length > 0 && back.length <= 500`.
    - **Interfejs**: Przycisk "Zapisz" w modalu jest `disabled`, dopóki oba warunki nie są spełnione.

## 10. Obsługa błędów
Aplikacja będzie obsługiwać błędy API i sieciowe w sposób przyjazny dla użytkownika.
- **Błąd walidacji (400)**: Komunikaty powinny być wyświetlane przy odpowiednich polach.
- **Brak autoryzacji (401)**: Użytkownik powinien zostać przekierowany do strony logowania.
- **Nie znaleziono talii (404)**: Wyświetlenie komunikatu "Nie znaleziono talii" z opcją powrotu.
- **Przekroczenie limitu zapytań (429)**: Wyświetlenie konkretnego komunikatu, np. "Przekroczono limit zapytań do AI. Spróbuj ponownie później."
- **Błąd serwera (500) lub błąd sieci**: Wyświetlenie ogólnego komunikatu o błędzie z prośbą o ponowną próbę.
W każdym przypadku błędu, komponent `ErrorDisplay` pokaże stosowną informację i przycisk umożliwiający zresetowanie stanu i powrót do formularza wejściowego.

## 11. Kroki implementacji
1.  **Stworzenie plików**: Utworzenie strony Astro `src/pages/app/decks/[deckId]/generate.astro` oraz pliku dla komponentu React `src/components/features/GenerationClientComponent.tsx`.
2.  **Definicja typów**: Zdefiniowanie nowych typów `CandidateStatus` i `FlashcardCandidateViewModel` w `src/types.ts` lub lokalnie w komponencie.
3.  **Implementacja hooka `useFlashcardGeneration`**: Stworzenie logiki zarządzania stanem, w tym obsługa kroków, kandydatów oraz integracja z `fetch` API.
4.  **Budowa komponentów UI**: Implementacja komponentów `SourceTextForm`, `CandidateReviewList`, `FlashcardCandidateCard` i `EditCandidateDialog` z użyciem komponentów z biblioteki Shadcn/ui.
5.  **Połączenie logiki z UI**: Integracja hooka `useFlashcardGeneration` z głównym komponentem `GenerationClientComponent` i przekazanie stanu oraz akcji do komponentów podrzędnych.
6.  **Routing i nawigacja**: Zapewnienie, że `deckId` jest poprawnie przekazywane z adresu URL do komponentu oraz obsługa przekierowania po pomyślnym zapisaniu fiszek.
7.  **Obsługa ładowania i błędów**: Implementacja wizualnych wskaźników dla stanów `loading`, `submitting` i `error`.
8.  **Stylowanie**: Dopracowanie wyglądu komponentów za pomocą Tailwind CSS, w tym wizualne rozróżnienie statusów kandydatów na fiszki.
