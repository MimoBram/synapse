export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PublicProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

export interface AuthResult {
  profile: PublicProfile;
  token: string;
}
