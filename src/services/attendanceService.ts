import { apiPost } from "./api";

export type JoinSessionResponse = {
  success: boolean;
  attendanceId: string;
  sessionId: string;
  joinedAt: string;
};

export type LeaveSessionResponse = {
  success: boolean;
  attendanceId: string;
  sessionId: string;

  joinedAt: string | null;
  leftAt: string | null;

  minutesAttended: number;
  attendanceStatus: string;
};

export async function joinSession(
  sessionId: string
): Promise<JoinSessionResponse> {
  return apiPost<JoinSessionResponse>(
    "/api/method/club100_core.api.attendance.join_session",
    {
      session_id: sessionId,
    }
  );
}

export async function leaveSession(
  sessionId: string
): Promise<LeaveSessionResponse> {
  return apiPost<LeaveSessionResponse>(
    "/api/method/club100_core.api.attendance.leave_session",
    {
      session_id: sessionId,
    }
  );
}