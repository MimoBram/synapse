import { Router } from "express";
import { requireAuth } from "../../middleware/authenticate";
import { like, list, unlike } from "./likes.controller";

export const projectLikesRouter = Router({ mergeParams: true });
projectLikesRouter.get("/", list);
projectLikesRouter.post("/", requireAuth, like);
projectLikesRouter.delete("/", requireAuth, unlike);
