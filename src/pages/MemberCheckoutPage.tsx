import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMembershipSelection } from "../context/MembershipContext";
import { apiGet } from "../services/api";
import { getCheckoutQuote, createMemberCheckout, verifyMemberCheckout, type MemberOrder, getMemberCheckoutState, resumeMemberCheckout } from "../services/commerceService";

type TrialProgram = {id:string;name:string};
type RazorpayResponse = {razorpay_payment_id:string;razorpay_order_id:string;razorpay_signature:string};
type RazorpayInstance = {open:()=>void;on:(event:string,callback:(error:unknown)=>void)=>void};
type RazorpayConstructor = new (options:Record<string,unknown>)=>RazorpayInstance;
declare global {interface Window {Razorpay?:RazorpayConstructor}}
const money=(amount:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(amount);
const friendlyDate=(value:string|null|undefined)=>{
  if(!value)return "—";
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if(!match)return value;
  const date=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
  if(Number.isNaN(date.getTime()))return value;
  return date.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
};
function loadRazorpay():Promise<void>{
  if(window.Razorpay)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const script=document.createElement("script");script.src="https://checkout.razorpay.com/v1/checkout.js";
    script.onload=()=>window.Razorpay?resolve():reject(new Error("Razorpay checkout unavailable"));
    script.onerror=()=>reject(new Error("Unable to load secure payment checkout"));document.body.appendChild(script);
  });
}
export default function MemberCheckoutPage(){
 const [params,setParams]=useSearchParams();
 const {memberships,selectedEnrollmentId,refresh}=useMembershipSelection();
 const selected=memberships.find(m=>m.enrollmentId===selectedEnrollmentId);
 const program=params.get("program")||selected?.program||"";
 const months=Number(params.get("months")||3);
 const validMonths=[1,3,6,12].includes(months);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [confirmed,setConfirmed]=useState<{enrollment:string;status:string}|null>(null);
 const [awaiting,setAwaiting]=useState<MemberOrder|null>(null);
 const queryClient=useQueryClient();
 const programs=useQuery({queryKey:["checkout-programs"],queryFn:()=>apiGet<{programs:TrialProgram[]}>("/api/method/club100_core.api.self_trial.self_trial_programs")});
 const state=useQuery({queryKey:["member-checkout-state",program],queryFn:()=>getMemberCheckoutState(program),enabled:!!program,retry:false,refetchOnWindowFocus:true});
 const quote=useQuery({queryKey:["checkout-quote",program,months],queryFn:()=>getCheckoutQuote(program,months),enabled:!!program&&validMonths,retry:false});
 useEffect(()=>{setError("");setAwaiting(null)},[program,months]);
 async function launch(order:MemberOrder){
    setAwaiting(order);
    await loadRazorpay();
    if(order.mode!=="test")throw new Error("Local validation requires Razorpay test mode. Payment was not opened.");
    if(!window.Razorpay)throw new Error("Razorpay checkout unavailable");
    const instance=new window.Razorpay({key:order.key_id,amount:order.amount,currency:order.currency,
      name:"Club100",description:`Self membership · ${months} month${months===1?"":"s"}`,order_id:order.order_id,
      handler:async(response:unknown)=>{
        setBusy(true);
        try{
          const result=await verifyMemberCheckout(order.enrollment,response as RazorpayResponse);
          setConfirmed({enrollment:result.enrollment,status:result.status});setAwaiting(null);
          await queryClient.invalidateQueries({queryKey:["my-enrollments"]});await state.refetch();refresh();
        }catch(e){setError(`${e instanceof Error?e.message:"Verification failed"}. If you paid, do not retry; contact support with order ${order.enrollment}.`)}
        finally{setBusy(false)}
      },modal:{ondismiss:()=>setBusy(false)},theme:{color:"#2F80ED"}});
    instance.on("payment.failed",()=>{setError(`Payment not completed. Contact support with checkout reference ${order.enrollment} if charged.`);setBusy(false)});
    instance.open();setBusy(false);
 }
 async function pay(resume=false){
   if(!program||busy)return;
   if(!resume&&(!validMonths||!quote.data))return;
   setBusy(true);setError("");
   try {
     const order=resume&&state.data?.enrollment
       ?await resumeMemberCheckout(state.data.enrollment)
       :await createMemberCheckout(program,months);
     await state.refetch();
     await launch(order);
   }catch(e){setError(e instanceof Error?e.message:"Unable to start payment");setBusy(false)}
 }
 async function refreshPaymentStatus(){
   setError("");
   const updated=await state.refetch();
   if(updated.data?.state==="paid"&&updated.data.enrollment){
     setConfirmed({enrollment:updated.data.enrollment,status:updated.data.status||"Scheduled"});
     setAwaiting(null);
     await queryClient.invalidateQueries({queryKey:["my-enrollments"]});refresh();
   }
 }
 return (
  <main className="mx-auto max-w-2xl px-4 py-8">
    <Link to="/membership-plans" className="text-sm font-semibold text-[#2F80ED] hover:text-[#1F6FD1]">← Membership plans</Link>
    <h1 className="mt-4 text-3xl font-bold text-[#12395B]">Review your membership</h1>
    <p className="mt-2 text-slate-600">Review your choices and the amount payable before continuing to secure checkout.</p>

    {confirmed ? (
      <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-emerald-900">Payment verified</h2>
        <p className="mt-2 text-sm text-emerald-900">Your membership payment has been recorded.</p>
        <p className="mt-2 text-sm text-slate-700">Status: {confirmed.status}. Scheduled memberships become active on their start date.</p>
        <p className="mt-2 text-xs text-slate-500">Reference: {confirmed.enrollment}</p>
        <Link to="/dashboard" className="mt-5 inline-block rounded-xl bg-[#2F80ED] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F6FD1]">Go to Dashboard →</Link>
      </section>
    ) : (
      <div className="mt-6 space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <label className="block text-sm font-semibold text-[#12395B]">
          Fitness program
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 focus:border-[#2F80ED] focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={program}
            onChange={e=>setParams({program:e.target.value,months:String(months)})}
          >
            <option value="">Select program</option>
            {programs.data?.programs.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            {program&&!programs.data?.programs.some(p=>p.id===program)&&<option value={program}>{program}</option>}
          </select>
        </label>
        <label className="block text-sm font-semibold text-[#12395B]">
          Membership duration
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 focus:border-[#2F80ED] focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={months}
            onChange={e=>setParams({program,months:e.target.value})}
          >
            {[1,3,6,12].map(m=><option key={m} value={m}>{m} {m===1?"month":"months"}</option>)}
          </select>
        </label>

        {quote.isPending&&program&&<p className="text-sm text-slate-600">Calculating your price and start date…</p>}
        {quote.isError&&<p role="alert" className="text-sm text-red-700">{quote.error instanceof Error?quote.error.message:"Unable to prepare checkout"}</p>}
        {quote.data&&(
          <section className="space-y-3 rounded-xl bg-slate-50 p-4">
            <h2 className="font-semibold text-[#12395B]">Self-Guided · {months} {months===1?"month":"months"}</h2>
            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
              <span>Monthly equivalent</span><strong className="text-slate-900">{money(quote.data.monthlyEquivalent)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
              <span>Paid membership begins</span><strong className="text-right text-[#12395B]">{friendlyDate(quote.data.paidStartDate)}</strong>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-[#12395B]">Pay today</span>
                <span className="text-2xl font-bold text-[#12395B]">{money(quote.data.amountPayable)}</span>
              </div>
            </div>
            {quote.data.trialEnrollmentId&&(
              <p className="rounded-lg bg-blue-50 p-3 text-sm leading-6 text-[#12395B]">
                ✓ Your remaining free trial days are preserved. Your paid membership starts after your trial ends.
              </p>
            )}
          </section>
        )}

        {state.data?.state==="pending"&&(
          <section className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-950">Unfinished checkout</p>
            <p className="text-sm text-slate-700">{state.data.durationMonths} months · {money(state.data.amountPayable||0)} · Starts {friendlyDate(state.data.paidStartDate)}</p>
            <p className="text-sm text-amber-950">If you paid, check the payment status before retrying. A payment may still be processing.</p>
            <p className="text-xs text-slate-600">Reference: {state.data.enrollment}</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={busy||state.isFetching} onClick={()=>void refreshPaymentStatus()} className="rounded-lg border border-[#2F80ED] px-4 py-2 font-semibold text-[#2F80ED] hover:bg-blue-50 disabled:opacity-50">Check payment status</button>
              <button type="button" disabled={busy||state.isFetching} onClick={()=>void pay(true)} className="rounded-lg bg-[#2F80ED] px-4 py-2 font-semibold text-white hover:bg-[#1F6FD1] disabled:opacity-50">Resume same checkout</button>
            </div>
          </section>
        )}
        {state.data?.state==="paid"&&(
          <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-900">Payment already recorded</p>
            <p className="mt-1 text-sm text-slate-700">Status: {state.data.status}</p>
            <Link to="/dashboard" className="mt-3 inline-block text-sm font-semibold text-[#2F80ED]">Go to Dashboard →</Link>
          </section>
        )}
        {awaiting&&<p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">Checkout reference: {awaiting.enrollment}. If payment succeeded but confirmation failed, contact Club100 support before attempting another payment.</p>}
        {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button
          type="button"
          onClick={()=>void pay(false)}
          disabled={busy||!quote.data||!!awaiting||state.isPending||state.data?.state!=="none"}
          className="w-full rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white transition hover:bg-[#1F6FD1] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy?"Processing…":quote.data?`Pay ${money(quote.data.amountPayable)} Securely`:"Pay Securely"}
        </button>
        <p className="text-center text-xs font-medium text-amber-700">Razorpay Test Mode</p>
        <p className="text-xs leading-5 text-slate-500">Membership becomes active on the scheduled start date after Club100 verifies captured payment with Razorpay. Club100 does not store card details.</p>
      </div>
    )}
  </main>
 );
}
