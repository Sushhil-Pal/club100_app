import { NavLink } from "react-router-dom";

const items = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Schedule", to: "/schedule" },
  { label: "Progress", to: "/progress" },
  { label: "Program", to: "/program" },
  { label: "Profile", to: "/profile" },
];

export default function DesktopSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white p-6 md:block">
      <div className="mb-8 text-2xl font-bold text-[#12395B]">
        Club<span className="text-[#2F80ED]">100</span>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "block rounded-xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-blue-50 text-[#2F80ED]"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}