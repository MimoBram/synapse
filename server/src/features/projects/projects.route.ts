import { Router } from "express";
import multer from "multer";
import { optionalAuth, requireAuth } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { create, getById, list, remove, update, uploadAsset } from "./projects.controller";
import { createProjectSchema, updateProjectSchema } from "./projects.schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get("/", optionalAuth, list);
router.get("/:id", optionalAuth, getById);
router.post("/", requireAuth, validate(createProjectSchema), create);
router.patch("/:id", requireAuth, validate(updateProjectSchema), update);
router.delete("/:id", requireAuth, remove);
router.post("/:id/assets", requireAuth, upload.single("asset"), uploadAsset);

export default router;
