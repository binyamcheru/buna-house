// lib/performance-monitor.ts
// Monitor and log performance metrics (FREE analytics)

interface PerformanceMetrics {
  pageLoadTime: number;
  apiCallCount: number;
  cacheHitRate: number;
  errorCount: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    apiCallCount: 0,
    cacheHitRate: 0,
    errorCount: 0,
    timestamp: Date.now(),
  };

  private apiCalls = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.trackPageLoad();
    }
  }

  /**
   * Track page load time
   */
  private trackPageLoad() {
    window.addEventListener('load', () => {
      const perfData = performance.timing;
      this.metrics.pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`⚡ Page loaded in ${this.metrics.pageLoadTime}ms`);
    });
  }

  /**
   * Track API call
   */
  trackApiCall() {
    this.apiCalls++;
    this.metrics.apiCallCount = this.apiCalls;
  }

  /**
   * Track cache hit
   */
  trackCacheHit() {
    this.cacheHits++;
    this.updateCacheHitRate();
  }

  /**
   * Track cache miss
   */
  trackCacheMiss() {
    this.cacheMisses++;
    this.updateCacheHitRate();
  }

  /**
   * Update cache hit rate
   */
  private updateCacheHitRate() {
    const total = this.cacheHits + this.cacheMisses;
    if (total > 0) {
      this.metrics.cacheHitRate = (this.cacheHits / total) * 100;
    }
  }

  /**
   * Track error
   */
  trackError() {
    this.metrics.errorCount++;
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Log metrics to console
   */
  logMetrics() {
    console.table({
      'Page Load (ms)': this.metrics.pageLoadTime,
      'API Calls': this.metrics.apiCallCount,
      'Cache Hit Rate': `${this.metrics.cacheHitRate.toFixed(1)}%`,
      'Errors': this.metrics.errorCount,
      'Cache Hits': this.cacheHits,
      'Cache Misses': this.cacheMisses,
    });
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      pageLoadTime: 0,
      apiCallCount: 0,
      cacheHitRate: 0,
      errorCount: 0,
      timestamp: Date.now(),
    };
    this.apiCalls = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Export metrics (for client demo)
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Usage:
//
// // Track API call:
// performanceMonitor.trackApiCall();
//
// // Track cache:
// if (cachedData) {
//   performanceMonitor.trackCacheHit();
// } else {
//   performanceMonitor.trackCacheMiss();
// }
//
// // Log metrics (show client):
// performanceMonitor.logMetrics();
