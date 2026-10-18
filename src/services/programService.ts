import type { ProgramSummary } from "../types/program";
import { apiGet } from "./api";

export async function getCurrentProgram(enrollmentId?: string | null): Promise<ProgramSummary | null> {
  const program = await apiGet<
    ProgramSummary | null | undefined
  >(
    "/api/method/club100_core.api.program.current_program" + (enrollmentId ? `?enrollment_id=${encodeURIComponent(enrollmentId)}` : "")
  );

  return program ?? null;
}