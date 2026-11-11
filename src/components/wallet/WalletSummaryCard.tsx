import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatInr, getMyWallet } from "../../services/walletService";
import { nextWalletExpiry } from "../../utils/walletInsights";

export default function WalletSummaryCard() {
  const wallet = useQuery({
    queryKey: ["my-wallet"], queryFn: getMyWallet,
    staleTime: 0, refetchOnWindowFocus: true, retry: false,
  });
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm" aria-label="My wallet balance">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#12395B]">My Wallet</h2>
          <p className="mt-1 text-xs text-slate-500">Credits available for Club100 purchases</p>
        </div>
        <Link to="/wallet" className="text-sm font-semibold text-[#2F80ED]">Details →</Link>
      </div>
      {wallet.isPending ? <p className="mt-4 text-sm text-slate-500">Loading balance…</p>
        : wallet.isError ? (
          <div className="mt-4 text-sm text-red-700" role="alert">
            Unable to load balance. <button type="button" onClick={() => void wallet.refetch()} className="underline">Retry</button>
          </div>
        ) : (
          <>
            <p className="mt-3 text-3xl font-bold text-slate-900">{formatInr(wallet.data.available)}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
              <span>Corporate {formatInr(wallet.data.by_source.Corporate)}</span>
              <span>Referral {formatInr(wallet.data.by_source.Referral)}</span>
              <span>Promotion {formatInr(wallet.data.by_source.Promotion)}</span>
            </div>
            {Number(wallet.data.reserved) > 0 && <p className="mt-2 text-xs text-amber-700">{formatInr(wallet.data.reserved)} reserved for checkout</p>}
            {(() => { const next = nextWalletExpiry(wallet.data.grants);
              return next ? <p className="mt-3 text-xs font-medium text-amber-800">{formatInr(next.amount)} of credits expire on {next.date}</p> : null;
            })()}
          </>
        )}
    </section>
  );
}
