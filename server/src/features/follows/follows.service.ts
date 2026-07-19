import { supabase } from "../../config/database";
import { AppError } from "../../utils/AppError";
import { logActivity, notify } from "../../utils/events";
import { buildPageResponse, cursorFilter, type Cursor } from "../../utils/pagination";
import type { FollowRow } from "./follows.types";

export async function followUser(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) {
    throw new AppError(400, "Cannot follow yourself");
  }

  const { data: target, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", followingId)
    .maybeSingle();
  if (lookupError) {
    throw new AppError(500, `Failed to look up user: ${lookupError.message}`);
  }
  if (!target) {
    throw new AppError(404, "User not found");
  }

  const { error } = await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
  if (error) {
    if (error.code === "23505") {
      throw new AppError(409, "Already following this user");
    }
    throw new AppError(500, `Failed to follow user: ${error.message}`);
  }

  await logActivity({ actorId: followerId, verb: "followed", targetType: "profile", targetId: followingId });
  await notify({ recipientId: followingId, actorId: followerId, type: "follow" });
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) {
    throw new AppError(500, `Failed to unfollow user: ${error.message}`);
  }
}

export async function listFollowers(
  userId: string,
  pagination: { limit: number; cursor?: Cursor },
): Promise<{ data: FollowRow[]; nextCursor: string | null }> {
  let request = supabase
    .from("follows")
    .select("follower_id, following_id, created_at")
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .order("follower_id", { ascending: false })
    .limit(pagination.limit + 1);
  if (pagination.cursor) {
    request = request.or(cursorFilter(pagination.cursor, "follower_id"));
  }
  const { data, error } = await request;
  if (error) {
    throw new AppError(500, `Failed to list followers: ${error.message}`);
  }
  return buildPageResponse(data ?? [], pagination.limit, "follower_id");
}

export async function listFollowing(
  userId: string,
  pagination: { limit: number; cursor?: Cursor },
): Promise<{ data: FollowRow[]; nextCursor: string | null }> {
  let request = supabase
    .from("follows")
    .select("follower_id, following_id, created_at")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })
    .order("following_id", { ascending: false })
    .limit(pagination.limit + 1);
  if (pagination.cursor) {
    request = request.or(cursorFilter(pagination.cursor, "following_id"));
  }
  const { data, error } = await request;
  if (error) {
    throw new AppError(500, `Failed to list following: ${error.message}`);
  }
  return buildPageResponse(data ?? [], pagination.limit, "following_id");
}
