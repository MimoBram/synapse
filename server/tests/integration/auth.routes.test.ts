import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockQueryBuilder } from "../helpers/mockSupabase";

vi.mock("../../src/config/database", () => ({ supabase: { from: vi.fn() } }));

import { app } from "../../src/app";
import { supabase } from "../../src/config/database";

const mockedFrom = vi.mocked(supabase.from);

beforeEach(() => {
  mockedFrom.mockReset();
});

describe("POST /api/auth/register", () => {
  it("returns 400 for an invalid payload", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  it("returns 201 and a token for a valid payload", async () => {
    mockedFrom
      .mockReturnValueOnce(mockQueryBuilder({ data: null, error: null }))
      .mockReturnValueOnce(
        mockQueryBuilder({
          data: {
            id: "user-1",
            email: "new@example.com",
            username: "newuser",
            role: "developer",
            created_at: "2026-01-01T00:00:00.000Z",
          },
          error: null,
        }),
      );

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "new@example.com", username: "newuser", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
  });
});

describe("POST /api/projects", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/projects").send({ title: "Test project" });
    expect(res.status).toBe(401);
  });
});
