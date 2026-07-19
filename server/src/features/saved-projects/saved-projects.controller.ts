import type { Request, Response } from "express";
import { parsePagination } from "../../utils/pagination";
import { listMySavedProjects, saveProject, unsaveProject } from "./saved-projects.service";

export async function save(req: Request, res: Response): Promise<void> {
  await saveProject(String(req.params.projectId), req.user!.id);
  res.status(204).send();
}

export async function unsave(req: Request, res: Response): Promise<void> {
  await unsaveProject(String(req.params.projectId), req.user!.id);
  res.status(204).send();
}

export async function listMine(req: Request, res: Response): Promise<void> {
  const result = await listMySavedProjects(req.user!.id, parsePagination(req));
  res.status(200).json(result);
}
