import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { create, list, remove } from "./comments.controller";
import { createCommentSchema } from "./comments.schema";

export const projectCommentsRouter = Router({ mergeParams: true });
projectCommentsRouter.get("/", optionalAuth, list);
projectCommentsRouter.post("/", requireAuth, validate(createCommentSchema), create);

export const commentsRouter = Router();
commentsRouter.delete("/:id", requireAuth, remove);
