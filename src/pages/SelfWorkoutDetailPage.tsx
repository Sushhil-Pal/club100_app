import {useParams,Link} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {getVirtualWorkoutDetail} from "../services/selfWorkoutService";
import PageContainer from "../components/layout/PageContainer";

export default function SelfWorkoutDetailPage(){
  const {id} = useParams();
  const query = useQuery({
    queryKey:["virtual-workout-detail",id],
    queryFn:()=>getVirtualWorkoutDetail(id!),
    enabled:!!id,
    refetchInterval:15000,
    refetchOnWindowFocus:true,
  });
  return <PageContainer><div className="space-y-5">
    <Link to="/schedule" className="text-sm font-semibold text-[#2F80ED]">← Back to Schedule</Link>
    {query.isPending?<p>Loading workout details...</p>:query.isError?<p className="rounded-xl bg-red-50 p-5 text-red-700">{query.error.message}</p>:<>
      <header><p className="text-sm text-[#2F80ED]">Self · Guided Workouts</p><h1 className="mt-2 text-3xl font-bold text-[#12395B]">{query.data.title}</h1>
      <p className="mt-2 text-slate-600">{query.data.scheduledDate} · {query.data.startTime} · {query.data.durationMinutes} minutes</p></header>
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-bold text-[#12395B]">Workout Details</h2>
        <p className="mt-3 text-sm text-slate-600">Level: {query.data.fitnessLevel || "All levels"} · Format: {query.data.format || "Self-Guided"}</p>
        {query.data.equipmentRequired&&<p className="mt-3 text-sm text-slate-600">Equipment: {query.data.equipmentRequired}</p>}
        {query.data.instructions&&<div className="prose mt-5 text-sm text-slate-700" dangerouslySetInnerHTML={{__html:query.data.instructions}} />}
        {query.data.accessState==="Available"&&query.data.videoUrl?<a href={query.data.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white">Open Guided Workout</a>:<p className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">{query.data.accessState==="Expired"?"Workout video access has ended.":query.data.accessState==="Locked"?"The workout video becomes available at your scheduled start time.":"No video is configured for this workout."}</p>}
      </section>
    </>}
  </div></PageContainer>;
}
