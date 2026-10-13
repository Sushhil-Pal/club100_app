import {
  Link,
} from "react-router-dom";

import type {
  MemberAssessmentContext,
} from "../../services/memberService";

function formatAssessmentDate(
  value: string | null | undefined
) {
  if (!value) {
    return null;
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

export default function AssessmentJourneyCard({
  context,
  heading = "Fitness Assessment",
}: {
  context: MemberAssessmentContext;
  heading?: string;
}) {
  if (!context.allowed) {
    return null;
  }

  const state =
    context.state ??
    "Not Started";

  const assessmentType =
    context.assessmentType ??
    "Baseline";

  const latest =
    context.latestAssessment ??
    null;

  const draftPath =
    context.draftAssessmentId
      ? `/assessment/${context.draftAssessmentId}`
      : "/assessment";

  const nextDue =
    formatAssessmentDate(
      context.nextAssessmentDueOn
    );

  if (state === "Draft") {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {heading}
        </p>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">
          {assessmentType} assessment in progress
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Continue where you left off. Your saved measurements are waiting for you.
        </p>

        <Link
          to={draftPath}
          className="mt-5 inline-flex rounded-xl bg-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F6FD1]"
        >
          Resume Assessment
        </Link>
      </section>
    );
  }

  if (state === "Not Started") {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {heading}
        </p>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">
          Complete your baseline assessment
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Establish your starting Club100 Fitness Score so you can measure progress over time.
        </p>

        <Link
          to="/assessment"
          className="mt-5 inline-flex rounded-xl bg-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F6FD1]"
        >
          Start Assessment
        </Link>
      </section>
    );
  }

  if (state === "Due") {
    return (
      <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#2F80ED]">
          {heading}
        </p>

        <h2 className="mt-3 text-xl font-semibold text-slate-900">
          Your reassessment is due
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Measure your fitness again and compare it with your previous assessment.
        </p>

        {nextDue && (
          <p className="mt-3 text-sm font-medium text-[#12395B]">
            Due {nextDue}
          </p>
        )}

        <Link
          to="/assessment"
          className="mt-5 inline-flex rounded-xl bg-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F6FD1]"
        >
          Start Reassessment
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {heading}
      </p>

      {latest ? (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <span className="text-5xl font-bold text-[#12395B]">
              {latest.fitnessScore ??
                "—"}
            </span>

            {latest.fitnessLevel && (
              <span className="mb-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#2F80ED]">
                {latest.fitnessLevel}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {latest.type} ·{" "}
            {formatAssessmentDate(
              latest.date
            )}
          </p>

          {nextDue && (
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Next reassessment
              </p>

              <p className="mt-1 font-semibold text-[#12395B]">
                {nextDue}
              </p>
            </div>
          )}

          <Link
            to={`/progress/${latest.id}`}
            className="mt-5 inline-flex text-sm font-semibold text-[#2F80ED]"
          >
            View Assessment Result →
          </Link>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Your assessment status is available from the assessment page.
        </p>
      )}
    </section>
  );
}
