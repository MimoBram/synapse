import type { Request } from "express";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface Cursor {
  createdAt: string;
  id: string;
}

export function parsePagination(req: Request): { limit: number; cursor?: Cursor } {
  const rawLimit = Number(req.query.limit);
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), MAX_LIMIT) : DEFAULT_LIMIT;

  const rawCursor = req.query.cursor;
  if (typeof rawCursor !== "string" || rawCursor.length === 0) {
    return { limit };
  }

  try {
    const decoded = JSON.parse(Buffer.from(rawCursor, "base64url").toString("utf8")) as Partial<Cursor>;
    if (typeof decoded.createdAt === "string" && typeof decoded.id === "string") {
      return { limit, cursor: { createdAt: decoded.createdAt, id: decoded.id } };
    }
  } catch {
    // malformed cursor: fall back to the first page
  }

  return { limit };
}

export function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(JSON.stringify({ createdAt, id }), "utf8").toString("base64url");
}

/**
 * PostgREST `.or()` expression selecting rows strictly after this cursor,
 * assuming results are ordered by created_at desc, then idColumn desc.
 */
export function cursorFilter(cursor: Cursor, idColumn = "id"): string {
  return `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},${idColumn}.lt.${cursor.id})`;
}

export function buildPageResponse<T extends Record<string, unknown>>(
  rows: T[],
  limit: number,
  idColumn = "id",
): { data: T[]; nextCursor: string | null } {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const last = data[data.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(String(last.created_at), String(last[idColumn])) : null;
  return { data, nextCursor };
}
