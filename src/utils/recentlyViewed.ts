import { Product } from '../types/resale';

export const RECENTLY_VIEWED_STORAGE_KEY = 'innove_recently_viewed_items';
const MAX_STORED_HISTORY = 12;

/**
 * Retrieve recently viewed products from sessionStorage.
 * Optionally excludes a specific product ID (e.g. the one currently in view).
 */
export function getRecentlyViewed(excludeProductId?: string, limit: number = 4): Product[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = sessionStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const items: Product[] = JSON.parse(raw);
    if (!Array.isArray(items)) return [];

    let filtered = items;
    if (excludeProductId) {
      filtered = filtered.filter((p) => p && p.id !== excludeProductId);
    }
    return filtered.slice(0, limit);
  } catch (err) {
    console.warn('Failed to parse recently viewed items from sessionStorage:', err);
    return [];
  }
}

/**
 * Records a product into sessionStorage at the front of the list.
 * Deduplicates by ID and limits total stored history.
 */
export function recordProductView(product: Product): Product[] {
  if (typeof window === 'undefined' || !product || !product.id) return [];

  try {
    const raw = sessionStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    let items: Product[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) items = parsed;
      } catch {
        items = [];
      }
    }

    // Filter out previous occurrences of the same product
    const updated = [product, ...items.filter((p) => p && p.id !== product.id)].slice(
      0,
      MAX_STORED_HISTORY
    );

    sessionStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));

    // Notify listeners in case multiple views/drawers are active
    window.dispatchEvent(
      new CustomEvent('innove:recently-viewed-updated', {
        detail: { product, updated }
      })
    );

    return updated;
  } catch (err) {
    console.warn('Failed to save recently viewed product to sessionStorage:', err);
    return [];
  }
}

/**
 * Clear the recently viewed history in the current session.
 */
export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('innove:recently-viewed-updated', { detail: { updated: [] } }));
}
