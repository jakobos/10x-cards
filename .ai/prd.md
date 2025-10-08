# Dokument wymagań produktu (PRD) - Generator Fiszek AI
## 1. Przegląd produktu
Generator Fiszek AI to aplikacja webowa, która ma na celu usprawnienie procesu tworzenia fiszek edukacyjnych. Głównym założeniem jest wykorzystanie sztucznej inteligencji do automatycznego generowania fiszek na podstawie tekstu dostarczonego przez użytkownika. Produkt jest skierowany do senior deweloperów, którzy uczą się nowych technologii i potrzebują szybkiego sposobu na tworzenie materiałów do nauki w oparciu o metodę powtórek. Aplikacja pozwoli na ręczne tworzenie i edycję fiszek, grupowanie ich w talie oraz naukę przy użyciu gotowego algorytmu powtórek.

## 2. Problem użytkownika
Tworzenie wysokiej jakości fiszek jest skuteczną metodą nauki, ale proces ten jest bardzo czasochłonny. Senior deweloperzy, którzy chcą szybko przyswajać nową wiedzę, np. z dokumentacji technicznych, nie mają czasu na ręczne przepisywanie i formatowanie dziesiątek kart. Ta bariera często zniechęca ich do regularnego stosowania jednej z najbardziej efektywnych technik zapamiętywania, jaką jest spaced repetition. Generator Fiszek AI rozwiązuje ten problem, automatyzując najbardziej żmudną część procesu i pozwalając użytkownikowi skupić się na nauce.

## 3. Wymagania funkcjonalne
### 3.1. Zarządzanie kontem użytkownika
- Użytkownicy mogą trwale usunąć swoje konto wraz ze wszystkimi danymi.
- Użytkownicy mogą zmienić swoje hasło.

### 3.2. Zarządzanie taliami (Deck)
- Użytkownicy mogą tworzyć nowe talie, podając ich nazwę.
- Użytkownicy mogą edytować nazwy istniejących talii.
- Użytkownicy mogą usuwać talie, co powoduje skasowanie również wszystkich zawartych w nich fiszek.
- Usunięcie talii wymaga dodatkowego potwierdzenia.

### 3.3. Zarządzanie fiszkami (Flashcard)
- Każda fiszka składa się z przodu (maks. 200 znaków) i tyłu (maks. 500 znaków).
- Użytkownicy mogą ręcznie tworzyć nowe fiszki wewnątrz talii.
- Użytkownicy mogą edytować przód i tył istniejących fiszek.
- Użytkownicy mogą usuwać pojedyncze fiszki.

### 3.4. Generowanie fiszek przez AI
- Użytkownik może wkleić tekst (plain text) o długości od 1000 do 10000 znaków w celu wygenerowania fiszek.
- System analizuje tekst i prezentuje użytkownikowi listę propozycji (kandydatów) na fiszki.
- Użytkownik może zaakceptować lub odrzucić każdą z propozycji.
- Zaakceptowane fiszki są dodawane do wybranej talii.
- Nie ma możliwości edycji fiszek na etapie przeglądania propozycji.

### 3.5. System nauki
- Aplikacja wykorzystuje gotową bibliotekę open-source do implementacji algorytmu powtórek
- Interfejs nauki pokazuje przód fiszki, a użytkownik odkrywa jej tył.
- Po odkryciu tyłu, użytkownik dokonuje samooceny, wybierając opcję "Wiedziałem" lub "Nie wiedziałem".
- Na podstawie oceny algorytm decyduje, kiedy fiszka powinna pojawić się ponownie.

## 4. Granice produktu
### 4.1. Co wchodzi w zakres MVP
- Rejestracja i logowanie
- Pełne zarządzanie (CRUD) taliami i fiszkami.
- Generowanie fiszek przez AI z wklejonego tekstu w formacie plain text.
- Podstawowy interfejs do nauki oparty na gotowym algorytmie powtórek.
- Aplikacja działa wyłącznie w przeglądarce internetowej (web).

### 4.2. Co nie wchodzi w zakres MVP
- Własny, zaawansowany algorytm powtórek (np. na wzór SuperMemo czy Anki).
- Import plików z materiałami (np. PDF, DOCX, TXT).
- Funkcje społecznościowe, takie jak współdzielenie talii między użytkownikami.
- Integracje z zewnętrznymi platformami edukacyjnymi.
- Aplikacje mobilne (iOS, Android).
- Monetyzacja i systemy płatności.

## 5. Historyjki użytkowników
### 5.1. Zarządzanie kontem
- ID: US-001
- Tytuł: Rejestracja użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji, abym mógł przechowywać swoje talie i fiszki.
- Kryteria akceptacji:
  1. Na stronie głównej znajduje się przycisk "Zarejestruj się".
  2. Po pomyślnej rejestracji i pierwszym logowaniu, jestem przenoszony do głównego panelu aplikacji.
  3. Widzę ekran powitalny z przyciskiem zachęcającym do stworzenia pierwszej talii.

- ID: US-002
- Tytuł: Logowanie użytkownika
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na swoje konto, aby uzyskać dostęp do moich materiałów.
- Kryteria akceptacji:
  1. Na stronie głównej znajduje się przycisk "Zaloguj się".
  2. Po pomyślnym zalogowaniu, jestem przenoszony do widoku "Moje talie".

- ID: US-003
- Tytuł: Wylogowanie użytkownika
- Opis: Jako zalogowany użytkownik, chcę móc się wylogować, aby zabezpieczyć swoje konto.
- Kryteria akceptacji:
  1. W interfejsie aplikacji dostępny jest przycisk "Wyloguj".
  2. Po kliknięciu jestem wylogowywany i przenoszony na stronę główną.

- ID: US-004
- Tytuł: Usunięcie konta
- Opis: Jako użytkownik, chcę mieć możliwość trwałego usunięcia swojego konta i wszystkich moich danych.
- Kryteria akceptacji:
  1. W ustawieniach konta znajduje się opcja "Usuń konto".
  2. Kliknięcie opcji wyświetla okno modalne z prośbą o potwierdzenie operacji.
  3. Po potwierdzeniu, moje konto i wszystkie powiązane z nim dane (talie, fiszki) są usuwane z bazy danych.
  4. Jestem wylogowywany i przenoszony na stronę główną.

### 5.2. Zarządzanie taliami
- ID: US-005
- Tytuł: Tworzenie talii
- Opis: Jako użytkownik, chcę móc tworzyć nowe talie, aby grupować tematycznie moje fiszki.
- Kryteria akceptacji:
  1. W widoku "Moje talie" znajduje się przycisk "Stwórz nową talię".
  2. Po kliknięciu pojawia się pole do wpisania nazwy talii.
  3. Po zatwierdzeniu nazwy, nowa, pusta talia pojawia się na liście moich talii.
  4. Nazwa talii nie może być pusta.

- ID: US-006
- Tytuł: Przeglądanie listy talii
- Opis: Jako użytkownik, chcę widzieć listę wszystkich moich talii, aby móc wybrać jedną z nich do nauki lub edycji.
- Kryteria akceptacji:
  1. Głównym ekranem po zalogowaniu jest widok "Moje talie".
  2. Każda talia na liście ma widoczną nazwę.
  3. Przy każdej talii znajdują się przyciski: "Ucz się", "Edytuj", "Usuń".

- ID: US-007
- Tytuł: Edycja nazwy talii
- Opis: Jako użytkownik, chcę mieć możliwość zmiany nazwy istniejącej talii.
- Kryteria akceptacji:
  1. Po kliknięciu przycisku "Edytuj" przy talii, jej nazwa staje się polem edytowalnym.
  2. Po wprowadzeniu nowej nazwy i jej zatwierdzeniu, nazwa talii na liście zostaje zaktualizowana.
  3. Nowa nazwa nie może być pusta.

- ID: US-008
- Tytuł: Usuwanie talii
- Opis: Jako użytkownik, chcę móc usunąć talię, której już nie potrzebuję.
- Kryteria akceptacji:
  1. Po kliknięciu przycisku "Usuń" przy talii, pojawia się okno modalne z prośbą o potwierdzenie.
  2. W oknie jest informacja, że usunięcie talii skasuje również wszystkie jej fiszki.
  3. Po potwierdzeniu, talia znika z listy "Moje talie".

### 5.3. Zarządzanie fiszkami
- ID: US-009
- Tytuł: Ręczne dodawanie fiszki
- Opis: Jako użytkownik, chcę móc ręcznie dodać nową fiszkę do wybranej talii.
- Kryteria akceptacji:
  1. W widoku szczegółów talii znajduje się przycisk "Dodaj fiszkę".
  2. Po kliknięciu otwiera się modal z polami "Przód" i "Tył".
  3. Po wypełnieniu pól i zatwierdzeniu, nowa fiszka jest dodawana do talii, a modal się zamyka.
  4. Pola "Przód" i "Tył" nie mogą być puste.
  5. System waliduje długość tekstu (przód <= 200, tył <= 500 znaków).

- ID: US-010
- Tytuł: Edycja fiszki
- Opis: Jako użytkownik, chcę móc edytować istniejące fiszki, aby poprawić błędy lub zaktualizować informacje.
- Kryteria akceptacji:
  1. W widoku listy fiszek w talii, każda fiszka ma opcję "Edytuj".
  2. Po kliknięciu "Edytuj" mogę modyfikować zawartość pól "Przód" i "Tył".
  3. Zapisanie zmian aktualizuje fiszkę w bazie danych.
  4. Walidacja długości tekstu działa tak samo, jak przy tworzeniu.

- ID: US-011
- Tytuł: Usuwanie fiszki
- Opis: Jako użytkownik, chcę móc usunąć pojedynczą fiszkę z talii.
- Kryteria akceptacji:
  1. W widoku listy fiszek w talii, każda fiszka ma opcję "Usuń".
  2. Po kliknięciu "Usuń" i potwierdzeniu, fiszka jest trwale usuwana z talii.

### 5.4. Generowanie fiszek AI
- ID: US-012
- Tytuł: Rozpoczęcie generowania fiszek AI
- Opis: Jako użytkownik, chcę wkleić fragment tekstu, aby AI wygenerowało dla mnie propozycje fiszek.
- Kryteria akceptacji:
  1. W widoku talii znajduje się przycisk "Generuj fiszki z AI".
  2. Po kliknięciu zostaję przeniesiony do widoku z dużym polem tekstowym.
  3. Mogę wkleić tekst i kliknąć przycisk "Generuj".
  4. System wyświetla błąd, jeśli tekst jest krótszy niż 1000 lub dłuższy niż 10000 znaków.

- ID: US-013
- Tytuł: Przeglądanie i akceptacja wygenerowanych fiszek
- Opis: Jako użytkownik, chcę przejrzeć listę fiszek zaproponowanych przez AI i zdecydować, które z nich chcę dodać do mojej talii.
- Kryteria akceptacji:
  1. Po zakończeniu generowania, widzę listę "kandydatów" na fiszki, każdy z widocznym przodem i tyłem.
  2. Przy każdej propozycji znajdują się przyciski "Akceptuj" i "Odrzuć".
  3. Kliknięcie "Akceptuj" powoduje oznaczenie fiszki do dodania.
  4. Kliknięcie "Odrzuć" powoduje usunięcie propozycji z listy.
  5. Po przejrzeniu wszystkich propozycji klikam przycisk "Zakończ". Zaakceptowane fiszki są dodawane do talii.
  6. Po zakończeniu jestem przenoszony z powrotem do widoku talii, gdzie widzę nowo dodane fiszki.

### 5.5. Nauka
- ID: US-014
- Tytuł: Rozpoczęcie sesji nauki
- Opis: Jako użytkownik, chcę rozpocząć sesję nauki dla wybranej talii.
- Kryteria akceptacji:
  1. Na liście talii, przy każdej z nich jest przycisk "Ucz się".
  2. Kliknięcie przycisku rozpoczyna sesję nauki i przenosi mnie do interfejsu nauki.
  3. Przycisk "Ucz się" jest nieaktywny, jeśli talia nie zawiera żadnych fiszek.

- ID: US-015
- Tytuł: Interakcja z fiszką podczas nauki
- Opis: Jako użytkownik, w trakcie nauki chcę zobaczyć pytanie, zastanowić się nad odpowiedzią, a następnie ją odkryć i ocenić swoją wiedzę.
- Kryteria akceptacji:
  1. System prezentuje mi przód fiszki.
  2. W interfejsie znajduje się przycisk "Pokaż odpowiedź".
  3. Po kliknięciu, tył fiszki zostaje odkryty.
  4. Pojawiają się dwa przyciski: "Wiedziałem" i "Nie wiedziałem".

- ID: US-016
- Tytuł: Zakończenie sesji nauki
- Opis: Jako użytkownik, chcę, aby sesja nauki zakończyła się automatycznie, gdy algorytm uzna, że na dziś wystarczy powtórek.
- Kryteria akceptacji:
  1. Po przejściu przez zaplanowane na daną sesję fiszki, wyświetla się komunikat o zakończeniu nauki.
  2. Jestem przenoszony z powrotem do widoku "Moje talie".

## 6. Metryki sukcesu
### Metryka 1: Jakość generowanych fiszek
- Cel: Minimum 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkownika.
- Sposób mierzenia: System będzie logował każdą akcję "akceptuj" i "odrzuć" na ekranie przeglądania propozycji. Metryka będzie liczona jako: (liczba zaakceptowanych fiszek / łączna liczba wygenerowanych propozycji) * 100.

### Metryka 2: Adopcja funkcji AI
- Cel: Minimum 75% wszystkich fiszek w systemie jest tworzonych przy użyciu generatora AI.
- Sposób mierzenia: Każda fiszka w bazie danych będzie miała atrybut wskazujący na metodę jej utworzenia ("AI" lub "manualna"). Metryka będzie liczona jako: (liczba fiszek stworzonych przez AI / całkowita liczba fiszek w systemie) * 100.