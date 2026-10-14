import { apiGet } from "./api";

export type VirtualWorkout = {
  id: string;
  enrollment: string;
  sequenceNo: number;
  cycle: string;
  workoutContent: string;
  title: string;
  format: string | null;
  fitnessLevel: string | null;
  durationMinutes: number;
  equipmentRequired: string | null;
  thumbnail: string | null;
  scheduledDate: string;
  startTime: string;
  availableFrom: string;
  availableUntil: string;
  accessState: "Locked" | "Available" | "Expired";
};
export type VirtualWorkoutDetail = VirtualWorkout & {
  instructions: string | null;
  videoUrl: string | null;
};
export async function getVirtualWorkouts(enrollmentId: string, from: string, to: string) {
  const query = new URLSearchParams({enrollment_id: enrollmentId, from_date: from, to_date: to});
  return apiGet<{enrollment: string; workouts: VirtualWorkout[]}>(
    `/api/method/club100_core.api.self_workouts.list_virtual_workouts?${query}`
  );
}
export async function getVirtualWorkoutDetail(id: string) {
  const query = new URLSearchParams({workout_id: id});
  return apiGet<VirtualWorkoutDetail>(
    `/api/method/club100_core.api.self_workouts.virtual_workout_detail?${query}`
  );
}
