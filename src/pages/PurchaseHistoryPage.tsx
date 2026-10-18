import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "../components/layout/PageContainer";
import { getMyPurchases } from "../services/purchaseHistoryService";

const money = (amount: number) => `₹${Number(amount).toLocaleString("en-IN")}`;
const date = (s: string | null) => s ? new Date(`${s}T00:00:00`).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"}) : "—";

export default function PurchaseHistoryPage() {
  const query = useQuery({queryKey:["my-purchases"],queryFn:getMyPurchases,refetchOnWindowFocus:true,refetchInterval:60_000});
  return <PageContainer>
    <div className="mx-auto max-w-3xl space-y-5 py-6">
      <Link to="/dashboard" className="text-sm font-semibold text-teal-700">← Dashboard</Link>
      <h1 className="text-3xl font-bold text-[#12395B]">My purchases</h1>
      <p className="text-slate-600">Your Club100 membership purchases and upcoming start dates.</p>
      {query.isPending && <p>Loading your purchases...</p>}
      {query.isError && <p role="alert" className="text-red-700">Unable to retrieve purchase history. Please try again.</p>}
      {query.data?.purchases.length === 0 && <div className="rounded-2xl bg-white p-6 shadow-sm">No purchases yet. <Link to="/membership-plans" className="text-teal-700 underline">Explore membership plans</Link></div>}
      {query.data?.purchases.map(p=><div key={p.enrollmentId} className="rounded-2xl bg-white p-6 shadow-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[#12395B]">{p.program} · Self · {p.durationMonths} {p.durationMonths === 1 ? "month" : "months"}</h2>
          <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold">{p.status} · {p.paymentStatus}</span>
        </div>
        <p className="font-semibold">{money(p.amountPayable)}</p>
        <p className="text-sm text-slate-600">Start: {date(p.startDate)} · End: {date(p.endDate)}</p>
        {p.status === "Scheduled" && p.paymentStatus === "Paid" && <p className="text-sm text-teal-800">Payment received. Your membership will begin on {date(p.startDate)}. Your current trial remains available until its expiry.</p>}
        {p.paymentStatus === "Pending" && <p className="text-sm text-amber-700">Payment not yet confirmed. Return to checkout to check its status or resume the existing order.</p>}
        {p.trialEnrollmentId && <p className="text-xs text-slate-500">Converted from trial: {p.trialEnrollmentId}</p>}
        <p className="text-xs text-slate-500">Enrollment: {p.enrollmentId}</p>
      </div>)}
    </div>
  </PageContainer>;
}
