import { supabase } from "./database";
import { AppError } from "../utils/AppError";

export type StorageBucket = "avatars" | "project-assets";

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true,
  });
  if (error) {
    throw new AppError(500, `Failed to upload file to ${bucket}: ${error.message}`);
  }
  return getPublicUrl(bucket, path);
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
