import {useQuery} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import {getSelfScheduleSettings, getVirtualWorkouts} from "../../services/selfWorkoutService";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"});
const formatTime = (time: string) => {const [h,m] = time.split(":").map(Number);return new Date(2020,0,1,h,m).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"});};

export default function SelfNextWorkout({enrollmentId}:{enrollmentId:string}) {
  const today = iso(new Date());
  const end = new Date(); end.setDate(end.getDate()+30);
  const settings = useQuery({queryKey:["self-workout-settings",enrollmentId],queryFn:()=>getSelfScheduleSettings(enrollmentId)});
  const workouts = useQuery({queryKey:["self-next-workouts",enrollmentId,today],queryFn:()=>getVirtualWorkouts(enrollmentId,today,iso(end)),enabled:settings.data?.configured===true,refetchInterval:30000});
  if(settings.isPending || (settings.data?.configured && workouts.isPending)) return <section className="rounded-2xl bg-white p-6 shadow-sm">Loading your next workout...</section>;
  if(settings.isError || workouts.isError) return <section className="rounded-2xl bg-white p-6 text-red-700 shadow-sm">Unable to load your next workout.</section>;
  if(!settings.data?.configured) return <section className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-[#12395B]">Set up your weekly workouts</h2><p className="mt-2 text-sm text-slate-600">Choose your workout days and times to get started.</p><Link className="mt-4 inline-block font-semibold text-[#2F80ED]" to={`/self-schedule/${encodeURIComponent(enrollmentId)}`}>Set Up Schedule →</Link></section>;
  const next = [...(workouts.data?.workouts??[])].filter(w=>w.accessState!=="Expired").sort((a,b)=>a.availableFrom.localeCompare(b.availableFrom))[0];
  return <section className="rounded-2xl bg-white p-6 shadow-sm">
    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your Next Workout</p>
    {next ? <><h2 className="mt-3 text-2xl font-semibold text-slate-900">{next.title}</h2>
      <p className="mt-2 text-slate-600">{formatDate(next.scheduledDate)} · {formatTime(next.startTime)}</p>
      <p className="mt-1 text-sm text-slate-500">{next.format || "Self-Guided"} · {next.durationMinutes} minutes</p>
      <p className="mt-2 text-sm text-slate-500">{next.accessState==="Locked"?"Video unlocks at your scheduled time.":"Your workout is available now."}</p>
      <Link className="mt-5 block rounded-xl bg-[#2F80ED] px-4 py-3 text-center font-semibold text-white" to={`/self-workout/${encodeURIComponent(next.id)}`}>{next.accessState==="Available"?"Start Workout":"View Workout"}</Link>
    </> : <><h2 className="mt-3 text-xl font-semibold">No upcoming workouts in the next 31 days</h2><p className="mt-2 text-sm text-slate-500">Review your workout schedule to see what's next.</p></>}
    <Link to="/schedule" className="mt-4 block text-center text-sm font-semibold text-[#2F80ED]">View Full Schedule →</Link>
  </section>;
}
