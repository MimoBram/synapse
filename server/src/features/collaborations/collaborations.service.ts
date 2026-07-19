import { supabase } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { logActivity, notify } from "../../utils/events";
import { buildPageResponse, cursorFilter, type Cursor } from "../../utils/pagination";
import { getProjectById } from "../projects/projects.service";
import type { CollaborationAction, CollaborationRow, CreateCollaborationInput } from "./collaborations.types";

const COLUMNS = "id, project_id, user_id, role, status, initiated_by, created_at, updated_at";

type InvitationAction = "invited" | "requested" | "accepted" | "rejected" | "cancelled" | "auto_approved";

async function logInvitation(
  projectId: string,
  targetUserId: string,
  actorId: string,
  action: InvitationAction,
): Promise<void> {
  const { error } = await supabase
    .from("collaboration_invitations")
    .insert({ project_id: projectId, target_user_id: targetUserId, actor_id: actorId, action });
  if (error) {
    throw new AppError(500, `Failed to log invitation: ${error.message}`);
  }
}

export async function createCollaboration(
  projectId: string,
  requesterId: string,
  input: CreateCollaborationInput,
): Promise<CollaborationRow> {
  const project = await getProjectById(projectId, requesterId);
  const isOwner = project.creator_id === requesterId;

  let targetUserId: string;
  const initiatedBy: "owner" | "user" = isOwner ? "owner" : "user";

  if (isOwner) {
    if (!input.user_id) {
      throw new AppError(400, "user_id is required when the project owner sends an invite");
    }
    if (input.user_id === requesterId) {
      throw new AppError(400, "Cannot invite yourself to your own project");
    }
    targetUserId = input.user_id;
  } else {
    targetUserId = requesterId;
  }

  const { data: existing, error: existingError } = await supabase
    .from("collaborations")
    .select(COLUMNS)
    .eq("project_id", projectId)
    .eq("user_id", targetUserId)
    .maybeSingle();
  if (existingError) {
    throw new AppError(500, `Failed to check existing collaboration: ${existingError.message}`);
  }

  if (existing && existing.status !== "rejected") {
    throw new AppError(409, `This user already has a ${existing.status} collaboration on this project`);
  }

  const autoApprove = initiatedBy === "user" && project.auto_approve_join;
  const status = autoApprove ? "accepted" : "pending";
  const role = input.role ?? "contributor";

  const { data: row, error } = existing
    ? await supabase
        .from("collaborations")
        .update({ role, status, initiated_by: initiatedBy, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select(COLUMNS)
        .single()
    : await supabase
        .from("collaborations")
        .insert({ project_id: projectId, user_id: targetUserId, role, status, initiated_by: initiatedBy })
        .select(COLUMNS)
        .single();

  if (error || !row) {
    throw new AppError(500, `Failed to create collaboration: ${error?.message ?? "unknown error"}`);
  }

  await logInvitation(projectId, targetUserId, requesterId, initiatedBy === "owner" ? "invited" : "requested");

  const counterpartId = initiatedBy === "owner" ? targetUserId : project.creator_id;
  await notify({
    recipientId: counterpartId,
    actorId: requesterId,
    type: "invite",
    payload: { projectId, collaborationId: row.id, initiatedBy },
  });

  if (autoApprove) {
    await logInvitation(projectId, targetUserId, targetUserId, "auto_approved");
    await logActivity({ actorId: targetUserId, verb: "joined_project", targetType: "project", targetId: projectId });
  }

  return row;
}

export async function respondToCollaboration(
  collaborationId: string,
  requesterId: string,
  action: CollaborationAction,
): Promise<CollaborationRow | null> {
  const { data: collab, error } = await supabase
    .from("collaborations")
    .select(COLUMNS)
    .eq("id", collaborationId)
    .maybeSingle();
  if (error) {
    throw new AppError(500, `Failed to load collaboration: ${error.message}`);
  }
  if (!collab) {
    throw new AppError(404, "Collaboration not found");
  }
  if (collab.status !== "pending") {
    throw new AppError(409, `Collaboration is already ${collab.status}`);
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, creator_id")
    .eq("id", collab.project_id)
    .single();
  if (projectError || !project) {
    throw new AppError(404, "Project not found");
  }

  const recipientId = collab.initiated_by === "owner" ? collab.user_id : project.creator_id;
  const initiatorId = collab.initiated_by === "owner" ? project.creator_id : collab.user_id;

  if (action === "cancel") {
    if (requesterId !== initiatorId) {
      throw new AppError(403, "Only the person who sent this invite/request can cancel it");
    }
    const { error: deleteError } = await supabase.from("collaborations").delete().eq("id", collaborationId);
    if (deleteError) {
      throw new AppError(500, `Failed to cancel collaboration: ${deleteError.message}`);
    }
    await logInvitation(collab.project_id, collab.user_id, requesterId, "cancelled");
    return null;
  }

  if (requesterId !== recipientId) {
    throw new AppError(403, "Only the recipient of this invite/request can respond to it");
  }

  const status = action === "accept" ? "accepted" : "rejected";
  const { data: updated, error: updateError } = await supabase
    .from("collaborations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", collaborationId)
    .select(COLUMNS)
    .single();
  if (updateError || !updated) {
    throw new AppError(500, `Failed to update collaboration: ${updateError?.message ?? "unknown error"}`);
  }

  await logInvitation(collab.project_id, collab.user_id, requesterId, action === "accept" ? "accepted" : "rejected");
  await notify({
    recipientId: initiatorId,
    actorId: requesterId,
    type: action === "accept" ? "invite_accepted" : "invite_rejected",
    payload: { projectId: collab.project_id, collaborationId },
  });

  if (action === "accept") {
    await logActivity({
      actorId: collab.user_id,
      verb: "joined_project",
      targetType: "project",
      targetId: collab.project_id,
    });
  }

  return updated;
}

export async function listProjectCollaborations(
  projectId: string,
  pagination: { limit: number; cursor?: Cursor },
): Promise<{ data: CollaborationRow[]; nextCursor: string | null }> {
  let request = supabase
    .from("collaborations")
    .select(COLUMNS)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(pagination.limit + 1);
  if (pagination.cursor) {
    request = request.or(cursorFilter(pagination.cursor));
  }
  const { data, error } = await request;
  if (error) {
    throw new AppError(500, `Failed to list collaborations: ${error.message}`);
  }
  return buildPageResponse(data ?? [], pagination.limit);
}

export async function listMyCollaborations(
  userId: string,
  pagination: { limit: number; cursor?: Cursor },
): Promise<{ data: CollaborationRow[]; nextCursor: string | null }> {
  let request = supabase
    .from("collaborations")
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(pagination.limit + 1);
  if (pagination.cursor) {
    request = request.or(cursorFilter(pagination.cursor));
  }
  const { data, error } = await request;
  if (error) {
    throw new AppError(500, `Failed to list your collaborations: ${error.message}`);
  }
  return buildPageResponse(data ?? [], pagination.limit);
}
