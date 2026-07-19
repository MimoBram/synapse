import { hash } from "bcrypt-ts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockQueryBuilder } from "../helpers/mockSupabase";

vi.mock("../../src/config/database", () => ({ supabase: { from: vi.fn() } }));

import { supabase } from "../../src/config/database";
import { loginUser, registerUser } from "../../src/features/auth/auth.service";

const mockedFrom = vi.mocked(supabase.from);

beforeEach(() => {
  mockedFrom.mockReset();
});

describe("registerUser", () => {
  it("creates a new user and returns a signed token", async () => {
    mockedFrom
      .mockReturnValueOnce(mockQueryBuilder({ data: null, error: null })) // existing email/username check
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
      ); // insert

    const result = await registerUser({ email: "new@example.com", username: "newuser", password: "password123" });

    expect(result.profile.email).toBe("new@example.com");
    expect(result.token.split(".")).toHaveLength(3);
  });

  it("rejects when the email or username is already taken", async () => {
    mockedFrom.mockReturnValueOnce(mockQueryBuilder({ data: { id: "existing-user" }, error: null }));

    await expect(
      registerUser({ email: "taken@example.com", username: "taken", password: "password123" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe("loginUser", () => {
  it("returns a token for correct credentials", async () => {
    const password_hash = await hash("password123", 10);
    mockedFrom.mockReturnValueOnce(
      mockQueryBuilder({
        data: {
          id: "user-1",
          email: "user@example.com",
          username: "user1",
          role: "developer",
          created_at: "2026-01-01T00:00:00.000Z",
          password_hash,
        },
        error: null,
      }),
    );

    const result = await loginUser({ email: "user@example.com", password: "password123" });
    expect(result.profile.id).toBe("user-1");
  });

  it("rejects an unknown email", async () => {
    mockedFrom.mockReturnValueOnce(mockQueryBuilder({ data: null, error: null }));

    await expect(loginUser({ email: "nope@example.com", password: "password123" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("rejects an incorrect password", async () => {
    const password_hash = await hash("correct-password", 10);
    mockedFrom.mockReturnValueOnce(
      mockQueryBuilder({
        data: {
          id: "user-1",
          email: "user@example.com",
          username: "user1",
          role: "developer",
          created_at: "2026-01-01T00:00:00.000Z",
          password_hash,
        },
        error: null,
      }),
    );

    await expect(loginUser({ email: "user@example.com", password: "wrong-password" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
