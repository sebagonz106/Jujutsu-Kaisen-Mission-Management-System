/**
 * @fileoverview Type definitions for query results and parameters.
 *
 * Defines generic structures for query execution results and input parameters.
 *
 * @module types/query
 */

/**
 * Generic query result wrapper.
 *
 * @template T - The type of data items returned by the query.
 */
export interface QueryResult<T> {
  /** Array of result items. */
  data: T[];

  /** Timestamp when the query was executed (ISO date string). */
  executedAt: string;

  /** Filters applied to the query. */
  filters: Record<string, unknown>;
}

/**
 * Generic query parameters object.
 *
 * Can contain any combination of filter parameters with various value types.
 */
export interface QueryParams {
  [key: string]: string | number | boolean | null | undefined;
}
