import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../services/api";
import { getCurrentMember } from "../services/memberService";
import { useMembershipSelection } from "../context/MembershipContext";

type TrialContext = {
  eligible: boolean;
  reason?: string;
  durationDays?: number;
  trialEnrollmentId?: string;
  trialEndDate?: string;
  trialStatus?: string;
};
type TrialProgram = {id:string;name:string};
type TrialActivation = {enrollmentId:string;startDate:string;endDate:string;durationDays:number};

export default function FreeTrialPage() {
  const queryClient = useQueryClient();
  const {refresh} = useMembershipSelection();
  const [program, setProgram] = useState("");
  const memberQuery = useQuery({queryKey:["current-member"], queryFn:getCurrentMember});
  const status = useQuery({
    queryKey:["self-trial-context"],
    queryFn:()=>apiGet<TrialContext>("/api/method/club100_core.api.self_trial.self_trial_context"),
    refetchOnWindowFocus:true,
  });
  const programs = useQuery({
    queryKey:["self-trial-programs"],
    queryFn:()=>apiGet<{programs:TrialProgram[]}>("/api/method/club100_core.api.self_trial.self_trial_programs"),
    enabled:status.data?.eligible===true,
  });
  const choices=programs.data?.programs ?? [];
  useEffect(()=>{
    if(!program && choices.length===1) setProgram(choices[0].id);
  },[program,choices]);
  const activate=useMutation({
    mutationFn:()=>apiPost<TrialActivation>("/api/method/club100_core.api.self_trial.activate_self_trial",{program}),
    onSuccess:async result=>{
      await queryClient.invalidateQueries({queryKey:["self-trial-context"]});
      await queryClient.invalidateQueries({queryKey:["my-enrollments"]});
      refresh();
      const memberId=memberQuery.data?.id;
      if(memberId) {
        try {localStorage.setItem(`club100_selected_membership_${memberId}`,result.enrollmentId);} catch { /* optional persistence */ }
      }
      // Reload initializes membership selection from refreshed ERP membership list.
      window.location.assign(`/self-schedule/${encodeURIComponent(result.enrollmentId)}`);
    },
  });
  return <div className="mx-auto max-w-2xl px-4 py-8">
    <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Club100 · Self</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Your 14-day free trial</h1>
      <p className="mt-3 text-slate-600">Explore the Self-guided workouts and fitness assessment. No card or payment required. Your trial starts when you activate it.</p>
      {status.isPending && <p className="mt-6 text-slate-600">Checking your eligibility…</p>}
      {status.isError && <p className="mt-6 text-red-700">Could not check trial eligibility. Please refresh and try again.</p>}
      {status.data && !status.data.eligible && <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <p className="font-semibold text-slate-800">Trial unavailable</p>
        <p className="mt-1 text-slate-600">{status.data.reason || "This member is not eligible for another free trial."}</p>
        {status.data.trialEnrollmentId && <p className="mt-2 text-sm text-slate-500">Previous trial: {status.data.trialStatus || "Used"}{status.data.trialEndDate ? ` · Ends ${status.data.trialEndDate}` : ""}</p>}
        <Link to="/dashboard" className="mt-4 inline-block font-semibold text-teal-700">Return to Dashboard</Link>
      </div>}
      {status.data?.eligible && <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="trial-program" className="block text-sm font-semibold text-slate-800">Choose your fitness program</label>
          {programs.isPending ? <p className="mt-2 text-slate-500">Loading available programs…</p> : programs.isError ?
            <p className="mt-2 text-red-700">Unable to load programs. Please refresh the page.</p> :
            <select id="trial-program" value={program} onChange={e=>setProgram(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900">
              <option value="">Select a program</option>
              {choices.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>}
          {!programs.isPending && !programs.isError && choices.length===0 && <p className="mt-2 text-amber-800">No Self workout programs are currently available for trial activation.</p>}
        </div>
        <p className="text-sm text-slate-500">Available once per member, including existing Society or paid members. The activation date counts as day one.</p>
        {activate.isError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{activate.error instanceof Error ? activate.error.message : "Unable to activate the trial."}</p>}
        <button type="button" disabled={!program || activate.isPending || programs.isError} onClick={()=>activate.mutate()} className="w-full rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {activate.isPending ? "Activating…" : "Activate 14-day trial"}
        </button>
      </div>}
    </div>
  </div>;
}
