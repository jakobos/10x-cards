# API Endpoint Implementation Plan: Generate Flashcard Candidates

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia użytkownikom generowanie propozycji fiszek na podstawie dostarczonego tekstu źródłowego. Wykorzystuje zewnętrzny model AI do analizy tekstu i tworzenia zestawu potencjalnych pytań i odpowiedzi. Każda operacja generowania jest śledzona w bazie danych w celu monitorowania i zbierania metryk.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/ai/generate-flashcards`
- **Ciało żądania (Request Body)**:
  - **Typ zawartości**: `application/json`
  - **Struktura**:
    ```json
    {
      "sourceText": "A long string of text between 1000 and 10000 characters..."
    }
    ```
- **Parametry**:
  - **Wymagane**:
    - `sourceText` (`string`): Tekst źródłowy do generowania fiszek. Musi mieć od 1000 do 10000 znaków.

## 3. Wykorzystywane typy
- **Command Model (Request)**: `GenerateFlashcardsCommand`
- **DTO (Response)**: `GenerateFlashcardsResponseDto`
- **Pomocnicze DTO**: `FlashcardCandidateDto`

Wszystkie typy są zdefiniowane w `src/types.ts`.

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (`200 OK`)**:
  - **Struktura**:
    ```json
    {
      "generationId": "new-generation-uuid",
      "candidates": [
        { "front": "AI Generated Question 1", "back": "AI Generated Answer 1" },
        { "front": "AI Generated Question 2", "back": "AI Generated Answer 2" }
      ]
    }
    ```
- **Odpowiedzi błędu**:
  - `400 Bad Request`: Nieprawidłowe dane wejściowe.
  - `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
  - `429 Too Many Requests`: Przekroczono limit żądań.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera (np. błąd usługi AI).

## 5. Przepływ danych
1.  Klient wysyła żądanie `POST` na adres `/api/ai/generate-flashcards` z `sourceText` w ciele.
2.  Middleware Astro weryfikuje sesję użytkownika.
3.  Endpoint w `src/pages/api/ai/generate-flashcards.ts` odbiera żądanie.
4.  Następuje walidacja ciała żądania przy użyciu schemy `zod` zdefiniowanej dla `GenerateFlashcardsCommand`.
5.  Jeśli walidacja się powiedzie, endpoint wywołuje funkcję z serwisu `AIService` (np. `aiService.generateCandidates(sourceText, userId)`).
6.  `AIService`:
    a. Uruchamia pomiar czasu trwania operacji.
    b. Oblicza hash `SHA-256` z `sourceText`.
    c. Wysyła `sourceText` do zewnętrznego API AI (np. OpenRouter).
    d. Odbiera i parsuje odpowiedź AI, przekształcając ją w listę obiektów `FlashcardCandidateDto`.
    e. Zatrzymuje pomiar czasu.
    f. Zapisuje w tabeli `generations` nowy rekord zawierający `user_id`, `model`, `generated_count`, `source_text_hash`, `source_text_length` i `generation_duration`.
    g. Zwraca `generationId` oraz listę kandydatów (`candidates`) do endpointu.
7.  Endpoint Astro formatuje odpowiedź jako `GenerateFlashcardsResponseDto` i wysyła ją do klienta z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp do endpointu musi być ograniczony do uwierzytelnionych użytkowników. Należy sprawdzić `context.locals.user` na początku obsługi żądania.
- **Autoryzacja**: Zasady RLS (Row Level Security) w Supabase zapewnią, że rekord w tabeli `generations` zostanie utworzony z poprawnym `user_id` należącym do zalogowanego użytkownika.
- **Walidacja danych wejściowych**: Użycie biblioteki `zod` do ścisłej walidacji `sourceText` (typ, minimalna i maksymalna długość) jest obowiązkowe.
- **Ograniczenie liczby żądań (Rate Limiting)**: Należy zaimplementować mechanizm rate limiting (np. w middleware Astro), aby chronić endpoint przed nadużyciami. Przykładowy limit: 5 żądań na użytkownika na 10 minut.
- **Zarządzanie sekretami**: Klucz API do usługi AI musi być przechowywany jako zmienna środowiskowa (`OPENROUTER_API_KEY`) i dostępny tylko po stronie serwera (`import.meta.env.OPENROUTER_API_KEY`).

## 7. Rozważania dotyczące wydajności
- **Czas odpowiedzi AI**: 60 sekund oczekiwania, inczej błąd timeout.
- **Asynchroniczność po stronie klienta**: Interfejs użytkownika musi obsługiwać ten długi czas oczekiwania, informując użytkownika o trwającym procesie (np. za pomocą wskaźnika ładowania).
- **Monitorowanie**: Zapisywanie `generation_duration` w tabeli `generations` pozwoli na monitorowanie wydajności modelu AI i identyfikację potencjalnych problemów.

## 8. Etapy wdrożenia
1.  **Utworzenie pliku endpointu**: Stworzyć nowy plik `src/pages/api/ai/generate-flashcards.ts`.
2.  **Definicja schemy walidacji**: W pliku endpointu zdefiniować schemę `zod` dla `GenerateFlashcardsCommand`, która będzie weryfikować `sourceText`.
3.  **Implementacja obsługi `POST`**: Wewnątrz `src/pages/api/ai/generate-flashcards.ts` zaimplementować handler `POST`, który:
    a. Sprawdza uwierzytelnienie użytkownika (`context.locals.user`).
    b. Parsuje i waliduje ciało żądania przy użyciu `zod`.
    c. Obsługuje błędy walidacji, zwracając `400 Bad Request`.
4.  **Utworzenie serwisu AI**: Stworzyć nowy plik `src/lib/services/generation.service.ts`.
5.  **Implementacja logiki w serwisie**: W `generation.service.ts` zaimplementować funkcję `generateCandidates`, która będzie zawierać całą logikę biznesową:
    a. Komunikację z API OpenRouter. Na etapie developmentu skorzystamy z mocków zamiasty wywoływania serwisu AI.
    b. Haszowanie tekstu.
    c. Zapis do tabeli `generations` przy użyciu klienta Supabase.
6.  **Konfiguracja zmiennych środowiskowych**: Dodać `OPENROUTER_API_KEY` do zmiennych środowiskowych projektu.
7.  **Integracja serwisu z endpointem**: Wywołać metodę z `generation.service.ts` w handlerze `POST` i przekazać jej zwalidowane dane.
8.  **Obsługa błędów**: Zaimplementować bloki `try...catch` do obsługi potencjalnych błędów z serwisu AI oraz bazy danych, zwracając `500 Internal Server Error`.
9.  **(Opcjonalnie) Implementacja Rate Limiting**: W middleware (`src/middleware/index.ts`) dodać logikę ograniczającą liczbę żądań do tego endpointu.
