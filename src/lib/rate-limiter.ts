/**
 * In-memory rate limiter for API endpoints.
 * Tracks request timestamps per user and enforces rate limits.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

type RateLimitStore = Record<string, number[]>;

export class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Checks if a user has exceeded the rate limit.
   *
   * @param userId - The user ID to check
   * @returns true if rate limit is exceeded, false otherwise
   */
  isRateLimited(userId: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Initialize user's request history if it doesn't exist
    if (!this.store[userId]) {
      this.store[userId] = [];
    }

    // Remove timestamps outside the current window
    this.store[userId] = this.store[userId].filter((timestamp) => timestamp > windowStart);

    // Check if user has exceeded the limit
    if (this.store[userId].length >= this.config.maxRequests) {
      return true;
    }

    // Record this request
    this.store[userId].push(now);
    return false;
  }

  /**
   * Gets the remaining requests for a user.
   *
   * @param userId - The user ID to check
   * @returns Number of remaining requests
   */
  getRemainingRequests(userId: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    if (!this.store[userId]) {
      return this.config.maxRequests;
    }

    const recentRequests = this.store[userId].filter((timestamp) => timestamp > windowStart);
    return Math.max(0, this.config.maxRequests - recentRequests.length);
  }

  /**
   * Clears old entries from the store (cleanup).
   * Should be called periodically to prevent memory leaks.
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Build a new clean store without empty entries
    const cleanStore: RateLimitStore = {};

    for (const userId of Object.keys(this.store)) {
      const recentRequests = this.store[userId].filter((timestamp) => timestamp > windowStart);

      // Only keep users with recent requests
      if (recentRequests.length > 0) {
        cleanStore[userId] = recentRequests;
      }
    }

    this.store = cleanStore;
  }

  /**
   * Cleans up old entries from the store based on a given probability.
   * This is a serverless-friendly alternative to setInterval.
   * @param probability - The chance of cleanup running, from 0 to 1.
   */
  cleanupConditionally(probability = 0.01): void {
    if (Math.random() < probability) {
      this.cleanup();
    }
  }
}

// Create rate limiter for AI endpoints: 5 requests per 10 minutes
export const aiRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 10 * 60 * 1000, // 10 minutes
});

// Create rate limiter for CRUD endpoints: 100 requests per minute
export const crudRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
});
