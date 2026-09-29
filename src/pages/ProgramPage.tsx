import { useQuery } from "@tanstack/react-query";

import PageContainer from "../components/layout/PageContainer";
import { getCurrentProgram } from "../services/programService";

const weekSessions = [
  { day: "Mon", type: "Power", status: "Completed" },
  { day: "Wed", type: "Flow", status: "Completed" },
  { day: "Fri", type: "Pulse", status: "Upcoming" },
  { day: "Sun", type: "Play", status: "Upcoming" },
];

export default function ProgramPage() {
  const programQuery = useQuery({
    queryKey: ["current-program"],
    queryFn: getCurrentProgram,
  });

  if (programQuery.isLoading) {
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

  if (programQuery.isError) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="font-medium text-red-600">
            We couldn&apos;t load your program.
          </p>
        </div>
      </PageContainer>
    );
  }

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
                    You&apos;re registered with Club100. Once a program is assigned
                    to you, your schedule and program details will appear here.
                </p>
                </section>
            </div>
            </PageContainer>
        );
    }


  const program = programQuery.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#12395B] md:text-4xl">
            My Program
          </h1>

          <p className="mt-2 text-slate-600">
            Track your progress through the Club100 fitness journey.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#12395B] to-[#2F80ED] p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
              Active Program
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {program.name}
            </h2>

            <p className="mt-2 text-sm text-blue-100">
              {program.startDate} – {program.endDate}
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                Week {program.currentWeek} of {program.totalWeeks}
              </span>

              <span className="font-semibold text-[#2F80ED]">
                {program.completionPercentage}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#2F80ED]"
                style={{
                  width: `${program.completionPercentage}%`,
                }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-[#12395B]">
                  {program.sessionsCompleted}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Sessions completed
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-[#12395B]">
                  {program.attendancePercentage}%
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Attendance
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            This Week
          </h2>

          <div className="mt-5 divide-y divide-slate-100">
            {weekSessions.map((session) => (
              <div
                key={`${session.day}-${session.type}`}
                className="flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 text-sm font-semibold text-slate-500">
                    {session.day}
                  </div>

                  <p className="font-semibold text-slate-800">
                    {session.type}
                  </p>
                </div>

                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    session.status === "Completed"
                      ? "bg-green-50 text-green-700"
                      : "bg-blue-50 text-[#2F80ED]",
                  ].join(" ")}
                >
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            About This Program
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            A structured fitness program designed to improve strength,
            mobility, endurance and overall fitness through varied training
            and regular progress tracking.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Training Format
              </p>

              <p className="mt-2 font-medium text-slate-800">
                Power • Flow • Pulse • Play
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Session Duration
              </p>

              <p className="mt-2 font-medium text-slate-800">
                60 minutes
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}