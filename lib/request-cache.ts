// Request deduplication utility
// Prevents duplicate simultaneous API calls

class RequestCache {
  private pending: Map<string, Promise<any>> = new Map();

  /**
   * Fetch with deduplication
   * If same request is already pending, returns existing promise
   * @param key Unique identifier for the request
   * @param fetcher Function that performs the actual fetch
   */
  async fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // If request is already pending, return existing promise
    if (this.pending.has(key)) {
      console.log(`♻️ Reusing pending request: ${key}`);
      return this.pending.get(key)!;
    }

    console.log(`🆕 Starting new request: ${key}`);

    // Start new request
    const promise = fetcher().finally(() => {
      // Clean up after request completes
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pending.clear();
  }
}

export const requestCache = new RequestCache();

// Usage Example:
// import { requestCache } from '@/lib/request-cache';
//
// const data = await requestCache.fetch('products', async () => {
//   const response = await fetch('/api/products');
//   return response.json();
// });
