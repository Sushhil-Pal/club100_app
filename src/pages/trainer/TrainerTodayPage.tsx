import {
  useNavigate,
} from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getTrainerToday,
} from "../../services/trainerService";

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#12395B]">
        {value}
      </p>
    </div>
  );
}

function SessionStatusBadge({
  status,
}: {
  status: string;
}) {
  let classes =
    "bg-slate-100 text-slate-700";

  if (status === "Live") {
    classes =
      "bg-green-100 text-green-700";
  }

  if (status === "Completed") {
    classes =
      "bg-blue-100 text-blue-700";
  }

  if (status === "Cancelled") {
    classes =
      "bg-red-100 text-red-700";
  }

  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-xs font-semibold",
        classes,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

export default function TrainerTodayPage() {
  const navigate =
    useNavigate();

  const todayQuery =
    useQuery({
      queryKey: [
        "trainer-today",
      ],

      queryFn:
        getTrainerToday,
    });

  if (todayQuery.isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        Loading today&apos;s activity...
      </div>
    );
  }

  if (
    todayQuery.isError ||
    !todayQuery.data
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-700">
          We couldn&apos;t load
          today&apos;s activity.
        </p>

        {todayQuery.error instanceof
          Error && (
          <p className="mt-2 text-sm text-red-700">
            {
              todayQuery.error
                .message
            }
          </p>
        )}
      </div>
    );
  }

  const data =
    todayQuery.data;

  return (
    <div>
      {/* Header */}

      <div>
        <p className="text-sm font-semibold text-[#2F80ED]">
          {data.date}
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#12395B]">
          Today
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Your Club100 activity
          for today.
        </p>
      </div>

      {/* Summary */}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          label="Sessions Today"
          value={
            data.summary
              .sessions
          }
        />

        <SummaryCard
          label="Scheduled"
          value={
            data.summary
              .scheduled
          }
        />

        <SummaryCard
          label="Completed"
          value={
            data.summary
              .completed
          }
        />

        <SummaryCard
          label="Draft Assessments"
          value={
            data.summary
              .draftAssessments
          }
        />
      </div>

      {/* Today's Sessions */}

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#12395B]">
              Today&apos;s Sessions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your scheduled and
              completed sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/trainer/sessions"
              )
            }
            className="text-sm font-semibold text-[#2F80ED]"
          >
            View all
          </button>
        </div>

        {data.sessions.length ===
          0 ? (
          <div className="mt-4 rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="font-semibold text-slate-700">
              No sessions today
            </p>

            <p className="mt-1 text-sm text-slate-500">
              You don&apos;t have
              any sessions assigned
              for today.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {data.sessions.map(
              (session) => (
                <div
                  key={
                    session.id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-[#12395B]">
                        {
                          session
                            .program
                            .name
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          session
                            .cohort
                            .name
                        }
                      </p>
                    </div>

                    <SessionStatusBadge
                      status={
                        session.status
                      }
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                    <span>
                      {session.startTime ??
                        "Time not set"}

                      {session.endTime
                        ? ` - ${session.endTime}`
                        : ""}
                    </span>

                    <span>
                      {
                        session.deliveryMode
                      }
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/trainer/session/${session.id}`
                        )
                      }
                      className="rounded-xl bg-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1F6FD1]"
                    >
                      {session.status ===
                      "Completed"
                        ? "View Session"
                        : "Open Session"}
                    </button>

                    {session.meetingUrl &&
                      session.status !==
                        "Completed" && (
                        <a
                          href={
                            session.meetingUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-[#2F80ED]"
                        >
                          Join Meeting
                        </a>
                      )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Draft Assessments */}

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#12395B]">
              Assessments In Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Continue assessments
              you have already
              started.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/trainer/assessments"
              )
            }
            className="text-sm font-semibold text-[#2F80ED]"
          >
            View all
          </button>
        </div>

        {data.draftAssessments
          .length === 0 ? (
          <div className="mt-4 rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="font-semibold text-slate-700">
              No draft assessments
            </p>

            <p className="mt-1 text-sm text-slate-500">
              There are no
              assessments waiting
              to be continued.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {data.draftAssessments.map(
              (assessment) => (
                <div
                  key={
                    assessment.id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-slate-900">
                        {
                          assessment
                            .member
                            .fullName
                        }
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                        <span>
                          {
                            assessment.assessmentType
                          }
                        </span>

                        {assessment
                          .assessmentDate && (
                          <span>
                            {
                              assessment.assessmentDate
                            }
                          </span>
                        )}

                        {assessment
                          .member
                          .mobile && (
                          <span>
                            {
                              assessment
                                .member
                                .mobile
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/trainer/assessment/${assessment.id}`
                        )
                      }
                      className="rounded-xl border border-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-[#2F80ED]"
                    >
                      Continue Assessment
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Quick Actions */}

      <section className="mt-8">
        <h2 className="text-lg font-bold text-[#12395B]">
          Quick Actions
        </h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/trainer/members"
              )
            }
            className="rounded-xl bg-[#2F80ED] px-4 py-3 font-semibold text-white hover:bg-[#1F6FD1]"
          >
            Find Member
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/trainer/assessment/new"
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Start Assessment
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/trainer/sessions"
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Sessions
          </button>
        </div>
      </section>
    </div>
  );
}