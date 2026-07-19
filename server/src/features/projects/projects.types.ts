export type Visibility = "public" | "private";
export type ProjectType = "open_source" | "hiring" | "personal";

export interface ProjectRow {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  repo_url: string | null;
  visibility: Visibility;
  project_type: ProjectType;
  cover_image_url: string | null;
  auto_approve_join: boolean;
  created_at: string;
}

export interface CreateProjectInput {
  title: string;
  description?: string;
  repo_url?: string;
  visibility?: Visibility;
  project_type?: ProjectType;
  auto_approve_join?: boolean;
  skill_names?: string[];
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface ProjectListFilters {
  q?: string;
  skill?: string;
  projectType?: ProjectType;
  mine?: boolean;
}
