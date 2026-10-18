import { NavLink } from "react-router-dom";

import { useMembershipNavigation } from "./useMembershipNavigation";

export default function BottomNavigation() {
  const { items } = useMembershipNavigation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white md:hidden">
      <div className="mx-auto grid max-w-md"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "px-2 py-3 text-center text-xs font-medium",
                isActive ? "text-[#2F80ED]" : "text-slate-500",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}