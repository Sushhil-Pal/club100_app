import {
  useNavigate,
} from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import PageContainer from "../components/layout/PageContainer";

import {
  getMemberProgress,
} from "../services/memberService";

function ChangeBadge({
  value,
}: {
  value: number | null;
}) {
  if (value === null) {
    return null;
  }

  if (value > 0) {
    return (
      <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
        +{value}
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
        {value}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
      No change
    </span>
  );
}

export default function ProgressPage() {
  const navigate =
    useNavigate();

  const progressQuery =
    useQuery({
      queryKey: [
        "member-progress",
      ],

      queryFn:
        getMemberProgress,
    });

  if (progressQuery.isLoading) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-500">
            Loading your progress...
          </p>
        </div>
      </PageContainer>
    );
  }

  if (
    progressQuery.isError ||
    !progressQuery.data
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            We couldn&apos;t load your progress.
          </p>

          {progressQuery.error instanceof
            Error && (
            <p className="mt-2 text-sm text-red-700">
              {
                progressQuery.error
                  .message
              }
            </p>
          )}
        </div>
      </PageContainer>
    );
  }

  const progress =
    progressQuery.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-[#12395B] md:text-4xl">
            My Progress
          </h1>

          <p className="mt-2 text-slate-600">
            See how your fitness is improving over time.
          </p>
        </div>

        {!progress.hasAssessment ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No assessment yet
            </h2>

            <p className="mt-2 text-slate-500">
              Your fitness progress will appear here after your
              baseline assessment is completed.
            </p>
          </section>
        ) : (
          <>
            {/* Overall Score */}

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Club100 Fitness Score
              </p>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <span className="text-5xl font-bold text-[#12395B]">
                  {progress.fitnessScore.current ??
                    "—"}
                </span>

                {progress.hasPreviousAssessment && (
                  <ChangeBadge
                    value={
                      progress.fitnessScore.change
                    }
                  />
                )}
              </div>

              {progress.currentAssessment
                ?.fitnessLevel && (
                <p className="mt-2 font-medium text-[#12395B]">
                  {
                    progress.currentAssessment
                      .fitnessLevel
                  }
                </p>
              )}

              {progress.hasPreviousAssessment ? (
                <div className="mt-4 text-sm text-slate-500">
                  <p>
                    Change since your previous assessment
                  </p>

                  {progress.previousAssessment && (
                    <p className="mt-1">
                      Previous assessment:{" "}
                      {
                        progress.previousAssessment
                          .date
                      }
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <p className="font-medium text-[#12395B]">
                    Baseline Assessment
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    This is your starting fitness score.
                  </p>
                </div>
              )}
            </section>

            {/* Categories */}

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Category Progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your current score across the five Club100
                fitness areas.
              </p>

              <div className="mt-6 space-y-6">
                {progress.categoryScores.map(
                  (item) => (
                    <div
                      key={
                        item.category
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-700">
                            {
                              item.category
                            }
                          </p>

                          {progress.hasPreviousAssessment &&
                            item.previous !==
                              null && (
                              <p className="mt-1 text-xs text-slate-400">
                                Previous:{" "}
                                {
                                  item.previous
                                }
                              </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#12395B]">
                            {item.current ??
                              "—"}
                          </span>

                          {progress.hasPreviousAssessment && (
                            <ChangeBadge
                              value={
                                item.change
                              }
                            />
                          )}
                        </div>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[#2F80ED]"
                          style={{
                            width: `${
                              item.current ??
                              0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Assessment History */}

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Assessment History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your fitness journey over time.
              </p>

              <div className="mt-5 divide-y divide-slate-100">
                {progress.assessments.map(
                  (
                    assessment,
                    index
                  ) => (
                    <div
                      key={
                        assessment.id
                      }
                      className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-800">
                            {
                              assessment.type
                            }
                          </p>

                          {index === 0 && (
                            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-[#2F80ED]">
                              Latest
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            assessment.date
                          }
                        </p>

                        {assessment.fitnessLevel && (
                          <p className="mt-1 text-sm text-slate-500">
                            {
                              assessment.fitnessLevel
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-2xl font-bold text-[#12395B]">
                          {assessment.score ??
                            "—"}
                        </span>

                        <ChangeBadge
                          value={
                            assessment.change
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/progress/${assessment.id}`
                            )
                          }
                          className="rounded-xl border border-[#2F80ED] px-4 py-2 text-sm font-semibold text-[#2F80ED] transition hover:bg-[#F5FAFE]"
                        >
                          View Result
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </PageContainer>
  );
}