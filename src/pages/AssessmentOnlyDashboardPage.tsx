import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import {
  getCurrentMember,
  getFreeAssessmentContext,
} from "../services/memberService";

// No active enrollment: show the one-time free baseline assessment journey.
export default function AssessmentOnlyDashboardPage() {
  const memberQuery = useQuery({
    queryKey: ["current-member"],
    queryFn: getCurrentMember,
  });
  const assessmentQuery = useQuery({
    queryKey: ["free-assessment-context"],
    queryFn: getFreeAssessmentContext,
  });

  if (memberQuery.isPending || assessmentQuery.isPending) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
          Loading your fitness journey...
        </div>
      </PageContainer>
    );
  }

  if (memberQuery.isError || assessmentQuery.isError) {
    return (
      <PageContainer>
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          We couldn't load your free assessment. Please refresh and try again.
        </section>
      </PageContainer>
    );
  }

  const context = assessmentQuery.data;
  const firstName = memberQuery.data?.fullName?.trim().split(/\s+/)[0] || "Member";
  const resultId = context?.latestAssessment?.id;
  const isDraft = context?.state === "Draft" && Boolean(context.draftAssessmentId);
  const hasResult = Boolean(resultId);
  const nextPath = isDraft
    ? `/free-assessment/${context?.draftAssessmentId}`
    : "/free-assessment";

  return (
    <PageContainer>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2F80ED]">
            Welcome to Club100
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#12395B]">
            Hello, {firstName}.
          </h1>
          <p className="mt-2 text-slate-600">
            Discover your starting point and build your fitness journey.
          </p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2F80ED]">
            Free Fitness Assessment
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {hasResult ? "Your Fitness Score is ready" : isDraft ? "Continue your assessment" : "Discover your Fitness Score"}
          </h2>
          <p className="mt-3 text-slate-600">
            {hasResult
              ? "Review your baseline results and explore programs to support your goals."
              : isDraft
                ? "Your answers are saved. Pick up where you left off."
                : "Complete your free baseline assessment. No membership purchase or trial activation is required."}
          </p>

          {hasResult && context?.latestAssessment?.fitnessScore != null && (
            <p className="mt-4 text-3xl font-bold text-[#12395B]">
              {context.latestAssessment.fitnessScore}
              <span className="ml-2 text-sm font-normal text-slate-500">Club100 Fitness Score</span>
            </p>
          )}

          {hasResult ? (
            <Link className="mt-5 inline-flex rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white" to={`/progress/${resultId}`}>
              View My Fitness Score
            </Link>
          ) : context?.allowed ? (
            <Link className="mt-5 inline-flex rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white" to={nextPath}>
              {isDraft ? "Resume Free Assessment" : "Start Free Assessment"}
            </Link>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              {context?.reason || "Free Assessment is not currently available."}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2F80ED]">14-day free trial</p>
          <h2 className="mt-2 text-xl font-bold text-[#12395B]">Try Club100 Self workouts for free</h2>
          <p className="mt-2 text-slate-600">Explore guided Self workouts for 14 days. No payment details required. Available once per member, subject to eligibility.</p>
          <Link className="mt-4 inline-flex rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white" to="/free-trial">Explore Free Trial</Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-bold text-[#12395B]">Explore Club100 fitness programs</h2>
          <p className="mt-2 text-slate-600">
            Ready for structured workouts? Explore Everyday Fitness, Weight Management and other Club100 offerings.
          </p>
          <a className="mt-4 inline-flex rounded-xl border border-[#2F80ED] px-5 py-3 font-semibold text-[#2F80ED]" href="https://club100.fit/ways-to-train" target="_blank" rel="noopener noreferrer">
            Explore Memberships
          </a>
        </section>
      </div>
    </PageContainer>
  );
}
