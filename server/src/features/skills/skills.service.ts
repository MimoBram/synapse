import { supabase } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { findOrCreateSkillIds } from "../../utils/skills";
import type { SkillRow } from "./skills.types";

export async function listSkills(query?: string): Promise<SkillRow[]> {
  let request = supabase.from("skills").select("id, name").order("name", { ascending: true }).limit(50);
  if (query) {
    request = request.ilike("name", `%${query.replace(/[%_]/g, "\\$&")}%`);
  }
  const { data, error } = await request;
  if (error) {
    throw new AppError(500, `Failed to list skills: ${error.message}`);
  }
  return data ?? [];
}

export async function setMySkills(profileId: string, skillNames: string[]): Promise<SkillRow[]> {
  await supabase.from("profile_skills").delete().eq("profile_id", profileId);
  if (skillNames.length === 0) {
    return [];
  }

  const skillIds = await findOrCreateSkillIds(skillNames);
  const { error } = await supabase
    .from("profile_skills")
    .insert(skillIds.map((skillId) => ({ profile_id: profileId, skill_id: skillId })));
  if (error) {
    throw new AppError(500, `Failed to save skills: ${error.message}`);
  }

  const { data, error: fetchError } = await supabase.from("skills").select("id, name").in("id", skillIds);
  if (fetchError) {
    throw new AppError(500, `Failed to load saved skills: ${fetchError.message}`);
  }
  return data ?? [];
}
