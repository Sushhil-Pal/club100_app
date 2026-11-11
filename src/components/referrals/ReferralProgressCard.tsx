import { useQuery } from "@tanstack/react-query";
import { getMyReferralProgress } from "../../services/memberInsightsService";
import { formatInr, getMyWallet } from "../../services/walletService";

export default function ReferralProgressCard() {
  const progress = useQuery({queryKey:["my-referral-progress"], queryFn:getMyReferralProgress, retry:false});
  const wallet = useQuery({queryKey:["my-wallet"], queryFn:getMyWallet, retry:false});
  return <section aria-label="Referral activity" className="mt-5 border-t border-slate-200 pt-5">
    <h3 className="text-base font-semibold text-[#12395B]">Your referral activity</h3>
    {progress.isPending ? <p className="mt-3 text-sm text-slate-500">Loading referral activity…</p> :
      progress.isError ? <p role="alert" className="mt-3 text-sm text-red-700">Unable to load referral activity. <button className="underline" type="button" onClick={() => void progress.refetch()}>Retry</button></p> : <>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Recorded referrals</p><p className="mt-1 text-xl font-semibold">{progress.data.recorded_referrals}</p></div>
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Referrals with verified paid membership</p><p className="mt-1 text-xl font-semibold">{progress.data.paid_referrals}</p></div>
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Rewards under review</p><p className="mt-1 text-xl font-semibold">{progress.data.provisional_reward_events}</p></div>
        </div>
        <div className="mt-3 rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap justify-between gap-3"><span className="text-sm text-slate-600">Referral credits issued to date</span><strong>{formatInr(progress.data.credited_total)}</strong></div>
          <div className="mt-2 flex flex-wrap justify-between gap-3"><span className="text-sm text-slate-600">Referral credits currently available</span><strong>{wallet.data ? formatInr(wallet.data.by_source.Referral) : wallet.isError ? "Unavailable" : "Loading…"}</strong></div>
          <p className="mt-2 text-xs text-slate-500">Paid memberships are not automatically eligible for rewards. Under-review amounts are not spendable credits; only issued wallet credits can be used for purchases.</p>
        </div>
      </>}
  </section>;
}
