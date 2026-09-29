import { NavLink } from "react-router-dom";

const items = [
  { label: "Home", to: "/dashboard" },
  { label: "Schedule", to: "/schedule" },
  { label: "Progress", to: "/progress" },
  { label: "Program", to: "/program" },
  { label: "Profile", to: "/profile" },
];

export default function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
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