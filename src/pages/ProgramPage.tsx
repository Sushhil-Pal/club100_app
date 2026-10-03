import {
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
} from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";

import {
  getCurrentProgram,
} from "../services/programService";

import {
  getMemberSchedule,
  type MemberScheduleSession,
} from "../services/memberService";

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatShortDate(
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

function getWeekBounds() {
  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const day =
    today.getDay();

  const daysFromMonday =
    day === 0
      ? 6
      : day - 1;

  const start =
    new Date(today);

  start.setDate(
    today.getDate() -
      daysFromMonday
  );

  const end =
    new Date(start);

  end.setDate(
    start.getDate() + 6
  );

  end.setHours(
    23,
    59,
    59,
    999
  );

  return {
    start,
    end,
  };
}

function isThisWeek(
  sessionDate: string
) {
  const {
    start,
    end,
  } = getWeekBounds();

  const date =
    new Date(
      `${sessionDate}T00:00:00`
    );

  return (
    date >= start &&
    date <= end
  );
}

function SessionStatusBadge({
  status,
}: {
  status: string;
}) {
  let className =
    "bg-blue-50 text-[#2F80ED]";

  if (
    status === "Completed"
  ) {
    className =
      "bg-green-50 text-green-700";
  } else if (
    status === "Live"
  ) {
    className =
      "bg-green-50 text-green-700";
  } else if (
    status === "Cancelled"
  ) {
    className =
      "bg-red-50 text-red-700";
  }

  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-xs font-semibold",
        className,
      ].join(" ")}
    >
      {status === "Live"
        ? "Live Now"
        : status}
    </span>
  );
}

function WeekSessionRow({
  session,
}: {
  session:
    MemberScheduleSession;
}) {
  return (
    <Link
      to={`/session/${session.id}`}
      className="flex items-center justify-between gap-4 py-4 transition hover:bg-slate-50"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-500">
          {formatShortDate(
            session.sessionDate
          )}
        </p>

        <p className="mt-1 font-semibold text-slate-800">
          {
            session.program
              .name
          }
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {formatTime(
            session.startTime
          )}
          {" – "}
          {formatTime(
            session.endTime
          )}
          {" • "}
          {
            session.deliveryMode
          }
        </p>
      </div>

      <SessionStatusBadge
        status={
          session.status
        }
      />
    </Link>
  );
}

export default function ProgramPage() {
  // ---------------------------------------------------------
  // Queries
  // ---------------------------------------------------------

  const programQuery =
    useQuery({
      queryKey: [
        "current-program",
      ],

      queryFn:
        getCurrentProgram,
    });

  const scheduleQuery =
    useQuery({
      queryKey: [
        "member-schedule",
      ],

      queryFn:
        getMemberSchedule,
    });

  // ---------------------------------------------------------
  // Loading
  // ---------------------------------------------------------

  if (
    programQuery.isLoading ||
    scheduleQuery.isLoading
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-500">
            Loading your program...
          </p>
        </div>
      </PageContainer>
    );
  }

  // ---------------------------------------------------------
  // Error
  // ---------------------------------------------------------

  if (
    programQuery.isError ||
    scheduleQuery.isError
  ) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            We couldn&apos;t load your program.
          </p>
        </div>
      </PageContainer>
    );
  }

  // ---------------------------------------------------------
  // No current program
  // ---------------------------------------------------------

  if (!programQuery.data) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#12395B] md:text-4xl">
              My Program
            </h1>

            <p className="mt-2 text-slate-600">
              Your Club100 training program will appear here.
            </p>
          </div>

          <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-[#2F80ED]">
              C100
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              No active program yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-500">
              You&apos;re registered with Club100. Once a program is assigned to you, your schedule and program details will appear here.
            </p>
          </section>
        </div>
      </PageContainer>
    );
  }

  // ---------------------------------------------------------
  // Data
  // ---------------------------------------------------------

  const program =
    programQuery.data;

  const schedule =
    scheduleQuery.data;

  const allSessions = [
    ...(schedule?.upcoming ??
      []),

    ...(schedule?.past ??
      []),
  ];

  const weekSessions =
    allSessions
      .filter(
        (session) =>
          session.program.id ===
            program.id &&
          isThisWeek(
            session.sessionDate
          )
      )
      .sort(
        (a, b) => {
          const dateCompare =
            a.sessionDate.localeCompare(
              b.sessionDate
            );

          if (
            dateCompare !== 0
          ) {
            return dateCompare;
          }

          return (
            a.startTime ??
            ""
          ).localeCompare(
            b.startTime ??
              ""
          );
        }
      );

  const completion =
    Math.min(
      Math.max(
        program.completionPercentage,
        0
      ),
      100
    );

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold text-[#12395B] md:text-4xl">
            My Program
          </h1>

          <p className="mt-2 text-slate-600">
            Track your Club100 training journey, sessions and attendance.
          </p>
        </div>

        {/* Program summary */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#12395B] to-[#2F80ED] p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
              Active Program
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {program.name}
            </h2>

            {(program.startDate ||
              program.endDate) && (
              <p className="mt-2 text-sm text-blue-100">
                {formatDate(
                  program.startDate
                )}
                {" – "}
                {formatDate(
                  program.endDate
                )}
              </p>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-700">
                Week{" "}
                {
                  program.currentWeek
                }{" "}
                of{" "}
                {
                  program.totalWeeks
                }
              </span>

              <span className="font-semibold text-[#2F80ED]">
                {completion}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#2F80ED]"
                style={{
                  width:
                    `${completion}%`,
                }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-[#12395B]">
                  {
                    program.sessionsCompleted
                  }
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Sessions attended
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-[#12395B]">
                  {
                    program.attendancePercentage
                  }
                  %
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Attendance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* This week */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                This Week
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your Club100 sessions for the current week.
              </p>
            </div>

            <Link
              to="/schedule"
              className="shrink-0 text-sm font-semibold text-[#2F80ED]"
            >
              Schedule →
            </Link>
          </div>

          {weekSessions.length >
          0 ? (
            <div className="mt-4 divide-y divide-slate-100">
              {weekSessions.map(
                (session) => (
                  <WeekSessionRow
                    key={
                      session.id
                    }
                    session={
                      session
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 p-5">
              <p className="font-medium text-slate-700">
                No sessions this week
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Check your schedule for your next Club100 session.
              </p>

              <Link
                to="/schedule"
                className="mt-4 inline-block text-sm font-semibold text-[#2F80ED]"
              >
                View Schedule →
              </Link>
            </div>
          )}
        </section>

        {/* Program information */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Program Details
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Program Length
              </p>

              <p className="mt-2 font-medium text-slate-800">
                {
                  program.totalWeeks
                }{" "}
                {program.totalWeeks ===
                1
                  ? "week"
                  : "weeks"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Session Duration
              </p>

              <p className="mt-2 font-medium text-slate-800">
                {
                  program.sessionDurationMinutes ??
                  60
                }{" "}
                minutes
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Started
              </p>

              <p className="mt-2 font-medium text-slate-800">
                {formatDate(
                  program.startDate
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Program Ends
              </p>

              <p className="mt-2 font-medium text-slate-800">
                {formatDate(
                  program.endDate
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Club100 approach */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Club100 Training
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Your Club100 program combines varied training with regular participation and progress tracking to help you build fitness consistently.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "Power",
              "Flow",
              "Pulse",
              "Play",
            ].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#12395B]"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}