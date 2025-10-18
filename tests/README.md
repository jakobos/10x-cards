# Testing Environment

Projekt jest skonfigurowany z wielopoziomową strategią testowania.

## Struktura katalogów

```
tests/
├── setup/           # Pliki konfiguracyjne dla testów
│   └── vitest.setup.ts
├── mocks/           # Mock handlers dla MSW
│   ├── handlers.ts  # Definicje handlerów API
│   ├── server.ts    # MSW server dla testów (Node.js)
│   └── browser.ts   # MSW worker dla przeglądarki
├── fixtures/        # Dane testowe i factory functions
│   └── test-data.ts
├── unit/            # Testy jednostkowe i integracyjne (.test.ts/.test.tsx)
└── e2e/             # Testy End-to-End (.spec.ts)
```

## Testy jednostkowe i integracyjne

### Używane narzędzia

- **Vitest 2.x** - Test runner z natywnym wsparciem ESM
- **React Testing Library 16.x** - Testowanie komponentów React
- **@testing-library/user-event 14.x** - Symulacja interakcji użytkownika
- **happy-dom 15.x** - Szybkie środowisko DOM
- **MSW 2.x** - Mockowanie requestów HTTP
- **@faker-js/faker 9.x** - Generowanie danych testowych

### Uruchamianie testów

```bash
# Uruchom wszystkie testy jednostkowe
npm run test

# Uruchom testy w trybie watch (dla development)
npm run test:watch

# Uruchom testy z interfejsem UI
npm run test:ui

# Uruchom testy z pokryciem kodu
npm run test:coverage
```

### Konfiguracja

Testy jednostkowe używają:
- **happy-dom** jako środowiska DOM (szybsze niż jsdom)
- **MSW** do mockowania requestów HTTP
- **@faker-js/faker** do generowania danych testowych

Pliki setup są automatycznie ładowane przed każdym testem (konfiguracja w `vitest.config.ts`).

## Testy End-to-End

### Używane narzędzia

- **Playwright 1.x** - Framework E2E z wsparciem TypeScript
- **@axe-core/playwright 4.x** - Weryfikacja dostępności (WCAG 2.1)

### Uruchamianie testów E2E

**Ważne:** Przed uruchomieniem testów E2E, uruchom aplikację w osobnym terminalu:

```bash
# Terminal 1 - uruchom aplikację
npm run dev

# Terminal 2 - uruchom testy E2E
npm run test:e2e

# Inne opcje:
npm run test:e2e:ui      # UI mode
npm run test:e2e:debug   # Debug mode
npm run test:e2e:codegen # Code generation
```

### Konfiguracja

Testy E2E używają:
- **Chromium/Desktop Chrome** (zgodnie z wytycznymi)
- **@axe-core/playwright** do testowania dostępności
- Automatyczne trace on failure
- Screenshot on failure

## Uruchamianie wszystkich testów

```bash
# Uruchom testy jednostkowe i E2E
npm run test:all
```

## Kluczowe narzędzia i wtyczki

### Vitest
- `vi.fn()` - mockowanie funkcji
- `vi.spyOn()` - monitorowanie funkcji
- `vi.mock()` - mockowanie modułów
- Inline snapshots: `expect(value).toMatchInlineSnapshot()`

### Playwright
- Page Object Model dla struktury testów
- Resilient locators (getByRole, getByLabel)
- Trace viewer: `npx playwright show-trace`
- Codegen: `npm run test:e2e:codegen`

## Pliki konfiguracyjne

- `vitest.config.ts` - Konfiguracja Vitest
- `playwright.config.ts` - Konfiguracja Playwright
- `tests/setup/vitest.setup.ts` - Setup dla testów jednostkowych
- `tests/mocks/handlers.ts` - Handlery MSW
- `tests/fixtures/test-data.ts` - Factory functions dla danych testowych

## Zasoby

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Faker.js Documentation](https://fakerjs.dev/)

