import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getTrainerAssessments,
  type TrainerAssessmentSummary,
} from "../../services/trainerService";

type StatusFilter =
  | ""
  | "Draft"
  | "Completed";

function formatScore(
  value: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return Math.round(value);
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const className =
    status === "Completed"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        className,
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function AssessmentCard({
  assessment,
  onOpen,
}: {
  assessment: TrainerAssessmentSummary;
  onOpen: () => void;
}) {
  const isCompleted =
    assessment.status ===
    "Completed";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-[#12395B]">
              {
                assessment.member
                  .fullName
              }
            </h3>

            <StatusBadge
              status={
                assessment.status
              }
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>
              {
                assessment.assessmentType
              }
            </span>

            <span>
              {
                assessment.assessmentDate
              }
            </span>

            <span>
              {
                assessment.deliveryMode
              }
            </span>
          </div>

          {assessment.member
            .mobile && (
            <p className="mt-2 text-sm text-slate-500">
              {
                assessment.member
                  .mobile
              }
            </p>
          )}

          <p className="mt-2 text-xs text-slate-400">
            {assessment.id}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {isCompleted && (
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Fitness Score
              </p>

              <p className="mt-1 text-2xl font-bold text-[#12395B]">
                {formatScore(
                  assessment.fitnessScore
                )}
              </p>

              {assessment.fitnessLevel && (
                <p className="mt-1 text-xs text-slate-500">
                  {
                    assessment.fitnessLevel
                  }
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onOpen}
            className="rounded-xl bg-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F6FD1]"
          >
            {isCompleted
              ? "View Result"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrainerAssessmentsPage() {
  const navigate =
    useNavigate();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] =
    useState<StatusFilter>(
      ""
    );

  const [
    submittedSearch,
    setSubmittedSearch,
  ] = useState("");

  const assessmentsQuery =
    useQuery({
      queryKey: [
        "trainer-assessments",
        submittedSearch,
        status,
      ],

      queryFn: () =>
        getTrainerAssessments(
          submittedSearch,
          status
        ),
    });

  const assessments =
    assessmentsQuery.data ??
    [];

  const draftCount =
    useMemo(
      () =>
        assessments.filter(
          (assessment) =>
            assessment.status ===
            "Draft"
        ).length,
      [assessments]
    );

  const completedCount =
    useMemo(
      () =>
        assessments.filter(
          (assessment) =>
            assessment.status ===
            "Completed"
        ).length,
      [assessments]
    );

  function handleSearchSubmit(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmittedSearch(
      search.trim()
    );
  }

  function openAssessment(
    assessment:
      TrainerAssessmentSummary
  ) {
    if (
      assessment.status ===
      "Completed"
    ) {
      navigate(
        `/trainer/assessment/${assessment.id}/result`
      );

      return;
    }

    navigate(
      `/trainer/assessment/${assessment.id}`
    );
  }

  return (
    <div>
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#12395B]">
            Assessments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Continue drafts or
            review completed
            assessments.
          </p>
        </div>
      </div>

      {/* Filters */}

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <form
          onSubmit={
            handleSearchSubmit
          }
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search member, mobile or assessment ID"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#2F80ED]"
          />

          <button
            type="submit"
            className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1]"
          >
            Search
          </button>
        </form>

        {/* Status tabs */}

        <div className="mt-4 flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() =>
              setStatus("")
            }
            className={[
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              status === ""
                ? "bg-[#12395B] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            All
          </button>

          <button
            type="button"
            onClick={() =>
              setStatus("Draft")
            }
            className={[
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              status === "Draft"
                ? "bg-[#12395B] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            Draft
          </button>

          <button
            type="button"
            onClick={() =>
              setStatus(
                "Completed"
              )
            }
            className={[
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              status ===
              "Completed"
                ? "bg-[#12395B] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Summary */}

      {!assessmentsQuery
        .isLoading &&
        !assessmentsQuery
          .isError &&
        status === "" &&
        !submittedSearch && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Draft
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-900">
                {draftCount}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                Completed
              </p>

              <p className="mt-1 text-2xl font-bold text-green-900">
                {
                  completedCount
                }
              </p>
            </div>
          </div>
        )}

      {/* Loading */}

      {assessmentsQuery
        .isLoading && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Loading
            assessments...
          </p>
        </div>
      )}

      {/* Error */}

      {assessmentsQuery
        .isError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">
            We couldn&apos;t
            load assessments.
          </p>

          {assessmentsQuery
            .error instanceof
            Error && (
            <p className="mt-2 text-sm text-red-700">
              {
                assessmentsQuery
                  .error.message
              }
            </p>
          )}
        </div>
      )}

      {/* Empty */}

      {!assessmentsQuery
        .isLoading &&
        !assessmentsQuery
          .isError &&
        assessments.length ===
          0 && (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="font-semibold text-slate-800">
              No assessments
              found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {submittedSearch
                ? "Try a different member name, mobile number or assessment ID."
                : status
                  ? `There are no ${status.toLowerCase()} assessments yet.`
                  : "Assessments started by you will appear here."}
            </p>
          </div>
        )}

      {/* Results */}

      {!assessmentsQuery
        .isLoading &&
        !assessmentsQuery
          .isError &&
        assessments.length >
          0 && (
          <div className="mt-6 space-y-4">
            {assessments.map(
              (
                assessment
              ) => (
                <AssessmentCard
                  key={
                    assessment.id
                  }
                  assessment={
                    assessment
                  }
                  onOpen={() =>
                    openAssessment(
                      assessment
                    )
                  }
                />
              )
            )}
          </div>
        )}
    </div>
  );
}