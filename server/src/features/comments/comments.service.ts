import { supabase } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { logActivity, notify } from "../../utils/events";
import { buildPageResponse, cursorFilter, type Cursor } from "../../utils/pagination";
import { getProjectById } from "../projects/projects.service";
import type { CommentRow } from "./comments.types";

const COLUMNS = "id, project_id, user_id, content, created_at";

export async function createComment(projectId: string, userId: string, content: string): Promise<CommentRow> {
  const project = await getProjectById(projectId, userId);

  const { data, error } = await supabase
    .from("comments")
    .insert({ project_id: projectId, user_id: userId, content })
    .select(COLUMNS)
    .single();
  if (error || !data) {
    throw new AppError(500, `Failed to create comment: ${error?.message ?? "unknown error"}`);
  }

  await logActivity({ actorId: userId, verb: "commented", targetType: "comment", targetId: data.id });

  if (project.creator_id !== userId) {
    await notify({
      recipientId: project.creator_id,
      actorId: userId,
      type: "comment",
      payload: { projectId, commentId: data.id },
    });
  }

  return data;
}

export async function listComments(
  projectId: string,
  requesterId: string | undefined,
  pagination: { limit: number; cursor?: Cursor },
): Promise<{ data: CommentRow[]; nextCursor: string | null }> {
  await getProjectById(projectId, requesterId);

  let request = supabase
    .from("comments")
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
    throw new AppError(500, `Failed to list comments: ${error.message}`);
  }
  return buildPageResponse(data ?? [], pagination.limit);
}

export async function deleteComment(commentId: string, requesterId: string): Promise<void> {
  const { data: comment, error } = await supabase
    .from("comments")
    .select("id, project_id, user_id")
    .eq("id", commentId)
    .maybeSingle();
  if (error) {
    throw new AppError(500, `Failed to load comment: ${error.message}`);
  }
  if (!comment) {
    throw new AppError(404, "Comment not found");
  }

  if (comment.user_id !== requesterId) {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("creator_id")
      .eq("id", comment.project_id)
      .single();
    if (projectError || !project) {
      throw new AppError(500, `Failed to load project: ${projectError?.message ?? "unknown error"}`);
    }
    if (project.creator_id !== requesterId) {
      throw new AppError(403, "Only the comment author or project owner can delete this comment");
    }
  }

  const { error: deleteError } = await supabase.from("comments").delete().eq("id", commentId);
  if (deleteError) {
    throw new AppError(500, `Failed to delete comment: ${deleteError.message}`);
  }
}
