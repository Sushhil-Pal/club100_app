import {
  useMemo,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import PageContainer from "../components/layout/PageContainer";

import {
  getMemberAssessmentResult,
} from "../services/memberService";

function formatScore(
  value: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return Math.round(value);
}

function formatMetricValue(
  value: number | null,
  textValue: string | null,
  unit: string | null
) {
  if (
    textValue !== null &&
    textValue !== ""
  ) {
    return textValue;
  }

  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return unit
    ? `${value} ${unit}`
    : String(value);
}

function ChangeBadge({
  current,
  previous,
}: {
  current: number | null;
  previous: number | null;
}) {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined
  ) {
    return null;
  }

  const difference =
    Math.round(
      current - previous
    );

  if (difference > 0) {
    return (
      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
        +{difference}
      </span>
    );
  }

  if (difference < 0) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        {difference}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      No change
    </span>
  );
}

export default function MemberAssessmentResultPage() {
  const navigate =
    useNavigate();

  const {
    assessmentId,
  } = useParams<{
    assessmentId: string;
  }>();

  const resultQuery =
    useQuery({
      queryKey: [
        "member-assessment-result",
        assessmentId,
      ],

      queryFn: () =>
        getMemberAssessmentResult(
          assessmentId!
        ),

      enabled:
        !!assessmentId,
    });

  const metricsByCategory =
    useMemo(() => {
      const metrics =
        resultQuery.data
          ?.assessment.metrics ??
        [];

      return metrics.reduce<
        Record<
          string,
          typeof metrics
        >
      >(
        (
          groups,
          metric
        ) => {
          const category =
            metric.category ||
            "Other";

          if (!groups[category]) {
            groups[category] = [];
          }

          groups[
            category
          ].push(metric);

          return groups;
        },
        {}
      );
    }, [
      resultQuery.data,
    ]);

  if (
    resultQuery.isLoading
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          Loading assessment result...
        </div>
      </PageContainer>
    );
  }

  if (
    resultQuery.isError ||
    !resultQuery.data
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            We couldn&apos;t load this assessment result.
          </p>

          {resultQuery.error instanceof
            Error && (
            <p className="mt-2 text-sm text-red-700">
              {
                resultQuery.error.message
              }
            </p>
          )}
        </div>
      </PageContainer>
    );
  }

  const assessment =
    resultQuery.data.assessment;

  const previous =
    assessment.previousAssessment;

  function previousCategory(
    category: string
  ): number | null {
    if (!previous) {
      return null;
    }

    return (
      previous.categories.find(
        (item) =>
          item.category ===
          category
      )?.score ?? null
    );
  }

  function previousMetric(
    metric: string
  ) {
    if (!previous) {
      return null;
    }

    return (
      previous.metrics.find(
        (item) =>
          item.metric === metric
      ) ?? null
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}

        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/progress"
              )
            }
            className="text-sm font-semibold text-[#2F80ED]"
          >
            ← Back to My Progress
          </button>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
            {
              assessment.assessmentType
            }{" "}
            Assessment
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#12395B]">
            My Fitness Assessment
          </h1>

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>
              {
                assessment.assessmentDate
              }
            </span>

            <span>
              {
                assessment.deliveryMode
              }
            </span>
          </div>
        </div>

        {/* Overall Score */}

        <section className="rounded-2xl bg-[#12395B] p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
            Club100 Fitness Score
          </p>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-6xl font-bold">
              {formatScore(
                assessment.fitnessScore
              )}
            </span>

            <span className="mb-2 text-lg text-white/60">
              / 100
            </span>
          </div>

          {assessment.fitnessLevel && (
            <div className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              {
                assessment.fitnessLevel
              }
            </div>
          )}
        </section>

        {/* Progress */}

        {previous && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
              Progress
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#12395B]">
              Since Previous Assessment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Compared with{" "}
              {previous.assessmentType}{" "}
              on{" "}
              {previous.assessmentDate}
            </p>

            <div className="mt-5 grid grid-cols-3 items-center rounded-2xl bg-[#F5FAFE] p-5">
              <div>
                <p className="text-xs text-slate-400">
                  Previous
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-600">
                  {formatScore(
                    previous.fitnessScore
                  )}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-400">
                  Change
                </p>

                <div className="mt-2">
                  <ChangeBadge
                    current={
                      assessment.fitnessScore
                    }
                    previous={
                      previous.fitnessScore
                    }
                  />
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">
                  Current
                </p>

                <p className="mt-1 text-2xl font-bold text-[#12395B]">
                  {formatScore(
                    assessment.fitnessScore
                  )}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Category Scores */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#12395B]">
            Fitness Areas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your score across each area of fitness.
          </p>

          <div className="mt-6 space-y-5">
            {assessment.categories.map(
              (category) => {
                const score =
                  category.score ?? 0;

                const oldScore =
                  previousCategory(
                    category.category
                  );

                return (
                  <div
                    key={
                      category.category
                    }
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-slate-800">
                        {
                          category.category
                        }
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#12395B]">
                          {formatScore(
                            category.score
                          )}
                        </span>

                        {previous && (
                          <ChangeBadge
                            current={
                              category.score
                            }
                            previous={
                              oldScore
                            }
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#2F80ED]"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              score,
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
        </section>

        {/* Individual Metrics */}

        <section>
          <h2 className="text-xl font-bold text-[#12395B]">
            My Results
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Detailed results from this assessment.
          </p>

          <div className="mt-4 space-y-5">
            {Object.entries(
              metricsByCategory
            ).map(
              ([
                category,
                metrics,
              ]) => (
                <div
                  key={
                    category
                  }
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <h3 className="font-bold text-[#12395B]">
                    {category}
                  </h3>

                  <div className="mt-3 divide-y divide-slate-100">
                    {metrics.map(
                      (metric) => {
                        const oldMetric =
                          previousMetric(
                            metric.metric
                          );

                        const useMobileStack =
                          metric.metricName ===
                            "Shoulder Flexibility" ||
                          metric.metricName ===
                            "Single Leg Balance";

                        return (
                          <div
                            key={
                              metric.metric
                            }
                            className="py-4"
                          >
                            <div
                              className={
                                useMobileStack
                                  ? "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-5"
                                  : "flex items-start justify-between gap-5"
                              }
                            >
                              {/* Metric name / rating / previous result */}

                              <div className="min-w-0">
                                <p className="font-medium text-slate-800">
                                  {
                                    metric.metricName
                                  }
                                </p>

                                {metric.rating && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {
                                      metric.rating
                                    }
                                  </p>
                                )}

                                {oldMetric && (
                                  <div className="mt-2 text-xs text-slate-400">
                                    <span>
                                      Previous result:
                                    </span>

                                    <span className="ml-1 break-words">
                                      {formatMetricValue(
                                        oldMetric.value,
                                        oldMetric.textValue,
                                        oldMetric.unit
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Current result / change / score */}

                              <div
                                className={
                                  useMobileStack
                                    ? "w-full sm:w-auto sm:shrink-0 sm:text-right"
                                    : "shrink-0 text-right"
                                }
                              >
                                <p className="break-words font-semibold text-slate-900">
                                  {formatMetricValue(
                                    metric.value,
                                    metric.textValue,
                                    metric.unit
                                  )}
                                </p>

                                {metric.includeInScore && (
                                  <div
                                    className={
                                      useMobileStack
                                        ? "mt-2 flex flex-col items-start gap-1.5 sm:items-end"
                                        : "mt-2 flex flex-col items-end gap-1.5"
                                    }
                                  >
                                    {oldMetric?.includeInScore && (
                                      <ChangeBadge
                                        current={
                                          metric.score
                                        }
                                        previous={
                                          oldMetric.score
                                        }
                                      />
                                    )}

                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-500">
                                        Score
                                      </span>

                                      <span className="rounded-lg bg-[#F5FAFE] px-2.5 py-1 text-sm font-bold text-[#12395B]">
                                        {formatScore(
                                          metric.score
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}