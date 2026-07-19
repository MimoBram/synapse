import { Router } from "express";
import { requireAuth } from "../../middleware/authenticate";
import { list, markAllRead, markRead } from "./notifications.controller";

export const meNotificationsRouter = Router();
meNotificationsRouter.use(requireAuth);
meNotificationsRouter.get("/", list);
meNotificationsRouter.patch("/read-all", markAllRead);
meNotificationsRouter.patch("/:id/read", markRead);
