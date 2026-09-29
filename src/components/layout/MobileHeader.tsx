export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-[#12395B]">
          Club<span className="text-[#2F80ED]">100</span>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
          SP
        </div>
      </div>
    </header>
  );
}