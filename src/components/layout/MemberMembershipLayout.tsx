import { Outlet } from "react-router-dom";
import { MembershipProvider } from "../../context/MembershipContext";

export default function MemberMembershipLayout() {
  return (
    <MembershipProvider>
      <Outlet />
    </MembershipProvider>
  );
}
