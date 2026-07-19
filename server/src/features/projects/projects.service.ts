import { supabase } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { buildPageResponse, cursorFilter, type Cursor } from "../../utils/pagination";
import { logActivity } from "../../utils/events";
import { findOrCreateSkillIds } from "../../utils/skills";
import type { CreateProjectInput, ProjectListFilters, ProjectRow, UpdateProjectInput } from "./projects.types";

const COLUMNS =
  "id, creator_id, title, description, repo_url, visibility, project_type, cover_image_url, auto_approve_join, created_at";

async function syncProjectSkills(projectId: string, skillNames: string[]): Promise<void> {
  await supabase.from("project_skills").delete().eq("project_id", projectId);
  if (skillNames.length === 0) {
    return;
  }

  const skillIds = await findOrCreateSkillIds(skillNames);
  const { error } = await supabase
    .from("project_skills")
    .insert(skillIds.map((skillId) => ({ project_id: projectId, skill_id: skillId })));
  if (error) {
    throw new AppError(500, `Failed to link skills to project: ${error.message}`);
  }
}

export async function createProject(creatorId: string, input: CreateProjectInput): Promise<ProjectRow> {
  const { skill_names, ...projectFields } = input;

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...projectFields, creator_id: creatorId })
    .select(COLUMNS)
    .single();
  if (error || !data) {
    throw new AppError(500, `Failed to create project: ${error?.message ?? "unknown error"}`);
  }

  if (skill_names && skill_names.length > 0) {
    await syncProjectSkills(data.id, skill_names);
  }

  await logActivity({ actorId: creatorId, verb: "created_project", targetType: "project", targetId: data.id });

  return data;
}

export async function listProjects(
  filters: ProjectListFilters,
  requesterId: string | undefined,
  pagination: { limit: number; cursor?: Cursor },
): Promise<{ data: ProjectRow[]; nextCursor: string | null }> {
  let projectIdFilter: string[] | undefined;

  if (filters.skill) {
    const { data: skill, error: skillError } = await supabase
      .from("skills")
      .select("id")
      .eq("name", filters.skill.trim().toLowerCase())
      .maybeSingle();
    if (skillError) {
      throw new AppError(500, `Failed to look up skill: ${skillError.message}`);
    }
    if (!skill) {
      return { data: [], nextCursor: null };
    }
    const { data: links, error: linksError } = await supabase
      .from("project_skills")
      .select("project_id")
      .eq("skill_id", skill.id);
    if (linksError) {
      throw new AppError(500, `Failed to look up projects for skill: ${linksError.message}`);
    }
    projectIdFilter = (links ?? []).map((row) => row.project_id);
    if (projectIdFilter.length === 0) {
      return { data: [], nextCursor: null };
    }
  }

  let request = supabase
    .from("projects")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(pagination.limit + 1);

  if (filters.mine && requesterId) {
    request = request.eq("creator_id", requesterId);
  } else {
    request = request.eq("visibility", "public");
  }

  if (filters.projectType) {
    request = request.eq("project_type", filters.projectType);
  }
  if (filters.q) {
    const term = filters.q.replace(/[%_]/g, "\\$&");
    request = request.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }
  if (projectIdFilter) {
    request = request.in("id", projectIdFilter);
  }
  if (pagination.cursor) {
    request = request.or(cursorFilter(pagination.cursor));
  }

  const { data, error } = await request;
  if (error) {
    throw new AppError(500, `Failed to list projects: ${error.message}`);
  }

  return buildPageResponse(data ?? [], pagination.limit);
}

export async function getProjectById(id: string, requesterId?: string): Promise<ProjectRow> {
  const { data, error } = await supabase.from("projects").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    throw new AppError(500, `Failed to load project: ${error.message}`);
  }
  if (!data || (data.visibility === "private" && data.creator_id !== requesterId)) {
    throw new AppError(404, "Project not found");
  }
  return data;
}

async function assertOwner(id: string, requesterId: string): Promise<ProjectRow> {
  const { data, error } = await supabase.from("projects").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    throw new AppError(500, `Failed to load project: ${error.message}`);
  }
  if (!data) {
    throw new AppError(404, "Project not found");
  }
  if (data.creator_id !== requesterId) {
    throw new AppError(403, "Only the project creator can perform this action");
  }
  return data;
}

export async function updateProject(
  id: string,
  requesterId: string,
  updates: UpdateProjectInput,
): Promise<ProjectRow> {
  await assertOwner(id, requesterId);
  const { skill_names, ...projectFields } = updates;

  if (Object.keys(projectFields).length > 0) {
    const { error } = await supabase.from("projects").update(projectFields).eq("id", id);
    if (error) {
      throw new AppError(500, `Failed to update project: ${error.message}`);
    }
  }

  if (skill_names) {
    await syncProjectSkills(id, skill_names);
  }

  return getProjectById(id, requesterId);
}

export async function deleteProject(id: string, requesterId: string): Promise<void> {
  await assertOwner(id, requesterId);
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    throw new AppError(500, `Failed to delete project: ${error.message}`);
  }
}

export { assertOwner as assertProjectOwner };
