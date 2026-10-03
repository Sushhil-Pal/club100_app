import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
} from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";

import {
  getMemberSchedule,
  type MemberScheduleSession,
} from "../services/memberService";

type ScheduleTab =
  | "upcoming"
  | "past";

function formatDate(
  value: string
) {
  const date =
    new Date(
      `${value}T00:00:00`
    );

  return date.toLocaleDateString(
    undefined,
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const parts =
    value.split(":");

  if (parts.length < 2) {
    return value;
  }

  const hours =
    Number(parts[0]);

  const minutes =
    Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const date =
    new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  let className =
    "bg-slate-100 text-slate-600";

  if (status === "Live") {
    className =
      "bg-green-50 text-green-700";
  } else if (
    status === "Completed"
  ) {
    className =
      "bg-blue-50 text-blue-700";
  } else if (
    status === "Cancelled"
  ) {
    className =
      "bg-red-50 text-red-700";
  }

  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        className,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function SessionCard({
  session,
  isUpcoming,
  isNext,
}: {
  session:
    MemberScheduleSession;

  isUpcoming: boolean;

  isNext: boolean;
}) {
  const canJoin =
    isUpcoming &&
    !!session.meetingUrl &&
    (
      session.status ===
        "Scheduled" ||
      session.status ===
        "Live"
    );

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#2F80ED]">
              {formatDate(
                session.sessionDate
              )}
            </p>

            <StatusBadge
              status={
                session.status
              }
            />

            {isNext && (
              <span className="rounded-full bg-[#EAF4FC] px-3 py-1 text-xs font-semibold text-[#12395B]">
                Next Session
              </span>
            )}
          </div>

          <h2 className="mt-3 text-xl font-bold text-[#12395B]">
            {
              session.program
                .name
            }
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {
              session.cohort
                .name
            }
          </p>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p>
              <span className="text-slate-400">
                Time:{" "}
              </span>

              {formatTime(
                session.startTime
              )}
              {" – "}
              {formatTime(
                session.endTime
              )}
            </p>

            <p>
              <span className="text-slate-400">
                Trainer:{" "}
              </span>

              {
                session.trainer
                  .name
              }
            </p>

            <p>
              <span className="text-slate-400">
                Mode:{" "}
              </span>

              {
                session.deliveryMode
              }
            </p>

            {session.cohort
              .fitnessLevel && (
              <p>
                <span className="text-slate-400">
                  Level:{" "}
                </span>

                {
                  session.cohort
                    .fitnessLevel
                }
              </p>
            )}
          </div>

          {!isUpcoming &&
            session.attendance && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-700">
                Attendance:{" "}
                {
                  session.attendance
                    .status
                }
              </p>

              {session.attendance
                .minutesAttended !=
                null && (
                <p className="mt-1 text-xs text-slate-500">
                  {
                    session.attendance
                      .minutesAttended
                  }{" "}
                  minutes attended
                </p>
              )}

              {session.attendance
                .notes && (
                <p className="mt-1 text-xs text-slate-500">
                  {
                    session.attendance
                      .notes
                  }
                </p>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 sm:min-w-40">
          {canJoin ? (
            <a
              href={
                session.meetingUrl!
              }
              target="_blank"
              rel="noreferrer"
              className="block w-full rounded-xl bg-[#2F80ED] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#1F6FD1]"
            >
              {session.status ===
              "Live"
                ? "Join Live Session"
                : "Open Meeting"}
            </a>
          ) : isUpcoming ? (
            <Link
              to={`/session/${session.id}`}
              className="block w-full rounded-xl border border-[#2F80ED] px-4 py-3 text-center text-sm font-semibold text-[#2F80ED]"
            >
              View Session
            </Link>
          ) : (
            <Link
              to={`/session/${session.id}`}
              className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-600"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default function SchedulePage() {
  const [
    activeTab,
    setActiveTab,
  ] = useState<ScheduleTab>(
    "upcoming"
  );

  const scheduleQuery =
    useQuery({
      queryKey: [
        "member-schedule",
      ],

      queryFn:
        getMemberSchedule,
    });

  if (
    scheduleQuery.isLoading
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-500">
            Loading your schedule...
          </p>
        </div>
      </PageContainer>
    );
  }

  if (
    scheduleQuery.isError ||
    !scheduleQuery.data
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            We couldn&apos;t load your schedule.
          </p>

          {scheduleQuery.error instanceof
            Error && (
            <p className="mt-2 text-sm text-red-700">
              {
                scheduleQuery.error
                  .message
              }
            </p>
          )}
        </div>
      </PageContainer>
    );
  }

  const upcoming =
    scheduleQuery.data
      .upcoming;

  const past =
    scheduleQuery.data
      .past;

  const sessions =
    activeTab ===
    "upcoming"
      ? upcoming
      : past;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-[#12395B] md:text-4xl">
            Schedule
          </h1>

          <p className="mt-2 text-slate-600">
            View your Club100 sessions and attendance.
          </p>
        </div>

        {/* Tabs */}

        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "upcoming"
              )
            }
            className={[
              "flex-1 rounded-lg px-4 py-2 text-sm transition",
              activeTab ===
              "upcoming"
                ? "bg-white font-semibold text-[#2F80ED] shadow-sm"
                : "font-medium text-slate-500",
            ].join(" ")}
          >
            Upcoming

            {upcoming.length >
              0 && (
              <span className="ml-2">
                ({upcoming.length})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "past"
              )
            }
            className={[
              "flex-1 rounded-lg px-4 py-2 text-sm transition",
              activeTab ===
              "past"
                ? "bg-white font-semibold text-[#2F80ED] shadow-sm"
                : "font-medium text-slate-500",
            ].join(" ")}
          >
            Past

            {past.length > 0 && (
              <span className="ml-2">
                ({past.length})
              </span>
            )}
          </button>
        </div>

        {/* Empty state */}

        {sessions.length ===
        0 ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="font-medium text-slate-700">
              {activeTab ===
              "upcoming"
                ? "No upcoming sessions"
                : "No past sessions"}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {activeTab ===
              "upcoming"
                ? "Your upcoming Club100 sessions will appear here."
                : "Your completed session history will appear here."}
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {sessions.map(
              (
                session,
                index
              ) => (
                <SessionCard
                  key={
                    session.id
                  }
                  session={
                    session
                  }
                  isUpcoming={
                    activeTab ===
                    "upcoming"
                  }
                  isNext={
                    activeTab ===
                      "upcoming" &&
                    index === 0
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}