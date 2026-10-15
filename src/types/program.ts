export type ProgramSummary = {
  id: string;
  name: string;

  startDate: string | null;
  endDate: string | null;

  currentWeek: number | null;
  totalWeeks: number | null;

  completionPercentage: number | null;
  pricingModel?: string | null;
  planCode?: string | null;
  participationMode?: "Ongoing" | "Finite";
  sessionsCompleted: number;
  attendancePercentage: number;

  sessionDurationMinutes?: number;

  enrollmentId?: string;
  cohortId?: string | null;
};