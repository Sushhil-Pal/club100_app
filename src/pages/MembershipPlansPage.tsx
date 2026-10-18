import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useMembershipSelection } from "../context/MembershipContext";
import { getMembershipOffers } from "../services/commerceService";

const money = (amount: number) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
}).format(amount);

export default function MembershipPlansPage() {
  const { memberships, selectedEnrollmentId } = useMembershipSelection();
  const selected = memberships.find(m => m.enrollmentId === selectedEnrollmentId);
  const program = new URLSearchParams(window.location.search).get("program") || selected?.program || "";
  const offers = useQuery({
    queryKey: ["membership-offers", "self"],
    queryFn: () => getMembershipOffers("self"),
  });
  return <main className="mx-auto max-w-4xl px-4 py-8">
    <Link to="/dashboard" className="text-sm font-semibold text-teal-700">← Dashboard</Link>
    <h1 className="mt-4 text-3xl font-bold text-slate-900">Continue with Club100</h1>
    <p className="mt-2 text-slate-600">Choose the Self membership that suits you. Your fitness history stays with your account.</p>
    {offers.isPending && <p className="mt-6">Loading membership prices…</p>}
    {offers.isError && <p role="alert" className="mt-6 text-red-700">Unable to load membership prices. Please try again later.</p>}
    {offers.data && <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {offers.data.offers.map(offer => <section key={offer.durationMonths} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{offer.durationMonths} {offer.durationMonths === 1 ? "month" : "months"}</h2>
        <p className="mt-3 text-2xl font-bold text-slate-900">{money(offer.monthlyEquivalent)}<span className="text-base font-normal text-slate-500">/month</span></p>
        <p className="mt-1 text-slate-700">Total: {money(offer.amountPayable)}</p>
        <Link to={`/membership-checkout?program=${encodeURIComponent(program)}&months=${offer.durationMonths}`} className="mt-4 inline-block rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white">Review checkout</Link>
      </section>)}
    </div>}
  </main>;
}
