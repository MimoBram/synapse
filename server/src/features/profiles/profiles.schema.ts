import { z } from "zod";

export const updateMeSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, "username may only contain letters, numbers and underscores")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "no fields to update" });
