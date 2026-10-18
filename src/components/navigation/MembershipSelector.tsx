import { useMembershipSelection } from "../../context/MembershipContext";
export default function MembershipSelector(){
 const {memberships,selectedEnrollmentId,select,loading,error,refresh}=useMembershipSelection();
 if(error) return <div className="text-xs text-red-700">Unable to load memberships. <button onClick={refresh} className="underline">Retry</button></div>;
 if(loading||memberships.length<=1) return null;
 return <div className="max-w-sm">
   <label htmlFor="club100-active-membership" className="mb-1 block text-xs font-semibold text-slate-600">CURRENT MEMBERSHIP</label>
   <select id="club100-active-membership" value={selectedEnrollmentId??""} onChange={e=>select(e.target.value)}
     className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800">
      {memberships.map(m=><option key={m.enrollmentId} value={m.enrollmentId}>
       {m.program} — {m.pricingModel==="Society Batch"?"Society":m.plan??m.pricingModel}{m.isTrial?" (Free Trial)":""}
      </option>)}
   </select>
 </div>;
}
