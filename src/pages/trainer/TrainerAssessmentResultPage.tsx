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

      {/* Detailed metrics */}

      <div className="mt-6 space-y-6">
        {Object.entries(
          metricsByCategory
        ).map(
          ([
            category,
            metrics,
          ]) => (
            <section
              key={category}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-bold text-[#12395B]">
                {category}
              </h2>

              <div className="mt-4 divide-y divide-slate-100">
                {metrics.map(
                  (metric) => (
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