import {
  useQuery,
} from "@tanstack/react-query";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getMemberSessionDetail,
} from "../services/memberService";

function formatDate(
  value: string
) {
  const date =
    new Date(
      `${value}T00:00:00`
    );

  return date.toLocaleDateString(
    undefined,
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatTime(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const parts =
    value.split(":");

  if (parts.length < 2) {
    return value;
  }

  const hours =
    Number(parts[0]);

  const minutes =
    Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const date =
    new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function formatDateTime(
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  let className =
    "bg-slate-700 text-slate-200";

  if (status === "Live") {
    className =
      "bg-green-500/15 text-green-300 ring-1 ring-green-500/30";
  } else if (
    status === "Completed"
  ) {
    className =
      "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30";
  } else if (
    status === "Cancelled"
  ) {
    className =
      "bg-red-500/15 text-red-300 ring-1 ring-red-500/30";
  } else if (
    status === "Scheduled"
  ) {
    className =
      "bg-white/10 text-slate-200 ring-1 ring-white/10";
  }

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold",
        className,
      ].join(" ")}
    >
      {status === "Live" && (
        <span className="mr-2 h-2 w-2 rounded-full bg-green-400" />
      )}

      {status === "Live"
        ? "Live Now"
        : status}
    </span>
  );
}

export default function SessionPage() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const sessionQuery =
    useQuery({
      queryKey: [
        "member-session",
        id,
      ],

      queryFn: () =>
        getMemberSessionDetail(
          id!
        ),

      enabled:
        !!id,

      // While the page is open we want a Scheduled
      // session to turn Live shortly after the trainer
      // starts it.
      refetchInterval:
        15000,
    });

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (
    sessionQuery.isLoading
  ) {
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
  // Error / inaccessible session
  // ---------------------------------------------------------

  if (
    sessionQuery.isError ||
    !sessionQuery.data
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center text-white">
        <div className="max-w-md">
          <div className="text-xl font-bold">
            Club
            <span className="text-[#2F80ED]">
              100
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-bold">
            Session unavailable
          </h1>

          <p className="mt-2 text-slate-400">
            We couldn&apos;t load this session.
          </p>

          {sessionQuery.error instanceof
            Error && (
            <p className="mt-3 text-sm text-red-300">
              {
                sessionQuery.error
                  .message
              }
            </p>
          )}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/schedule"
              )
            }
            className="mt-6 rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1]"
          >
            Back to Schedule
          </button>
        </div>
      </div>
    );
  }

  const session =
    sessionQuery.data.session;

  const isScheduled =
    session.status ===
    "Scheduled";

  const isLive =
    session.status ===
    "Live";

  const isCompleted =
    session.status ===
    "Completed";

  const isCancelled =
    session.status ===
    "Cancelled";

  const isSelfGuided =
    session.sessionType ===
    "Self Guided";

  const accessState =
    session.contentAccess
      ?.state ?? null;

  const accessStatus =
    isCancelled
      ? "Cancelled"
      : accessState ===
        "Available"
      ? "Available Now"
      : accessState ===
        "Expired"
      ? "Access Ended"
      : "Scheduled";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto min-h-screen max-w-5xl px-5 py-6">
        {/* Header */}

        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/schedule"
              )
            }
            className="text-xl font-bold"
          >
            Club
            <span className="text-[#2F80ED]">
              100
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/schedule"
              )
            }
            className="text-sm text-slate-300 transition hover:text-white"
          >
            ← Schedule
          </button>
        </header>

        {/* Hero */}

        <main className="pb-12 pt-10">
          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge
                    status={
                      isSelfGuided
                        ? accessStatus
                        : session.status
                    }
                  />

                  <span className="text-sm text-slate-400">
                    {
                      session.deliveryMode
                    }
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                  {
                    session.program
                      .name
                  }
                </h1>

                <p className="mt-2 text-lg text-slate-300">
                  {isSelfGuided
                    ? `${session.plan?.name ?? "Self"} · Self-Guided`
                    : session.cohort
                        ?.name ??
                      "Club100 Session"}
                </p>
              </div>

              {!isSelfGuided &&
                session.cohort
                  ?.fitnessLevel && (
                <span className="self-start rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300">
                  {
                    session.cohort
                      .fitnessLevel
                  }
                </span>
              )}
            </div>

            {/* Date / time / trainer */}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/[0.06] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </p>

                <p className="mt-2 font-semibold text-slate-100">
                  {formatDate(
                    session.sessionDate
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.06] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Time
                </p>

                <p className="mt-2 font-semibold text-slate-100">
                  {formatTime(
                    session.startTime
                  )}
                  {" – "}
                  {formatTime(
                    session.endTime
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.06] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {isSelfGuided
                    ? "Training Style"
                    : "Trainer"}
                </p>

                <p className="mt-2 font-semibold text-slate-100">
                  {isSelfGuided
                    ? "Self-Guided"
                    : session.trainer
                        ?.name ??
                      "Club100 Trainer"}
                </p>
              </div>
            </div>

            {isSelfGuided &&
              !isCancelled && (
              <div
                className={[
                  "mt-8 rounded-2xl border p-5 text-center",
                  accessState ===
                  "Available"
                    ? "border-green-400/20 bg-green-500/10"
                    : accessState ===
                      "Expired"
                    ? "border-slate-500/20 bg-white/[0.04]"
                    : "border-blue-400/20 bg-blue-500/10",
                ].join(" ")}
              >
                {accessState ===
                "Available" ? (
                  <>
                    <p className="text-sm font-semibold uppercase tracking-wide text-green-300">
                      Workout available now
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      Ready to train?
                    </h2>

                    <p className="mt-3 text-sm text-slate-300">
                      Your guided workout video is available until {formatDateTime(
                        session.contentAccess
                          ?.availableUntil
                      )}.
                    </p>
                  </>
                ) : accessState ===
                  "Expired" ? (
                  <>
                    <p className="font-semibold text-slate-200">
                      Workout access window ended.
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      The guided video was available until {formatDateTime(
                        session.contentAccess
                          ?.availableUntil
                      )}.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-blue-200">
                      Your guided workout is scheduled.
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      The workout video will unlock automatically at {formatDateTime(
                        session.contentAccess
                          ?.availableFrom
                      )}.
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-slate-500" />
                      Video locked until start time
                    </div>
                  </>
                )}
              </div>
            )}

            {/* -------------------------------------------------
                Scheduled
            ------------------------------------------------- */}

            {!isSelfGuided && isScheduled && (
              <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5 text-center">
                <p className="font-semibold text-blue-200">
                  Your session has not started yet.
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  This page will update automatically when your trainer starts the session.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />

                  Waiting for trainer
                </div>
              </div>
            )}

            {/* -------------------------------------------------
                Live
            ------------------------------------------------- */}

            {!isSelfGuided && isLive && (
              <div className="mt-8 rounded-2xl border border-green-400/20 bg-green-500/10 p-5">
                <div className="text-center">
                  <p className="text-sm font-semibold uppercase tracking-wide text-green-300">
                    Session is live
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Ready to train?
                  </h2>

                  {session.meetingUrl ? (
                    <a
                      href={
                        session.meetingUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#2F80ED] px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#1F6FD1] sm:w-auto sm:min-w-64"
                    >
                      Join Live Session
                    </a>
                  ) : (
                    <div className="mt-5 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                      Live meeting link is not available yet.
                    </div>
                  )}

                  <p className="mt-4 text-xs text-slate-400">
                    The live session will open in your meeting app or a new browser tab.
                  </p>
                </div>
              </div>
            )}

            {/* -------------------------------------------------
                Completed
            ------------------------------------------------- */}

            {!isSelfGuided && isCompleted && (
              <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">
                  Session completed
                </p>

                {session.attendance ? (
                  <div className="mt-4">
                    <p className="text-2xl font-bold">
                      {
                        session.attendance
                          .status
                      }
                    </p>

                    {session.attendance
                      .minutesAttended !=
                      null && (
                      <p className="mt-2 text-sm text-slate-300">
                        {
                          session.attendance
                            .minutesAttended
                        }{" "}
                        minutes attended
                      </p>
                    )}

                    {session.attendance
                      .notes && (
                      <p className="mt-3 text-sm text-slate-400">
                        {
                          session.attendance
                            .notes
                        }
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">
                    Attendance has not been recorded for this session.
                  </p>
                )}

                {session.feedback.submitted ? (
                  <div className="mt-6 inline-flex items-center rounded-xl bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-300 ring-1 ring-green-500/20">
                    ✓ Feedback Submitted
                  </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/feedback/${session.id}`
                          )
                        }
                        className="mt-6 rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1]"
                      >
                        Give Session Feedback
                      </button>
                    )}
              </div>
            )}

            {/* -------------------------------------------------
                Cancelled
            ------------------------------------------------- */}

            {isCancelled && (
              <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
                <p className="font-semibold text-red-200">
                  This session was cancelled.
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Check your schedule for upcoming Club100 sessions.
                </p>
              </div>
            )}
          </section>

          {/* Main content */}

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Session content */}

            <div className="space-y-6">
              {/* Today's workout */}

              {session.workoutContent && (
              <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
                  Today&apos;s Workout
                </p>

                {(
                  <div className="mt-4">
                    {/* Header */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {
                            session.workoutContent
                              .title
                          }
                        </h2>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {session.workoutContent
                            .format && (
                            <span className="rounded-full bg-[#2F80ED]/15 px-3 py-1 text-xs font-semibold text-blue-300">
                              {
                                session.workoutContent
                                  .format
                              }
                            </span>
                          )}

                          {session.workoutContent
                            .fitnessLevel && (
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                              {
                                session.workoutContent
                                  .fitnessLevel
                              }
                            </span>
                          )}

                          {session.workoutContent
                            .durationMinutes !=
                            null && (
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                              {
                                session.workoutContent
                                  .durationMinutes
                              }{" "}
                              min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Thumbnail */}

                    {session.workoutContent
                      .thumbnail && (
                      <img
                        src={
                          session.workoutContent
                            .thumbnail
                        }
                        alt={
                          session.workoutContent
                            .title
                        }
                        className="mt-5 max-h-80 w-full rounded-2xl object-cover"
                      />
                    )}

                    {/* Equipment */}

                    {session.workoutContent
                      .equipmentRequired && (
                      <div className="mt-5 rounded-xl bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Equipment Required
                        </p>

                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300">
                          {
                            session.workoutContent
                              .equipmentRequired
                          }
                        </p>
                      </div>
                    )}

                    {/* Instructions */}

                    {session.workoutContent
                      .instructions && (
                      <div className="mt-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Workout Plan
                        </p>

                        <div
                          className="mt-3 text-sm leading-7 text-slate-300"
                          dangerouslySetInnerHTML={{
                            __html:
                              session.workoutContent
                                .instructions,
                          }}
                        />
                      </div>
                    )}

                    {/* Guided / supporting workout video */}

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <p className="text-sm text-slate-400">
                        {isSelfGuided
                          ? "Guided workout video"
                          : "Supporting workout video"}
                      </p>

                      {session.workoutContent
                        .videoUrl ? (
                        <a
                          href={
                            session.workoutContent
                              .videoUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex rounded-xl bg-[#2F80ED] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F6FD1]"
                        >
                          {isSelfGuided
                            ? "Start Guided Workout"
                            : "Open Workout Video"}
                        </a>
                      ) : isSelfGuided ? (
                        <div className="mt-3 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-400">
                          {accessState ===
                          "Expired"
                            ? "The workout video is no longer available."
                            : "The workout video will appear here at the scheduled start time."}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </section>
              )}

              {/* Standard preparation for trainer-led sessions */}
              {!isSelfGuided && session.preparation && (
                <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">Workout Format</p>
                  <h2 className="mt-2 text-xl font-bold text-white">{session.preparation.format || "Format to be confirmed"}</h2>
                  {session.preparation.description && <p className="mt-1 text-sm text-slate-300">{session.preparation.description}</p>}
                  <h3 className="mt-5 text-sm font-semibold text-white">What to Bring</h3>
                  {session.preparation.itemsToBring.length ? (
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-300">
                      {session.preparation.itemsToBring.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  ) : <p className="mt-2 text-sm text-slate-400">Preparation details will be shared by your trainer.</p>}
                  {session.preparation.preparationInstructions && (
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <h3 className="text-sm font-semibold text-white">Preparation Guidance</h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300">{session.preparation.preparationInstructions}</p>
                    </div>
                  )}
                  {session.preparation.additionalInstructions && (
                    <div className="mt-5 rounded-xl border border-blue-400/20 bg-[#2F80ED]/10 p-4">
                      <h3 className="text-sm font-semibold text-blue-200">Additional Trainer Instructions</h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-200">{session.preparation.additionalInstructions}</p>
                    </div>
                  )}
                </section>
              )}

              {/* Trainer notes */}

              <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
                  {isSelfGuided
                    ? "Session Notes"
                    : "Trainer Notes"}
                </p>

                {session.notes ? (
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">
                    {
                      session.notes
                    }
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-slate-400">
                    No special instructions for this session.
                  </p>
                )}
              </section>

              {/* Program */}

              {session.program
                .description && (
                <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
                    About This Program
                  </p>

                  <div
                    className="mt-4 text-sm leading-7 text-slate-300"
                    dangerouslySetInnerHTML={{
                      __html:
                        session.program
                          .description,
                    }}
                  />
                </section>
              )}
            </div>

            {/* Sidebar */}

            <aside className="space-y-6">
              {/* Trainer */}

              {!isSelfGuided && (
              <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Your Trainer
                </p>

                <div className="mt-4 flex items-center gap-4">
                  {session.trainer
                    ?.photo ? (
                    <img
                      src={
                        session.trainer
                          .photo
                      }
                      alt={
                        session.trainer
                          .name
                      }
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2F80ED]/20 text-lg font-bold text-blue-300">
                      {session.trainer
                        ?.name
                        ?.trim()
                        .charAt(0)
                        .toUpperCase() ||
                        "T"}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold">
                      {
                        session.trainer
                          ?.name ??
                        "Club100 Trainer"
                      }
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Club100 Trainer
                    </p>
                  </div>
                </div>

                {session.trainer
                  ?.bio && (
                  <div
                    className="mt-4 text-sm leading-6 text-slate-400"
                    dangerouslySetInnerHTML={{
                      __html:
                        session.trainer
                          .bio,
                    }}
                  />
                )}
              </section>
              )}

              {/* Session details */}

              <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Your Session
                </p>

                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="text-slate-500">
                      Program
                    </p>

                    <p className="mt-1 font-medium text-slate-200">
                      {
                        session.program
                          .name
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">
                      {isSelfGuided
                        ? "Plan"
                        : "Cohort"}
                    </p>

                    <p className="mt-1 font-medium text-slate-200">
                      {isSelfGuided
                        ? session.plan
                            ?.name ??
                          "Self"
                        : session.cohort
                            ?.name ??
                          "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">
                      Delivery
                    </p>

                    <p className="mt-1 font-medium text-slate-200">
                      {
                        session.deliveryMode ??
                        "—"
                      }
                    </p>
                  </div>

                  {session.program
                    .sessionDurationMinutes !=
                    null && (
                    <div>
                      <p className="text-slate-500">
                        Duration
                      </p>

                      <p className="mt-1 font-medium text-slate-200">
                        {
                          session.program
                            .sessionDurationMinutes
                        }{" "}
                        minutes
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Helpful note while live */}

              {!isSelfGuided && isLive && (
                <section className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
                  <p className="font-semibold text-blue-200">
                    Keep Club100 open
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Your live meeting opens separately, so you can return here for session guidance and notes.
                  </p>
                </section>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}