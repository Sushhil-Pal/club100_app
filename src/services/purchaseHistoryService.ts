import { apiGet } from "./api";
export type PurchaseRecord = {
  enrollmentId: string; program: string; plan: string | null;
  status: string; paymentStatus: string; durationMonths: number;
  amountPayable: number; startDate: string | null; endDate: string | null;
  trialEnrollmentId: string | null;
};
export function getMyPurchases() {
  return apiGet<{ purchases: PurchaseRecord[] }>("/api/method/club100_core.api.purchase_history.my_purchases");
}
