import { supabase } from "../../config/database";
import { uploadFile } from "../../config/storage";
import { AppError } from "../../utils/AppError";
import type { MeProfileView, PublicProfileView, UpdateProfileInput } from "./profiles.types";

const PUBLIC_COLUMNS = "id, username, role, avatar_url, created_at";
const ME_COLUMNS = "id, email, username, role, avatar_url, created_at";

export async function getPublicProfile(id: string): Promise<PublicProfileView> {
  const { data, error } = await supabase.from("profiles").select(PUBLIC_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    throw new AppError(500, `Failed to load profile: ${error.message}`);
  }
  if (!data) {
    throw new AppError(404, "Profile not found");
  }
  return data;
}

export async function getMe(id: string): Promise<MeProfileView> {
  const { data, error } = await supabase.from("profiles").select(ME_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    throw new AppError(500, `Failed to load profile: ${error.message}`);
  }
  if (!data) {
    throw new AppError(404, "Profile not found");
  }
  return data;
}

export async function updateMe(id: string, updates: UpdateProfileInput): Promise<MeProfileView> {
  if (updates.username) {
    const { data: existing, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", updates.username)
      .neq("id", id)
      .maybeSingle();
    if (lookupError) {
      throw new AppError(500, `Failed to check username: ${lookupError.message}`);
    }
    if (existing) {
      throw new AppError(409, "Username is already in use");
    }
  }

  const { data, error } = await supabase.from("profiles").update(updates).eq("id", id).select(ME_COLUMNS).single();
  if (error || !data) {
    throw new AppError(500, `Failed to update profile: ${error?.message ?? "unknown error"}`);
  }
  return data;
}

export async function updateAvatar(id: string, file: Express.Multer.File): Promise<MeProfileView> {
  const extension = file.originalname.split(".").pop() ?? "jpg";
  const path = `${id}/avatar.${extension}`;
  const url = await uploadFile("avatars", path, file.buffer, file.mimetype);

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", id)
    .select(ME_COLUMNS)
    .single();
  if (error || !data) {
    throw new AppError(500, `Failed to save avatar: ${error?.message ?? "unknown error"}`);
  }
  return data;
}
