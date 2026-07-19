import type { Request, Response } from "express";
import { parsePagination } from "../../utils/pagination";
import { createComment, deleteComment, listComments } from "./comments.service";

export async function create(req: Request, res: Response): Promise<void> {
  const comment = await createComment(String(req.params.projectId), req.user!.id, req.body.content);
  res.status(201).json(comment);
}

export async function list(req: Request, res: Response): Promise<void> {
  const pagination = parsePagination(req);
  const result = await listComments(String(req.params.projectId), req.user?.id, pagination);
  res.status(200).json(result);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await deleteComment(String(req.params.id), req.user!.id);
  res.status(204).send();
}
