import { useQuery } from "@tanstack/react-query";

import PageContainer from "../components/layout/PageContainer";
import { getProgressSummary } from "../services/progressService";

export default function ProgressPage() {
  const progressQuery = useQuery({
    queryKey: ["progress-summary"],
    queryFn: getProgressSummary,
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

  if (progressQuery.isError) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="font-medium text-red-600">
            We couldn&apos;t load your progress.
          </p>
        </div>
      </PageContainer>
    );
  }

  const progress = progressQuery.data;

  const hasAssessment =
    progress.assessments.length > 0;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#12395B] md:text-4xl">
            My Progress
          </h1>

          <p className="mt-2 text-slate-600">
            See how your fitness is improving over time.
          </p>
        </div>

        {!hasAssessment ? (
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
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Fitness Score
              </p>

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
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Category Scores
              </h2>

              <div className="mt-6 space-y-5">
                {progress.categoryScores.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-slate-700">
                        {item.label}
                      </span>

                      {progress.hasReassessment ? (
                        <div className="text-sm">
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

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
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
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Assessment History
              </h2>

              <div className="mt-5 divide-y divide-slate-100">
                {progress.assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {assessment.type}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {assessment.date}
                      </p>
                    </div>

                    <div className="text-2xl font-bold text-[#12395B]">
                      {assessment.score}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </PageContainer>
  );
}