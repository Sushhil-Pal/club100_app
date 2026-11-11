import { apiGet } from "./api";

export type WalletActivityEntry = {
  id: string;
  created_at: string;
  type: "Credit" | "Spend" | "Refund" | "Reversal" | "Expiry";
  source: "Corporate" | "Referral" | "Promotion" | "Wallet";
  amount: string;
  description: string;
  enrollment: string;
};
export type WalletActivityPage = {
  page: number;
  has_more: boolean;
  entries: WalletActivityEntry[];
};
export type ReferralProgress = {
  recorded_referrals: number;
  paid_referrals: number;
  provisional_reward_events: number;
  credited_total: string;
};

export function getMyWalletActivity(page: number): Promise<WalletActivityPage> {
  return apiGet<WalletActivityPage>(
    `/api/method/club100_core.api.member_insights.my_wallet_activity?page=${encodeURIComponent(String(page))}`
  );
}
export function getMyReferralProgress(): Promise<ReferralProgress> {
  return apiGet<ReferralProgress>(
    "/api/method/club100_core.api.member_insights.my_referral_progress"
  );
}
