"use client";

// Client-side "read" tracking for notifications.
// Notifications are computed on the fly from live data (orders, stock, leads)
// rather than stored as rows, so there's no server-side read flag to update.
// We persist which notification IDs the admin has already seen in
// localStorage and use that to compute the real unread count/badge.

const STORAGE_KEY = "admin_read_notification_ids";

function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

export function markNotificationRead(id: string) {
  const ids = getReadIds();
  ids.add(id);
  saveReadIds(ids);
}

export function markAllNotificationsRead(ids: string[]) {
  const readIds = getReadIds();
  ids.forEach((id) => readIds.add(id));
  saveReadIds(readIds);
}

export function isNotificationRead(id: string): boolean {
  return getReadIds().has(id);
}

/** Returns notifications with `read` recomputed from local storage. */
export function applyReadState<T extends { id: string; read: boolean }>(notifications: T[]): T[] {
  const readIds = getReadIds();
  return notifications.map((n) => ({ ...n, read: readIds.has(n.id) }));
}
