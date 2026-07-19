import { Router } from "express";
import { requireAuth } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { list, setMine } from "./skills.controller";
import { setMySkillsSchema } from "./skills.schema";

export const skillsRouter = Router();
skillsRouter.get("/", list);

export const meSkillsRouter = Router();
meSkillsRouter.put("/", requireAuth, validate(setMySkillsSchema), setMine);
