import type { ProgressSummary } from "../types/assessment";
import { apiGet } from "./api";

export async function getProgressSummary(): Promise<ProgressSummary> {
  return apiGet<ProgressSummary>(
    "/api/method/club100_core.api.progress.progress_summary"
  );
}