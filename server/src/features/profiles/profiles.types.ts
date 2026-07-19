export interface PublicProfileView {
  id: string;
  username: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

export interface MeProfileView extends PublicProfileView {
  email: string;
}

export interface UpdateProfileInput {
  username?: string;
}
