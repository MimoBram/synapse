import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { getMe, getPublicProfile, updateAvatar, updateMe } from "./profiles.service";

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  const profile = await getMe(req.user!.id);
  res.status(200).json(profile);
}

export async function updateMyProfile(req: Request, res: Response): Promise<void> {
  const profile = await updateMe(req.user!.id, req.body);
  res.status(200).json(profile);
}

export async function uploadMyAvatar(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new AppError(400, "avatar file is required");
  }
  const profile = await updateAvatar(req.user!.id, req.file);
  res.status(200).json(profile);
}

export async function getProfileById(req: Request, res: Response): Promise<void> {
  const profile = await getPublicProfile(String(req.params.id));
  res.status(200).json(profile);
}
