# Plan Testów - 10x Cards

## 1. Wprowadzenie

Celem tego dokumentu jest zdefiniowanie strategii, zakresu, zasobów i harmonogramu działań testowych dla projektu **10x Cards**. Plan ma na celu zapewnienie wysokiej jakości aplikacji poprzez weryfikację kluczowych funkcjonalności, stabilności oraz bezpieczeństwa. Główne cele testów to:
- Weryfikacja poprawności działania podstawowych funkcji aplikacji (uwierzytelnianie, zarządzanie taliami i fiszkami).
- Zapewnienie niezawodności i dokładności procesu generowania fiszek z wykorzystaniem AI.
- Potwierdzenie spójności i użyteczności interfejsu użytkownika.
- Identyfikacja i eliminacja błędów przed wdrożeniem produkcyjnym.

Zakres testów obejmuje całą aplikację, od logiki backendowej i komunikacji z bazą danych, po komponenty interfejsu użytkownika i przepływy E2E.

## 2. Strategia Testowa

Strategia testowa opiera się na podejściu wielopoziomowym, dostosowanym do architektury projektu opartej na Astro 5, React 19 i Supabase.

1.  **Backend (API Endpoints & Services):** Każdy endpoint API w `src/pages/api` oraz logika biznesowa w `src/lib/services` będą posiadały dedykowane testy integracyjne. Testy te będą uruchamiane przeciwko dedykowanej, testowej instancji bazy danych Supabase, aby zapewnić izolację i powtarzalność. Mockowanie zewnętrznych usług, takich jak OpenRouter.ai, zostanie zrealizowane przy użyciu MSW (Mock Service Worker), co pozwoli na realistyczne przechwytywanie i mockowanie requestów HTTP na poziomie sieci.
2.  **Frontend (React Components & Hooks):** Interaktywne komponenty React (`.tsx`) oraz hooki (`src/hooks`) będą testowane jednostkowo i komponentowo z wykorzystaniem React Testing Library i `@testing-library/user-event` dla realistycznych symulacji interakcji użytkownika. Celem będzie weryfikacja ich poprawnego renderowania, zachowania w odpowiedzi na interakcje oraz zarządzania stanem. Testy będą uruchamiane w środowisku `happy-dom` dla optymalnej wydajności.
3.  **Przepływy End-to-End (E2E):** Krytyczne ścieżki użytkownika, takie jak rejestracja, logowanie, tworzenie talii, generowanie fiszek i proces nauki, zostaną zautomatyzowane przy użyciu Playwright. Testy E2E będą również obejmować automatyczną weryfikację dostępności (a11y) z wykorzystaniem `@axe-core/playwright`, zapewniając zgodność z wytycznymi WCAG.
4.  **Komponenty Astro:** Ze względu na ograniczone wsparcie dla bezpośredniego testowania komponentów `.astro`, logika biznesowa będzie wydzielana do funkcji TypeScript testowanych jednostkowo, a pełna funkcjonalność komponentów Astro będzie weryfikowana przez testy E2E.

Wszystkie testy będą częścią procesu Continuous Integration (CI) na platformie GitHub Actions, aby zapewnić, że nowy kod nie wprowadza regresji.

## 3. Typy Testów

### 3.1 Testy Jednostkowe

- **Cel:** Weryfikacja poprawności działania pojedynczych funkcji, komponentów i hooków w izolacji.
- **Zakres:**
    - Funkcje pomocnicze w `src/lib/helpers.ts` i `src/lib/utils.ts`.
    - Logika walidacji w `src/lib/validation`.
    - Komponenty UI z `src/components/ui` (np. `Button`, `Input`).
    - Logika hooków React (np. `useDecks`, `useDeckDetails`, `useFlashcardGeneration`).
    - Serwisy biznesowe z `src/lib/services` (z mockowaniem zależności).
- **Narzędzia:** Vitest, React Testing Library, `@testing-library/user-event`, `happy-dom`, `@faker-js/faker`.
- **Przykład:** Testowanie funkcji walidacji, logiki hooków, renderowania komponentów UI.

### 3.2 Testy Integracyjne

- **Cel:** Sprawdzenie poprawności współpracy pomiędzy różnymi modułami systemu.
- **Zakres:**
    - **API Endpoints:** Weryfikacja pełnego cyklu żądanie-odpowiedź dla wszystkich endpointów w `src/pages/api`, włączając w to uwierzytelnianie, operacje CRUD na taliach i fiszkach oraz obsługę błędów.
    - **Serwisy:** Testowanie logiki biznesowej w `src/lib/services` w połączeniu z testową bazą danych Supabase i mockowanymi zewnętrznymi API (OpenRouter.ai).
    - **Middleware:** Sprawdzenie logiki middleware'u Astro (`src/middleware/index.ts`), w tym ochrony tras i autoryzacji.
    - **Mockowanie HTTP:** Przechwytywanie i mockowanie requestów do zewnętrznych serwisów (OpenRouter.ai) oraz wewnętrznych API.
- **Narzędzia:** Vitest, MSW (Mock Service Worker), Supabase (testowa instancja), `@faker-js/faker`.
- **Przykład:** Testowanie endpointu generowania fiszek z mockiem OpenRouter.ai, testowanie CRUD operations na taliach z testową bazą danych.

### 3.3 Testy End-to-End (E2E)

- **Cel:** Symulacja rzeczywistych scenariuszy użycia aplikacji z perspektywy użytkownika oraz weryfikacja dostępności.
- **Zakres:**
    - Proces rejestracji i logowania.
    - Tworzenie, edycja i usuwanie talii kart.
    - Generowanie fiszek na podstawie tekstu źródłowego.
    - Dodawanie, edycja i usuwanie pojedynczych fiszek.
    - Proces przeglądania i nauki fiszek.
    - **Testy dostępności (a11y):** Automatyczna weryfikacja zgodności z WCAG 2.1 (poziom AA) dla kluczowych widoków aplikacji.
- **Narzędzia:** Playwright, `@axe-core/playwright`, `@faker-js/faker`.
- **Przykład:** Pełny flow użytkownika od rejestracji przez utworzenie talii, wygenerowanie fiszek AI, do nauki; weryfikacja dostępności dla użytkowników czytników ekranu.

## 4. Obszary Priorytetowe

1.  **Moduł uwierzytelniania i autoryzacji:**
    - Endpointy: `src/pages/api/auth/*`
    - Komponenty: `LoginForm.tsx`, `RegisterForm.tsx`
    - Middleware: `src/middleware/index.ts`
2.  **Zarządzanie taliami (CRUD):**
    - Endpointy: `src/pages/api/decks/*`
    - Komponenty: `DecksView.tsx`, `CreateEditDeckDialog.tsx`, `DeleteDeckDialog.tsx`
    - Serwis: `deck.service.ts`
3.  **Generowanie fiszek AI:**
    - Endpoint: `src/pages/api/ai/generate-flashcards.ts`
    - Komponenty: `GenerationClientComponent.tsx`
    - Serwisy: `generation.service.ts`, `openrouter.service.ts`
4.  **Zarządzanie fiszkami (CRUD):**
    - Endpointy: `src/pages/api/decks/[deckId]/flashcards/*`
    - Komponenty: `DeckDetailsView.tsx`, `FlashcardFormDialog.tsx`
    - Serwis: `flashcard.service.ts`

## 5. Narzędzia i Frameworki

### 5.1 Podstawowy Stack (Must-Have)

- **Test Runner:** Vitest v2.x (dla testów jednostkowych i integracyjnych)
  - Natywne wsparcie ESM, idealne dla Astro 5
  - Bardzo szybki dzięki integracji z Vite
  - Kompatybilny z API Jest
- **Środowisko DOM:** `happy-dom` v15.x
  - Szybsza alternatywa dla jsdom
  - Optymalna wydajność dla testów komponentów React
- **Biblioteka do testowania komponentów:** React Testing Library v16.x
  - Standard dla React 19
  - Promuje testowanie zachowań użytkownika
- **Interakcje użytkownika:** `@testing-library/user-event` v14.x
  - Realistyczne symulacje interakcji (zamiast `fireEvent`)
  - Lepsze odwzorowanie rzeczywistego zachowania użytkownika
- **Framework E2E:** Playwright v1.x
  - Najlepszy framework E2E w 2025
  - Wsparcie dla TypeScript, auto-wait, parallelizacja
- **Mockowanie HTTP:** MSW (Mock Service Worker) v2.x
  - Przechwytywanie requestów na poziomie sieci
  - Działa w Node.js i przeglądarce
  - Idealne dla mockowania OpenRouter.ai i innych API
- **Mockowanie modułów:** Vitest Mocks (wbudowane)
  - Dla mockowania funkcji i modułów
  - Używane wraz z MSW
- **Automatyzacja (CI/CD):** GitHub Actions
  - Bezpłatne dla projektów open source
  - Doskonała integracja z GitHub

### 5.2 Narzędzia Pomocnicze

- **Generowanie danych testowych:** `@faker-js/faker` v9.x
  - Realistyczne dane dla testów
  - Użytkownik, emaile, teksty, daty
- **Testy dostępności:** `@axe-core/playwright` v4.x
  - Automatyczna weryfikacja WCAG 2.1
  - Integracja z Playwright
- **Wizualne UI dla testów:** `@vitest/ui` v2.x
  - Interfejs graficzny dla Vitest
  - Ułatwia debugowanie i analizę wyników

### 5.3 Instalacja

```bash
# Podstawowy stack
npm install -D vitest @vitest/ui happy-dom
npm install -D @testing-library/react @testing-library/user-event
npm install -D playwright @playwright/test
npm install -D msw

# Narzędzia pomocnicze
npm install -D @faker-js/faker @axe-core/playwright
```

## 6. Kryteria Akceptacji

Projekt zostanie uznany za "gotowy" do wdrożenia, gdy spełnione zostaną następujące kryteria:
- Wszystkie zdefiniowane testy jednostkowe, integracyjne i E2E przechodzą pomyślnie.
- Pokrycie kodu testami (code coverage) dla kluczowych modułów (serwisy, walidacja, endpointy) wynosi co najmniej 80%.
- Nie występują żadne krytyczne ani blokujące błędy w zidentyfikowanych obszarach priorytetowych.
- Wszystkie testy są zintegrowane z procesem CI i uruchamiane automatycznie przy każdej zmianie w kodzie.
- **Testy dostępności:** Kluczowe widoki aplikacji (logowanie, lista talii, widok fiszek, generowanie AI) przechodzą testy a11y bez błędów krytycznych.
- **Wydajność testów:** Cały zestaw testów jednostkowych i integracyjnych wykonuje się w mniej niż 2 minuty, testy E2E w mniej niż 10 minut.

## 8. Przykłady Konfiguracji

### 8.1 Konfiguracja Vitest (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
```

### 8.2 Setup MSW (src/test/setup.ts)

```typescript
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// Uruchom MSW przed testami
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlerów po każdym teście
afterEach(() => server.resetHandlers())

// Zamknij serwer po testach
afterAll(() => server.close())
```

### 8.3 Mockowanie OpenRouter.ai (src/test/mocks/handlers.ts)

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock OpenRouter.ai
  http.post('https://openrouter.ai/api/v1/chat/completions', async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      id: 'chatcmpl-test',
      choices: [
        {
          message: {
            content: JSON.stringify([
              { front: 'Test Question?', back: 'Test Answer' },
              { front: 'Another Question?', back: 'Another Answer' },
            ]),
          },
        },
      ],
    })
  }),
  
  // Mock Supabase Auth (jeśli potrzebne)
  http.post('*/auth/v1/token*', () => {
    return HttpResponse.json({
      access_token: 'test-token',
      user: { id: 'test-user-id', email: 'test@example.com' },
    })
  }),
]
```

### 8.4 Przykład testu komponentu React

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('should submit form with correct credentials', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    
    render(<LoginForm onSubmit={onSubmit} />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })
})
```

### 8.5 Przykład testu E2E z dostępnością (Playwright)

```typescript
import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Login Flow', () => {
  test('should login successfully and check accessibility', async ({ page }) => {
    await page.goto('/login')
    
    // Test dostępności
    await injectAxe(page)
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    })
    
    // Test funkcjonalny
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/app/decks')
    await expect(page.getByRole('heading', { name: /my decks/i })).toBeVisible()
  })
})
```

### 8.6 Konfiguracja GitHub Actions (.github/workflows/test.yml)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit and integration tests
        run: npm run test:coverage
        env:
          SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:4321
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## 9. Najlepsze Praktyki

### 9.1 Testowanie z MSW
- Definiuj handlery raz i reużywaj w testach
- Używaj `server.use()` do nadpisywania handlerów w konkretnych testach
- Mockuj błędy i edge cases (network errors, timeouts, 4xx/5xx responses)

### 9.2 React Testing Library
- Preferuj `user-event` nad `fireEvent`
- Szukaj elementów po roli lub accessible name (nie po class/id)
- Testuj zachowania użytkownika, nie implementację

### 9.3 Playwright
- Używaj `auto-waiting` - unikaj manualnych `waitFor`
- Parallelizuj testy dla szybszości
- Używaj `test.describe.configure({ mode: 'serial' })` dla testów zależnych

### 9.4 Struktura testów
- **Arrange-Act-Assert** (AAA pattern)
- Jeden test = jedna asercja (główna)
- Opisowe nazwy testów w formacie: "should [expected behavior] when [condition]"

### 9.5 Dane testowe
- Używaj `@faker-js/faker` dla generowania danych
- Twórz factory functions dla złożonych obiektów
- Izoluj dane testowe - każdy test powinien mieć własne dane

## 10. Skrypty NPM

Dodaj następujące skrypty do `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

## 11. Uwagi Specyficzne dla Astro 5

### 11.1 Testowanie komponentów `.astro`
- Brak natywnego wsparcia dla testów jednostkowych komponentów Astro
- **Strategia:** Wydziel logikę do funkcji TypeScript w `src/lib` i testuj je jednostkowo
- Testuj komponenty Astro poprzez testy E2E w Playwright

### 11.2 Testowanie API Endpoints
- Endpointy Astro (`src/pages/api/**/*.ts`) można testować bezpośrednio importując funkcje
- Alternatywnie: użyj MSW do mockowania całego API i testuj integracyjnie z komponentami

### 11.3 Middleware
- Testuj middleware symulując obiekty `Request` i `Response`
- Wykorzystaj `node-mocks-http` lub twórz własne mocki

### 11.4 SSR/SSG
- Playwright automatycznie obsługuje SSR
- Testuj hydratację komponentów React po stronie klienta
- Weryfikuj, że interaktywne komponenty działają poprawnie po załadowaniu JS

