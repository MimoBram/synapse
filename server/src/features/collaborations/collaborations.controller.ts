import type { Request, Response } from "express";
import { parsePagination } from "../../utils/pagination";
import {
  createCollaboration,
  listMyCollaborations,
  listProjectCollaborations,
  respondToCollaboration,
} from "./collaborations.service";

export async function create(req: Request, res: Response): Promise<void> {
  const collaboration = await createCollaboration(String(req.params.projectId), req.user!.id, req.body);
  res.status(201).json(collaboration);
}

export async function respond(req: Request, res: Response): Promise<void> {
  const result = await respondToCollaboration(String(req.params.id), req.user!.id, req.body.action);
  if (result === null) {
    res.status(204).send();
    return;
  }
  res.status(200).json(result);
}

export async function listForProject(req: Request, res: Response): Promise<void> {
  const pagination = parsePagination(req);
  const result = await listProjectCollaborations(String(req.params.projectId), pagination);
  res.status(200).json(result);
}

export async function listMine(req: Request, res: Response): Promise<void> {
  const pagination = parsePagination(req);
  const result = await listMyCollaborations(req.user!.id, pagination);
  res.status(200).json(result);
}
