import { supabase } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { buildPageResponse, cursorFilter, type Cursor } from "../../utils/pagination";
import type { NotificationRow } from "./notifications.types";

const COLUMNS = "id, recipient_id, actor_id, type, payload, is_read, created_at";

export async function listMyNotifications(
  userId: string,
  filters: { unreadOnly?: boolean },
  pagination: { limit: number; cursor?: Cursor },
): Promise<{ data: NotificationRow[]; nextCursor: string | null }> {
  let request = supabase
    .from("notifications")
    .select(COLUMNS)
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(pagination.limit + 1);
  if (filters.unreadOnly) {
    request = request.eq("is_read", false);
  }
  if (pagination.cursor) {
    request = request.or(cursorFilter(pagination.cursor));
  }

  const { data, error } = await request;
  if (error) {
    throw new AppError(500, `Failed to list notifications: ${error.message}`);
  }
  return buildPageResponse(data ?? [], pagination.limit);
}

export async function markNotificationRead(id: string, userId: string): Promise<NotificationRow> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("recipient_id", userId)
    .select(COLUMNS)
    .maybeSingle();
  if (error) {
    throw new AppError(500, `Failed to mark notification read: ${error.message}`);
  }
  if (!data) {
    throw new AppError(404, "Notification not found");
  }
  return data;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", userId)
    .eq("is_read", false);
  if (error) {
    throw new AppError(500, `Failed to mark notifications read: ${error.message}`);
  }
}
