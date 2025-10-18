Frontend - Astro z React dla komponentów interaktywnych:

- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:

- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testy - Wielopoziomowa strategia testowania dla zapewnienia jakości:

Testy jednostkowe i integracyjne:
- Vitest 2.x jako test runner z natywnym wsparciem ESM i integracją z Vite
- React Testing Library 16.x do testowania komponentów React z perspektywy użytkownika
- @testing-library/user-event 14.x do realistycznych symulacji interakcji użytkownika
- happy-dom 15.x jako szybkie środowisko DOM dla testów komponentów
- MSW (Mock Service Worker) 2.x do mockowania requestów HTTP i zewnętrznych API
- @faker-js/faker 9.x do generowania realistycznych danych testowych

Testy End-to-End:
- Playwright 1.x jako framework E2E z wsparciem TypeScript, auto-wait i paralelizacją
- @axe-core/playwright 4.x do automatycznej weryfikacji dostępności zgodnie z WCAG 2.1

CI/CD i Hosting:

- Github Actions do tworzenia pipeline'ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker
