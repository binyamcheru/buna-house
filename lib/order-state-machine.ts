/**
 * Order State Machine
 * Enforces valid order status transitions
 */

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

const VALID_TRANSITIONS: { [key in OrderStatus]: OrderStatus[] } = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function isValidStatusTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  if (fromStatus === toStatus) return true; // No change is always valid
  return VALID_TRANSITIONS[fromStatus]?.includes(toStatus) || false;
}

export function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

export const ORDER_STATUS_LABELS: { [key in OrderStatus]: string } = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: { [key in OrderStatus]: string } = {
  pending: '#FFA500',
  confirmed: '#4A90E2',
  preparing: '#9B59B6',
  ready: '#27AE60',
  delivered: '#2ECC71',
  cancelled: '#E74C3C',
};
