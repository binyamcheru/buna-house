// lib/optimistic-updates.ts
// Optimistic UI updates for better UX (no waiting for API)

import { cache } from './cache';

/**
 * Optimistic Cart Updates
 * Updates UI immediately, syncs with server in background
 */
export class OptimisticUpdates {
  // Update cart immediately (local state)
  static updateCartOptimistically(action: 'add' | 'remove' | 'update', item: any) {
    // Update localStorage cart immediately
    const cart = JSON.parse(localStorage.getItem('roast-cart-v1') || '[]');

    switch (action) {
      case 'add':
        cart.push(item);
        break;
      case 'remove':
        const index = cart.findIndex((i: any) => i.key === item.key);
        if (index > -1) cart.splice(index, 1);
        break;
      case 'update':
        const updateIndex = cart.findIndex((i: any) => i.key === item.key);
        if (updateIndex > -1) cart[updateIndex] = item;
        break;
    }

    localStorage.setItem('roast-cart-v1', JSON.stringify(cart));
    return cart;
  }

  // Optimistic order submission
  static async submitOrderOptimistically(orderData: any) {
    // Show success immediately
    const tempOrderNumber = `ORD-TEMP-${Date.now()}`;

    // Return temporary success
    const tempOrder = {
      order_number: tempOrderNumber,
      status: 'pending',
      ...orderData,
    };

    // Submit to API in background
    setTimeout(async () => {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          // If failed, show error notification
          console.error('Order submission failed in background');
          // Could trigger a notification here
        }
      } catch (error) {
        console.error('Background order submission error:', error);
      }
    }, 0);

    return tempOrder;
  }

  // Optimistic cache invalidation
  static invalidateCache(keys: string[]) {
    keys.forEach(key => cache.delete(key));
  }
}
