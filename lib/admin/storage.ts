// DEMO PERSISTENCE ADAPTER — this is NOT a database.
// Admin edits are kept in this browser's localStorage only, so they survive a refresh
// on this device but are invisible to visitors, other browsers and the public site.
// In Phase 2, replace this adapter with calls to a real backend API.

const STORAGE_KEY = "an-portfolio-admin-demo-v1";

export const demoStorage = {
  load<T>(): T | null {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  save<T>(value: T): boolean {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable: nothing to clear.
    }
  },
};
