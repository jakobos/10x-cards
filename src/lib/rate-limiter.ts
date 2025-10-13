/**
 * In-memory rate limiter for API endpoints.
 * Tracks request timestamps per user and enforces rate limits.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

type RateLimitStore = Record<string, number[]>;

class RateLimiter {
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

    for (const userId in this.store) {
      this.store[userId] = this.store[userId].filter((timestamp) => timestamp > windowStart);

      // Remove user entry if no recent requests
      if (this.store[userId].length === 0) {
        delete this.store[userId];
      }
    }
  }
}

// Create rate limiter for AI endpoints: 5 requests per 10 minutes
export const aiRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 10 * 60 * 1000, // 10 minutes
});

// Cleanup every 15 minutes
setInterval(
  () => {
    aiRateLimiter.cleanup();
  },
  15 * 60 * 1000
);
