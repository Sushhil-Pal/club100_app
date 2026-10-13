import {
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";

import {
  getAssessmentContext,
  startSelfAssessment,
} from "../services/memberService";

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default function SelfAssessmentHomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [safetyAcknowledged, setSafetyAcknowledged] =
    useState(false);

  const contextQuery = useQuery({
    queryKey: [
      "member-assessment-context",
    ],
    queryFn: getAssessmentContext,
  });

  const startMutation = useMutation({
    mutationFn: () =>
      startSelfAssessment(
        safetyAcknowledged
      ),

    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "member-assessment-context",
        ],
      });

      navigate(
        `/assessment/${result.assessment.id}`
      );
    },
  });

  if (contextQuery.isLoading) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-500">
            Loading your assessment...
          </p>
        </div>
      </PageContainer>
    );
  }

  if (
    contextQuery.isError ||
    !contextQuery.data
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            We couldn&apos;t load your assessment status.
          </p>
        </div>
      </PageContainer>
    );
  }

  const context = contextQuery.data;

  if (!context.allowed) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
            Fitness Assessment
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#12395B]">
            Self Assessment
          </h1>

          <p className="mt-4 text-slate-600">
            {context.reason ||
              "Self Assessment is not available for your current membership."}
          </p>
        </div>
      </PageContainer>
    );
  }

  const isDraft =
    context.state === "Draft" &&
    !!context.draftAssessmentId;

  const canStart =
    !!context.canStart;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
            {context.program?.name || "Club100"}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#12395B] md:text-4xl">
            Your Fitness Assessment
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Measure your starting point and track how your fitness changes over time.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#2F80ED]">
                {context.assessmentType || "Assessment"}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {isDraft
                  ? "Continue your assessment"
                  : context.state === "Current"
                    ? "Assessment up to date"
                    : "Know your starting point"}
              </h2>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2F80ED]">
              {context.plan?.name} · {context.assessmentMode}
            </span>
          </div>

          {isDraft && (
            <>
              <p className="mt-4 text-slate-600">
                Your previous entries have been saved. Continue from where you left off.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/assessment/${context.draftAssessmentId}`
                  )
                }
                className="mt-5 rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white"
              >
                Resume Assessment
              </button>
            </>
          )}

          {!isDraft && canStart && (
            <>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold text-[#12395B]">
                  Before you begin
                </h3>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  <li>Perform the tests only if you feel well enough to exercise.</li>
                  <li>Use stable equipment and support where instructed.</li>
                  <li>Stop if you experience pain, dizziness, unusual shortness of breath, or feel unwell.</li>
                  <li>You can save your assessment and continue later.</li>
                </ul>

                <label className="mt-5 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={safetyAcknowledged}
                    onChange={(event) =>
                      setSafetyAcknowledged(
                        event.target.checked
                      )
                    }
                    className="mt-1 h-4 w-4"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    I understand these instructions and feel able to proceed with the assessment.
                  </span>
                </label>
              </div>

              <button
                type="button"
                disabled={
                  !safetyAcknowledged ||
                  startMutation.isPending
                }
                onClick={() =>
                  startMutation.mutate()
                }
                className="mt-5 rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {startMutation.isPending
                  ? "Starting..."
                  : `Start ${context.assessmentType || "Assessment"}`}
              </button>
            </>
          )}

          {!isDraft &&
            !canStart &&
            context.latestAssessment && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Latest Fitness Score
                  </p>
                  <p className="mt-1 text-4xl font-bold text-[#12395B]">
                    {context.latestAssessment.fitnessScore ?? "—"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {context.latestAssessment.type} · {formatDate(context.latestAssessment.date)}
                  </p>

                  <Link
                    to={`/progress/${context.latestAssessment.id}`}
                    className="mt-4 inline-block text-sm font-semibold text-[#2F80ED]"
                  >
                    View assessment result →
                  </Link>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Next reassessment
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatDate(context.nextAssessmentDueOn)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Reassessing regularly helps you measure meaningful progress rather than day-to-day variation.
                  </p>
                </div>
              </div>
            )}

          {startMutation.isError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {startMutation.error instanceof Error
                ? startMutation.error.message
                : "We couldn't start the assessment."}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#12395B]">
            What you&apos;ll measure
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Body composition, cardiovascular health, strength and endurance, mobility and balance, and well-being and readiness.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}
