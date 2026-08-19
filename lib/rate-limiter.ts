// lib/rate-limiter.ts
// Client-side rate limiting (prevent API spam)

class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  /**
   * Check if action is allowed
   * @param key Unique identifier (e.g., 'submit-order', 'add-to-cart')
   * @param maxAttempts Maximum attempts allowed
   * @param windowMs Time window in milliseconds
   */
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Remove old attempts outside window
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      console.warn(`⚠️ Rate limit exceeded for: ${key}`);
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  /**
   * Get time until next allowed attempt
   */
  getRetryAfter(key: string, windowMs: number = 60000): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;

    const oldestAttempt = Math.min(...attempts);
    const timeUntilReset = windowMs - (Date.now() - oldestAttempt);

    return Math.max(0, Math.ceil(timeUntilReset / 1000)); // seconds
  }

  /**
   * Clear attempts for a key
   */
  clear(key?: string): void {
    if (key) {
      this.attempts.delete(key);
    } else {
      this.attempts.clear();
    }
  }
}

export const rateLimiter = new RateLimiter();

// Usage Examples:
//
// // Before submitting order:
// if (!rateLimiter.isAllowed('submit-order', 3, 60000)) {
//   const retryAfter = rateLimiter.getRetryAfter('submit-order', 60000);
//   alert(`Please wait ${retryAfter} seconds before trying again`);
//   return;
// }
//
// // Before adding to cart (prevent rapid clicking):
// if (!rateLimiter.isAllowed(`add-to-cart-${productId}`, 10, 1000)) {
//   return; // Ignore rapid clicks
// }
