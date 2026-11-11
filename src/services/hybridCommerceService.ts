import { apiGet, apiPost } from "./api";
import type { MemberOrder } from "./commerceService";

const base = "/api/method/club100_core.api.hybrid_commerce.";

export type HybridQuote = {
  enabled: boolean;
  original: string;
  gstPercent: string;
  displayedFundedBalance: string;
  approvedPromotionBalance: string;
  unbackedBySource?: { Corporate: string; Referral: string };
  bySource: { Corporate: string; Referral: string; Promotion: string };
  currency: "INR";
  fundingVerificationRequired: true;
  paidStartDate: string;
};
export type HybridState = {
  state: "none" | "pending" | "paid" | "review" | "expired";
  hybrid: boolean;
  enrollment?: string;
  status?: string;
  paymentStatus?: string;
  amountPayable?: number;
  paidStartDate?: string;
  doNotRetry?: boolean;
  reviewReason?: string | null;
};
export function getHybridQuote(program: string, durationMonths: number) {
  return apiGet<HybridQuote>(
    `${base}checkout_quote?program=${encodeURIComponent(program)}&duration_months=${durationMonths}`
  );
}
export function createHybridOrder(program: string, durationMonths: number, promotionDiscount: string, walletAmount: string) {
  return apiPost<MemberOrder>(`${base}create_hybrid_checkout`, {
    program, duration_months: durationMonths,
    promotion_discount: promotionDiscount, wallet_amount: walletAmount,
  });
}
export function resumeHybridOrder(enrollmentId: string) {
  return apiPost<MemberOrder>(`${base}resume_hybrid_checkout`, { enrollment_id: enrollmentId });
}
export function getHybridState(program: string) {
  return apiGet<HybridState>(`${base}hybrid_checkout_state?program=${encodeURIComponent(program)}`);
}
