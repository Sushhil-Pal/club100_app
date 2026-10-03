import {
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
} from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";

import {
  getCurrentMember,
  getMemberProgress,
  getMemberSchedule,
} from "../services/memberService";

import {
  getCurrentProgram,
} from "../services/programService";

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
      weekday: "short",
      day: "numeric",
      month: "short",
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

function getGreeting() {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function DashboardPage() {
  // ---------------------------------------------------------
  // Queries
  // ---------------------------------------------------------

  const memberQuery =
    useQuery({
      queryKey: [
        "current-member",
      ],

      queryFn:
        getCurrentMember,
    });

  const programQuery =
    useQuery({
      queryKey: [
        "current-program",
      ],

      queryFn:
        getCurrentProgram,
    });

  const scheduleQuery =
    useQuery({
      queryKey: [
        "member-schedule",
      ],

      queryFn:
        getMemberSchedule,
    });

  const progressQuery =
    useQuery({
      queryKey: [
        "member-progress",
      ],

      queryFn:
        getMemberProgress,
    });

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (
    memberQuery.isLoading ||
    programQuery.isLoading ||
    scheduleQuery.isLoading ||
    progressQuery.isLoading
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-500">
            Loading your Club100 dashboard...
          </p>
        </div>
      </PageContainer>
    );
  }

  // ---------------------------------------------------------
  // Error
  // ---------------------------------------------------------

  if (
    memberQuery.isError ||
    programQuery.isError ||
    scheduleQuery.isError ||
    progressQuery.isError
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            We couldn&apos;t load your dashboard.
          </p>
        </div>
      </PageContainer>
    );
  }

  // ---------------------------------------------------------
  // Data
  // ---------------------------------------------------------

  const member =
    memberQuery.data;

  const program =
    programQuery.data;

  const schedule =
    scheduleQuery.data;

  const progress =
    progressQuery.data;

  if (
    !member ||
    !schedule ||
    !progress
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-500">
            Dashboard data is not available.
          </p>
        </div>
      </PageContainer>
    );
  }

  const nextSession =
    schedule.upcoming[0] ??
    null;

  const firstName =
    member.fullName
      ?.trim()
      .split(/\s+/)[0] ||
    "Member";

  const latestAssessment =
    progress.assessments[0] ??
    null;

  const fitnessScore =
    progress.fitnessScore.current;

  const scoreChange =
    progress.fitnessScore.change;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* --------------------------------------------------
            Greeting
        -------------------------------------------------- */}

        <div>
          <h1 className="text-3xl font-bold text-[#12395B] md:text-4xl">
            {getGreeting()}, {firstName}.
          </h1>

          <p className="mt-2 text-slate-600">
            Here&apos;s what&apos;s happening with your Club100 journey.
          </p>
        </div>

        {/* --------------------------------------------------
            Next Session
        -------------------------------------------------- */}

        {nextSession ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Next Session
              </p>

              {nextSession.status ===
              "Live" ? (
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />

                  Live Now
                </span>
              ) : (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2F80ED]">
                  {
                    nextSession.status
                  }
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {
                    nextSession.program
                      .name
                  }
                </h2>

                <p className="mt-1 text-slate-600">
                  {
                    nextSession.cohort
                      .name
                  }
                </p>

                <div className="mt-4 space-y-1 text-sm text-slate-500">
                  <p>
                    {formatDate(
                      nextSession.sessionDate
                    )}
                  </p>

                  <p>
                    {formatTime(
                      nextSession.startTime
                    )}
                    {" – "}
                    {formatTime(
                      nextSession.endTime
                    )}
                  </p>

                  <p>
                    Trainer:{" "}
                    {
                      nextSession.trainer
                        .name ||
                      "Club100 Trainer"
                    }
                  </p>

                  <p>
                    Mode:{" "}
                    {
                      nextSession.deliveryMode
                    }
                  </p>
                </div>
              </div>

              {nextSession.cohort
                .fitnessLevel && (
                <div className="self-start rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-[#2F80ED]">
                  {
                    nextSession.cohort
                      .fitnessLevel
                  }
                </div>
              )}
            </div>

            <Link
              to={`/session/${nextSession.id}`}
              className={[
                "mt-6 block w-full rounded-xl px-4 py-3 text-center font-semibold text-white transition",
                nextSession.status ===
                "Live"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-[#2F80ED] hover:bg-[#1F6FD1]",
              ].join(" ")}
            >
              {nextSession.status ===
              "Live"
                ? "Join Live Session"
                : "View Session"}
            </Link>

            <Link
              to="/schedule"
              className="mt-4 block text-center text-sm font-semibold text-[#2F80ED]"
            >
              View Full Schedule →
            </Link>
          </section>
        ) : (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Next Session
            </p>

            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              No upcoming sessions
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Your upcoming Club100 sessions will appear here once they are scheduled for your cohort.
            </p>

            <Link
              to="/schedule"
              className="mt-5 inline-block text-sm font-semibold text-[#2F80ED]"
            >
              View Schedule →
            </Link>
          </section>
        )}

        {/* --------------------------------------------------
            Program + Fitness Score
        -------------------------------------------------- */}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ------------------------------------------------
              Program
          ------------------------------------------------ */}

          {program ? (
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                My Program
              </p>

              <h2 className="mt-3 text-xl font-semibold text-slate-900">
                {program.name}
              </h2>

              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  Week{" "}
                  {program.currentWeek}{" "}
                  of{" "}
                  {program.totalWeeks}
                </span>

                <span className="font-semibold text-[#2F80ED]">
                  {
                    program.completionPercentage
                  }
                  %
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#2F80ED]"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        program.completionPercentage,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-[#12395B]">
                    {
                      program.sessionsCompleted
                    }
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Sessions completed
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-[#12395B]">
                    {
                      program.attendancePercentage
                    }
                    %
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Attendance
                  </p>
                </div>
              </div>

              <Link
                to="/program"
                className="mt-6 inline-block text-sm font-semibold text-[#2F80ED]"
              >
                View Program →
              </Link>
            </section>
          ) : (
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                My Program
              </p>

              <h2 className="mt-3 text-xl font-semibold text-slate-900">
                Welcome to Club100
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Once a Club100 program and cohort are assigned to you, your program details, schedule and attendance will appear here.
              </p>

              <div className="mt-5 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-medium text-[#12395B]">
                  What happens next?
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Your training program will be assigned based on your membership and fitness plan.
                </p>
              </div>

              <Link
                to="/program"
                className="mt-5 inline-block text-sm font-semibold text-[#2F80ED]"
              >
                View Program →
              </Link>
            </section>
          )}

          {/* ------------------------------------------------
              Fitness Score
          ------------------------------------------------ */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Fitness Score
            </p>

            {!progress.hasAssessment ? (
              <div className="mt-4">
                <p className="text-xl font-semibold text-slate-900">
                  No assessment yet
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your fitness score will appear after your baseline assessment is completed.
                </p>

                <Link
                  to="/progress"
                  className="mt-5 inline-block text-sm font-semibold text-[#2F80ED]"
                >
                  View Progress →
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-5xl font-bold text-[#12395B]">
                    {fitnessScore ??
                      "—"}
                  </span>

                  {progress.hasPreviousAssessment &&
                    scoreChange !=
                      null && (
                    <span
                      className={[
                        "mb-1 rounded-full px-3 py-1 text-sm font-semibold",
                        scoreChange >= 0
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700",
                      ].join(
                        " "
                      )}
                    >
                      {scoreChange >
                      0
                        ? "+"
                        : ""}
                      {
                        scoreChange
                      }
                    </span>
                  )}
                </div>

                {progress.hasPreviousAssessment ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Since previous assessment
                  </p>
                ) : (
                  <div className="mt-3">
                    <p className="font-medium text-[#12395B]">
                      Baseline Assessment
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Your starting fitness score
                    </p>
                  </div>
                )}

                {progress.categoryScores
                  .length > 0 && (
                  <div className="mt-6 space-y-4">
                    {progress.categoryScores
                      .slice(
                        0,
                        3
                      )
                      .map(
                        (
                          item
                        ) => {
                          const displayScore =
                            item.current ??
                            0;

                          return (
                            <div
                              key={
                                item.category
                              }
                            >
                              <div className="flex items-center justify-between gap-4 text-sm">
                                <span className="text-slate-600">
                                  {
                                    item.category
                                  }
                                </span>

                                <div className="shrink-0">
                                  {progress.hasPreviousAssessment &&
                                  item.previous !=
                                    null ? (
                                    <>
                                      <span className="text-slate-400">
                                        {
                                          item.previous
                                        }
                                      </span>

                                      <span className="mx-2 text-slate-400">
                                        →
                                      </span>

                                      <span className="font-semibold text-[#12395B]">
                                        {
                                          item.current ??
                                          "—"
                                        }
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-semibold text-[#12395B]">
                                      {
                                        item.current ??
                                        "—"
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-[#2F80ED]"
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        displayScore,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                  </div>
                )}

                <Link
                  to="/progress"
                  className="mt-6 inline-block text-sm font-semibold text-[#2F80ED]"
                >
                  View Progress →
                </Link>
              </>
            )}
          </section>
        </div>

        {/* --------------------------------------------------
            Latest Assessment
        -------------------------------------------------- */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Latest Assessment
              </p>

              {latestAssessment ? (
                <>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    {
                      latestAssessment.type
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(
                      latestAssessment.date
                    )}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {latestAssessment.score !=
                      null && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#12395B]">
                        Score{" "}
                        {
                          latestAssessment.score
                        }
                      </span>
                    )}

                    {latestAssessment.fitnessLevel && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                        {
                          latestAssessment.fitnessLevel
                        }
                      </span>
                    )}

                    {latestAssessment.change !=
                      null && (
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-sm font-semibold",
                          latestAssessment.change >=
                          0
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700",
                        ].join(
                          " "
                        )}
                      >
                        {latestAssessment.change >
                        0
                          ? "+"
                          : ""}
                        {
                          latestAssessment.change
                        }{" "}
                        vs previous
                      </span>
                    )}
                  </div>

                  {!progress.hasPreviousAssessment && (
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                      Baseline completed. Your next assessment will show how your fitness has changed from this starting point.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    No assessment yet
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Once your baseline fitness assessment is completed, your assessment history will appear here.
                  </p>
                </>
              )}
            </div>

            <Link
              to="/progress"
              className="rounded-xl border border-[#2F80ED] px-4 py-2 text-center text-sm font-semibold text-[#2F80ED] transition hover:bg-blue-50"
            >
              {latestAssessment
                ? "View Assessments"
                : "View Progress"}
            </Link>
          </div>
        </section>

        {/* --------------------------------------------------
            Quick Actions
        -------------------------------------------------- */}

        <section>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Quick Actions
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              to="/schedule"
              className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <p className="font-semibold text-[#12395B]">
                Schedule
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Upcoming and past sessions
              </p>
            </Link>

            <Link
              to="/progress"
              className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <p className="font-semibold text-[#12395B]">
                Progress
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Fitness scores and assessments
              </p>
            </Link>

            <Link
              to="/profile"
              className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <p className="font-semibold text-[#12395B]">
                Profile
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Personal and fitness details
              </p>
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}