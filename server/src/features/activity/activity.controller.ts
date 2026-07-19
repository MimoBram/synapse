import type { Request, Response } from "express";
import { parsePagination } from "../../utils/pagination";
import { listActivity } from "./activity.service";

export async function list(req: Request, res: Response): Promise<void> {
  const result = await listActivity(parsePagination(req));
  res.status(200).json(result);
}
