import { vi } from "vitest";

export interface FakeResult {
  data: unknown;
  error: { message: string; code?: string } | null;
}

const CHAINABLE_METHODS = [
  "select",
  "insert",
  "update",
  "delete",
  "eq",
  "neq",
  "in",
  "or",
  "order",
  "limit",
  "ilike",
] as const;

/**
 * A single-use fake Supabase query builder. Chain methods return itself;
 * .single()/.maybeSingle() resolve to `result`, and awaiting the builder
 * directly (no terminal call) also resolves to `result` via `.then`.
 */
export function mockQueryBuilder(result: FakeResult) {
  const builder: Record<string, unknown> = {};
  for (const method of CHAINABLE_METHODS) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.then = (onFulfilled: (value: FakeResult) => unknown, onRejected: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(onFulfilled, onRejected);
  return builder;
}
