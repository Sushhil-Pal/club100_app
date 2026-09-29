import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import PageContainer from "../components/layout/PageContainer";
import { getUpcomingSessions } from "../services/scheduleService";

export default function SchedulePage() {
  const sessionsQuery = useQuery({
    queryKey: ["upcoming-sessions"],
    queryFn: getUpcomingSessions,
  });

  if (sessionsQuery.isLoading) {
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

  if (sessionsQuery.isError) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="font-medium text-red-600">
            We couldn&apos;t load your schedule.
          </p>
        </div>
      </PageContainer>
    );
  }

  const sessions = sessionsQuery.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#12395B] md:text-4xl">
            Schedule
          </h1>

          <p className="mt-2 text-slate-600">
            View and join your upcoming Club100 sessions.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1">
          <button className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#2F80ED] shadow-sm">
            Upcoming
          </button>

          <button className="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-slate-500">
            Past
          </button>
        </div>

        {sessions.length === 0 ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-slate-500">
              You don&apos;t have any upcoming sessions.
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => {
              const isNextSession = index === 0;

              return (
                <section
                  key={session.id}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">
                        {session.date}
                      </p>

                      <h2 className="mt-2 text-xl font-semibold text-slate-900">
                        {session.title}
                      </h2>

                      <p className="mt-1 text-slate-600">
                        {session.subtitle}
                      </p>

                      <div className="mt-3 space-y-1 text-sm text-slate-500">
                        <p>
                          {session.startTime} – {session.endTime}
                        </p>

                        <p>
                          Trainer: {session.trainer}
                        </p>

                        <p>
                          Level: {session.level}
                        </p>
                      </div>
                    </div>

                    <div className="sm:min-w-40">
                      {isNextSession ? (
                        <Link
                          to={`/session/${session.id}`}
                          className="block w-full rounded-xl bg-[#2F80ED] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#1F6FD1]"
                        >
                          Join Session
                        </Link>
                      ) : (
                        <button className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600">
                          Add to Calendar
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}