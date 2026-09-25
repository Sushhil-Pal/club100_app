export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-[#12395B]">
          Club100
        </h1>

        <p className="mt-2 text-slate-600">
          Know Your Fitness. Improve It. Measure the Progress.
        </p>

        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Next Session</p>
          <h2 className="mt-1 text-xl font-semibold">Power</h2>
          <p className="mt-1 text-slate-600">
            Today • 7:00 AM
          </p>

          <button className="mt-5 w-full rounded-xl bg-[#2F80ED] px-4 py-3 font-medium text-white">
            Join Session
          </button>
        </div>
      </div>
    </main>
  );
}