import type {
  AssessmentSummary,
  CategoryScore,
} from "../types/assessment";

export const mockFitnessScore = {
  current: 74,
  baseline: 62,
};

export const mockCategoryScores: CategoryScore[] = [
  { label: "Strength", baseline: 58, current: 71 },
  { label: "Mobility", baseline: 72, current: 78 },
  { label: "Balance", baseline: 68, current: 81 },
  { label: "Endurance", baseline: 55, current: 69 },
  { label: "Body Metrics", baseline: 65, current: 69 },
];

export const mockAssessments: AssessmentSummary[] = [
  { date: "20 Sep 2026", type: "Reassessment", score: 74 },
  { date: "15 Aug 2026", type: "Reassessment", score: 68 },
  { date: "12 Jul 2026", type: "Baseline", score: 62 },
];