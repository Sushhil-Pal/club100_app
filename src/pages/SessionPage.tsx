import { useState } from "react";
import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { getSessionById } from "../services/scheduleService";

import {
  joinSession,
  leaveSession,
} from "../services/attendanceService";


export default function SessionPage() {
  const [joined, setJoined] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  // ---------------------------------------------------------
  // Load session
  // ---------------------------------------------------------

  const sessionQuery = useQuery({
    queryKey: ["session", id],
    queryFn: () => getSessionById(id ?? ""),
    enabled: Boolean(id),
  });

  // ---------------------------------------------------------
  // Join attendance
  // ---------------------------------------------------------

  const joinMutation = useMutation({
    mutationFn: joinSession,

    onSuccess: () => {
      setJoined(true);
    },
  });

  // ---------------------------------------------------------
  // Leave attendance
  // ---------------------------------------------------------

  const leaveMutation = useMutation({
    mutationFn: leaveSession,

    onSuccess: (_data, sessionId) => {
      navigate(`/feedback/${sessionId}`);
    },
  });

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (sessionQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="text-center">
          <div className="text-xl font-bold">
            Club
            <span className="text-[#2F80ED]">
              100
            </span>
          </div>

          <p className="mt-4 text-slate-400">
            Loading session...
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Session not found / API error
  // ---------------------------------------------------------

  if (
    sessionQuery.isError ||
    !sessionQuery.data
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center text-white">
        <div>
          <div className="text-xl font-bold">
            Club
            <span className="text-[#2F80ED]">
              100
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            Session not found
          </h1>

          <p className="mt-2 text-slate-400">
            We couldn&apos;t load this session.
          </p>

          <button
            onClick={() =>
              navigate("/schedule")
            }
            className="mt-6 rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white hover:bg-[#1F6FD1]"
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  const session = sessionQuery.data;

  // ---------------------------------------------------------
  // Pre-session screen
  // ---------------------------------------------------------

  if (!joined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-6">
          <header className="flex items-center justify-between">
            <div className="text-xl font-bold">
              Club
              <span className="text-[#2F80ED]">
                100
              </span>
            </div>

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Exit
            </button>
          </header>

          <main className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">
                Your session starts soon
              </p>

              <h1 className="mt-4 text-4xl font-bold">
                {session.title}
              </h1>

              <p className="mt-2 text-lg text-slate-300">
                {session.subtitle}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-slate-400">
                    Date & Time
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {session.date}
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {session.startTime} –{" "}
                    {session.endTime}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-slate-400">
                    Trainer
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {session.trainer ||
                      "Club100 Trainer"}
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {session.level}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-slate-400">
                    Format
                  </p>

                  <p className="mt-2 font-semibold">
                    {session.format}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-slate-400">
                    Delivery
                  </p>

                  <p className="mt-2 font-semibold">
                    {session.deliveryMode ||
                      "Online"}
                  </p>
                </div>
              </div>

              {session.equipment &&
                session.equipment.length >
                  0 && (
                  <div className="mt-8 rounded-2xl bg-white/10 p-6 text-left">
                    <h2 className="text-lg font-semibold">
                      Equipment Required
                    </h2>

                    <ul className="mt-4 space-y-2 text-slate-300">
                      {session.equipment.map(
                        (item) => (
                          <li key={item}>
                            • {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {joinMutation.isError && (
                <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  We couldn&apos;t join the
                  session. Please try again.
                </div>
              )}

              <button
                onClick={() =>
                  joinMutation.mutate(
                    session.id
                  )
                }
                disabled={
                  joinMutation.isPending
                }
                className="mt-8 w-full rounded-xl bg-[#2F80ED] px-5 py-4 text-lg font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {joinMutation.isPending
                  ? "Joining..."
                  : "Join Session"}
              </button>

              <p className="mt-4 text-xs text-slate-500">
                Your attendance will begin
                when you join the session.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Live workout screen
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-lg font-bold">
              Club
              <span className="text-[#2F80ED]">
                100
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              {session.format} •{" "}
              {session.level}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-slate-200">
              {session.startTime} –{" "}
              {session.endTime}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Session in progress
            </p>
          </div>
        </header>

        <main className="grid flex-1 gap-4 p-4 lg:grid-cols-[1fr_320px]">
          {/* Main workout content */}

          <section className="flex min-h-[60vh] items-center justify-center overflow-hidden rounded-2xl bg-black">
            {session.workout?.videoUrl ? (
              <video
                src={
                  session.workout.videoUrl
                }
                controls
                className="h-full max-h-[80vh] w-full object-contain"
              />
            ) : (
              <div className="px-6 text-center">
                <p className="text-sm text-slate-500">
                  Workout Content
                </p>

                <h2 className="mt-2 text-3xl font-semibold">
                  {session.subtitle}
                </h2>

                <p className="mt-4 text-slate-400">
                  Video player placeholder
                </p>
              </div>
            )}
          </section>

          {/* Session sidebar */}

          <aside className="space-y-4">
            <section className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm font-semibold text-slate-300">
                Live Trainer
              </p>

              <div className="mt-4 flex aspect-video items-center justify-center rounded-xl bg-slate-800">
                <span className="text-sm text-slate-500">
                  Trainer camera
                </span>
              </div>

              <p className="mt-3 font-medium">
                {session.trainer ||
                  "Club100 Trainer"}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Your trainer will guide you
                throughout the workout.
              </p>
            </section>

            <section className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-slate-400">
                Workout
              </p>

              <h3 className="mt-1 text-xl font-semibold">
                {session.subtitle}
              </h3>

              {session.workout
                ?.durationMinutes && (
                <p className="mt-2 text-sm text-slate-300">
                  {
                    session.workout
                      .durationMinutes
                  }{" "}
                  minutes
                </p>
              )}

              {session.workout
                ?.instructions && (
                <div
                  className="mt-4 text-sm leading-6 text-slate-400"
                  dangerouslySetInnerHTML={{
                    __html:
                      session.workout
                        .instructions,
                  }}
                />
              )}
            </section>

            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/5">
                Easier
              </button>

              <button className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold transition hover:bg-white/5">
                Harder
              </button>
            </div>

            {leaveMutation.isError && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                We couldn&apos;t end the
                session. Please try again.
              </div>
            )}

            <button
              onClick={() =>
                leaveMutation.mutate(
                  session.id
                )
              }
              disabled={
                leaveMutation.isPending
              }
              className="w-full rounded-xl bg-red-500/90 px-4 py-3 text-sm font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {leaveMutation.isPending
                ? "Ending Session..."
                : "End Session"}
            </button>
          </aside>
        </main>
      </div>
    </div>
  );
}