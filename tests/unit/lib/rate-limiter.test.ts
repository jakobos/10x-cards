import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RateLimiter } from "@/lib/rate-limiter";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("isRateLimited", () => {
    it("should allow requests within limit", () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      expect(limiter.isRateLimited("user1")).toBe(false);
      expect(limiter.isRateLimited("user1")).toBe(false);
      expect(limiter.isRateLimited("user1")).toBe(false);
    });

    it("should block requests exceeding limit", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");

      expect(limiter.isRateLimited("user1")).toBe(true);
    });

    it("should block all subsequent requests after limit is reached", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");

      expect(limiter.isRateLimited("user1")).toBe(true);
      expect(limiter.isRateLimited("user1")).toBe(true);
      expect(limiter.isRateLimited("user1")).toBe(true);
    });

    it("should reset after window expires", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");
      expect(limiter.isRateLimited("user1")).toBe(true);

      // Advance time beyond the window
      vi.advanceTimersByTime(1001);

      // Should allow new requests
      expect(limiter.isRateLimited("user1")).toBe(false);
    });

    it("should reset only expired requests, not all requests", () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      // First request at t=0
      limiter.isRateLimited("user1");

      // Advance time by 600ms
      vi.advanceTimersByTime(600);

      // Second and third requests at t=600
      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");

      // At this point, all 3 requests are used
      expect(limiter.isRateLimited("user1")).toBe(true);

      // Advance time by 500ms (total 1100ms from first request)
      vi.advanceTimersByTime(500);

      // First request should be expired, but 2nd and 3rd should still count
      expect(limiter.isRateLimited("user1")).toBe(false); // 2 remaining + this = 3
      expect(limiter.isRateLimited("user1")).toBe(true); // Now at limit again
    });

    it("should track different users independently", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");

      expect(limiter.isRateLimited("user1")).toBe(true);
      expect(limiter.isRateLimited("user2")).toBe(false);
      expect(limiter.isRateLimited("user3")).toBe(false);
    });

    it("should handle limit of 1 request", () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });

      expect(limiter.isRateLimited("user1")).toBe(false);
      expect(limiter.isRateLimited("user1")).toBe(true);
    });

    it("should handle very large limits", () => {
      const limiter = new RateLimiter({ maxRequests: 1000, windowMs: 60000 });

      // Make 999 requests
      for (let i = 0; i < 999; i++) {
        expect(limiter.isRateLimited("user1")).toBe(false);
      }

      // 1000th request should still be allowed
      expect(limiter.isRateLimited("user1")).toBe(false);

      // 1001st request should be blocked
      expect(limiter.isRateLimited("user1")).toBe(true);
    });

    it("should handle new user correctly", () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      // First request from a new user should not be rate limited
      expect(limiter.isRateLimited("new-user")).toBe(false);
    });

    it("should not count blocked requests toward the limit", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.isRateLimited("user1"); // 1st request
      limiter.isRateLimited("user1"); // 2nd request

      // These should all be blocked but not counted
      expect(limiter.isRateLimited("user1")).toBe(true);
      expect(limiter.isRateLimited("user1")).toBe(true);
      expect(limiter.isRateLimited("user1")).toBe(true);

      // After window expires, should still have full limit available
      vi.advanceTimersByTime(1001);

      expect(limiter.isRateLimited("user1")).toBe(false); // Should work
      expect(limiter.isRateLimited("user1")).toBe(false); // Should work
      expect(limiter.isRateLimited("user1")).toBe(true); // Should block
    });
  });

  describe("getRemainingRequests", () => {
    it("should return max requests for new user", () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      expect(limiter.getRemainingRequests("user1")).toBe(5);
    });

    it("should return correct remaining requests after some usage", () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      expect(limiter.getRemainingRequests("user1")).toBe(5);
      limiter.isRateLimited("user1");
      expect(limiter.getRemainingRequests("user1")).toBe(4);
      limiter.isRateLimited("user1");
      expect(limiter.getRemainingRequests("user1")).toBe(3);
      limiter.isRateLimited("user1");
      expect(limiter.getRemainingRequests("user1")).toBe(2);
    });

    it("should return 0 when limit is reached", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");

      expect(limiter.getRemainingRequests("user1")).toBe(0);
    });

    it("should not return negative values", () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });

      limiter.isRateLimited("user1");

      expect(limiter.getRemainingRequests("user1")).toBe(0);
      expect(limiter.getRemainingRequests("user1")).toBeGreaterThanOrEqual(0);
    });

    it("should update after window expires", () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");
      expect(limiter.getRemainingRequests("user1")).toBe(1);

      vi.advanceTimersByTime(1001);

      expect(limiter.getRemainingRequests("user1")).toBe(3);
    });

    it("should update correctly as requests expire from sliding window", () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      // Request at t=0
      limiter.isRateLimited("user1");
      expect(limiter.getRemainingRequests("user1")).toBe(2);

      // Request at t=500
      vi.advanceTimersByTime(500);
      limiter.isRateLimited("user1");
      expect(limiter.getRemainingRequests("user1")).toBe(1);

      // At t=1100, first request should be expired
      vi.advanceTimersByTime(600);
      expect(limiter.getRemainingRequests("user1")).toBe(2);

      // At t=1600, second request should be expired too
      vi.advanceTimersByTime(500);
      expect(limiter.getRemainingRequests("user1")).toBe(3);
    });

    it("should track remaining requests independently per user", () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");
      limiter.isRateLimited("user2");

      expect(limiter.getRemainingRequests("user1")).toBe(3);
      expect(limiter.getRemainingRequests("user2")).toBe(4);
      expect(limiter.getRemainingRequests("user3")).toBe(5);
    });
  });

  describe("cleanup", () => {
    it("should remove expired entries from store", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user2");

      // Advance time beyond the window
      vi.advanceTimersByTime(1500);

      limiter.cleanup();

      // After cleanup, users should have full limit again
      expect(limiter.getRemainingRequests("user1")).toBe(2);
      expect(limiter.getRemainingRequests("user2")).toBe(2);
    });

    it("should remove user entries with no recent requests", () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user2");
      limiter.isRateLimited("user3");

      // Advance time beyond window
      vi.advanceTimersByTime(1500);

      limiter.cleanup();

      // All users should be cleaned up and have full limit
      expect(limiter.getRemainingRequests("user1")).toBe(3);
      expect(limiter.getRemainingRequests("user2")).toBe(3);
      expect(limiter.getRemainingRequests("user3")).toBe(3);
    });

    it("should not remove users with recent requests", () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      // user1 makes requests at t=0
      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");

      // Advance time by 500ms
      vi.advanceTimersByTime(500);

      // user2 makes requests at t=500
      limiter.isRateLimited("user2");

      // Advance time by 300ms (total 800ms)
      vi.advanceTimersByTime(300);

      // Cleanup at t=800
      limiter.cleanup();

      // user1's requests should still count (within 1000ms window from t=800)
      expect(limiter.getRemainingRequests("user1")).toBe(3);

      // user2's requests should still count
      expect(limiter.getRemainingRequests("user2")).toBe(4);
    });

    it("should handle cleanup with mixed expired and active entries", () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });

      // user1 at t=0
      limiter.isRateLimited("user1");

      // Advance to t=1100 (user1's request expired)
      vi.advanceTimersByTime(1100);

      // user2 at t=1100
      limiter.isRateLimited("user2");
      limiter.isRateLimited("user2");

      limiter.cleanup();

      // user1 should be cleaned up
      expect(limiter.getRemainingRequests("user1")).toBe(3);

      // user2 should still have their requests counted
      expect(limiter.getRemainingRequests("user2")).toBe(1);
    });

    it("should work correctly when called multiple times", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.isRateLimited("user1");

      vi.advanceTimersByTime(1500);

      limiter.cleanup();
      limiter.cleanup();
      limiter.cleanup();

      expect(limiter.getRemainingRequests("user1")).toBe(2);
    });

    it("should handle cleanup with no users in store", () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      // Call cleanup on empty store - should not throw
      expect(() => limiter.cleanup()).not.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle requests at exact window boundary", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");

      // Exactly at boundary (requests expire, so should allow new requests)
      // Implementation uses `timestamp > windowStart`, so at exactly windowMs,
      // old timestamps are filtered out
      vi.advanceTimersByTime(1000);
      expect(limiter.isRateLimited("user1")).toBe(false);

      // This request and one more should be allowed
      expect(limiter.isRateLimited("user1")).toBe(false);

      // Third request should be blocked
      expect(limiter.isRateLimited("user1")).toBe(true);
    });

    it("should handle very short time windows", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 100 });

      expect(limiter.isRateLimited("user1")).toBe(false);
      expect(limiter.isRateLimited("user1")).toBe(false);
      expect(limiter.isRateLimited("user1")).toBe(true);

      vi.advanceTimersByTime(101);

      expect(limiter.isRateLimited("user1")).toBe(false);
    });

    it("should handle very long time windows", () => {
      const limiter = new RateLimiter({
        maxRequests: 3,
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
      });

      expect(limiter.isRateLimited("user1")).toBe(false);
      expect(limiter.isRateLimited("user1")).toBe(false);
      expect(limiter.isRateLimited("user1")).toBe(false);
      expect(limiter.isRateLimited("user1")).toBe(true);

      // Advance by 23 hours - should still be limited
      vi.advanceTimersByTime(23 * 60 * 60 * 1000);
      expect(limiter.isRateLimited("user1")).toBe(true);

      // Advance by 2 more hours - should reset
      vi.advanceTimersByTime(2 * 60 * 60 * 1000);
      expect(limiter.isRateLimited("user1")).toBe(false);
    });

    it("should handle empty user ID string", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });

      expect(limiter.isRateLimited("")).toBe(false);
      expect(limiter.isRateLimited("")).toBe(false);
      expect(limiter.isRateLimited("")).toBe(true);
    });

    it("should handle special characters in user ID", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });
      const specialUserId = "user@email.com!#$%";

      expect(limiter.isRateLimited(specialUserId)).toBe(false);
      expect(limiter.isRateLimited(specialUserId)).toBe(false);
      expect(limiter.isRateLimited(specialUserId)).toBe(true);
    });

    it("should handle UUID user IDs", () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });
      const uuid = "550e8400-e29b-41d4-a716-446655440000";

      expect(limiter.isRateLimited(uuid)).toBe(false);
      expect(limiter.isRateLimited(uuid)).toBe(false);
      expect(limiter.isRateLimited(uuid)).toBe(true);
    });

    it("should handle rapid concurrent-like requests", () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      // Simulate multiple requests at the same timestamp
      for (let i = 0; i < 5; i++) {
        expect(limiter.isRateLimited("user1")).toBe(false);
      }

      expect(limiter.isRateLimited("user1")).toBe(true);
    });
  });

  describe("configuration validation", () => {
    it("should work with minimum viable config", () => {
      const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1 });

      expect(limiter.isRateLimited("user1")).toBe(false);
      expect(limiter.isRateLimited("user1")).toBe(true);
    });

    it("should maintain independent state across multiple limiter instances", () => {
      const limiter1 = new RateLimiter({ maxRequests: 2, windowMs: 1000 });
      const limiter2 = new RateLimiter({ maxRequests: 5, windowMs: 2000 });

      limiter1.isRateLimited("user1");
      limiter1.isRateLimited("user1");

      // limiter1 should be at limit
      expect(limiter1.isRateLimited("user1")).toBe(true);

      // limiter2 should be independent
      expect(limiter2.isRateLimited("user1")).toBe(false);
      expect(limiter2.getRemainingRequests("user1")).toBe(4);
    });
  });

  describe("realistic usage scenarios", () => {
    it("should handle AI endpoint rate limiting scenario (5 req/10 min)", () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 10 * 60 * 1000, // 10 minutes
      });

      // User makes 5 requests
      for (let i = 0; i < 5; i++) {
        expect(limiter.isRateLimited("user1")).toBe(false);
      }

      // 6th request should be blocked
      expect(limiter.isRateLimited("user1")).toBe(true);

      // Wait 10 minutes and 1 second
      vi.advanceTimersByTime(10 * 60 * 1000 + 1);

      // Should work again
      expect(limiter.isRateLimited("user1")).toBe(false);
    });

    it("should handle CRUD endpoint rate limiting scenario (100 req/min)", () => {
      const limiter = new RateLimiter({
        maxRequests: 100,
        windowMs: 60 * 1000, // 1 minute
      });

      // User makes 100 requests
      for (let i = 0; i < 100; i++) {
        expect(limiter.isRateLimited("user1")).toBe(false);
      }

      // 101st request should be blocked
      expect(limiter.isRateLimited("user1")).toBe(true);

      expect(limiter.getRemainingRequests("user1")).toBe(0);
    });

    it("should handle burst traffic with gradual recovery", () => {
      const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

      // Burst: 5 requests at t=0
      for (let i = 0; i < 5; i++) {
        limiter.isRateLimited("user1");
      }

      expect(limiter.isRateLimited("user1")).toBe(true);
      expect(limiter.getRemainingRequests("user1")).toBe(0);

      // At t=250ms, no requests expired yet
      vi.advanceTimersByTime(250);
      expect(limiter.getRemainingRequests("user1")).toBe(0);

      // At t=1001ms, all requests expired
      vi.advanceTimersByTime(751);
      expect(limiter.getRemainingRequests("user1")).toBe(5);
    });
  });

  describe("immutability", () => {
    it("should not mutate config object", () => {
      const config = { maxRequests: 5, windowMs: 1000 };
      const configCopy = { ...config };

      const limiter = new RateLimiter(config);

      limiter.isRateLimited("user1");
      limiter.isRateLimited("user1");

      expect(config).toEqual(configCopy);
    });
  });
});
