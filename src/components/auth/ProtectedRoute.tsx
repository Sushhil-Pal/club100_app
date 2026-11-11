import type { ReactNode } from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { getSessionStatus } from "../../services/authService";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const location = useLocation();

  const sessionQuery = useQuery({
    queryKey: ["auth-session"],
    queryFn: getSessionStatus,

    // Session state should be checked whenever
    // a protected route is entered.
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

  // A failed network/server request is not proof that the user logged out.
  // Preserve the current route and allow retry; redirect only on an explicit
  // authenticated:false response from the session-status endpoint.
  if (sessionQuery.isError) {
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-700">Unable to verify your Club100 session. Your session may still be active.</p>
        <button type="button" onClick={() => void sessionQuery.refetch()} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white">Try again</button>
      </div>
    );
  }

  if (!sessionQuery.data?.authenticated) {
    return (
      <Navigate
        to={location.pathname === "/free-trial" ? "/register?next=%2Ffree-trial" : "/login"}
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <>{children}</>;
}