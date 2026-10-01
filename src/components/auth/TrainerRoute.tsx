import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import {
  getSessionStatus,
} from "../../services/authService";

export default function TrainerRoute() {
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

  if (
    sessionQuery.isError ||
    !session?.authenticated
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const isTrainer =
    session.roles.includes("trainer");

  if (!isTrainer) {
    const isMember =
      session.roles.includes("member");

    return (
      <Navigate
        to={
          isMember
            ? "/dashboard"
            : "/login"
        }
        replace
      />
    );
  }

  return <Outlet />;
}