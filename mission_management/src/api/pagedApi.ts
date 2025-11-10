/**
 * @fileoverview Pagination adapter for API responses.
 *
 * This module provides a normalization layer to convert various paginated response
 * shapes into a unified `PagedResponse<T>` format. It supports:
 * - Standard pagination shapes with `items`, `nextCursor`, and `hasMore`
 * - Nested structures like `{ data: { items: [...] }, meta: { nextCursor: ... } }`
 * - Legacy REST API shapes using `results` and `next`
 * - Fallback to plain arrays (with optional client-side slicing when limit is specified)
 *
 * This allows frontend hooks to remain agnostic to backend pagination formats and
 * gracefully handles APIs that don't yet support server-side pagination.
 *
 * @module api/pagedApi
 */

/**
 * Unified paginated response structure.
 *
 * @template T - The type of items in the page.
 */
export type PagedResponse<T> = {
  /** Array of items in the current page. */
  items: T[];
  /** Cursor for fetching the next page (null if no more pages). */
  nextCursor?: string | number | null;
  /** Whether more pages are available (derived from nextCursor if not provided). */
  hasMore?: boolean;
};

type Raw = unknown;

/**
 * Normalizes an unknown API response into a unified `PagedResponse<T>` format.
 *
 * Handles multiple response shapes:
 * - `{ items: T[], nextCursor?: ..., hasMore?: ... }` - standard shape
 * - `{ data: { items: T[] }, meta: { nextCursor?: ... } }` - nested shape
 * - `{ results: T[], next?: ... }` - legacy REST API shape
 * - `T[]` - plain array (fallback with optional client-side slicing)
 *
 * @template T - The type of items in the response.
 * @param raw - The raw API response data.
 * @param options - Optional configuration.
 * @param options.limit - If specified and raw is a plain array longer than limit,
 *                        slices to first page and signals more pages available.
 * @returns A normalized `PagedResponse<T>` with `items`, `nextCursor`, and `hasMore`.
 *
 * @example
 * ```ts
 * // Standard shape
 * const res1 = normalizePaged<User>({ items: [...], nextCursor: 123, hasMore: true });
 *
 * // Plain array fallback
 * const res2 = normalizePaged<User>([...users], { limit: 20 });
 *
 * // Nested shape
 * const res3 = normalizePaged<User>({ data: { items: [...] }, meta: { nextCursor: 'abc' } });
 * ```
 */
export function normalizePaged<T>(raw: Raw, options?: { limit?: number }): PagedResponse<T> {
  const limit = options?.limit ?? undefined;

    // Case A: standard shape
    if (isObject(raw)) {
      const rec = raw as Record<string, unknown>;
      // Direct keys
      if (Array.isArray(rec.items)) {
        const items = rec.items as T[];
        const nextCursor = (rec.nextCursor ?? rec.next) as string | number | null | undefined;
        const hasMore = (rec.hasMore as boolean | undefined) ?? (nextCursor != null);
        return { items, nextCursor: nextCursor ?? null, hasMore };
      }
      // Nested data.items
      if (isObject(rec.data) && Array.isArray((rec.data as Record<string, unknown>).items)) {
        const dataObj = rec.data as Record<string, unknown>;
        const items = dataObj.items as T[];
        const meta = isObject(rec.meta) ? (rec.meta as Record<string, unknown>) : {};
        const nextCursor = (meta.nextCursor ?? meta.next) as string | number | null | undefined;
        const hasMore = (rec.hasMore as boolean | undefined) ?? (meta.hasMore as boolean | undefined) ?? (nextCursor != null);
        return { items, nextCursor: nextCursor ?? null, hasMore };
      }
      // Common alt: results
      if (Array.isArray(rec.results)) {
        const items = rec.results as T[];
        const nextCursor = rec.next as string | number | null | undefined;
        const hasMore = nextCursor != null;
        return { items, nextCursor: nextCursor ?? null, hasMore };
      }
  }

  // Case B: plain array fallback
  if (Array.isArray(raw)) {
    const arr = raw as T[];
    if (limit && arr.length > limit) {
      // slice to first page and signal more
      return { items: arr.slice(0, limit), nextCursor: limit, hasMore: true };
    }
    return { items: arr, nextCursor: null, hasMore: false };
  }

  // Unknown shape
  return { items: [], nextCursor: null, hasMore: false };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
