import type { Request, Response } from "express";
import { parsePagination } from "../../utils/pagination";
import { likeProject, listLikes, unlikeProject } from "./likes.service";

export async function like(req: Request, res: Response): Promise<void> {
  await likeProject(String(req.params.projectId), req.user!.id);
  res.status(204).send();
}

export async function unlike(req: Request, res: Response): Promise<void> {
  await unlikeProject(String(req.params.projectId), req.user!.id);
  res.status(204).send();
}

export async function list(req: Request, res: Response): Promise<void> {
  const result = await listLikes(String(req.params.projectId), parsePagination(req));
  res.status(200).json(result);
}
