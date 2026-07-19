import { supabase } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { buildPageResponse, cursorFilter, type Cursor } from "../../utils/pagination";
import { getProjectById } from "../projects/projects.service";
import type { SavedProjectRow } from "./saved-projects.types";

export async function saveProject(projectId: string, userId: string): Promise<void> {
  await getProjectById(projectId, userId);

  const { error } = await supabase.from("saved_projects").insert({ project_id: projectId, user_id: userId });
  if (error) {
    if (error.code === "23505") {
      throw new AppError(409, "Project already saved");
    }
    throw new AppError(500, `Failed to save project: ${error.message}`);
  }
}

export async function unsaveProject(projectId: string, userId: string): Promise<void> {
  const { error } = await supabase.from("saved_projects").delete().eq("project_id", projectId).eq("user_id", userId);
  if (error) {
    throw new AppError(500, `Failed to unsave project: ${error.message}`);
  }
}

export async function listMySavedProjects(
  userId: string,
  pagination: { limit: number; cursor?: Cursor },
): Promise<{ data: SavedProjectRow[]; nextCursor: string | null }> {
  let request = supabase
    .from("saved_projects")
    .select("project_id, user_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("project_id", { ascending: false })
    .limit(pagination.limit + 1);
  if (pagination.cursor) {
    request = request.or(cursorFilter(pagination.cursor, "project_id"));
  }
  const { data, error } = await request;
  if (error) {
    throw new AppError(500, `Failed to list saved projects: ${error.message}`);
  }
  return buildPageResponse(data ?? [], pagination.limit, "project_id");
}
