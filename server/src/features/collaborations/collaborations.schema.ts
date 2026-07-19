import { z } from "zod";

export const createCollaborationSchema = z.object({
  user_id: z.string().uuid().optional(),
  role: z.enum(["maintainer", "contributor", "reviewer"]).optional(),
});

export const respondCollaborationSchema = z.object({
  action: z.enum(["accept", "reject", "cancel"]),
});
