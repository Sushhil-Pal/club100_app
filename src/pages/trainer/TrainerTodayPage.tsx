export default function TrainerTodayPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Today
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Your Club100 activity for today.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Sessions Today
          </p>

          <p className="mt-2 text-3xl font-bold text-[#12395B]">
            0
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Assessments Pending
          </p>

          <p className="mt-2 text-3xl font-bold text-[#12395B]">
            0
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Assessments In Progress
          </p>

          <p className="mt-2 text-3xl font-bold text-[#12395B]">
            0
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Quick Actions
        </h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-xl bg-[#2F80ED] px-4 py-3 font-semibold text-white hover:bg-[#1F6FD1]">
            Find Member
          </button>

          <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">
            Start Assessment
          </button>
        </div>
      </div>
    </div>
  );
}