import { apiGet, apiPost } from "./api";

export type TrainingLevelCode = "L1" | "L2" | "L3";

export type TrainingJourney = {
  member: string;
  program: string;
  track: "Standard" | "Society";
  levelCode: TrainingLevelCode;
  levelName: string;
  curriculum: string;
  cycleNumber: number;
  weekNumber: number;
  sessionNumber: number;
  lastEnrollment: string | null;
  modified: string;
  nextWorkoutAt?: string;
  positionSource?: string;
};

export function getMyTrainingJourney() {
  return apiGet<{ journey: TrainingJourney | null }>(
    "/api/method/club100_core.curriculum.journey.my_training_journey"
  );
}

export function changeMyTrainingLevel(
  levelCode: TrainingLevelCode,
  expectedModified: string,
  enrollmentId: string
) {
  return apiPost<{ journey: TrainingJourney; changed: boolean }>(
    "/api/method/club100_core.curriculum.journey.change_my_training_level",
    {
      level_code: levelCode,
      expected_modified: expectedModified,
      enrollment_id: enrollmentId,
    }
  );
}
