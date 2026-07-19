import { Router } from "express";
import { list } from "./activity.controller";

const router = Router();
router.get("/", list);

export default router;
