import { Router } from "express";
import { requireAuth } from "../../middleware/authenticate";
import { follow, followers, following, unfollow } from "./follows.controller";

export const profileFollowRouter = Router();
profileFollowRouter.post("/:id/follow", requireAuth, follow);
profileFollowRouter.delete("/:id/follow", requireAuth, unfollow);
profileFollowRouter.get("/:id/followers", followers);
profileFollowRouter.get("/:id/following", following);
