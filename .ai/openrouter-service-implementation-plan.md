# OpenRouter Service Implementation Plan

## 1. Service Description

The `OpenRouterService` will act as a centralized, reusable client for interacting with the OpenRouter.ai API. Its primary responsibility is to abstract the complexities of making API calls, handling authentication, formatting requests, parsing responses, and managing errors. This service will provide a simple interface for other parts of the application (e.g., API endpoints for flashcard generation) to leverage various Large Language Models (LLMs) available through OpenRouter.

The service will be designed to be robust, configurable, and easy to use, adhering to the project's coding practices and tech stack (Astro, TypeScript).

## 2. Constructor Description

The service will be implemented as a TypeScript class. The constructor will initialize the service with the necessary configuration.

```typescript
// Location: src/lib/services/openrouter.service.ts

class OpenRouterService {
  private apiKey: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is not set.");
    }
    this.defaultModel = 'anthropic/claude-3.5-sonnet';
  }
}
```

-   **Initialization**: The constructor reads the `OPENROUTER_API_KEY` from the environment variables.
-   **Validation**: It immediately throws an error if the API key is not found, ensuring a fail-fast approach.
-   **Defaults**: It sets a default model, which can be overridden on a per-call basis.

## 3. Public Methods and Fields

The primary public method will be `generateJson`, designed to handle chat-based interactions that require a structured JSON response.

```typescript
// Location: src/lib/services/openrouter.service.ts (inside OpenRouterService class)

interface GenerationParameters {
  systemPrompt: string;
  userPrompt: string;
  jsonSchema: Record<string, any>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

public async generateJson<T>(params: GenerationParameters): Promise<T> {
  // Implementation details...
}
```

-   **`generateJson<T>(params: GenerationParameters): Promise<T>`**
    -   **Purpose**: To send a request to the OpenRouter API and get a structured JSON response that conforms to a provided schema.
    -   **Generics (`<T>`)**: Allows the caller to specify the expected return type, providing strong type safety.
    -   **Parameters (`GenerationParameters`)**:
        -   `systemPrompt`: The system message to guide the model's behavior.
        -   `userPrompt`: The user's input or request.
        -   `jsonSchema`: A JavaScript object representing the JSON schema for the desired output.
        -   `model` (optional): The name of the OpenRouter model to use (e.g., `openai/gpt-4o`). Defaults to the class's `defaultModel`.
        -   `temperature` (optional): Controls the randomness of the output.
        -   `maxTokens` (optional): The maximum number of tokens in the response.
    -   **Returns**: A promise that resolves to a typed object `T` matching the `jsonSchema`.

## 4. Private Methods and Fields

Private methods will encapsulate the internal logic of building requests and handling responses.

```typescript
// Location: src/lib/services/openrouter.service.ts (inside OpenRouterService class)

private buildRequestPayload(params: GenerationParameters): Record<string, any> {
  // ...
}

private async sendRequest(payload: Record<string, any>): Promise<any> {
  // ...
}

private parseResponse<T>(response: any): T {
  // ...
}
```

-   **`buildRequestPayload(params)`**:
    -   **Purpose**: To construct the complete request body for the OpenRouter API.
    -   **Functionality**:
        1.  Sets the `model` from `params` or the default.
        2.  Adds optional parameters like `temperature` and `max_tokens` if provided.
        3.  Formats the `messages` array with `system` and `user` roles.
        4.  Correctly structures the `response_format` object using the provided `jsonSchema` according to OpenRouter's specification.

-   **`sendRequest(payload)`**:
    -   **Purpose**: To execute the HTTP POST request to the OpenRouter API endpoint.
    -   **Functionality**:
        1.  Uses `fetch` or a library like `axios` to call `https://openrouter.ai/api/v1/chat/completions`.
        2.  Sets the required headers: `Authorization: Bearer ${this.apiKey}` and `Content-Type: application/json`.
        3.  Handles the HTTP response, checking for non-200 status codes and throwing appropriate custom errors.

-   **`parseResponse<T>(response)`**:
    -   **Purpose**: To safely extract and parse the JSON content from the API response.
    -   **Functionality**:
        1.  Accesses the `choices[0].message.content` from the response body.
        2.  Uses a `try...catch` block to `JSON.parse` the content string.
        3.  If parsing fails, it throws a `ParsingError`.
        4.  Returns the parsed content cast to the generic type `T`.

## 5. Error Handling

A robust error-handling strategy is crucial. Custom error classes should be created to represent specific failure modes. These can be defined in a separate file (e.g., `src/lib/errors.ts`).

-   **`AuthenticationError`**: Thrown for 401 Unauthorized responses. Indicates an invalid API key.
-   **`RateLimitError`**: Thrown for 429 Too Many Requests. The application should handle this by notifying the user to try again later.
-   **`BadRequestError`**: Thrown for 400 Bad Request. This indicates an issue with the request payload (e.g., an invalid model name or malformed schema). The error should include details from the API response.
-   **`ServerError`**: Thrown for 5xx status codes. Indicates a problem on OpenRouter's end.
-   **`NetworkError`**: Thrown when the `fetch` call fails due to network issues.
-   **`ParsingError`**: Thrown if the model's response is not valid JSON when a JSON schema was requested.

The `sendRequest` method will be responsible for catching HTTP and network errors and mapping them to these custom error types.

## 6. Security Considerations

-   **API Key Management**: The `OPENROUTER_API_KEY` must never be hardcoded or exposed on the client-side. It should be managed exclusively as an environment variable on the server where the Astro application is running. Use a `.env` file for local development and the hosting provider's secrets management for production.
-   **Input Sanitization**: While the service itself doesn't directly handle user input from the web, any data passed into `userPrompt` should be sanitized by the calling code to prevent prompt injection attacks if the prompts are constructed from user-provided data.
-   **Resource Limiting**: Use the `maxTokens` parameter to prevent unexpectedly large (and costly) responses from the API. Implement application-level rate limiting (as seen in `src/lib/rate-limiter.ts`) on API endpoints that use this service to prevent abuse.

## 7. Step-by-Step Implementation Plan

### Step 1: Create Custom Error Types

Create a new file for custom application errors.

**File**: `src/lib/errors.ts`
```typescript
export class AuthenticationError extends Error {
  constructor(message: string = "OpenRouter authentication failed. Check your API key.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends Error {
  constructor(message: string = "Rate limit exceeded. Please try again later.") {
    super(message);
    this.name = "RateLimitError";
  }
}

// ... Define BadRequestError, ServerError, NetworkError, ParsingError similarly
```

### Step 2: Create the OpenRouter Service File

Create the main service file.

**File**: `src/lib/services/openrouter.service.ts`
```typescript
import {
  AuthenticationError,
  RateLimitError,
  BadRequestError,
  ServerError,
  NetworkError,
  ParsingError,
} from '@/lib/errors'; // Adjust path if necessary

// Interface definition from section 3
interface GenerationParameters {
  // ...
}

export class OpenRouterService {
  private apiKey: string;
  private defaultModel: string;
  private readonly baseUrl = "https://openrouter.ai/api/v1";

  // Constructor from section 2
  constructor() {
    // ...
  }

  // Public method from section 3
  public async generateJson<T>(params: GenerationParameters): Promise<T> {
    try {
      const payload = this.buildRequestPayload(params);
      const response = await this.sendRequest(payload);
      return this.parseResponse<T>(response);
    } catch (error) {
      // Log the error for debugging
      console.error("Error in OpenRouterService:", error);
      // Re-throw the original custom error
      throw error;
    }
  }
  
  // Private methods from section 4
  private buildRequestPayload(params: GenerationParameters): Record<string, any> {
    const { systemPrompt, userPrompt, jsonSchema, model, temperature, maxTokens } = params;

    return {
      model: model || this.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'custom_json_schema',
          strict: true,
          schema: jsonSchema,
        },
      },
      ...(temperature && { temperature }),
      ...(maxTokens && { max_tokens: maxTokens }),
    };
  }

  private async sendRequest(payload: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        switch (response.status) {
          case 401: throw new AuthenticationError();
          case 429: throw new RateLimitError();
          case 400: {
            const errorBody = await response.json();
            throw new BadRequestError(errorBody.error?.message || 'Bad request.');
          }
          default: throw new ServerError(`Request failed with status ${response.status}`);
        }
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error && !(error instanceof AuthenticationError || error instanceof RateLimitError || error instanceof BadRequestError || error instanceof ServerError)) {
        throw new NetworkError(error.message);
      }
      throw error; // Re-throw custom errors
    }
  }

  private parseResponse<T>(response: any): T {
    const content = response?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new ParsingError("Invalid response structure from API.");
    }
    try {
      return JSON.parse(content) as T;
    } catch (error) {
      throw new ParsingError("Failed to parse the model's response as JSON.");
    }
  }
}

export const openRouterService = new OpenRouterService();
```

### Step 3: Update Environment Variables

Add your OpenRouter API key to the project's environment files.

**File**: `.env` (create if it doesn't exist)
```
OPENROUTER_API_KEY="sk-or-..."
```
Ensure `.env` is listed in your `.gitignore` file.

### Step 4: Use the Service in an API Endpoint

Modify an existing or create a new API endpoint to use the service. For example, in `src/pages/api/ai/generate-flashcards.ts`.

```typescript
// Location: src/pages/api/ai/generate-flashcards.ts
import type { APIRoute } from 'astro';
import { openRouterService } from '@/lib/services/openrouter.service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { sourceText } = body; // Assume the client sends some text

    if (!sourceText) {
      return new Response(JSON.stringify({ error: 'Source text is required' }), { status: 400 });
    }

    const flashcardSchema = {
      type: 'object',
      properties: {
        flashcards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string', description: 'The question for the flashcard' },
              answer: { type: 'string', description: 'The answer to the question' },
            },
            required: ['question', 'answer'],
          },
        },
      },
      required: ['flashcards'],
    };

    const result = await openRouterService.generateJson<{ flashcards: { question: string; answer: string }[] }>({
      systemPrompt: "You are an expert at creating concise and accurate flashcards from a given text. Return the flashcards as a JSON object matching the provided schema.",
      userPrompt: `Generate 3-5 flashcards based on the following text: "${sourceText}"`,
      jsonSchema: flashcardSchema,
      model: 'anthropic/claude-3-haiku', // Example of overriding the default model
      maxTokens: 2048,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    // Handle custom errors from the service
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
```
