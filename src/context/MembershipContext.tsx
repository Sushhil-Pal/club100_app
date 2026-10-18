import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentMember } from "../services/memberService";
import { apiGet } from "../services/api";

export type ActiveMembership = {
  enrollmentId: string; program: string; plan: string | null;
  planCode: string | null; pricingModel: string; cohortId: string | null;
  status: string; isTrial: boolean; trialStatus: string | null;
  startDate: string; endDate: string;
};
type MembershipState = {
  memberships: ActiveMembership[]; selectedEnrollmentId: string | null;
  loading: boolean; error: boolean; refresh: () => void;
  select: (id: string) => void;
};
const MembershipContext = createContext<MembershipState | null>(null);
export function MembershipProvider({children}: {children: ReactNode}) {
  const member = useQuery({queryKey:["current-member"],queryFn:getCurrentMember});
  const list = useQuery({
    queryKey:["my-enrollments",member.data?.id],
    queryFn:()=>apiGet<{memberships:ActiveMembership[]}>("/api/method/club100_core.api.memberships.get_my_enrollments"),
    enabled:!!member.data?.id,
    refetchOnWindowFocus:true,
    refetchInterval:60_000, // Expired memberships disappear without a page reload.
    staleTime:60_000,
  });
  const memberships=list.data?.memberships ?? [];
  const storageKey=member.data?.id ? `club100_selected_membership_${member.data.id}`:null;
  const [selection,setSelection]=useState<{key:string;id:string|null}|null>(null);
  let saved:string|null=null;
  if(storageKey) {try {saved=localStorage.getItem(storageKey);}catch{ /* storage optional */ }}
  const chosen=selection?.key===storageKey ? selection.id : saved;
  const selectedEnrollmentId=memberships.find(m=>m.enrollmentId===chosen)?.enrollmentId ?? memberships[0]?.enrollmentId ?? null;
  const value=useMemo<MembershipState>(()=>({
    memberships,selectedEnrollmentId,
    loading:member.isPending||list.isPending,
    error:member.isError||list.isError,
    refresh:()=>{void list.refetch();},
    select:(id)=>{if(storageKey && memberships.some(m=>m.enrollmentId===id)) {setSelection({key:storageKey,id});try{localStorage.setItem(storageKey,id);}catch{/* storage optional */}}},
  }),[memberships,selectedEnrollmentId,member.isPending,member.isError,list.isPending,list.isError,list.refetch,storageKey]);
  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}
export function useMembershipSelection(){
  const context=useContext(MembershipContext);
  if(!context) throw new Error("MembershipProvider is missing");
  return context;
}
