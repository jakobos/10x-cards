# 10x Cards - AI Flashcard Generator (test)

[![Project Status: In Development](https://img.shields.io/badge/status-in_development-yellowgreen.svg)](https://github.com/jakobos/10x-cards)

An AI-powered web application designed to accelerate the creation of educational flashcards for developers.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

**10x Cards** is a web application designed to streamline the creation of educational flashcards. The core feature utilizes AI to automatically generate flashcards from text provided by the user. The product is targeted at senior developers who are learning new technologies and need a quick way to create study materials based on the spaced repetition method.

The application solves the problem of time-consuming manual flashcard creation, allowing users to focus on learning rather than on preparing materials. By automating the most tedious part of the process, it encourages the regular use of one of the most effective memorization techniques.

## Tech Stack

The project is built with a modern, scalable, and efficient technology stack:

| Category      | Technology                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend**  | [Astro](https://astro.build/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/) |
| **Backend**   | [Supabase](https://supabase.com/) (PostgreSQL, Authentication, BaaS SDK)                                    |
| **AI**        | [OpenRouter.ai](https://openrouter.ai/) for access to various large language models                          |
| **Testing**   | [Vitest](https://vitest.dev/) (unit & integration tests), [React Testing Library](https://testing-library.com/react), [MSW](https://mswjs.io/) (HTTP mocking), [Playwright](https://playwright.dev/) (E2E tests), [Axe](https://www.deque.com/axe/) (accessibility testing) |
| **DevOps**    | [GitHub Actions](https://github.com/features/actions) for CI/CD, [DigitalOcean](https://www.digitalocean.com/) with [Docker](https://www.docker.com/) for hosting      |

## Getting Started Locally

To set up and run the project locally, follow these steps:

### Prerequisites

-   **Node.js**: The project requires a specific version of Node.js. It's recommended to use a version manager like `nvm`.
    ```sh
    nvm use
    ```
    The required version is specified in the `.nvmrc` file (`22.20.0`).
-   **Environment Variables**: You will need API keys and configuration for Supabase and OpenRouter.ai.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/jakobos/10x-cards.git
    cd 10x-cards
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```sh
    cp .env.example .env
    ```
    Then, fill in the required values in the `.env` file (e.g., `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY`).

### Running the Application

Once the installation and setup are complete, you can start the development server:

```sh
npm run dev
```

The application will be available at `http://localhost:4321`.

## Available Scripts

The `package.json` file includes several scripts for development and maintenance:

| Script       | Description                                    |
| ------------ | ---------------------------------------------- |
| `dev`        | Starts the development server with hot-reloading. |
| `build`      | Builds the application for production.         |
| `preview`    | Serves the production build locally for preview. |
| `lint`       | Lints the codebase for errors and style issues.  |
| `lint:fix`   | Automatically fixes linting issues.            |
| `format`     | Formats the code using Prettier.               |
| `test`       | Runs unit and integration tests in watch mode.  |
| `test:run`   | Runs unit and integration tests once.          |
| `test:coverage` | Runs tests and generates coverage report.    |
| `test:e2e`   | Runs end-to-end tests with Playwright.         |



## Project Status

The project is currently **in development**. The focus is on delivering the features defined in the MVP scope.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
