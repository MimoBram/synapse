import type { Request, Response } from "express";
import { listSkills, setMySkills } from "./skills.service";

export async function list(req: Request, res: Response): Promise<void> {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const skills = await listSkills(q);
  res.status(200).json({ data: skills });
}

export async function setMine(req: Request, res: Response): Promise<void> {
  const skills = await setMySkills(req.user!.id, req.body.skill_names);
  res.status(200).json({ data: skills });
}
