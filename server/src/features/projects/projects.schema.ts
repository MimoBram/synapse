import { z } from "zod";

const projectTypeEnum = z.enum(["open_source", "hiring", "personal"]);
const visibilityEnum = z.enum(["public", "private"]);

export const createProjectSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(2000).optional(),
  repo_url: z.string().trim().url().optional(),
  visibility: visibilityEnum.optional(),
  project_type: projectTypeEnum.optional(),
  auto_approve_join: z.boolean().optional(),
  skill_names: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
});

export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "no fields to update" });

export const listProjectsQuerySchema = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  skill: z.string().trim().min(1).max(50).optional(),
  project_type: projectTypeEnum.optional(),
  mine: z.enum(["true", "false"]).optional(),
  limit: z.string().optional(),
  cursor: z.string().optional(),
});
