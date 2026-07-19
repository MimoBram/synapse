import { z } from "zod";

export const setMySkillsSchema = z.object({
  skill_names: z.array(z.string().trim().min(1).max(50)).max(30),
});
