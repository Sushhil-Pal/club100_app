import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";

import { getCurrentMember } from "../services/memberService";
import { getCurrentProgram } from "../services/programService";
import { getUpcomingSessions } from "../services/scheduleService";
import { getProgressSummary } from "../services/progressService";

export default function DashboardPage() {
  // ---------------------------------------------------------
  // Queries
  // ---------------------------------------------------------

  const memberQuery = useQuery({
    queryKey: ["current-member"],
    queryFn: getCurrentMember,
  });

  const programQuery = useQuery({
    queryKey: ["current-program"],
    queryFn: getCurrentProgram,
  });

  const sessionsQuery = useQuery({
    queryKey: ["upcoming-sessions"],
    queryFn: getUpcomingSessions,
  });

  const progressQuery = useQuery({
    queryKey: ["progress-summary"],
    queryFn: getProgressSummary,
  });

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (
    memberQuery.isLoading ||
    programQuery.isLoading ||
    sessionsQuery.isLoading ||
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
  // Errors
  //
  // Important:
  // A missing program, missing sessions or missing assessments
  // are NOT errors.
  // ---------------------------------------------------------

  if (
    memberQuery.isError ||
    programQuery.isError ||
    sessionsQuery.isError ||
    progressQuery.isError
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="font-medium text-red-600">
            We couldn&apos;t load your dashboard.
          </p>
        </div>
      </PageContainer>
    );
  }

  // ---------------------------------------------------------
  // Data
  // ---------------------------------------------------------

  const member = memberQuery.data;
  const program = programQuery.data;
  const sessions = sessionsQuery.data ?? [];
  const progress = progressQuery.data;

  const nextSession = sessions[0];

  const hasAssessment =
    progress.assessments.length > 0;

  const firstName =
    member.fullName
      ?.trim()
      .split(/\s+/)[0] || "Member";

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
            Good morning, {firstName}.
          </h1>

          <p className="mt-2 text-slate-600">
            Here&apos;s what&apos;s happening with your Club100 membership.
          </p>
        </div>

        {/* --------------------------------------------------
            Next Session
        -------------------------------------------------- */}

        {nextSession ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Next Session
            </p>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {nextSession.title}
                </h2>

                <p className="mt-1 text-slate-600">
                  {nextSession.subtitle}
                </p>

                <p className="mt-3 text-sm text-slate-500">
                  {nextSession.date}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {nextSession.startTime} – {nextSession.endTime}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Trainer: {nextSession.trainer || "Club100 Trainer"}
                </p>
              </div>

              <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-[#2F80ED]">
                {nextSession.level}
              </div>
            </div>

            <Link
              to={`/session/${nextSession.id}`}
              className="mt-6 block w-full rounded-xl bg-[#2F80ED] px-4 py-3 text-center font-semibold text-white transition hover:bg-[#1F6FD1]"
            >
              Join Session
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
              Your upcoming Club100 sessions will appear here once you
              are assigned to a program and cohort.
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
                  Week {program.currentWeek} of {program.totalWeeks}
                </span>

                <span className="font-semibold text-[#2F80ED]">
                  {program.completionPercentage}%
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#2F80ED]"
                  style={{
                    width: `${program.completionPercentage}%`,
                  }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-[#12395B]">
                    {program.sessionsCompleted}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Sessions completed
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-2xl font-bold text-[#12395B]">
                    {program.attendancePercentage}%
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
                Your Club100 membership is active. Once a fitness
                program is assigned to you, your program details,
                schedule and attendance will appear here.
              </p>

              <div className="mt-5 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-medium text-[#12395B]">
                  What happens next?
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  A Club100 program and cohort will be assigned based
                  on your membership and training plan.
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

            {!hasAssessment ? (
              <div className="mt-4">
                <p className="text-xl font-semibold text-slate-900">
                  No assessment yet
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your fitness score will appear after your baseline
                  assessment is completed.
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
                    {progress.fitnessScore.current}
                  </span>

                  {progress.hasReassessment && (
                    <span className="mb-1 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                      {progress.fitnessScore.change >= 0 ? "+" : ""}
                      {progress.fitnessScore.change}
                    </span>
                  )}
                </div>

                {progress.hasReassessment ? (
                  <p className="mt-2 text-sm text-slate-500">
                    Since baseline assessment
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

                {progress.categoryScores.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {progress.categoryScores
                      .slice(0, 3)
                      .map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              {item.label}
                            </span>

                            {progress.hasReassessment ? (
                              <div>
                                <span className="text-slate-400">
                                  {item.baseline}
                                </span>

                                <span className="mx-2 text-slate-400">
                                  →
                                </span>

                                <span className="font-semibold text-[#12395B]">
                                  {item.current}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-[#12395B]">
                                {item.baseline}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[#2F80ED]"
                              style={{
                                width: `${
                                  progress.hasReassessment
                                    ? item.current
                                    : item.baseline
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
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

              {progress.assessments[0] ? (
                <>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    {progress.assessments[0].type}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {progress.assessments[0].date}
                  </p>

                  {!progress.hasReassessment && (
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      Baseline completed. Your next reassessment will
                      show your progress from this starting point.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    No assessment yet
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Once your baseline fitness assessment is completed,
                    your assessment history will appear here.
                  </p>
                </>
              )}
            </div>

            <Link
              to="/progress"
              className="rounded-xl border border-[#2F80ED] px-4 py-2 text-center text-sm font-semibold text-[#2F80ED]"
            >
              {progress.assessments.length > 0
                ? "View Assessments"
                : "View Progress"}
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}