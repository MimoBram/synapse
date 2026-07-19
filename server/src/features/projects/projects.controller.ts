import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { uploadFile } from "../../config/storage";
import { parsePagination } from "../../utils/pagination";
import {
  assertProjectOwner,
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  updateProject,
} from "./projects.service";
import { listProjectsQuerySchema } from "./projects.schema";
import { supabase } from "../../config/database";

export async function create(req: Request, res: Response): Promise<void> {
  const project = await createProject(req.user!.id, req.body);
  res.status(201).json(project);
}

export async function list(req: Request, res: Response): Promise<void> {
  const parsed = listProjectsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues.map((issue) => issue.message).join("; "));
  }
  const { q, skill, project_type, mine } = parsed.data;
  const pagination = parsePagination(req);

  const result = await listProjects(
    { q, skill, projectType: project_type, mine: mine === "true" },
    req.user?.id,
    pagination,
  );
  res.status(200).json(result);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const project = await getProjectById(String(req.params.id), req.user?.id);
  res.status(200).json(project);
}

export async function update(req: Request, res: Response): Promise<void> {
  const project = await updateProject(String(req.params.id), req.user!.id, req.body);
  res.status(200).json(project);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await deleteProject(String(req.params.id), req.user!.id);
  res.status(204).send();
}

export async function uploadAsset(req: Request, res: Response): Promise<void> {
  const projectId = String(req.params.id);
  await assertProjectOwner(projectId, req.user!.id);

  if (!req.file) {
    throw new AppError(400, "asset file is required");
  }

  const path = `${projectId}/${Date.now()}-${req.file.originalname}`;
  const url = await uploadFile("project-assets", path, req.file.buffer, req.file.mimetype);

  const { data, error } = await supabase
    .from("project_assets")
    .insert({ project_id: projectId, url, uploaded_by: req.user!.id })
    .select("id, project_id, url, uploaded_by, created_at")
    .single();
  if (error || !data) {
    throw new AppError(500, `Failed to save project asset: ${error?.message ?? "unknown error"}`);
  }

  res.status(201).json(data);
}
