import {useQuery} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import {getSelfScheduleSettings,getVirtualWorkouts,getSelfWorkoutActivity} from "../../services/selfWorkoutService";

const iso = (d:Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export default function SelfWeeklyWorkouts({enrollmentId}:{enrollmentId:string}) {
  const now = new Date();
  const monday = new Date(now.getFullYear(),now.getMonth(),now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay()+6)%7));
  const sunday = new Date(monday); sunday.setDate(sunday.getDate()+6);
  const week = iso(monday);
  const settings = useQuery({queryKey:["self-workout-settings",enrollmentId],queryFn:()=>getSelfScheduleSettings(enrollmentId)});
  const workouts = useQuery({queryKey:["self-program-week",enrollmentId,week],queryFn:()=>getVirtualWorkouts(enrollmentId,week,iso(sunday)),enabled:settings.data?.configured===true});
  const activity = useQuery({queryKey:["self-workout-activity",enrollmentId],queryFn:()=>getSelfWorkoutActivity(enrollmentId),enabled:settings.data?.configured===true});
  const loading = settings.isPending || (settings.data?.configured && (workouts.isPending || activity.isPending));
  const error = settings.isError || workouts.isError || activity.isError;
  const completed = new Set(activity.data?.activities.filter(a=>a.status==="Completed").map(a=>a.workoutId)??[]);
  return <section className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold text-slate-900">This Week's Workouts</h2><p className="mt-1 text-sm text-slate-500">Your Self workouts for this calendar week (Monday–Sunday).</p></div><Link className="text-sm font-semibold text-[#2F80ED]" to="/schedule">Schedule →</Link></div>
    {loading?<p className="mt-5 text-slate-500">Loading workouts...</p>:error?<p className="mt-5 text-red-700">Unable to load weekly workouts.</p>:!settings.data?.configured?<Link className="mt-5 inline-block font-semibold text-[#2F80ED]" to={`/self-schedule/${encodeURIComponent(enrollmentId)}`}>Set Up Schedule →</Link>:
    (workouts.data?.workouts.length??0)===0?<p className="mt-5 text-slate-600">No workouts scheduled for this calendar week.</p>:
    <div className="mt-4 divide-y divide-slate-100">{workouts.data!.workouts.map(w=><div key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm text-slate-500">{new Date(`${w.scheduledDate}T00:00:00`).toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})} · {w.startTime.slice(0,5)}</p><p className="font-semibold text-[#12395B]">{w.title}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{completed.has(w.id)?"Completed":w.accessState==="Expired"?"Missed":w.accessState==="Available"?"Available":"Scheduled"}</span></div>)}</div>}
  </section>;
}
