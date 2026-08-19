// lib/cache.ts - Simple Browser Caching System

type CacheItem<T> = {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
};

class BrowserCache {
  private prefix = 'roast_cache_';

  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn,
    };
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache set failed:', e);
    }
  }

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return null;

      const item: CacheItem<T> = JSON.parse(raw);
      const now = Date.now();

      // Check if expired
      if (now - item.timestamp > item.expiresIn) {
        this.delete(key);
        return null;
      }

      return item.data;
    } catch (e) {
      console.warn('Cache get failed:', e);
      return null;
    }
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }
}

export const cache = new BrowserCache();
