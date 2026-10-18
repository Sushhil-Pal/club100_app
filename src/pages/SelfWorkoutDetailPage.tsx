import { useMembershipSelection } from "../context/MembershipContext";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVirtualWorkoutDetail,
  getSelfWorkoutActivity,
  startSelfWorkout,
  completeSelfWorkout,
} from "../services/selfWorkoutService";

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return value;
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, {
    hour: "numeric", minute: "2-digit",
  });
}

const panel = "rounded-2xl border border-white/10 bg-white/[0.06]";

export default function SelfWorkoutDetailPage() {
  const { id } = useParams();
  const client = useQueryClient();
  const enrollment = id?.split(":")[0];
  const {selectedEnrollmentId, loading: membershipLoading, error: membershipError}=useMembershipSelection();
  const permitted = !!enrollment && !membershipLoading && !membershipError && selectedEnrollmentId === enrollment;

  const activityQuery = useQuery({
    queryKey: ["self-workout-activity", enrollment],
    queryFn: () => getSelfWorkoutActivity(enrollment!),
    enabled: permitted,
  });
  const currentActivity = activityQuery.data?.activities.find(a => a.workoutId === id);
  const refresh = () => client.invalidateQueries({ queryKey: ["self-workout-activity", enrollment] });
  const start = useMutation({ mutationFn: () => startSelfWorkout(id!), onSuccess: refresh });
  const complete = useMutation({ mutationFn: () => completeSelfWorkout(id!), onSuccess: refresh });
  const query = useQuery({
    queryKey: ["virtual-workout-detail", id],
    queryFn: () => getVirtualWorkoutDetail(id!),
    enabled: !!id && permitted,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  const workout = query.data;
  const completed = currentActivity?.status === "Completed";
  const started = currentActivity?.status === "Started";
  const access = workout?.accessState;
  const statusText = completed ? "Completed" : started ? "Started" : access === "Available" ? "Available Now" : access === "Expired" ? "Access Ended" : "Scheduled";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-5xl px-5 py-6">
        <header className="flex items-center justify-between">
          <Link to="/schedule" className="text-xl font-bold text-white">Club<span className="text-[#2F80ED]">100</span></Link>
          <Link to="/schedule" className="text-sm text-slate-300 hover:text-white">← My Workouts</Link>
        </header>

        {membershipLoading ? (
          <p className="mt-12 text-center text-slate-300">Checking current membership...</p>
        ) : !permitted ? (
          <section className={`${panel} mt-10 p-8 text-center`}>
            <h1 className="text-2xl font-bold">Workout unavailable for selected membership</h1>
            <p className="mt-3 text-sm text-slate-300">Choose the corresponding active Self membership to open this workout.</p>
            <Link to="/schedule" className="mt-6 inline-block rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold">Back to Schedule</Link>
          </section>
        ) : query.isPending ? (
          <p className="mt-12 text-center text-slate-300">Loading workout details...</p>
        ) : query.isError || !workout ? (
          <section className={`${panel} mt-10 p-8 text-center`}>
            <h1 className="text-2xl font-bold">Workout unavailable</h1>
            <p className="mt-3 text-sm text-red-300">{query.error instanceof Error ? query.error.message : "We couldn't load this workout."}</p>
            <Link to="/schedule" className="mt-6 inline-block rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold">Back to Schedule</Link>
          </section>
        ) : (
          <main className="pb-12 pt-10">
            <section className={`${panel} p-6 sm:p-8`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${completed ? "bg-green-500/15 text-green-300" : access === "Available" ? "bg-blue-500/20 text-blue-200" : "bg-white/10 text-slate-200"}`}>{statusText}</span>
                <span className="text-sm text-slate-400">Self-Guided</span>
                {workout.format && <span className="rounded-full bg-[#2F80ED]/15 px-3 py-1 text-xs font-semibold text-blue-300">{workout.format}</span>}
              </div>
              <h1 className="mt-5 text-3xl font-bold sm:text-4xl">{workout.title}</h1>
              <p className="mt-2 text-slate-300">Train independently with your Club100 guided workout.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/[0.06] p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</p><p className="mt-2 font-semibold">{formatDate(workout.scheduledDate)}</p></div>
                <div className="rounded-2xl bg-white/[0.06] p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time</p><p className="mt-2 font-semibold">{formatTime(workout.startTime)}</p></div>
                <div className="rounded-2xl bg-white/[0.06] p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</p><p className="mt-2 font-semibold">{workout.durationMinutes} minutes</p></div>
              </div>
              <div className={`mt-8 rounded-2xl border p-5 text-center ${completed ? "border-green-400/20 bg-green-500/10" : access === "Available" ? "border-blue-400/20 bg-blue-500/10" : "border-white/10 bg-white/[0.04]"}`}>
                {completed ? <><p className="font-semibold text-green-300">✓ Workout completed</p><p className="mt-2 text-sm text-slate-300">Your completed workout has been recorded.</p></> : access === "Available" ? <><p className="font-semibold text-blue-200">Your workout is available now</p><p className="mt-2 text-sm text-slate-300">Open the guided video when you're ready to train.</p></> : access === "Expired" ? <><p className="font-semibold text-slate-200">Workout access window ended</p><p className="mt-2 text-sm text-slate-400">The guided video is no longer available.</p></> : <><p className="font-semibold text-blue-200">Your workout is scheduled</p><p className="mt-2 text-sm text-slate-400">The video unlocks at your scheduled start time.</p><div className="mt-4 inline-flex rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">Video locked until start time</div></>}
                {!completed && access !== "Available" && access !== "Expired" && (
                  <div className="mt-5 flex flex-col items-center gap-2">
                    <p className="text-xs text-slate-400">Automatically checking availability every 15 seconds.</p>
                    <button
                      type="button"
                      onClick={() => void query.refetch()}
                      disabled={query.isFetching}
                      aria-label="Check workout availability"
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-400/30 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-50"
                    >
                      <span aria-hidden="true" className={query.isFetching ? "inline-block animate-spin" : "inline-block"}>↻</span>
                      {query.isFetching ? "Checking..." : "Check Availability"}
                    </button>
                    {query.isRefetchError && <p role="alert" className="text-xs text-red-300">Could not check availability. Please try again.</p>}
                  </div>
                )}
                {activityQuery.isPending ? <p className="mt-4 text-sm text-slate-400">Loading workout activity...</p> : activityQuery.isError ? <p className="mt-4 text-sm text-red-300">Unable to load activity: {activityQuery.error.message}</p> : (
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    {access === "Available" && workout.videoUrl && !completed && <button type="button" disabled={start.isPending} onClick={async () => { const tab = window.open("about:blank", "_blank"); try { await start.mutateAsync(); if (tab) { tab.opener = null; tab.location.href = workout.videoUrl!; } else { window.location.href = workout.videoUrl!; } } catch { tab?.close(); } }} className="rounded-xl bg-[#2F80ED] px-6 py-3 font-semibold text-white disabled:opacity-50">{start.isPending ? "Starting..." : currentActivity ? "Open Guided Workout" : "Start Workout"}</button>}
                    {started && <button type="button" disabled={complete.isPending} onClick={() => complete.mutate()} className="rounded-xl border border-blue-400 px-6 py-3 font-semibold text-blue-200 disabled:opacity-50">{complete.isPending ? "Saving..." : "Mark Completed"}</button>}
                    {access === "Available" && !workout.videoUrl && <p className="text-sm text-slate-300">No video is configured for this workout.</p>}
                  </div>
                )}
                {start.isError && <p className="mt-3 text-sm text-red-300">{start.error.message}</p>}
                {complete.isError && <p className="mt-3 text-sm text-red-300">{complete.error.message}</p>}
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
              <section className={`${panel} p-6`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">Today's Workout</p>
                <h2 className="mt-3 text-xl font-bold">Workout Plan</h2>
                {workout.instructions ? <div className="prose prose-invert mt-4 max-w-none text-sm leading-7 text-slate-300" dangerouslySetInnerHTML={{ __html: workout.instructions }} /> : <p className="mt-4 text-sm text-slate-400">Follow the guided workout video when it becomes available.</p>}
              </section>
              <aside className="space-y-6">
                <section className={`${panel} p-5`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workout Details</p>
                  <div className="mt-4 space-y-4 text-sm">
                    <div><p className="text-slate-500">Format</p><p className="mt-1 font-medium text-slate-200">{workout.format || "Self-Guided"}</p></div>
                    <div><p className="text-slate-500">Level</p><p className="mt-1 font-medium text-slate-200">{workout.fitnessLevel || "All levels"}</p></div>
                    <div><p className="text-slate-500">Equipment Required</p><p className="mt-1 whitespace-pre-line font-medium text-slate-200">{workout.equipmentRequired || "None"}</p></div>
                  </div>
                </section>
              </aside>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
