import { supabase } from "../config/database";
import { AppError } from "./AppError";

/** Finds each skill by (case-insensitive) name, creating it if it doesn't exist yet. */
export async function findOrCreateSkillIds(rawNames: string[]): Promise<string[]> {
  const names = Array.from(new Set(rawNames.map((name) => name.trim().toLowerCase()))).filter(Boolean);
  const skillIds: string[] = [];

  for (const name of names) {
    const { data: existing } = await supabase.from("skills").select("id").eq("name", name).maybeSingle();
    if (existing) {
      skillIds.push(existing.id);
      continue;
    }
    const { data: created, error } = await supabase.from("skills").insert({ name }).select("id").single();
    if (error || !created) {
      throw new AppError(500, `Failed to create skill "${name}": ${error?.message ?? "unknown error"}`);
    }
    skillIds.push(created.id);
  }

  return skillIds;
}
