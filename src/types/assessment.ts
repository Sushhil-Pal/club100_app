export type CategoryScore = {
  label: string;
  baseline: number;
  current: number;
};

export type AssessmentSummary = {
  id: string;
  date: string | null;
  type: "Baseline" | "Reassessment";
  score: number;
  fitnessLevel?: "Beginner" | "Intermediate" | "Advanced";
};

export type ProgressSummary = {
  fitnessScore: {
    baseline: number;
    current: number;
    change: number;
  };

  hasReassessment: boolean;

  categoryScores: CategoryScore[];

  assessments: AssessmentSummary[];
};