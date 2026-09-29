export type ProgramSummary = {
  id: string;
  name: string;

  startDate: string | null;
  endDate: string | null;

  currentWeek: number;
  totalWeeks: number;

  completionPercentage: number;
  sessionsCompleted: number;
  attendancePercentage: number;

  sessionDurationMinutes?: number;

  enrollmentId?: string;
  cohortId?: string | null;
};