# Architektura UI dla Generatora Fiszek AI

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) została zaprojektowana w celu zapewnienia płynnego, intuicyjnego i spójnego doświadczenia dla użytkowników aplikacji Generator Fiszek AI. Opiera się na podejściu komponentowym z wykorzystaniem Astro, React i biblioteki `shadcn/ui`.

Struktura dzieli aplikację na logiczne, chronione widoki, które odpowiadają kluczowym funkcjonalnościom zdefiniowanym w dokumencie wymagań produktu (PRD). Centralnym punktem dla zalogowanego użytkownika jest panel "Moje talie", z którego ma dostęp do zarządzania taliami, fiszkami oraz do inicjowania procesu generowania fiszek przez AI.

Kluczowe założenia architektoniczne:
- **Spójność wizualna**: Konsekwentne użycie komponentów `shadcn/ui` (Dialog, AlertDialog, Button, Card, etc.) w całej aplikacji.
- **Minimalizacja przeładowań**: Wykorzystanie okien modalnych do operacji tworzenia i edycji w celu utrzymania kontekstu użytkownika.
- **Jasny feedback**: Wyraźne komunikowanie stanów aplikacji (ładowanie, sukces, błąd) za pomocą komponentów `Skeleton` i powiadomień `Toast`.
- **Bezpieczeństwo**: Ochrona wszystkich prywatnych ścieżek aplikacji za pomocą middleware weryfikującego sesję użytkownika.
- **Zarządzanie stanem**: Efektywne zarządzanie stanem serwera za pomocą `TanStack Query` oraz stanem lokalnym (np. na widoku generowania AI) przy użyciu hooków Reacta.

## 2. Lista widoków

### 1. Strona Główna / Publiczna
- **Nazwa widoku**: Strona Główna
- **Ścieżka widoku**: `/`
- **Główny cel**: Prezentacja aplikacji nowym użytkownikom oraz zapewnienie punktu wejścia (logowanie/rejestracja) dla powracających.
- **Kluczowe informacje do wyświetlenia**: Nazwa aplikacji, hasło marketingowe, formularze logowania i rejestracji.
- **Kluczowe komponenty widoku**: `Card` z zakładkami na formularze (`Tabs`), `Form`, `Input`, `Button`.
- **UX, dostępność i względy bezpieczeństwa**: Publicznie dostępna. Formularze powinny mieć walidację po stronie klienta i serwera.

### 2. Panel Główny / Moje Talie
- **Nazwa widoku**: Moje Talie
- **Ścieżka widoku**: `/app/decks` (lub podobna chroniona ścieżka)
- **Główny cel**: Umożliwienie użytkownikowi przeglądania, tworzenia i zarządzania swoimi taliami fiszek. Jest to główny ekran po zalogowaniu.
- **Kluczowe informacje do wyświetlenia**: Lista talii użytkownika (nazwa, liczba fiszek), przyciski akcji. W przypadku braku talii, wyświetlany jest "pusty stan" z wezwaniem do akcji.
- **Kluczowe komponenty widoku**: `Card` dla każdej talii, `Button` ("Stwórz nową talię", "Ucz się"), `DropdownMenu` (dla akcji "Edytuj nazwę", "Usuń"), `Dialog` (do tworzenia/edycji talii), `AlertDialog` (do potwierdzenia usunięcia), `Skeleton` (stan ładowania).
- **UX, dostępność i względy bezpieczeństwa**: Ścieżka chroniona. Akcje destrukcyjne (usunięcie) wymagają dodatkowego potwierdzenia. Przycisk "Ucz się" jest nieaktywny, jeśli talia nie ma fiszek.

### 3. Szczegóły Talii
- **Nazwa widoku**: Szczegóły Talii
- **Ścieżka widoku**: `/app/decks/{deckId}`
- **Główny cel**: Wyświetlanie i zarządzanie wszystkimi fiszkami w obrębie jednej, wybranej talii.
- **Kluczowe informacje do wyświetlenia**: Nazwa talii, lista fiszek (przód, tył), przyciski akcji na poziomie talii i pojedynczej fiszki.
- **Kluczowe komponenty widoku**: Nagłówek z nawigacją powrotną ("breadcrumb"), `Table` lub lista `Card` do wyświetlania fiszek, `Button` ("Dodaj fiszkę", "Generuj z AI", "Edytuj fiszkę", "Usuń fiszkę"), `Dialog` (do ręcznego dodawania/edycji fiszki), `AlertDialog` (do potwierdzenia usunięcia fiszki), `Skeleton`.
- **UX, dostępność i względy bezpieczeństwa**: Ścieżka chroniona. Paginacja fiszek po stronie klienta (MVP).

### 4. Generowanie Fiszek AI
- **Nazwa widoku**: Generowanie Fiszek AI
- **Ścieżka widoku**: `/app/decks/{deckId}/generate`
- **Główny cel**: Przeprowadzenie użytkownika przez proces automatycznego generowania fiszek na podstawie dostarczonego tekstu.
- **Kluczowe informacje do wyświetlenia**: Pole do wklejenia tekstu, lista wygenerowanych kandydatów na fiszki z ich statusem (oczekujący, zaakceptowany, odrzucony).
- **Kluczowe komponenty widoku**: `Textarea` (dla tekstu źródłowego), `Button` ("Generuj", "Zatwierdź"), `Card` dla każdego kandydata z przyciskami akcji ("Akceptuj", "Edytuj", "Odrzuć"), `Dialog` (do edycji kandydata), wskaźniki wizualne statusu.
- **UX, dostępność i względy bezpieczeństwa**: Ścieżka chroniona. Przycisk "Zatwierdź" jest aktywny tylko po zaakceptowaniu co najmniej jednego kandydata. Aplikacja powinna obsługiwać stan ładowania podczas generowania przez AI oraz błędy (np. przekroczenie limitu zapytań).

### 5. Sesja Nauki
- **Nazwa widoku**: Sesja Nauki
- **Ścieżka widoku**: `/app/decks/{deckId}/learn`
- **Główny cel**: Umożliwienie użytkownikowi nauki z wykorzystaniem algorytmu powtórek.
- **Kluczowe informacje do wyświetlenia**: Przód fiszki, a po interakcji – tył fiszki.
- **Kluczowe komponenty widoku**: `Card` do wyświetlania fiszki, `Button` ("Pokaż odpowiedź"), `Button` ("Wiedziałem"), `Button` ("Nie wiedziałem").
- **UX, dostępność i względy bezpieczeństwa**: Ścieżka chroniona. Minimalistyczny interfejs skupiony na procesie nauki.

### 6. Ustawienia Konta
- **Nazwa widoku**: Ustawienia Konta
- **Ścieżka widoku**: `/app/settings`
- **Główny cel**: Zapewnienie użytkownikowi możliwości zarządzania swoim kontem.
- **Kluczowe informacje do wyświetlenia**: Opcje zmiany hasła i trwałego usunięcia konta.
- **Kluczowe komponenty widoku**: `Form`, `Input`, `Button`, `AlertDialog` (do potwierdzenia usunięcia konta).
- **UX, dostępność i względy bezpieczeństwa**: Ścieżka chroniona. Usunięcie konta jest operacją krytyczną i wymaga jednoznacznego, wieloetapowego potwierdzenia.

## 3. Mapa podróży użytkownika

Główny przepływ pracy ("happy path") dla kluczowej funkcji generowania fiszek:

1.  **Start**: Użytkownik loguje się i ląduje na widoku **Moje Talie**.
2.  **Tworzenie Talii**: Klika "Stwórz nową talię", co otwiera modal. Po wpisaniu nazwy i zatwierdzeniu, nowa talia pojawia się na liście.
3.  **Nawigacja do Talii**: Użytkownik klika na nowo utworzoną talię, przechodząc do widoku **Szczegóły Talii**.
4.  **Inicjowanie Generowania**: Klika przycisk "Generuj fiszki z AI", co przenosi go do widoku **Generowanie Fiszek AI**.
5.  **Generowanie**: Wkleja tekst źródłowy i klika "Generuj". Aplikacja komunikuje stan ładowania.
6.  **Przeglądanie Kandydatów**: Po chwili pojawia się lista kandydatów. Użytkownik akceptuje, odrzuca lub edytuje propozycje. Zaakceptowane pozycje są wyraźnie oznaczone wizualnie.
7.  **Zapisywanie**: Po zaakceptowaniu wybranych fiszek, klika "Zatwierdź".
8.  **Powrót i Weryfikacja**: Użytkownik jest automatycznie przekierowywany z powrotem do widoku **Szczegóły Talii**, gdzie widzi nowo dodane fiszki na liście. Otrzymuje powiadomienie `Toast` o pomyślnym dodaniu fiszek.

## 4. Układ i struktura nawigacji

Aplikacja będzie posiadała spójny, globalny układ dla zalogowanych użytkowników, składający się z:

- **Główny Nagłówek (Header)**:
    - link 'Moje Talie` po lewej stronie ktory prowadzi do widoku `Moje Talie` (`/app/decks`)
    - link 'Sesja nuaki' prowadzi do widoku `Sesja Nauki` (`/app/decks/{deckId}/learn`)
    - Menu użytkownika po prawej stronie, zawierające link do `Ustawień Konta` oraz przycisk `Wyloguj`.

- **Nawigacja Kontekstowa**:
    - W widokach zagnieżdżonych (np. `Szczegóły Talii`, `Generowanie Fiszek AI`) zostanie zastosowany mechanizm "breadcrumbs" (np. `Moje Talie > Nazwa Talii`), aby ułatwić orientację i powrót do widoku nadrzędnego.

## 5. Kluczowe komponenty

Poniższe komponenty (`shadcn/ui`) będą reużywane w całej aplikacji, aby zapewnić spójność i przyspieszyć rozwój:

- **`Dialog`**: Używany do wszystkich operacji tworzenia i edycji (np. nowa talia, nowa fiszka, edycja kandydata AI), aby unikać przeładowywania strony.
- **`AlertDialog`**: Używany do wszystkich akcji destrukcyjnych, które wymagają potwierdzenia (np. usunięcie talii, fiszki, konta).
- **`Card`**: Główny element do wyświetlania informacji w formie bloków (np. talia na liście, kandydat na fiszkę).
- **`Button`**: Standardowy komponent do wywoływania akcji.
- **`Form` z `Input` i `Label`**: Używane we wszystkich formularzach, zintegrowane z `React Hook Form` i `Zod` do walidacji.
- **`Toast`**: Do wyświetlania nieblokujących powiadomień o sukcesie lub błędach.
- **`Skeleton`**: Używany jako "placeholder" podczas ładowania danych z API, poprawiając postrzeganą wydajność.
