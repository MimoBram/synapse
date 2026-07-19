import { supabase } from "../config/database";
import { logger } from "./logger";

type NotificationType = "invite" | "invite_accepted" | "invite_rejected" | "comment" | "follow" | "like";

interface NotifyInput {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  payload?: Record<string, unknown>;
}

// Fire-and-forget: a failed notification write must never break the
// caller's primary action (e.g. liking a project should still succeed).
export async function notify(input: NotifyInput): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    recipient_id: input.recipientId,
    actor_id: input.actorId ?? null,
    type: input.type,
    payload: input.payload ?? {},
  });
  if (error) {
    logger.error({ err: error, input }, "failed to write notification");
  }
}

type ActivityVerb = "created_project" | "joined_project" | "commented" | "followed" | "liked";
type ActivityTargetType = "project" | "profile" | "comment";

interface LogActivityInput {
  actorId: string;
  verb: ActivityVerb;
  targetType: ActivityTargetType;
  targetId: string;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  const { error } = await supabase.from("activity_log").insert({
    actor_id: input.actorId,
    verb: input.verb,
    target_type: input.targetType,
    target_id: input.targetId,
  });
  if (error) {
    logger.error({ err: error, input }, "failed to write activity log");
  }
}
