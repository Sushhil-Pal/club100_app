import {useParams,Link} from "react-router-dom";
import {useQuery,useMutation,useQueryClient} from "@tanstack/react-query";
import {getVirtualWorkoutDetail,getSelfWorkoutActivity,startSelfWorkout,completeSelfWorkout} from "../services/selfWorkoutService";
import PageContainer from "../components/layout/PageContainer";

export default function SelfWorkoutDetailPage(){
  const {id} = useParams();
  const client = useQueryClient();
  const enrollment = id?.split(":")[0];
  const activityQuery = useQuery({queryKey:["self-workout-activity",enrollment],queryFn:()=>getSelfWorkoutActivity(enrollment!),enabled:!!enrollment});
  const currentActivity = activityQuery.data?.activities.find(a=>a.workoutId===id);
  const refresh = () => client.invalidateQueries({queryKey:["self-workout-activity",enrollment]});
  const start = useMutation({mutationFn:()=>startSelfWorkout(id!),onSuccess:refresh});
  const complete = useMutation({mutationFn:()=>completeSelfWorkout(id!),onSuccess:refresh});
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
        {activityQuery.isPending?<p className="mt-4 text-sm text-slate-500">Loading workout activity...</p>:activityQuery.isError?<p className="mt-4 text-sm text-red-700">Unable to load activity: {activityQuery.error.message}</p>:<div className="mt-5 space-y-3">
          {currentActivity?.status==="Completed"?<p className="rounded-xl bg-green-50 p-4 font-semibold text-green-700">✓ Workout Completed</p>:currentActivity?.status==="Started"?<p className="text-sm font-semibold text-[#12395B]">Workout started</p>:null}
          {query.data.accessState==="Available"&&query.data.videoUrl&&currentActivity?.status!=="Completed"&&<button type="button" disabled={start.isPending} onClick={async()=>{const tab=window.open("about:blank","_blank");try{await start.mutateAsync();if(tab){tab.opener=null;tab.location.href=query.data.videoUrl!;}else{window.location.href=query.data.videoUrl!;}}catch{tab?.close();}}} className="rounded-xl bg-[#2F80ED] px-5 py-3 font-semibold text-white disabled:opacity-50">{start.isPending?"Starting...":currentActivity?"Open Guided Workout":"Start Workout"}</button>}
          {currentActivity?.status==="Started"&&<button type="button" disabled={complete.isPending} onClick={()=>complete.mutate()} className="ml-2 rounded-xl border border-[#2F80ED] px-5 py-3 font-semibold text-[#2F80ED] disabled:opacity-50">{complete.isPending?"Saving...":"Mark Completed"}</button>}
          {start.isError&&<p className="text-sm text-red-700">{start.error.message}</p>}
          {complete.isError&&<p className="text-sm text-red-700">{complete.error.message}</p>}
          {query.data.accessState!=="Available"&&<p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">{query.data.accessState==="Expired"?"Workout video access has ended.":"The workout video becomes available at your scheduled start time."}</p>}
          {query.data.accessState==="Available"&&!query.data.videoUrl&&<p className="text-sm text-slate-600">No video is configured for this workout.</p>}
        </div>}
      </section>
    </>}
  </div></PageContainer>;
}
