/**
 * Custom error types for the application.
 * These errors provide specific context for different failure scenarios.
 */

/**
 * Thrown when API authentication fails (401 Unauthorized).
 * Usually indicates an invalid or missing API key.
 */
export class AuthenticationError extends Error {
  constructor(message = "Authentication failed. Check your API key.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when rate limit is exceeded (429 Too Many Requests).
 * The application should handle this by notifying the user to try again later.
 */
export class RateLimitError extends Error {
  constructor(message = "Rate limit exceeded. Please try again later.") {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Thrown for malformed requests (400 Bad Request).
 * This indicates an issue with the request payload (e.g., invalid model name or malformed schema).
 */
export class BadRequestError extends Error {
  constructor(message = "Bad request. Check your request parameters.") {
    super(message);
    this.name = "BadRequestError";
  }
}

/**
 * Thrown for server-side errors (5xx status codes).
 * Indicates a problem on OpenRouter's end.
 */
export class ServerError extends Error {
  constructor(message = "Server error occurred. Please try again later.") {
    super(message);
    this.name = "ServerError";
  }
}

/**
 * Thrown when the fetch call fails due to network issues.
 * This could be connectivity problems, timeouts, etc.
 */
export class NetworkError extends Error {
  constructor(message = "Network error occurred. Please check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Thrown if the model's response is not valid JSON when a JSON schema was requested.
 * This could happen if the model returns malformed data.
 */
export class ParsingError extends Error {
  constructor(message = "Failed to parse the response. Invalid JSON format.") {
    super(message);
    this.name = "ParsingError";
  }
}
