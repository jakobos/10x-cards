/**
 * OpenRouter Service
 *
 * A centralized, reusable client for interacting with the OpenRouter.ai API.
 * This service abstracts the complexities of making API calls, handling authentication,
 * formatting requests, parsing responses, and managing errors.
 *
 * @example
 * ```typescript
 * const result = await openRouterService.generateJson({
 *   systemPrompt: "You are a helpful assistant",
 *   userPrompt: "Generate a response",
 *   jsonSchema: mySchema,
 * });
 * ```
 */

import {
  AuthenticationError,
  BadRequestError,
  NetworkError,
  ParsingError,
  RateLimitError,
  ServerError,
} from "../errors.ts";
import { OPENROUTER_API_KEY } from "astro:env/server";

/**
 * Parameters for generating structured JSON responses from OpenRouter API.
 */
export interface GenerationParameters {
  /** The system message to guide the model's behavior */
  systemPrompt: string;

  /** The user's input or request */
  userPrompt: string;

  /** A JavaScript object representing the JSON schema for the desired output */
  jsonSchema: Record<string, unknown>;

  /** Optional: The name of the OpenRouter model to use (e.g., 'openai/gpt-4o') */
  model?: string;

  /** Optional: Controls the randomness of the output (0.0 to 2.0) */
  temperature?: number;

  /** Optional: The maximum number of tokens in the response */
  maxTokens?: number;
}

/**
 * OpenRouter Service Class
 *
 * Provides a clean interface for interacting with OpenRouter's API.
 * Handles authentication, request formatting, and error management.
 */
export class OpenRouterService {
  private apiKey: string;
  private defaultModel: string;
  private readonly baseUrl = "https://openrouter.ai/api/v1";

  /**
   * Initializes the OpenRouter service with API credentials.
   *
   * @throws {Error} If OPENROUTER_API_KEY environment variable is not set
   */
  constructor() {
    // Guard clause: Check if API key is available

    // ... w konstruktorze (linia 68):
    const apiKey = OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is not set. " + "Please add it to your .env file.");
    }

    this.apiKey = apiKey;
    this.defaultModel = "gpt-4o-mini";
  }

  /**
   * Generates a structured JSON response from the OpenRouter API.
   *
   * This method sends a request to OpenRouter and expects a JSON response
   * that conforms to the provided schema.
   *
   * @template T - The expected return type matching the JSON schema
   * @param params - Generation parameters including prompts and schema
   * @returns A promise that resolves to a typed object matching the schema
   *
   * @throws {AuthenticationError} If API key is invalid
   * @throws {RateLimitError} If rate limit is exceeded
   * @throws {BadRequestError} If request parameters are invalid
   * @throws {ServerError} If OpenRouter server error occurs
   * @throws {NetworkError} If network connection fails
   * @throws {ParsingError} If response cannot be parsed as JSON
   *
   * @example
   * ```typescript
   * interface FlashcardResponse {
   *   flashcards: Array<{ question: string; answer: string }>;
   * }
   *
   * const result = await openRouterService.generateJson<FlashcardResponse>({
   *   systemPrompt: "You are a flashcard generator",
   *   userPrompt: "Create flashcards about TypeScript",
   *   jsonSchema: flashcardSchema,
   *   maxTokens: 2048,
   * });
   * ```
   */
  public async generateJson<T>(params: GenerationParameters): Promise<T> {
    const payload = this.buildRequestPayload(params);
    const response = await this.sendRequest(payload);
    return this.parseResponse<T>(response);
  }

  /**
   * Builds the complete request payload for the OpenRouter API.
   *
   * Constructs the request body according to OpenRouter's API specification,
   * including messages, response format, and optional parameters.
   *
   * @param params - Generation parameters
   * @returns The complete request payload ready to be sent
   * @private
   */
  private buildRequestPayload(params: GenerationParameters): Record<string, unknown> {
    const { systemPrompt, userPrompt, jsonSchema, model, temperature, maxTokens } = params;

    const payload: Record<string, unknown> = {
      model: model || this.defaultModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "custom_json_schema",
          strict: true,
          schema: jsonSchema,
        },
      },
    };

    // Add optional parameters only if they are provided
    if (temperature !== undefined) {
      payload.temperature = temperature;
    }

    if (maxTokens !== undefined) {
      payload.max_tokens = maxTokens;
    }

    return payload;
  }

  /**
   * Sends the HTTP POST request to the OpenRouter API.
   *
   * Handles the HTTP communication, including headers, authentication,
   * and error status code mapping.
   *
   * @param payload - The request payload to send
   * @returns The parsed JSON response from the API
   * @throws Custom errors based on HTTP status codes
   * @private
   */
  private async sendRequest(payload: Record<string, unknown>): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Handle non-OK responses with specific error types
      if (!response.ok) {
        return await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      // If it's already one of our custom errors, re-throw it
      if (
        error instanceof AuthenticationError ||
        error instanceof RateLimitError ||
        error instanceof BadRequestError ||
        error instanceof ServerError
      ) {
        throw error;
      }

      // Otherwise, it's a network error (connection failed, timeout, etc.)
      const message = error instanceof Error ? error.message : "Unknown network error";
      throw new NetworkError(`Network error: ${message}`);
    }
  }

  /**
   * Handles error responses from the API by mapping status codes to custom errors.
   *
   * @param response - The failed HTTP response
   * @throws Appropriate custom error based on status code
   * @private
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;

    switch (status) {
      case 401:
        throw new AuthenticationError("Authentication failed. Please check your OPENROUTER_API_KEY.");

      case 429:
        throw new RateLimitError("Rate limit exceeded. Please wait before making more requests.");

      case 400: {
        // Try to extract error details from response body
        try {
          const errorBody = await response.json();
          const errorMessage = errorBody.error?.message || "Bad request.";
          throw new BadRequestError(`Bad request: ${errorMessage}`);
        } catch {
          throw new BadRequestError("Bad request. Invalid parameters.");
        }
      }

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(`OpenRouter server error (${status}). Please try again later.`);

      default:
        throw new ServerError(`Request failed with status ${status}. Please try again.`);
    }
  }

  /**
   * Safely extracts and parses the JSON content from the API response.
   *
   * Accesses the message content from OpenRouter's response structure
   * and parses it as JSON.
   *
   * @template T - The expected return type
   * @param response - The API response object
   * @returns The parsed content cast to the generic type T
   * @throws {ParsingError} If response structure is invalid or content is not valid JSON
   * @private
   */
  private parseResponse<T>(response: unknown): T {
    // Validate response structure
    const responseObj = response as Record<string, unknown>;
    const choices = responseObj?.choices as Record<string, unknown>[] | undefined;
    const message = choices?.[0]?.message as Record<string, unknown> | undefined;
    const messageContent = message?.content;

    if (typeof messageContent !== "string") {
      throw new ParsingError("Invalid response structure from API. Missing message content.");
    }

    // Try to parse the JSON content
    try {
      return JSON.parse(messageContent) as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown parsing error";
      throw new ParsingError(`Failed to parse the model's response as JSON: ${errorMessage}`);
    }
  }
}

/**
 * Singleton instance of the OpenRouter service.
 * Use this exported instance throughout your application.
 *
 * @example
 * ```typescript
 * import { openRouterService } from '@/lib/services/openrouter.service';
 *
 * const result = await openRouterService.generateJson({...});
 * ```
 */
export const openRouterService = new OpenRouterService();
