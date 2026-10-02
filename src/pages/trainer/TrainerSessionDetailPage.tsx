import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cancelTrainerSession,
  completeTrainerSession,
  getTrainerSessionDetail,
  saveTrainerSessionAttendance,
  startTrainerSession,
  type SaveSessionAttendanceInput,
} from "../../services/trainerService";

type AttendanceStatus =
  | ""
  | "Present"
  | "Partial"
  | "Absent";

type AttendanceState = {
  status: AttendanceStatus;
  notes: string;
};

function StatusButton({
  label,
  selected,
  disabled,
  onClick,
}: {
  label:
    | "Present"
    | "Partial"
    | "Absent";

  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const selectedClass =
    label === "Present"
      ? "bg-green-600 text-white border-green-600"
      : label === "Partial"
        ? "bg-amber-500 text-white border-amber-500"
        : "bg-red-500 text-white border-red-500";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-lg border px-3 py-2 text-xs font-semibold transition",
        selected
          ? selectedClass
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function TrainerSessionDetailPage() {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const {
    sessionId,
  } = useParams<{
    sessionId: string;
  }>();

  const [
    attendanceState,
    setAttendanceState,
  ] = useState<
    Record<
      string,
      AttendanceState
    >
  >({});

  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");

  const sessionQuery =
    useQuery({
      queryKey: [
        "trainer-session",
        sessionId,
      ],

      queryFn: () =>
        getTrainerSessionDetail(
          sessionId!
        ),

      enabled:
        !!sessionId,
    });

  useEffect(() => {
    const participants =
      sessionQuery.data
        ?.session
        .participants;

    if (!participants) {
      return;
    }

    const nextState:
      Record<
        string,
        AttendanceState
      > = {};

    for (
      const participant
      of participants
    ) {
      nextState[
        participant.member.id
      ] = {
        status:
          (
            participant
              .attendance
              ?.status ??
            ""
          ) as AttendanceStatus,

        notes:
          participant
            .attendance
            ?.notes ??
          "",
      };
    }

    setAttendanceState(
      nextState
    );
  }, [
    sessionQuery.data,
  ]);

  const participantCount =
    sessionQuery.data
      ?.session
      .participants
      .length ?? 0;

  const markedCount =
    useMemo(() => {
      return Object.values(
        attendanceState
      ).filter(
        (item) =>
          item.status !== ""
      ).length;
    }, [
      attendanceState,
    ]);

  const presentCount =
    useMemo(() => {
      return Object.values(
        attendanceState
      ).filter(
        (item) =>
          item.status ===
          "Present"
      ).length;
    }, [
      attendanceState,
    ]);

  const partialCount =
    useMemo(() => {
      return Object.values(
        attendanceState
      ).filter(
        (item) =>
          item.status ===
          "Partial"
      ).length;
    }, [
      attendanceState,
    ]);

  const absentCount =
    useMemo(() => {
      return Object.values(
        attendanceState
      ).filter(
        (item) =>
          item.status ===
          "Absent"
      ).length;
    }, [
      attendanceState,
    ]);

  const unmarkedCount =
    participantCount -
    markedCount;

  const saveMutation =
    useMutation({
      mutationFn: () => {
        const participants =
          sessionQuery.data
            ?.session
            .participants ??
          [];

        const payload:
          SaveSessionAttendanceInput[] =
          [];

        for (
          const participant
          of participants
        ) {
          const state =
            attendanceState[
              participant
                .member.id
            ];

          if (
            !state ||
            !state.status
          ) {
            continue;
          }

          payload.push({
            memberId:
              participant
                .member.id,

            status:
              state.status,

            notes:
              state.notes.trim(),
          });
        }

        return saveTrainerSessionAttendance(
          sessionId!,
          payload
        );
      },

      onSuccess: async (
        response
      ) => {
        setSaveMessage(
          `${response.saved} attendance record(s) saved.`
        );

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-session",
              sessionId,
            ],
          });

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-sessions",
            ],
          });

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-today",
            ],
          });
      },
    });

  const startMutation =
    useMutation({
      mutationFn: () =>
        startTrainerSession(
          sessionId!
        ),

      onSuccess: async () => {
        setSaveMessage(
          "Session started."
        );

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-session",
              sessionId,
            ],
          });

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-sessions",
            ],
          });

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-today",
            ],
          });
      },
    });

  const cancelMutation =
    useMutation({
      mutationFn: () =>
        cancelTrainerSession(
          sessionId!
        ),

      onSuccess: async () => {
        setSaveMessage(
          "Session cancelled."
        );

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-session",
              sessionId,
            ],
          });

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-sessions",
            ],
          });

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-today",
            ],
          });
      },
    });

  const completeMutation =
    useMutation({
      mutationFn: async () => {
        const participants =
          sessionQuery.data
            ?.session
            .participants ??
          [];

        const payload:
          SaveSessionAttendanceInput[] =
          [];

        for (
          const participant
          of participants
        ) {
          const state =
            attendanceState[
              participant
                .member.id
            ];

          if (
            !state ||
            !state.status
          ) {
            continue;
          }

          payload.push({
            memberId:
              participant
                .member.id,

            status:
              state.status,

            notes:
              state.notes.trim(),
          });
        }

        if (
          payload.length > 0
        ) {
          await saveTrainerSessionAttendance(
            sessionId!,
            payload
          );
        }

        return completeTrainerSession(
          sessionId!
        );
      },

      onSuccess: async () => {
        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-session",
              sessionId,
            ],
          });

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-sessions",
            ],
          });

        await queryClient
          .invalidateQueries({
            queryKey: [
              "trainer-today",
            ],
          });

        navigate(
          "/trainer/sessions"
        );
      },
    });

  if (
    sessionQuery.isLoading
  ) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        Loading session...
      </div>
    );
  }

  if (
    sessionQuery.isError ||
    !sessionQuery.data
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-700">
          We couldn&apos;t load this session.
        </p>

        {sessionQuery.error instanceof
          Error && (
          <p className="mt-2 text-sm text-red-700">
            {
              sessionQuery.error
                .message
            }
          </p>
        )}
      </div>
    );
  }

  const session =
    sessionQuery.data.session;

  const isScheduled =
    session.status ===
    "Scheduled";

  const isLive =
    session.status ===
    "Live";

  const isCompleted =
    session.status ===
    "Completed";

  const isCancelled =
    session.status ===
    "Cancelled";

  const isReadOnly =
    isCompleted ||
    isCancelled;

  const canEditAttendance =
    isLive;

  const anyMutationPending =
    saveMutation.isPending ||
    startMutation.isPending ||
    cancelMutation.isPending ||
    completeMutation.isPending;

  return (
    <div>
      {/* Header */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/trainer/sessions"
            )
          }
          className="text-sm font-semibold text-[#2F80ED]"
        >
          ← Back to Sessions
        </button>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
              {
                session.deliveryMode
              }{" "}
              Session
            </p>

            <h1 className="mt-2 text-2xl font-bold text-[#12395B]">
              {
                session.program
                  .name
              }
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {
                session.cohort
                  .name
              }
            </p>
          </div>

          <span
            className={[
              "self-start rounded-full px-3 py-1.5 text-xs font-semibold",
              isLive
                ? "bg-green-50 text-green-700"
                : isCancelled
                  ? "bg-red-50 text-red-700"
                  : isCompleted
                    ? "bg-blue-50 text-blue-700"
                    : "bg-slate-100 text-slate-700",
            ].join(" ")}
          >
            {
              session.status
            }
          </span>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">
              Date
            </p>

            <p className="mt-1 font-medium">
              {
                session.sessionDate
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Start
            </p>

            <p className="mt-1 font-medium">
              {
                session.startTime ??
                "—"
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              End
            </p>

            <p className="mt-1 font-medium">
              {
                session.endTime ??
                "—"
              }
            </p>
          </div>
        </div>

        {session.meetingUrl && (
          <a
            href={
              session.meetingUrl
            }
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-xl border border-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-[#2F80ED]"
          >
            Open Meeting
          </a>
        )}

        {session.notes && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {
              session.notes
            }
          </div>
        )}
      </div>

      {/* Summary */}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400">
            Participants
          </p>

          <p className="mt-1 text-2xl font-bold text-[#12395B]">
            {
              participantCount
            }
          </p>
        </div>

        <div className="rounded-2xl bg-green-50 p-4">
          <p className="text-xs text-green-700">
            Present
          </p>

          <p className="mt-1 text-2xl font-bold text-green-900">
            {
              presentCount
            }
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-xs text-amber-700">
            Partial
          </p>

          <p className="mt-1 text-2xl font-bold text-amber-900">
            {
              partialCount
            }
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 p-4">
          <p className="text-xs text-red-700">
            Absent
          </p>

          <p className="mt-1 text-2xl font-bold text-red-900">
            {
              absentCount
            }
          </p>
        </div>

        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-xs text-slate-500">
            Unmarked
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-700">
            {
              unmarkedCount
            }
          </p>
        </div>
      </div>

      {/* Attendance */}

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#12395B]">
            Attendance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {isScheduled
              ? "Start the session before recording attendance."
              : isLive
                ? "Mark attendance for each enrolled member."
                : "Attendance for this session."}
          </p>
        </div>

        {session.participants.length ===
          0 && (
          <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
            No participants are enrolled for this session.
          </div>
        )}

        <div className="mt-5 divide-y divide-slate-100">
          {session.participants.map(
            (
              participant
            ) => {
              const memberId =
                participant.member
                  .id;

              const state =
                attendanceState[
                  memberId
                ] ?? {
                  status: "",
                  notes: "",
                };

              return (
                <div
                  key={
                    memberId
                  }
                  className="py-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {
                          participant
                            .member
                            .fullName
                        }
                      </p>

                      {participant
                        .member
                        .mobile && (
                        <p className="mt-1 text-sm text-slate-500">
                          {
                            participant
                              .member
                              .mobile
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <StatusButton
                        label="Present"
                        selected={
                          state.status ===
                          "Present"
                        }
                        disabled={
                          !canEditAttendance ||
                          anyMutationPending
                        }
                        onClick={() => {
                          if (
                            !canEditAttendance
                          ) {
                            return;
                          }

                          setAttendanceState(
                            (
                              current
                            ) => ({
                              ...current,

                              [
                                memberId
                              ]: {
                                ...state,

                                status:
                                  "Present",
                              },
                            })
                          );

                          setSaveMessage(
                            ""
                          );
                        }}
                      />

                      <StatusButton
                        label="Partial"
                        selected={
                          state.status ===
                          "Partial"
                        }
                        disabled={
                          !canEditAttendance ||
                          anyMutationPending
                        }
                        onClick={() => {
                          if (
                            !canEditAttendance
                          ) {
                            return;
                          }

                          setAttendanceState(
                            (
                              current
                            ) => ({
                              ...current,

                              [
                                memberId
                              ]: {
                                ...state,

                                status:
                                  "Partial",
                              },
                            })
                          );

                          setSaveMessage(
                            ""
                          );
                        }}
                      />

                      <StatusButton
                        label="Absent"
                        selected={
                          state.status ===
                          "Absent"
                        }
                        disabled={
                          !canEditAttendance ||
                          anyMutationPending
                        }
                        onClick={() => {
                          if (
                            !canEditAttendance
                          ) {
                            return;
                          }

                          setAttendanceState(
                            (
                              current
                            ) => ({
                              ...current,

                              [
                                memberId
                              ]: {
                                ...state,

                                status:
                                  "Absent",
                              },
                            })
                          );

                          setSaveMessage(
                            ""
                          );
                        }}
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={
                      state.notes
                    }
                    disabled={
                      !canEditAttendance ||
                      anyMutationPending
                    }
                    onChange={(
                      event
                    ) => {
                      setAttendanceState(
                        (
                          current
                        ) => ({
                          ...current,

                          [
                            memberId
                          ]: {
                            ...state,

                            notes:
                              event
                                .target
                                .value,
                          },
                        })
                      );

                      setSaveMessage(
                        ""
                      );
                    }}
                    placeholder="Optional attendance note"
                    className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#2F80ED] disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* Errors */}

      {saveMutation.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {saveMutation
            .error instanceof
          Error
            ? saveMutation
                .error.message
            : "Attendance could not be saved."}
        </div>
      )}

      {startMutation.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {startMutation
            .error instanceof
          Error
            ? startMutation
                .error.message
            : "Session could not be started."}
        </div>
      )}

      {cancelMutation.isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {cancelMutation
            .error instanceof
          Error
            ? cancelMutation
                .error.message
            : "Session could not be cancelled."}
        </div>
      )}

      {completeMutation
        .isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {completeMutation
            .error instanceof
          Error
            ? completeMutation
                .error.message
            : "Session could not be completed."}
        </div>
      )}

      {saveMessage && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {
            saveMessage
          }
        </div>
      )}

      {/* Actions */}

      {!isReadOnly && (
        <div className="sticky bottom-16 mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:bottom-4">
          {/* Scheduled */}

          {isScheduled && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Start the session to begin recording attendance.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={
                    startMutation
                      .isPending ||
                    cancelMutation
                      .isPending
                  }
                  onClick={() => {
                    const confirmed =
                      window.confirm(
                        "Cancel this session?"
                      );

                    if (!confirmed) {
                      return;
                    }

                    setSaveMessage(
                      ""
                    );

                    cancelMutation
                      .mutate();
                  }}
                  className="rounded-xl border border-red-300 bg-white px-5 py-3 font-semibold text-red-600 disabled:opacity-50"
                >
                  {cancelMutation
                    .isPending
                    ? "Cancelling..."
                    : "Cancel Session"}
                </button>

                <button
                  type="button"
                  disabled={
                    startMutation
                      .isPending ||
                    cancelMutation
                      .isPending
                  }
                  onClick={() => {
                    setSaveMessage(
                      ""
                    );

                    startMutation
                      .mutate();
                  }}
                  className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {startMutation
                    .isPending
                    ? "Starting..."
                    : "Start Session"}
                </button>
              </div>
            </div>
          )}

          {/* Live */}

          {isLive && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {unmarkedCount > 0
                  ? `${unmarkedCount} participant(s) still unmarked`
                  : "Attendance complete"}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={
                    cancelMutation
                      .isPending ||
                    saveMutation
                      .isPending ||
                    completeMutation
                      .isPending
                  }
                  onClick={() => {
                    const confirmed =
                      window.confirm(
                        "Cancel this session?"
                      );

                    if (!confirmed) {
                      return;
                    }

                    setSaveMessage(
                      ""
                    );

                    cancelMutation
                      .mutate();
                  }}
                  className="rounded-xl border border-red-300 bg-white px-5 py-3 font-semibold text-red-600 disabled:opacity-50"
                >
                  {cancelMutation
                    .isPending
                    ? "Cancelling..."
                    : "Cancel Session"}
                </button>

                <button
                  type="button"
                  disabled={
                    saveMutation
                      .isPending ||
                    completeMutation
                      .isPending ||
                    cancelMutation
                      .isPending
                  }
                  onClick={() => {
                    setSaveMessage(
                      ""
                    );

                    saveMutation
                      .mutate();
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 disabled:opacity-50"
                >
                  {saveMutation
                    .isPending
                    ? "Saving..."
                    : "Save Attendance"}
                </button>

                <button
                  type="button"
                  disabled={
                    completeMutation
                      .isPending ||
                    saveMutation
                      .isPending ||
                    cancelMutation
                      .isPending ||
                    unmarkedCount > 0
                  }
                  onClick={() => {
                    setSaveMessage(
                      ""
                    );

                    completeMutation
                      .mutate();
                  }}
                  className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {completeMutation
                    .isPending
                    ? "Completing..."
                    : "Complete Session"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Read-only status */}

      {isCompleted && (
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          This session has been completed. Attendance is read-only.
        </div>
      )}

      {isCancelled && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          This session has been cancelled.
        </div>
      )}
    </div>
  );
}