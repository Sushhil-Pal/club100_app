import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getTrainerSessions,
} from "../../services/trainerService";

type StatusFilter =
  | ""
  | "Scheduled"
  | "Live"
  | "Completed";

export default function TrainerSessionsPage() {
  const navigate =
    useNavigate();

  const [
    status,
    setStatus,
  ] =
    useState<StatusFilter>(
      ""
    );

  const sessionsQuery =
    useQuery({
      queryKey: [
        "trainer-sessions",
        status,
      ],

      queryFn: () =>
        getTrainerSessions(
          status
        ),
    });

  const sessions =
    sessionsQuery.data ??
    [];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-[#12395B]">
          Sessions
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your sessions and
          manage attendance.
        </p>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {[
          ["", "All"],
          [
            "Scheduled",
            "Scheduled",
          ],
          ["Live", "Live"],
          [
            "Completed",
            "Completed",
          ],
        ].map(
          ([
            value,
            label,
          ]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setStatus(
                  value as StatusFilter
                )
              }
              className={[
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold",
                status === value
                  ? "bg-[#12395B] text-white"
                  : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {label}
            </button>
          )
        )}
      </div>

      {sessionsQuery.isLoading && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          Loading sessions...
        </div>
      )}

      {sessionsQuery.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          We couldn&apos;t load
          sessions.
        </div>
      )}

      {!sessionsQuery.isLoading &&
        !sessionsQuery.isError &&
        sessions.length === 0 && (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-slate-800">
              No sessions found
            </p>
          </div>
        )}

      <div className="mt-6 space-y-4">
        {sessions.map(
          (session) => (
            <button
              key={
                session.id
              }
              type="button"
              onClick={() =>
                navigate(
                  `/trainer/session/${session.id}`
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#2F80ED]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-[#12395B]">
                    {
                      session.program
                        .name
                    }
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      session.cohort
                        .name
                    }
                  </p>

                  <p className="mt-3 text-sm text-slate-600">
                    {
                      session.sessionDate
                    }

                    {session.startTime &&
                      ` • ${session.startTime}`}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      session.deliveryMode
                    }
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {
                    session.status
                  }
                </span>
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );
}