import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import {
  getTrainerMemberDetail,
} from "../../services/trainerService";

export default function TrainerMemberDetailPage() {
  const navigate = useNavigate();

  const { memberId } =
    useParams<{
      memberId: string;
    }>();

  const memberQuery = useQuery({
    queryKey: [
      "trainer-member",
      memberId,
    ],

    queryFn: () =>
      getTrainerMemberDetail(
        memberId!
      ),

    enabled: !!memberId,
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

      {/* Member header */}

      <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
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

          <button
            type="button"
            onClick={() =>
              navigate(
                `/trainer/assessment/new?member=${member.id}`
              )
            }
            className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1]"
          >
            {memberQuery.data.assessmentCount > 0
                ? "Start Reassessment"
                : "Start Assessment"}
          </button>
        </div>
      </div>

      {/* Assessment summary */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

          <p className="mt-2 text-3xl font-bold text-[#12395B]">
            {latestAssessment?.fitnessScore ??
              "—"}
          </p>

          {latestAssessment?.fitnessLevel && (
            <p className="mt-1 text-sm text-slate-500">
              {
                latestAssessment.fitnessLevel
              }
            </p>
          )}
        </div>
      </div>

      {/* Latest Assessment */}

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Latest Assessment
        </h2>

        {latestAssessment ? (
          <div className="mt-4">
            <p className="font-medium text-slate-800">
              {latestAssessment.type}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {latestAssessment.date}
            </p>

            <button
              type="button"
              className="mt-4 text-sm font-semibold text-[#2F80ED]"
            >
              View Assessment
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-slate-500">
              No completed assessment yet.
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
        )}
      </div>
    </div>
  );
}