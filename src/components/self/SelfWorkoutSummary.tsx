import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getSelfWorkoutActivity, getVirtualWorkouts } from "../../services/selfWorkoutService";
import { getSelfScheduleSettings } from "../../services/selfWorkoutService";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export default function SelfWorkoutSummary({enrollmentId, compact=false}:{enrollmentId:string;compact?:boolean}) {
  const settings = useQuery({queryKey:["self-workout-settings",enrollmentId],queryFn:()=>getSelfScheduleSettings(enrollmentId)});
  const activity = useQuery({queryKey:["self-workout-activity",enrollmentId],queryFn:()=>getSelfWorkoutActivity(enrollmentId),enabled:settings.data?.configured===true});
  const from = new Date();from.setDate(from.getDate()-13);
  const today = iso(new Date());
  const workouts = useQuery({queryKey:["self-workout-summary",enrollmentId,today],queryFn:()=>getVirtualWorkouts(enrollmentId,iso(from),today),enabled:settings.data?.configured===true});
  if(settings.isPending || (settings.data?.configured && (activity.isPending||workouts.isPending))) return <section className="rounded-2xl bg-white p-5 text-slate-500 shadow-sm">Loading workout progress...</section>;
  if(settings.isError||activity.isError||workouts.isError) return <section className="rounded-2xl bg-white p-5 text-red-700 shadow-sm">Unable to load Self workout progress.</section>;
  if(!settings.data?.configured) return <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-bold text-[#12395B]">Self Workout Progress</h2><p className="mt-2 text-sm text-slate-600">Set up your weekly workout schedule to begin tracking.</p><Link to={`/self-schedule/${encodeURIComponent(enrollmentId)}`} className="mt-3 inline-block text-sm font-semibold text-[#2F80ED]">Set Up Schedule →</Link></section>;
  const all = workouts.data?.workouts ?? [];
  const statuses = new Map(activity.data?.activities.map(a=>[a.workoutId,a.status])??[]);
  const completed = all.filter(w=>statuses.get(w.id)==="Completed").length;
  const missed = all.filter(w=>w.accessState==="Expired"&&statuses.get(w.id)!=="Completed").length;
  const scheduled = all.filter(w=>w.accessState!=="Expired"&&statuses.get(w.id)!=="Completed").length;
  return <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-[#12395B]">Self Workout Progress</h2><p className="mt-1 text-sm text-slate-500">Last 14 calendar days (including today)</p><div className="mt-4 grid grid-cols-3 gap-3 text-center">{([["Completed",completed],["Missed",missed],["Scheduled",scheduled]] as const).map(([label,value])=><div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-2xl font-bold text-[#12395B]">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}</div>{!compact&&<p className="mt-3 text-xs text-slate-500">Missed means the access window has ended without a recorded completion. Workouts outside this 14-day period are not included.</p>}<Link to="/schedule" className="mt-4 inline-block text-sm font-semibold text-[#2F80ED]">View Workouts →</Link></section>;
}
