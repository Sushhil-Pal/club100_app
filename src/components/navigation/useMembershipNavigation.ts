import { useQuery } from "@tanstack/react-query";
import { useMembershipSelection } from "../../context/MembershipContext";
import { getCurrentProgram } from "../../services/programService";

export const enrolledNavItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Schedule", to: "/schedule" },
  { label: "Assessments", to: "/assessment" },
  { label: "Progress", to: "/progress" },
  { label: "Profile", to: "/profile" },
];

export const freeNavItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Assessments", to: "/free-assessment" },
  { label: "Profile", to: "/profile" },
];

export function useMembershipNavigation() {
  const selection=useMembershipSelection();
  const query = useQuery({
    queryKey: ["current-program",selection.selectedEnrollmentId],
    queryFn: ()=>getCurrentProgram(selection.selectedEnrollmentId),
    enabled: !selection.loading && !selection.error,
  });
  // Fail closed while membership status is unresolved; never label a
  // failed membership request as an assessment-only member.
  const items = query.isSuccess && query.data ? enrolledNavItems :
    query.isSuccess ? freeNavItems : [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Profile", to: "/profile" },
    ];
  return { ...query, isPending:selection.loading||query.isPending, isError:selection.error||query.isError, items };
}
