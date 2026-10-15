import {useEffect, useState} from "react";
import {Link, useParams, useNavigate} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import PageContainer from "../components/layout/PageContainer";
import {getSelfScheduleSettings, reviseSelfSchedule, setInitialSelfSchedule} from "../services/selfWorkoutService";
import type {SelfScheduleSlot} from "../services/selfWorkoutService";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const normalized = (raw: string) => {
  const value = String(raw ?? "").trim();
  const match = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(value);
  if (!match) return "";
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return "";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export default function SelfWorkoutScheduleSettingsPage() {
  const {enrollmentId} = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const query = useQuery({queryKey:["self-workout-settings",enrollmentId],queryFn:()=>getSelfScheduleSettings(enrollmentId!),enabled:!!enrollmentId});
  const [slots,setSlots] = useState<SelfScheduleSlot[]>([]);
  const [effective,setEffective] = useState("");
  const [error,setError] = useState("");
  const [initialized,setInitialized] = useState(false);
  useEffect(()=>{
    if(query.data && !initialized){
      setSlots(query.data.slots.length ? query.data.slots.map(s=>({...s,start_time:normalized(s.start_time)})) : []);
      setEffective(query.data.earliestChangeDate);
      setInitialized(true);
    }
  },[query.data,initialized]);
  const mutation = useMutation({
    mutationFn:async()=>{
      if(!query.data) throw new Error("Schedule settings unavailable");
      if(slots.length!==query.data.workoutsPerWeek) throw new Error(`Choose exactly ${query.data.workoutsPerWeek} days`);
      if(new Set(slots.map(x=>x.weekday)).size!==slots.length) throw new Error("Duplicate weekday");
      if(slots.some(s=>!normalized(s.start_time))) throw new Error("Set a valid time for every selected day");
      if(!query.data.configured) return setInitialSelfSchedule(enrollmentId!,slots);
      if(effective < query.data.earliestChangeDate) throw new Error("Changes must start on a future date");
      const last = query.data.pendingRevisions.at(-1)?.effectiveFrom;
      if(last && effective<=last) throw new Error(`Choose a date after the pending revision (${last})`);
      return reviseSelfSchedule(enrollmentId!,effective,slots);
    },
    onSuccess:async()=>{
      await Promise.all([
        qc.invalidateQueries({queryKey:["self-workout-settings",enrollmentId]}),
        qc.invalidateQueries({queryKey:["virtual-self-workouts",enrollmentId]})
      ]);
      navigate("/schedule");
    },
    onError:(e)=>setError(e instanceof Error?e.message:"Unable to save schedule"),
  });
  function toggle(day:string){
    setError("");
    setSlots(prev=>prev.some(x=>x.weekday===day)?prev.filter(x=>x.weekday!==day):[...prev,{weekday:day,start_time:"07:00"}]);
  }
  function changeTime(day:string, t:string){setSlots(prev=>prev.map(x=>x.weekday===day?{...x,start_time:t}:x));}
  return <PageContainer><div className="space-y-6">
    <Link to="/schedule" className="text-sm font-semibold text-[#2F80ED]">← Back to Schedule</Link>
    <header><h1 className="text-3xl font-bold text-[#12395B]">Your Workout Schedule</h1>
      <p className="mt-2 text-slate-600">Choose your recurring workout days and a different time for each day.</p></header>
    {query.isPending?<p>Loading schedule...</p>:query.isError?<p className="rounded-xl bg-red-50 p-5 text-red-700">{query.error.message}</p>:query.data&&<>
      <section className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
        <p className="font-semibold">Select exactly {query.data.workoutsPerWeek} different days ({slots.length} selected)</p>
        {WEEKDAYS.map(day=>{const slot=slots.find(s=>s.weekday===day);return <div key={day} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <label className="flex items-center gap-3"><input type="checkbox" checked={!!slot} onChange={()=>toggle(day)} disabled={!slot && slots.length>=query.data!.workoutsPerWeek}/><span>{day}</span></label>
          {slot&&<input aria-label={`${day} start time`} type="time" value={normalized(slot.start_time)} onChange={e=>changeTime(day,e.target.value)} className="rounded-lg border border-slate-300 p-2"/>}
        </div>})}
        {query.data.configured?<div className="space-y-2"><label className="block font-semibold" htmlFor="effective">Apply changes from</label>
          <input id="effective" type="date" min={query.data.earliestChangeDate} value={effective} onChange={e=>setEffective(e.target.value)} className="rounded-lg border border-slate-300 p-2"/>
          <p className="text-sm text-slate-500">Previous workouts are preserved. Changes apply to future workout dates only.</p></div>:<p className="text-sm text-slate-500">Set up your weekly routine to see your guided workouts.</p>}
        {query.data.pendingRevisions.length>0&&<div className="rounded-lg bg-blue-50 p-3 text-sm text-slate-700"><p className="font-semibold">Upcoming changes</p>{query.data.pendingRevisions.map(r=><p key={r.effectiveFrom}>Effective {r.effectiveFrom}: {r.slots.map(s=>`${s.weekday} ${normalized(s.start_time)}`).join(", ")}</p>)}</div>}
        {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="button" disabled={mutation.isPending || slots.length!==query.data.workoutsPerWeek || slots.some(s=>!normalized(s.start_time))} onClick={()=>{setError("");mutation.mutate()}} className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white disabled:opacity-50">{mutation.isPending?"Saving...":query.data.configured?"Schedule Future Change":"Save Workout Schedule"}</button>
      </section>
    </>}
  </div></PageContainer>;
}
