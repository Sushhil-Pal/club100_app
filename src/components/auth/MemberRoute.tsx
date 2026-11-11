import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import {
  getSessionStatus,
} from "../../services/authService";

export default function MemberRoute() {
  const sessionQuery = useQuery({
    queryKey: ["auth-session"],
    queryFn: getSessionStatus,
    staleTime: 0,
    retry: false,
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#12395B]">
            Club
            <span className="text-[#2F80ED]">
              100
            </span>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const session = sessionQuery.data;

  // Transient API errors must not be treated as a confirmed logout.
  if (sessionQuery.isError) {
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-700">Unable to verify your Club100 session. Please retry.</p>
        <button type="button" onClick={() => void sessionQuery.refetch()} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white">Try again</button>
      </div>
    );
  }

  if (!session?.authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const isMember =
    session.roles.includes("member");

  if (!isMember) {
    const isTrainer =
      session.roles.includes("trainer");

    return (
      <Navigate
        to={
          isTrainer
            ? "/trainer"
            : "/login"
        }
        replace
      />
    );
  }

  return <Outlet />;
}