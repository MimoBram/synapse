import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockQueryBuilder } from "../helpers/mockSupabase";

vi.mock("../../src/config/database", () => ({ supabase: { from: vi.fn() } }));
vi.mock("../../src/utils/events", () => ({ logActivity: vi.fn(), notify: vi.fn() }));

import { supabase } from "../../src/config/database";
import { createProject } from "../../src/features/projects/projects.service";

const mockedFrom = vi.mocked(supabase.from);

beforeEach(() => {
  mockedFrom.mockReset();
});

describe("createProject", () => {
  it("creates a project owned by the given creator", async () => {
    mockedFrom.mockReturnValueOnce(
      mockQueryBuilder({
        data: {
          id: "proj-1",
          creator_id: "user-1",
          title: "Synapse Landing Page",
          description: null,
          repo_url: null,
          visibility: "private",
          project_type: "personal",
          cover_image_url: null,
          auto_approve_join: false,
          created_at: "2026-01-01T00:00:00.000Z",
        },
        error: null,
      }),
    );

    const project = await createProject("user-1", { title: "Synapse Landing Page" });

    expect(project.id).toBe("proj-1");
    expect(project.creator_id).toBe("user-1");
    expect(mockedFrom).toHaveBeenCalledWith("projects");
  });
});
