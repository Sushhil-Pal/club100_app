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

import {
  getTrainerAssessmentResult,
} from "../../services/trainerService";

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

function scoreDifference(
  current: number | null,
  previous: number | null
): number | null {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined
  ) {
    return null;
  }

  return Math.round(
    current - previous
  );
}

function ChangeBadge({
  current,
  previous,
}: {
  current: number | null;
  previous: number | null;
}) {
  const difference =
    scoreDifference(
      current,
      previous
    );

  if (difference === null) {
    return (
      <span className="text-xs text-slate-400">
        —
      </span>
    );
  }

  if (difference > 0) {
    return (
      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
        +{difference}
      </span>
    );
  }

  if (difference < 0) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        {difference}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      No change
    </span>
  );
}

export default function TrainerAssessmentResultPage() {
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
        "trainer-assessment-result",
        assessmentId,
      ],

      queryFn: () =>
        getTrainerAssessmentResult(
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
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        Loading results...
      </div>
    );
  }

  if (
    resultQuery.isError ||
    !resultQuery.data
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">
          We couldn&apos;t load
          the assessment results.
        </p>

        {resultQuery.error instanceof
          Error && (
          <p className="mt-2 text-sm text-red-700">
            {
              resultQuery.error
                .message
            }
          </p>
        )}
      </div>
    );
  }

  const assessment =
    resultQuery.data
      .assessment;

  const previous =
    assessment.previousAssessment;

  function getPreviousCategoryScore(
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

  function getPreviousMetric(
    metricId: string
  ) {
    if (!previous) {
      return null;
    }

    return (
      previous.metrics.find(
        (item) =>
          item.metric ===
          metricId
      ) ?? null
    );
  }

  return (
    <div>
      {/* Header */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/trainer/members/${assessment.member.id}`
            )
          }
          className="text-sm font-semibold text-[#2F80ED]"
        >
          ← Back to Member
        </button>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
          {
            assessment.assessmentType
          }{" "}
          Assessment
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {
            assessment.member
              .fullName
          }
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

          <span>
            {
              assessment.status
            }
          </span>
        </div>
      </div>

      {/* Overall score */}

      <section className="mt-6 rounded-2xl bg-[#12395B] p-6 text-white shadow-sm">
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

      {/* Overall/category comparison */}

      {previous && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
            Progress
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#12395B]">
            Since Previous Assessment
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Compared with{" "}
            {
              previous.assessmentType
            }{" "}
            on{" "}
            {
              previous.assessmentDate
            }
          </p>

          <div className="mt-5 rounded-2xl bg-[#F5FAFE] p-5">
            <div className="grid grid-cols-3 items-center gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Previous
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-600">
                  {formatScore(
                    previous.fitnessScore
                  )}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs uppercase tracking-wide text-slate-400">
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
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Current
                </p>

                <p className="mt-1 text-2xl font-bold text-[#12395B]">
                  {formatScore(
                    assessment.fitnessScore
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {assessment.categories.map(
              (category) => {
                const previousScore =
                  getPreviousCategoryScore(
                    category.category
                  );

                return (
                  <div
                    key={
                      category.category
                    }
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {
                          category.category
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Previous{" "}
                        {formatScore(
                          previousScore
                        )}
                        {" → "}
                        Current{" "}
                        {formatScore(
                          category.score
                        )}
                      </p>
                    </div>

                    <ChangeBadge
                      current={
                        category.score
                      }
                      previous={
                        previousScore
                      }
                    />
                  </div>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* Category scores */}

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#12395B]">
          Category Scores
        </h2>

        <div className="mt-5 space-y-5">
          {assessment.categories.map(
            (category) => {
              const score =
                category.score ??
                0;

              return (
                <div
                  key={
                    category.category
                  }
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-800">
                        {
                          category.category
                        }
                      </p>

                      <p className="text-xs text-slate-500">
                        {
                          category.metricsScored
                        }{" "}
                        metrics scored
                      </p>
                    </div>

                    <span className="text-lg font-bold text-[#12395B]">
                      {formatScore(
                        category.score
                      )}
                    </span>
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

      {/* Metric-level progress */}

      {previous && (
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
            Detailed Progress
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#12395B]">
            Metric-Level Comparison
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Change is based on the
            normalized Club100 metric
            score.
          </p>

          <div className="mt-5 space-y-6">
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
                >
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    {category}
                  </h3>

                  <div className="mt-2 divide-y divide-slate-100">
                    {metrics.map(
                      (
                        metric
                      ) => {
                        const previousMetric =
                          getPreviousMetric(
                            metric.metric
                          );

                        return (
                          <div
                            key={
                              metric.metric
                            }
                            className="py-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800">
                                  {
                                    metric.metricName
                                  }
                                </p>

                                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs text-slate-400">
                                      Previous
                                    </p>

                                    <p className="mt-1 font-medium text-slate-600">
                                      {previousMetric
                                        ? formatMetricValue(
                                            previousMetric.value,
                                            previousMetric.textValue,
                                            previousMetric.unit
                                          )
                                        : "—"}
                                    </p>

                                    {previousMetric?.includeInScore && (
                                      <p className="mt-1 text-xs text-slate-400">
                                        Score{" "}
                                        {formatScore(
                                          previousMetric.score
                                        )}
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <p className="text-xs text-slate-400">
                                      Current
                                    </p>

                                    <p className="mt-1 font-semibold text-[#12395B]">
                                      {formatMetricValue(
                                        metric.value,
                                        metric.textValue,
                                        metric.unit
                                      )}
                                    </p>

                                    {metric.includeInScore && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        Score{" "}
                                        {formatScore(
                                          metric.score
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {metric.includeInScore &&
                                previousMetric?.includeInScore && (
                                  <ChangeBadge
                                    current={
                                      metric.score
                                    }
                                    previous={
                                      previousMetric.score
                                    }
                                  />
                                )}
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
      )}

      {/* Current detailed metrics */}

      <div className="mt-6 space-y-6">
        {Object.entries(
          metricsByCategory
        ).map(
          ([
            category,
            metrics,
          ]) => (
            <section
              key={
                category
              }
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-bold text-[#12395B]">
                {category}
              </h2>

              <div className="mt-4 divide-y divide-slate-100">
                {metrics.map(
                  (
                    metric
                  ) => (
                    <div
                      key={
                        metric.metric
                      }
                      className="flex items-center justify-between gap-4 py-4"
                    >
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
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-slate-900">
                          {formatMetricValue(
                            metric.value,
                            metric.textValue,
                            metric.unit
                          )}
                        </p>

                        {metric.includeInScore && (
                          <p className="mt-1 text-xs text-slate-500">
                            Score:{" "}
                            {formatScore(
                              metric.score
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )
        )}
      </div>
    </div>
  );
}