import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMembershipNavigation } from "../navigation/useMembershipNavigation";

type Props = { children: ReactNode };

export default function MembershipRequiredRoute({ children }: Props) {
  const query = useMembershipNavigation();
  if (query.isPending) {
    return <div className="p-6 text-slate-600">Checking membership...</div>;
  }
  if (query.isError) {
    return (
      <div className="p-6 text-red-700" role="alert">
        Unable to verify your membership. Please try again.
        <button type="button" onClick={() => void query.refetch()} className="ml-3 underline">Retry</button>
      </div>
    );
  }
  if (!query.data) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
