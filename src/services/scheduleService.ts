import type { Session } from "../types/session";
import { apiGet } from "./api";

export async function getUpcomingSessions(): Promise<Session[]> {
  return apiGet<Session[]>(
    "/api/method/club100_core.api.session.upcoming_sessions"
  );
}

export async function getSessionById(
  id: string
): Promise<Session | null> {
  return apiGet<Session>(
    `/api/method/club100_core.api.session.session_detail?session_id=${encodeURIComponent(
      id
    )}`
  );
}