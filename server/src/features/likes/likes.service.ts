import { supabase } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { logActivity, notify } from "../../utils/events";
import { buildPageResponse, cursorFilter, type Cursor } from "../../utils/pagination";
import { getProjectById } from "../projects/projects.service";
import type { ProjectLikeRow } from "./likes.types";

export async function likeProject(projectId: string, userId: string): Promise<void> {
  const project = await getProjectById(projectId, userId);

  const { error } = await supabase.from("project_likes").insert({ project_id: projectId, user_id: userId });
  if (error) {
    if (error.code === "23505") {
      throw new AppError(409, "Already liked this project");
    }
    throw new AppError(500, `Failed to like project: ${error.message}`);
  }

  await logActivity({ actorId: userId, verb: "liked", targetType: "project", targetId: projectId });
  if (project.creator_id !== userId) {
    await notify({ recipientId: project.creator_id, actorId: userId, type: "like", payload: { projectId } });
  }
}

export async function unlikeProject(projectId: string, userId: string): Promise<void> {
  const { error } = await supabase.from("project_likes").delete().eq("project_id", projectId).eq("user_id", userId);
  if (error) {
    throw new AppError(500, `Failed to unlike project: ${error.message}`);
  }
}

export async function listLikes(
  projectId: string,
  pagination: { limit: number; cursor?: Cursor },
): Promise<{ data: ProjectLikeRow[]; nextCursor: string | null }> {
  let request = supabase
    .from("project_likes")
    .select("project_id, user_id, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .order("user_id", { ascending: false })
    .limit(pagination.limit + 1);
  if (pagination.cursor) {
    request = request.or(cursorFilter(pagination.cursor, "user_id"));
  }
  const { data, error } = await request;
  if (error) {
    throw new AppError(500, `Failed to list likes: ${error.message}`);
  }
  return buildPageResponse(data ?? [], pagination.limit, "user_id");
}
