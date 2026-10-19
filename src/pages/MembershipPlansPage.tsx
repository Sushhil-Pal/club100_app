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

  const oneMonthPrice = offers.data?.offers.find(offer => offer.durationMonths === 1)?.amountPayable;
  const isActiveTrial = selected?.isTrial === true && selected.status === "Active";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/dashboard" className="text-sm font-semibold text-[#2F80ED] hover:text-[#1F6FD1]">
        ← Dashboard
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-[#12395B]">Choose Your Membership</h1>
      <p className="mt-2 text-slate-600">
        Choose the Self membership that suits you. Your fitness history stays with your account.
      </p>

      {isActiveTrial && (
        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-[#12395B]">
          <p className="font-semibold">Keep every day of your free trial.</p>
          <p className="mt-1 text-slate-700">
            You can purchase your membership today. Your paid plan will begin after your trial ends
            {selected.endDate ? ` (${selected.endDate})` : ""}, so no trial days are lost.
          </p>
        </div>
      )}

      {offers.isPending && <p className="mt-6 text-slate-600">Loading membership prices…</p>}
      {offers.isError && (
        <p role="alert" className="mt-6 text-red-700">
          Unable to load membership prices. Please try again later.
        </p>
      )}

      {offers.data && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {offers.data.offers.map(offer => {
            const recommended = offer.durationMonths === 6;
            const bestValue = offer.durationMonths === 12;
            const savings = oneMonthPrice == null
              ? 0
              : Math.max(0, oneMonthPrice * offer.durationMonths - offer.amountPayable);

            return (
              <section
                key={offer.durationMonths}
                className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                  recommended ? "border-[#2F80ED] ring-1 ring-[#2F80ED]/20" : "border-slate-200"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold text-[#12395B]">
                    {offer.durationMonths} {offer.durationMonths === 1 ? "month" : "months"}
                  </h2>
                  {recommended && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2F80ED]">
                      Recommended
                    </span>
                  )}
                  {bestValue && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2F80ED]">
                      Best Value
                    </span>
                  )}
                </div>

                <p className="mt-4 text-3xl font-bold text-[#12395B]">
                  {money(offer.monthlyEquivalent)}
                  <span className="text-base font-normal text-slate-500">/month</span>
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Total payable today: <span className="font-semibold">{money(offer.amountPayable)}</span>
                </p>
                {savings > 0 && (
                  <p className="mt-3 text-sm font-semibold text-[#2F80ED]">
                    Save {money(savings)} vs. monthly membership
                  </p>
                )}

                <Link
                  to={`/membership-checkout?program=${encodeURIComponent(program)}&months=${offer.durationMonths}`}
                  className="mt-5 inline-flex w-fit items-center justify-center rounded-xl bg-[#2F80ED] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F6FD1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F80ED]"
                >
                  Continue to Checkout →
                </Link>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
