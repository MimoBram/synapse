import type { Request, Response } from "express";
import { parsePagination } from "../../utils/pagination";
import { followUser, listFollowers, listFollowing, unfollowUser } from "./follows.service";

export async function follow(req: Request, res: Response): Promise<void> {
  await followUser(req.user!.id, String(req.params.id));
  res.status(204).send();
}

export async function unfollow(req: Request, res: Response): Promise<void> {
  await unfollowUser(req.user!.id, String(req.params.id));
  res.status(204).send();
}

export async function followers(req: Request, res: Response): Promise<void> {
  const result = await listFollowers(String(req.params.id), parsePagination(req));
  res.status(200).json(result);
}

export async function following(req: Request, res: Response): Promise<void> {
  const result = await listFollowing(String(req.params.id), parsePagination(req));
  res.status(200).json(result);
}
