import { Router } from "express";
import { requireAuth } from "../../middleware/authenticate";
import { listMine, save, unsave } from "./saved-projects.controller";

export const projectSaveRouter = Router({ mergeParams: true });
projectSaveRouter.post("/", requireAuth, save);
projectSaveRouter.delete("/", requireAuth, unsave);

export const meSavedProjectsRouter = Router();
meSavedProjectsRouter.get("/", requireAuth, listMine);
