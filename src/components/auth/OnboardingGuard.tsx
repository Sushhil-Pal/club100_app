import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getCurrentMember } from "../../services/memberService";

export default function OnboardingGuard() {
  const memberQuery = useQuery({
    queryKey: ["current-member"],
    queryFn: getCurrentMember,
  });

  if (memberQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-slate-500">
              Loading your Club100 account...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (
    memberQuery.isError ||
    !memberQuery.data
  ) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="font-medium text-red-600">
              We couldn&apos;t load your Club100 profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const member = memberQuery.data;

  if (
    member.onboardingStatus !==
    "Completed"
  ) {
    return (
      <Navigate
        to="/onboarding"
        replace
      />
    );
  }

  return <Outlet />;
}