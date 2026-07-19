import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import { requireAuth } from "../../src/middleware/authenticate";

function makeReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

describe("requireAuth middleware", () => {
  it("rejects requests without an Authorization header", () => {
    const next = vi.fn();
    requireAuth(makeReq(), {} as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("rejects an invalid token", () => {
    const next = vi.fn();
    requireAuth(makeReq({ authorization: "Bearer not-a-real-token" }), {} as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it("attaches req.user and calls next() for a valid token", () => {
    const token = jwt.sign({ sub: "user-1", role: "developer" }, process.env.JWT_SECRET as string, {
      expiresIn: "5m",
    });
    const req = makeReq({ authorization: `Bearer ${token}` });
    const next = vi.fn();

    requireAuth(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ id: "user-1", role: "developer" });
  });
});
