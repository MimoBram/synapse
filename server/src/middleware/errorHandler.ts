import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, err.message);
    } else {
      logger.warn({ err: err.message }, "request rejected");
    }
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  logger.error({ err }, message);
  res.status(500).json({ error: message });
}
