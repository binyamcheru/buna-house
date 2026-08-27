/**
 * Dashboard Query Cache
 * Caches expensive aggregation queries
 * Prevents recalculation on every dashboard load
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const dashboardCache: { [key: string]: CacheEntry } = {};

/**
 * Set cache with TTL (in milliseconds)
 */
export function setDashboardCache(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
  dashboardCache[key] = {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  };
}

/**
 * Get cache if valid
 */
export function getDashboardCache(key: string): any | null {
  const entry = dashboardCache[key];

  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > entry.ttl) {
    delete dashboardCache[key];
    return null;
  }

  return entry.data;
}

/**
 * Clear specific cache key
 */
export function clearDashboardCache(key: string): void {
  delete dashboardCache[key];
}

/**
 * Clear all dashboard cache
 */
export function clearAllDashboardCache(): void {
  Object.keys(dashboardCache).forEach(key => delete dashboardCache[key]);
}

/**
 * Cache keys for dashboard data
 */
export const CACHE_KEYS = {
  STATS: 'dashboard_stats',
  REVENUE: 'dashboard_revenue',
  POPULAR_PRODUCTS: 'dashboard_popular_products',
  RECENT_ORDERS: 'dashboard_recent_orders',
  CHART_DATA: 'dashboard_chart_data',
};

/**
 * Default TTLs (in milliseconds)
 */
export const CACHE_TTL = {
  STATS: 5 * 60 * 1000, // 5 minutes
  REVENUE: 10 * 60 * 1000, // 10 minutes
  POPULAR_PRODUCTS: 15 * 60 * 1000, // 15 minutes
  RECENT_ORDERS: 2 * 60 * 1000, // 2 minutes
  CHART_DATA: 10 * 60 * 1000, // 10 minutes
};
