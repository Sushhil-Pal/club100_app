import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import { formatInr, getMyWallet } from "../services/walletService";
import { getMyWalletActivity } from "../services/memberInsightsService";
import { nextWalletExpiry } from "../utils/walletInsights";

function dateLabel(value: string | null): string {
  if (!value) return "Lifetime";
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? value
    : parsed.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}
function dateTimeLabel(value: string): string {
  const iso = value.replace(" ", "T");
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? value
    : d.toLocaleString("en-IN", {day:"numeric", month:"short", year:"numeric", hour:"numeric", minute:"2-digit"});
}

export default function MyWalletPage() {
  const [activityPage, setActivityPage] = useState(1);
  const query = useQuery({queryKey:["my-wallet"], queryFn:getMyWallet,
    staleTime:0, refetchOnWindowFocus:true, retry:false});
  const activity = useQuery({queryKey:["my-wallet-activity",activityPage],
    queryFn:() => getMyWalletActivity(activityPage), staleTime:0, retry:false});
  const upcoming = query.data ? nextWalletExpiry(query.data.grants) : null;
  function refresh() { void query.refetch(); void activity.refetch(); }
  return (
    <PageContainer>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-3xl font-bold text-[#12395B]">My Wallet</h1>
            <p className="mt-1 text-sm text-slate-600">Your available Club100 credits</p></div>
          <button type="button" onClick={refresh} className="rounded-xl border border-blue-200 px-3 py-2 text-sm font-semibold text-[#2F80ED]">Refresh</button>
        </div>
        {query.isPending && <section className="rounded-2xl bg-white p-6 text-slate-500">Loading wallet…</section>}
        {query.isError && <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Unable to load your wallet. Retry using Refresh.</section>}
        {query.data && <>
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Available to spend</p>
            <p className="mt-2 text-4xl font-bold text-[#12395B]">{formatInr(query.data.available)}</p>
            <p className="mt-2 text-sm text-slate-500">Wallet status: {query.data.wallet_status}</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(["Corporate", "Referral", "Promotion"] as const).map(source => <div key={source} className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{source}</p><p className="mt-1 text-xl font-semibold">{formatInr(query.data.by_source[source])}</p>
              </div>)}
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <p>Reserved: <strong>{formatInr(query.data.reserved)}</strong></p>
              <p>Expired unused: <strong>{formatInr(query.data.expired_unspent)}</strong></p>
              <p>Future credits: <strong>{formatInr(query.data.future_unvested)}</strong></p>
            </div>
            {upcoming && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4" role="status">
              <p className="text-sm font-semibold text-amber-900">Next credit expiry: {dateLabel(upcoming.date)}</p>
              <p className="mt-1 text-sm text-amber-900">{formatInr(upcoming.amount)} currently available · {upcoming.sources.join(" + ")} credits</p>
              <p className="mt-1 text-xs text-amber-800">These credits remain usable through the expiry date. Checkout reservations or purchases can change this amount.</p>
            </div>}
          </section>
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#12395B]">Credit allocations</h2>
            {query.data.grants.length === 0 ? <p className="mt-3 text-sm text-slate-500">No credit allocations yet.</p>
              : <div className="mt-4 space-y-3">{query.data.grants.map(grant => (
                <div key={grant.grant} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div><p className="font-semibold text-slate-900">{grant.source} credits</p>
                      <p className="mt-1 text-xs text-slate-500">{grant.validity === "Lifetime" ? "Lifetime validity" : `Valid until ${dateLabel(grant.expires_on)}`}</p></div>
                    <p className="font-semibold">{formatInr(grant.spendable_remaining)} available</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">Remaining: {formatInr(grant.remaining)} · Reserved: {formatInr(grant.reserved)}</p>
                  {!grant.spendable && Number(grant.remaining) > 0 && <p className="mt-1 text-xs text-amber-700">Not currently spendable</p>}
                </div>))}</div>}
          </section>
        </>}
        <section className="rounded-2xl bg-white p-6 shadow-sm" aria-label="Wallet transaction history">
          <h2 className="text-xl font-semibold text-[#12395B]">Transaction history</h2>
          <p className="mt-1 text-xs text-slate-500">Your recent credits, membership purchases and wallet refunds. Most recent first.</p>
          {activity.isPending ? <p className="mt-4 text-sm text-slate-500">Loading transactions…</p> :
            activity.isError ? <p role="alert" className="mt-4 text-sm text-red-700">Unable to load transactions. <button className="underline" onClick={() => void activity.refetch()} type="button">Retry</button></p> :
            (activity.data?.entries.length ?? 0) === 0 ? <p className="mt-4 text-sm text-slate-500">No wallet transactions on this page.</p> :
            <div className="mt-4 divide-y divide-slate-100">{(activity.data?.entries ?? []).map(entry => {
              const positive = Number(entry.amount) > 0;
              return <div key={entry.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div><p className="text-sm font-semibold text-slate-900">{entry.description}</p>
                  <p className="mt-1 text-xs text-slate-500">{dateTimeLabel(entry.created_at)}{entry.enrollment ? ` · ${entry.enrollment}` : ""}</p></div>
                <span className={`font-semibold ${positive ? "text-emerald-700" : "text-slate-900"}`}>{positive ? "+" : ""}{formatInr(entry.amount)}</span>
              </div>;
            })}</div>}
          <div className="mt-4 flex items-center justify-between gap-3">
            <button type="button" disabled={activityPage === 1 || activity.isFetching} onClick={() => setActivityPage(p => Math.max(1,p-1))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40">Previous</button>
            <span className="text-xs text-slate-500">Page {activityPage}</span>
            <button type="button" disabled={!activity.data?.has_more || activity.isFetching} onClick={() => setActivityPage(p => p+1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40">Next</button>
          </div>
        </section>
        <Link to="/membership-plans" className="inline-block rounded-xl bg-[#2F80ED] px-5 py-3 text-sm font-semibold text-white">Explore memberships</Link>
      </div>
    </PageContainer>
  );
}
