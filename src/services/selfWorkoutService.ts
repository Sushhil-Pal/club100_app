import { apiGet, apiPost } from "./api";

export type CurriculumPrescription = {
  curriculum: string;
  levelCode: string;
  cycleNumber: number;
  weekNumber: number;
  sessionNumber: number;
  prescription: {
    workout_format: string;
    session_title: string;
    objective?: string;
    warm_up?: string;
    main_block_a?: string;
    main_block_b?: string;
    finisher_skill?: string;
    cooldown?: string;
    intensity?: string;
    equipment?: string;
    duration?: string;
  };
};
export type VirtualWorkout = {
  curriculumWorkout?: CurriculumPrescription | null;
  id: string;
  enrollment: string;
  sequenceNo: number;
  cycle: string;
  workoutContent: string | null;
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
  prescription?: CurriculumPrescription["prescription"];
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

export type SelfScheduleSlot = {weekday: string; start_time: string};
export type SelfScheduleSettings = {
  enrollment: string;
  workoutsPerWeek: number;
  configured: boolean;
  slots: SelfScheduleSlot[];
  pendingRevisions: {effectiveFrom: string; slots: SelfScheduleSlot[]}[];
  earliestChangeDate: string;
};
export function getSelfScheduleSettings(enrollmentId: string) {
  const q = new URLSearchParams({enrollment_id: enrollmentId});
  return apiGet<SelfScheduleSettings>(`/api/method/club100_core.api.self_workouts.get_self_workout_schedule_settings?${q}`);
}
export function setInitialSelfSchedule(enrollmentId: string, slots: SelfScheduleSlot[]) {
  return apiPost<{configured: boolean}>("/api/method/club100_core.api.self_workouts.set_initial_self_workout_schedule", {enrollment_id: enrollmentId, slots});
}
export function reviseSelfSchedule(enrollmentId: string, effectiveFrom: string, slots: SelfScheduleSlot[]) {
  return apiPost<{revision: string}>("/api/method/club100_core.api.self_workouts.revise_self_workout_schedule", {enrollment_id: enrollmentId, effective_from: effectiveFrom, slots});
}


export type SelfWorkoutActivity = {
  name: string;
  workoutId: string;
  status: "Started" | "Completed";
  startedAt: string | null;
  completedAt: string | null;
};
export type SelfWorkoutActivitySummary = {
  enrollment: string;
  activities: SelfWorkoutActivity[];
  started: number;
  completed: number;
};
export function getSelfWorkoutActivity(enrollmentId: string) {
  const q = new URLSearchParams({enrollment_id: enrollmentId});
  return apiGet<SelfWorkoutActivitySummary>(`/api/method/club100_core.api.self_workout_activity.get_self_workout_activity?${q}`);
}
export function startSelfWorkout(workoutId: string) {
  return apiPost<SelfWorkoutActivity>("/api/method/club100_core.api.self_workout_activity.start_self_workout", {workout_id: workoutId});
}
export function completeSelfWorkout(workoutId: string) {
  return apiPost<SelfWorkoutActivity>("/api/method/club100_core.api.self_workout_activity.complete_self_workout", {workout_id: workoutId});
}
