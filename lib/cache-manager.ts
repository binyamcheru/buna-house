/**
 * Cache Manager - Clear all frontend caches
 */

export function clearAllCaches() {
  if (typeof window === 'undefined') return;

  try {
    // 1. Clear localStorage
    localStorage.removeItem('products_cache');
    localStorage.removeItem('products_cache_time');
    localStorage.removeItem('products_cache_timestamp');
    localStorage.removeItem('hero_images_cache');
    localStorage.removeItem('settings_cache');

    // 2. Clear sessionStorage
    sessionStorage.clear();

    // Broadcast cache clear to any open tabs/listeners
    window.dispatchEvent(new Event('roast_cache_cleared'));

    console.log('✅ All caches cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear caches:', error);
    return false;
  }
}

export function clearProductsCache() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('products_cache');
  localStorage.removeItem('products_cache_time');
  localStorage.removeItem('products_cache_timestamp');
  window.dispatchEvent(new Event('roast_products_cache_cleared'));
}

export function clearHeroImagesCache() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hero_images_cache');
  window.dispatchEvent(new Event('roast_hero_cache_cleared'));
}

export function clearSettingsCache() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('settings_cache');
  window.dispatchEvent(new Event('roast_settings_cache_cleared'));
}

