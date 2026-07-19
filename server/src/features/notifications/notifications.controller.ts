import type { Request, Response } from "express";
import { parsePagination } from "../../utils/pagination";
import { listMyNotifications, markAllNotificationsRead, markNotificationRead } from "./notifications.service";

export async function list(req: Request, res: Response): Promise<void> {
  const pagination = parsePagination(req);
  const unreadOnly = req.query.unread === "true";
  const result = await listMyNotifications(req.user!.id, { unreadOnly }, pagination);
  res.status(200).json(result);
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const notification = await markNotificationRead(String(req.params.id), req.user!.id);
  res.status(200).json(notification);
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  await markAllNotificationsRead(req.user!.id);
  res.status(204).send();
}
