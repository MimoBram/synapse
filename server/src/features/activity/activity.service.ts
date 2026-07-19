import { supabase } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { buildPageResponse, cursorFilter, type Cursor } from "../../utils/pagination";
import type { ActivityRow } from "./activity.types";

const COLUMNS = "id, actor_id, verb, target_type, target_id, created_at";

export async function listActivity(pagination: {
  limit: number;
  cursor?: Cursor;
}): Promise<{ data: ActivityRow[]; nextCursor: string | null }> {
  let request = supabase
    .from("activity_log")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(pagination.limit + 1);
  if (pagination.cursor) {
    request = request.or(cursorFilter(pagination.cursor));
  }

  const { data, error } = await request;
  if (error) {
    throw new AppError(500, `Failed to list activity: ${error.message}`);
  }
  return buildPageResponse(data ?? [], pagination.limit);
}
