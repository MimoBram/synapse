import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { getMyProfile, getProfileById, updateMyProfile, uploadMyAvatar } from "./profiles.controller";
import { updateMeSchema } from "./profiles.schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const meRouter = Router();
meRouter.use(requireAuth);
meRouter.get("/", getMyProfile);
meRouter.patch("/", validate(updateMeSchema), updateMyProfile);
meRouter.post("/avatar", upload.single("avatar"), uploadMyAvatar);

export const publicProfilesRouter = Router();
publicProfilesRouter.get("/:id", getProfileById);
