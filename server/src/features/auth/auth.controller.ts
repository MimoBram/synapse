import type { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service";
import type { LoginInput, RegisterInput } from "./auth.types";

export async function register(req: Request, res: Response): Promise<void> {
  const result = await registerUser(req.body as RegisterInput);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await loginUser(req.body as LoginInput);
  res.status(200).json(result);
}
