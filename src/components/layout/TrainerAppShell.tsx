import {
  NavLink,
  Outlet,
} from "react-router-dom";

import InstallAppBanner from "../pwa/InstallAppBanner";

function navClass({
  isActive,
}: {
  isActive: boolean;
}) {
  return [
    "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition",
    isActive
      ? "text-[#2F80ED]"
      : "text-slate-500 hover:text-slate-800",
  ].join(" ");
}

export default function TrainerAppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ============================================
          Trainer Header
      ============================================ */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-xl font-bold text-[#12395B]">
              Club
              <span className="text-[#2F80ED]">
                100
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Trainer
            </p>
          </div>
        </div>
      </header>

      {/* ============================================
          Main Content
      ============================================ */}

      <main className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-5 md:px-8 md:pb-8">
        <InstallAppBanner />

        <Outlet />
      </main>

      {/* ============================================
          Mobile Trainer Navigation
      ============================================ */}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white md:hidden">
        <div className="mx-auto flex max-w-6xl">
          <NavLink
            to="/trainer"
            end
            className={
              navClass
            }
          >
            <span className="text-lg">
              ◉
            </span>

            <span>
              Today
            </span>
          </NavLink>

          <NavLink
            to="/trainer/members"
            className={
              navClass
            }
          >
            <span className="text-lg">
              ◎
            </span>

            <span>
              Members
            </span>
          </NavLink>

          <NavLink
            to="/trainer/assessments"
            className={
              navClass
            }
          >
            <span className="text-lg">
              ◫
            </span>

            <span>
              Assessments
            </span>
          </NavLink>

          <NavLink
            to="/trainer/sessions"
            className={
              navClass
            }
          >
            <span className="text-lg">
              ◩
            </span>

            <span>
              Sessions
            </span>
          </NavLink>

          <NavLink
            to="/trainer/profile"
            className={
              navClass
            }
          >
            <span className="text-lg">
              ◯
            </span>

            <span>
              Profile
            </span>
          </NavLink>
        </div>
      </nav>

      {/* ============================================
          Desktop Trainer Navigation
      ============================================ */}

      <nav className="fixed left-0 top-[73px] hidden h-[calc(100vh-73px)] w-56 border-r border-slate-200 bg-white p-4 md:block">
        <div className="space-y-2">
          <NavLink
            to="/trainer"
            end
            className={({
              isActive,
            }) =>
              [
                "block rounded-xl px-4 py-3 text-sm font-medium",
                isActive
                  ? "bg-[#EAF4FC] text-[#2F80ED]"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")
            }
          >
            Today
          </NavLink>

          <NavLink
            to="/trainer/members"
            className={({
              isActive,
            }) =>
              [
                "block rounded-xl px-4 py-3 text-sm font-medium",
                isActive
                  ? "bg-[#EAF4FC] text-[#2F80ED]"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")
            }
          >
            Members
          </NavLink>

          <NavLink
            to="/trainer/assessments"
            className={({
              isActive,
            }) =>
              [
                "block rounded-xl px-4 py-3 text-sm font-medium",
                isActive
                  ? "bg-[#EAF4FC] text-[#2F80ED]"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")
            }
          >
            Assessments
          </NavLink>

          <NavLink
            to="/trainer/sessions"
            className={({
              isActive,
            }) =>
              [
                "block rounded-xl px-4 py-3 text-sm font-medium",
                isActive
                  ? "bg-[#EAF4FC] text-[#2F80ED]"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")
            }
          >
            Sessions
          </NavLink>

          <NavLink
            to="/trainer/profile"
            className={({
              isActive,
            }) =>
              [
                "block rounded-xl px-4 py-3 text-sm font-medium",
                isActive
                  ? "bg-[#EAF4FC] text-[#2F80ED]"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")
            }
          >
            Profile
          </NavLink>
        </div>
      </nav>
    </div>
  );
}