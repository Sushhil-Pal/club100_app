import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import {getVirtualWorkouts, getSelfWorkoutActivity, getSelfScheduleSettings} from "../services/selfWorkoutService";

const isoDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
};
const localDate = (value: string) => new Date(`${value}T00:00:00`);
const prettyDate = (value: string) => localDate(value).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"});
const prettyTime = (value: string) => {
  const [hours,minutes] = value.split(":").map(Number);
  const date = new Date(2020,0,1,hours,minutes);
  return date.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});
};

export default function SelfWorkoutSchedulePage({enrollmentId}:{enrollmentId:string}) {
  const [tab,setTab] = useState<"upcoming"|"past">("upcoming");
  const today = isoDate(new Date());
  const from = new Date(); from.setDate(from.getDate()-14);
  const until = new Date(); until.setDate(until.getDate()+16);
  const settings = useQuery({queryKey:["self-workout-settings",enrollmentId],queryFn:()=>getSelfScheduleSettings(enrollmentId)});
  const query = useQuery({
    queryKey:["virtual-self-workouts",enrollmentId,today],
    queryFn:()=>getVirtualWorkouts(enrollmentId,isoDate(from),isoDate(until)),
    refetchInterval:30000,
    enabled:settings.data?.configured===true,
  });
  const activityQuery = useQuery({queryKey:["self-workout-activity",enrollmentId],queryFn:()=>getSelfWorkoutActivity(enrollmentId),enabled:settings.data?.configured===true,refetchInterval:30000});
  if(settings.isPending) return <PageContainer><p className="p-6">Loading workout settings...</p></PageContainer>;
  if(settings.isError) return <PageContainer><p className="p-6 text-red-700">{settings.error.message}</p></PageContainer>;
  if(!settings.data?.configured) return <PageContainer><div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold text-[#12395B]">Set Up Your Workout Schedule</h1><p>Choose {settings.data?.workoutsPerWeek} days each week and your preferred time for each workout.</p><Link to={`/self-schedule/${encodeURIComponent(enrollmentId)}`} className="inline-block rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white">Set Up Schedule</Link></div></PageContainer>;
  if(query.isPending) return <PageContainer><p className="p-6">Loading your guided workouts...</p></PageContainer>;
  if(query.isError) return <PageContainer><div className="rounded-xl bg-red-50 p-5 text-red-700">{query.error.message}</div></PageContainer>;
  if(activityQuery.isPending) return <PageContainer><p className="p-6">Loading workout activity...</p></PageContainer>;
  if(activityQuery.isError) return <PageContainer><p className="p-6 text-red-700">{activityQuery.error.message}</p></PageContainer>;
  const activityById = new Map(activityQuery.data?.activities.map(a=>[a.workoutId,a])??[]);
  const ordered = [...query.data.workouts].sort((a,b)=>a.availableFrom.localeCompare(b.availableFrom));
  const workouts = ordered.filter(w=>tab==="past"?w.accessState==="Expired":w.accessState!=="Expired");
  const nextId = ordered.find(w=>w.accessState==="Locked")?.id;
  return <PageContainer><div className="space-y-5">
    <header><h1 className="text-3xl font-bold text-[#12395B]">My Workouts</h1>
    <p className="mt-2 text-slate-600">Your scheduled self-guided workouts.</p></header>
    <div><Link to={`/self-schedule/${encodeURIComponent(enrollmentId)}`} className="text-sm font-semibold text-[#2F80ED]">Manage Weekly Schedule →</Link></div>
    <div className="flex rounded-xl bg-slate-100 p-1">
      {(["upcoming","past"] as const).map(t=><button key={t} type="button" onClick={()=>setTab(t)} className={`flex-1 rounded-lg p-3 text-sm font-semibold ${tab===t?"bg-white text-[#2F80ED] shadow-sm":"text-slate-500"}`}>{t==="upcoming"?"Upcoming":"Past"}</button>)}
    </div>
    {workouts.length===0&&<div className="rounded-xl bg-white p-6 text-slate-600">No {tab} workouts in this date range.</div>}
    {workouts.map(w=><section key={w.id} className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold text-[#2F80ED]">{prettyDate(w.scheduledDate)}</span>
      <span className="rounded-full bg-slate-100 px-3 py-1">{activityById.get(w.id)?.status==="Completed"?"Completed":activityById.get(w.id)?.status==="Started"?"Started":w.accessState==="Available"?"Available Now":w.accessState==="Expired"?"Access Ended":"Scheduled"}</span>
      {w.id===nextId&&<span className="rounded-full bg-blue-50 px-3 py-1 text-[#12395B]">Next Workout</span>}</div>
      <h2 className="mt-2 text-lg font-bold text-[#12395B]">{w.title}</h2>
      <p className="mt-1 text-sm text-slate-500">Workout {w.sequenceNo} · {w.format || "Self-Guided"}</p>
      <p className="mt-2 text-sm text-slate-700">{prettyTime(w.startTime)} · {w.durationMinutes} minutes</p>
      <p className="mt-1 text-sm text-slate-500">{w.accessState==="Locked"?`Video available at ${prettyTime(w.availableFrom.split("T")[1])}`:w.accessState==="Available"?`Video available until ${prettyTime(w.availableUntil.split("T")[1])}`:"Video access has ended"}</p>
      <Link className={`mt-3 inline-block rounded-xl px-4 py-2 text-sm font-semibold ${w.accessState==="Available"?"bg-[#2F80ED] text-white":"border border-[#2F80ED] text-[#2F80ED]"}`} to={`/self-workout/${encodeURIComponent(w.id)}`}>{activityById.get(w.id)?.status==="Completed"?"View Completed":w.accessState==="Available"?"Start Workout":"View Details"}</Link>
    </section>)}
  </div></PageContainer>;
}
