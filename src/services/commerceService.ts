import { apiGet } from "./api";

export type MembershipOffer = {
  durationMonths: number;
  monthlyEquivalent: number;
  amountPayable: number;
};
export type MembershipOffers = {
  plan: { id: string; name: string; code: string };
  currency: string;
  offers: MembershipOffer[];
};
export function getMembershipOffers(planCode = "self") {
  return apiGet<MembershipOffers>(
    `/api/method/club100_core.api.commerce.membership_offers?plan_code=${encodeURIComponent(planCode)}`
  );
}

import { apiPost } from "./api";
export type CheckoutQuote = {program:string;durationMonths:number;monthlyEquivalent:number;amountPayable:number;currency:string;paidStartDate:string;trialEnrollmentId:string|null};
export type MemberOrder = {success:boolean;enrollment:string;key_id:string;mode:string;order_id:string;amount:number;currency:string;paidStartDate:string;durationMonths:number;program:string};
export type PaymentConfirmation = {success:boolean;enrollment:string;status:string;payment_status:string};
const base = "/api/method/club100_core.api.commerce_checkout.";
export function getCheckoutQuote(program:string,durationMonths:number){return apiGet<CheckoutQuote>(`${base}checkout_quote?program=${encodeURIComponent(program)}&duration_months=${durationMonths}`);}
export function createMemberCheckout(program:string,durationMonths:number){return apiPost<MemberOrder>(`${base}create_member_checkout`,{program,duration_months:durationMonths});}
export function verifyMemberCheckout(enrollment:string,response:{razorpay_payment_id:string;razorpay_order_id:string;razorpay_signature:string}){return apiPost<PaymentConfirmation>(`${base}verify_member_checkout`,{enrollment_id:enrollment,...response});}

export type CheckoutState = {state:"none"|"pending"|"paid";enrollment?:string;status?:string;paymentStatus?:string;durationMonths?:number;amountPayable?:number;paidStartDate?:string};
export function getMemberCheckoutState(program:string){return apiGet<CheckoutState>(`${base}member_checkout_state?program=${encodeURIComponent(program)}`);}
export function resumeMemberCheckout(enrollment:string){return apiPost<MemberOrder>(`${base}resume_member_checkout`,{enrollment_id:enrollment});}
