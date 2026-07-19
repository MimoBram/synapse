import { hash, compare } from "bcrypt-ts";
import jwt from "jsonwebtoken";
import { supabase } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import type { AuthResult, LoginInput, PublicProfile, RegisterInput } from "./auth.types";

const SALT_ROUNDS = 10;

function toPublicProfile(row: {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
}): PublicProfile {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    role: row.role,
    created_at: row.created_at,
  };
}

function signToken(profile: PublicProfile): string {
  return jwt.sign({ sub: profile.id, role: profile.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const { email, username, password } = input;

  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .or(`email.eq.${email},username.eq.${username}`)
    .maybeSingle();

  if (lookupError) {
    throw new AppError(500, `Failed to check existing user: ${lookupError.message}`);
  }
  if (existing) {
    throw new AppError(409, "Email or username is already in use");
  }

  const password_hash = await hash(password, SALT_ROUNDS);

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ email, username, password_hash })
    .select("id, email, username, role, created_at")
    .single();

  if (insertError || !created) {
    throw new AppError(500, `Failed to create user: ${insertError?.message ?? "unknown error"}`);
  }

  const profile = toPublicProfile(created);
  const token = signToken(profile);
  return { profile, token };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input;

  const { data: user, error } = await supabase
    .from("profiles")
    .select("id, email, username, role, created_at, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new AppError(500, `Failed to look up user: ${error.message}`);
  }
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isValid = await compare(password, user.password_hash);
  if (!isValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const profile = toPublicProfile(user);
  const token = signToken(profile);
  return { profile, token };
}
