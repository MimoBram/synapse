export interface NotificationRow {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}
