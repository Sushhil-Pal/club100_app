import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ensureMyReferralCode, getMyReferralDashboard } from "../../services/referralService";
import { referralSignupUrl } from "../../utils/referralAttribution";
import ReferralProgressCard from "./ReferralProgressCard";

export default function ReferralShareCard() {
  const [message, setMessage] = useState("");
  // POST is intentional: issue a stable code once per member. React Query
  // deduplicates concurrent mount requests and caches the code per session.
  const code = useQuery({queryKey:["my-referral-code"], queryFn:ensureMyReferralCode, staleTime:Infinity, retry:false});
  const dashboard = useQuery({queryKey:["my-referral-dashboard"], queryFn:getMyReferralDashboard, retry:false});
  const url = code.data?.code ? referralSignupUrl(window.location.origin, code.data.code) : "";
  const enabled = !!dashboard.data?.program_enabled && !!code.data?.code;

  async function copy() {
    if (!enabled || !url) return;
    try { await navigator.clipboard.writeText(url); setMessage("Referral link copied."); }
    catch { setMessage("Copy isn't available in this browser. Select the link and copy it manually."); }
  }
  async function share() {
    if (!enabled || !url) return;
    try {
      if (navigator.share) await navigator.share({title:"Join me on Club100", text:"Join Club100 using my referral link", url});
      else await copy();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Sharing failed. Use Copy Link instead.");
    }
  }
  return (
    <section id="refer-and-earn" className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#12395B]">Refer &amp; Earn</h2>
      <p className="mt-2 text-sm text-slate-600">Invite your contacts to discover Club100. Eligible rewards are based on qualifying paid purchases, not just signups.</p>
      {(code.isPending || dashboard.isPending) && <p className="mt-3 text-sm text-slate-500">Loading your referral link…</p>}
      {(code.isError || dashboard.isError) && <div className="mt-3 text-sm text-red-700" role="alert">
        Unable to load your referral link. <button className="underline" type="button" onClick={() => {void code.refetch();void dashboard.refetch();}}>Retry</button>
      </div>}
      {url && <>
        <label htmlFor="club100-referral-link" className="mt-4 block text-xs font-semibold text-slate-600">Your personal referral link</label>
        <input id="club100-referral-link" type="text" readOnly value={url} onFocus={event => event.currentTarget.select()}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800" />
        {!dashboard.data?.program_enabled && <p role="status" className="mt-2 text-sm text-amber-800">Referrals aren't open yet. Your code is reserved; sharing will be enabled when Club100 activates the referral policy.</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" disabled={!enabled} onClick={() => void copy()} className="rounded-xl bg-[#2F80ED] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Copy Link</button>
          <button type="button" disabled={!enabled} onClick={() => void share()} className="rounded-xl border border-[#2F80ED] px-5 py-3 text-sm font-semibold text-[#2F80ED] disabled:opacity-50">Share</button>
        </div>
        {!!dashboard.data?.referral_count && <p className="mt-3 text-xs text-slate-600">Direct referrals recorded: {dashboard.data.referral_count}</p>}
      </>}
      {message && <p className="mt-3 text-sm text-teal-700" role="status">{message}</p>}
      <ReferralProgressCard />
    </section>
  );
}
