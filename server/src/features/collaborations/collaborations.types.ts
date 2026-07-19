export type CollaborationRole = "owner" | "maintainer" | "contributor" | "reviewer";
export type CollaborationStatus = "pending" | "accepted" | "rejected";
export type InitiatedBy = "owner" | "user";
export type CollaborationAction = "accept" | "reject" | "cancel";

export interface CollaborationRow {
  id: string;
  project_id: string;
  user_id: string;
  role: CollaborationRole;
  status: CollaborationStatus;
  initiated_by: InitiatedBy;
  created_at: string;
  updated_at: string;
}

export interface CreateCollaborationInput {
  user_id?: string;
  role?: CollaborationRole;
}
