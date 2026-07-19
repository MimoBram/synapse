import { Router } from "express";
import { validate } from "../../middleware/validate";
import { login, register } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
