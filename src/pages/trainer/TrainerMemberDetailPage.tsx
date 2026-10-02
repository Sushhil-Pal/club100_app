import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getTrainerMemberDetail,
} from "../../services/trainerService";

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
      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
        +{value}
      </span>
    );
  }

  if (value < 0) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
        {value}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      No change
    </span>
  );
}

export default function TrainerMemberDetailPage() {
  const navigate =
    useNavigate();

  const {
    memberId,
  } = useParams<{
    memberId: string;
  }>();

  const memberQuery =
    useQuery({
      queryKey: [
        "trainer-member",
        memberId,
      ],

      queryFn: () =>
        getTrainerMemberDetail(
          memberId!
        ),

      enabled:
        !!memberId,
    });

  if (memberQuery.isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading member...
        </p>
      </div>
    );
  }

  if (
    memberQuery.isError ||
    !memberQuery.data
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-medium text-red-700">
          We couldn&apos;t load this member.
        </p>
      </div>
    );
  }

  const {
    member,
    latestAssessment,
    assessmentCount,
    assessmentHistory,
    draftAssessment,
  } = memberQuery.data;

  return (
    <div>
      {/* Back */}

      <button
        type="button"
        onClick={() =>
          navigate(
            "/trainer/members"
          )
        }
        className="text-sm font-semibold text-[#2F80ED]"
      >
        ← Back to Members
      </button>

      {/* Member Header */}

      <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#12395B]">
              {member.fullName}
            </h1>

            <div className="mt-3 space-y-1 text-sm text-slate-500">
              {member.mobile && (
                <p>
                  Mobile: {member.mobile}
                </p>
              )}

              {member.email && (
                <p>
                  Email: {member.email}
                </p>
              )}

              {member.gender && (
                <p>
                  Gender: {member.gender}
                </p>
              )}
            </div>
          </div>

          {draftAssessment ? (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/trainer/assessment/${draftAssessment.id}`
                )
              }
              className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1]"
            >
              Continue Assessment
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/trainer/assessment/new?member=${member.id}`
                )
              }
              className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1]"
            >
              {assessmentCount > 0
                ? "Start Reassessment"
                : "Start Assessment"}
            </button>
          )}
        </div>
      </div>

      {/* Summary */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Completed Assessments
          </p>

          <p className="mt-2 text-3xl font-bold text-[#12395B]">
            {assessmentCount}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Current Fitness Score
          </p>

          <div className="mt-2 flex items-center gap-3">
            <p className="text-3xl font-bold text-[#12395B]">
              {latestAssessment?.fitnessScore ??
                "—"}
            </p>

            {latestAssessment && (
              <ChangeBadge
                value={
                  latestAssessment.scoreChange
                }
              />
            )}
          </div>

          {latestAssessment?.fitnessLevel && (
            <p className="mt-1 text-sm text-slate-500">
              {
                latestAssessment.fitnessLevel
              }
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Assessment Status
          </p>

          <p className="mt-2 text-lg font-bold text-[#12395B]">
            {draftAssessment
              ? "In Progress"
              : assessmentCount > 0
                ? "Up to Date"
                : "Not Assessed"}
          </p>

          {draftAssessment && (
            <p className="mt-1 text-sm text-slate-500">
              {draftAssessment.type}
            </p>
          )}
        </div>
      </div>

      {/* Draft */}

      {draftAssessment && (
        <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
            Assessment In Progress
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-[#12395B]">
                {draftAssessment.type}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Started {draftAssessment.date}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/trainer/assessment/${draftAssessment.id}`
                )
              }
              className="rounded-xl bg-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Continue Assessment
            </button>
          </div>
        </section>
      )}

      {/* Assessment History */}

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#12395B]">
            Assessment History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Fitness assessments and progress over time.
          </p>
        </div>

        {assessmentHistory.length ===
          0 ? (
          <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              No completed assessments yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/trainer/assessment/new?member=${member.id}`
                )
              }
              className="mt-4 text-sm font-semibold text-[#2F80ED]"
            >
              Start first assessment
            </button>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {assessmentHistory.map(
              (
                assessment,
                index
              ) => (
                <div
                  key={
                    assessment.id
                  }
                  className="py-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-900">
                          {
                            assessment.type
                          }
                        </p>

                        {index === 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
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

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">
                          Fitness Score
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-2xl font-bold text-[#12395B]">
                            {assessment.fitnessScore ??
                              "—"}
                          </span>

                          <ChangeBadge
                            value={
                              assessment.scoreChange
                            }
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/trainer/assessment/${assessment.id}/result`
                          )
                        }
                        className="rounded-xl border border-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-[#2F80ED]"
                      >
                        View Result
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}