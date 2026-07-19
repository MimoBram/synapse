import { Router } from "express";
import { requireAuth } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { create, listForProject, listMine, respond } from "./collaborations.controller";
import { createCollaborationSchema, respondCollaborationSchema } from "./collaborations.schema";

export const projectCollaborationsRouter = Router({ mergeParams: true });
projectCollaborationsRouter.get("/", listForProject);
projectCollaborationsRouter.post("/", requireAuth, validate(createCollaborationSchema), create);

export const collaborationsRouter = Router();
collaborationsRouter.patch("/:id", requireAuth, validate(respondCollaborationSchema), respond);

export const meCollaborationsRouter = Router();
meCollaborationsRouter.get("/", requireAuth, listMine);
