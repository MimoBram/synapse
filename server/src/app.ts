import cors from "cors";
import express from "express";
import helmet from "helmet";
import activityRoutes from "./features/activity/activity.route";
import authRoutes from "./features/auth/auth.route";
import {
  collaborationsRouter,
  meCollaborationsRouter,
  projectCollaborationsRouter,
} from "./features/collaborations/collaborations.route";
import { commentsRouter, projectCommentsRouter } from "./features/comments/comments.route";
import { profileFollowRouter } from "./features/follows/follows.route";
import { projectLikesRouter } from "./features/likes/likes.route";
import { meNotificationsRouter } from "./features/notifications/notifications.route";
import { meRouter, publicProfilesRouter } from "./features/profiles/profiles.route";
import projectsRoutes from "./features/projects/projects.route";
import { meSavedProjectsRouter, projectSaveRouter } from "./features/saved-projects/saved-projects.route";
import { meSkillsRouter, skillsRouter } from "./features/skills/skills.route";
import { requireAuth } from "./middleware/authenticate";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRateLimiter } from "./middleware/rateLimiter";
import { httpLogger } from "./utils/logger";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/skills", skillsRouter);
// More specific /api/me/* routers must be mounted before the generic
// /api/me router below, since Express matches path prefixes in order.
app.use("/api/me/skills", meSkillsRouter);
app.use("/api/me/collaborations", meCollaborationsRouter);
app.use("/api/me/saved-projects", meSavedProjectsRouter);
app.use("/api/me/notifications", meNotificationsRouter);
app.use("/api/me", meRouter);
app.use("/api/profiles", profileFollowRouter);
app.use("/api/profiles", publicProfilesRouter);
app.use("/api/projects/:projectId/collaborations", projectCollaborationsRouter);
app.use("/api/projects/:projectId/comments", projectCommentsRouter);
app.use("/api/projects/:projectId/likes", projectLikesRouter);
app.use("/api/projects/:projectId/save", projectSaveRouter);
app.use("/api/projects", projectsRoutes);
app.use("/api/collaborations", collaborationsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/activity", activityRoutes);

// Sanity-check route to confirm requireAuth works end to end during development
app.get("/api/whoami", requireAuth, (req, res) => {
  res.status(200).json({ user: req.user });
});

app.use(notFoundHandler);
app.use(errorHandler);
