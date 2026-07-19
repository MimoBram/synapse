import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockQueryBuilder } from "../helpers/mockSupabase";

vi.mock("../../src/config/database", () => ({ supabase: { from: vi.fn() } }));
vi.mock("../../src/utils/events", () => ({ logActivity: vi.fn(), notify: vi.fn() }));

import { supabase } from "../../src/config/database";
import { respondToCollaboration } from "../../src/features/collaborations/collaborations.service";

const mockedFrom = vi.mocked(supabase.from);

const pendingCollab = {
  id: "collab-1",
  project_id: "proj-1",
  user_id: "invited-user",
  role: "contributor",
  status: "pending",
  initiated_by: "owner",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const project = { id: "proj-1", creator_id: "owner-user" };

beforeEach(() => {
  mockedFrom.mockReset();
});

describe("respondToCollaboration authorization", () => {
  it("rejects accept from someone who isn't the invited recipient", async () => {
    mockedFrom
      .mockReturnValueOnce(mockQueryBuilder({ data: pendingCollab, error: null }))
      .mockReturnValueOnce(mockQueryBuilder({ data: project, error: null }));

    await expect(respondToCollaboration("collab-1", "someone-else", "accept")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rejects cancel from someone who isn't the initiator", async () => {
    mockedFrom
      .mockReturnValueOnce(mockQueryBuilder({ data: pendingCollab, error: null }))
      .mockReturnValueOnce(mockQueryBuilder({ data: project, error: null }));

    // initiated_by "owner" means only the project creator (owner-user) may cancel
    await expect(respondToCollaboration("collab-1", "invited-user", "cancel")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rejects responding to a collaboration that's already resolved", async () => {
    mockedFrom.mockReturnValueOnce(
      mockQueryBuilder({ data: { ...pendingCollab, status: "accepted" }, error: null }),
    );

    await expect(respondToCollaboration("collab-1", "invited-user", "accept")).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("lets the invited user accept, updating status to accepted", async () => {
    mockedFrom
      .mockReturnValueOnce(mockQueryBuilder({ data: pendingCollab, error: null })) // load collaboration
      .mockReturnValueOnce(mockQueryBuilder({ data: project, error: null })) // load project
      .mockReturnValueOnce(mockQueryBuilder({ data: { ...pendingCollab, status: "accepted" }, error: null })) // update
      .mockReturnValueOnce(mockQueryBuilder({ data: null, error: null })); // invitation log insert

    const result = await respondToCollaboration("collab-1", "invited-user", "accept");
    expect(result?.status).toBe("accepted");
  });

  it("lets the initiator cancel, deleting the collaboration", async () => {
    mockedFrom
      .mockReturnValueOnce(mockQueryBuilder({ data: pendingCollab, error: null })) // load collaboration
      .mockReturnValueOnce(mockQueryBuilder({ data: project, error: null })) // load project
      .mockReturnValueOnce(mockQueryBuilder({ data: null, error: null })) // delete
      .mockReturnValueOnce(mockQueryBuilder({ data: null, error: null })); // invitation log insert

    const result = await respondToCollaboration("collab-1", "owner-user", "cancel");
    expect(result).toBeNull();
  });
});
