import { apiGet } from "./api";

export type WalletGrant = {
  grant: string;
  source: "Corporate" | "Referral" | "Promotion";
  remaining: string;
  reserved: string;
  spendable_remaining: string;
  validity: "Lifetime" | "Expires On";
  valid_from: string;
  expires_on: string | null;
  spendable: boolean;
};

export type MyWallet = {
  currency: "INR";
  wallet: string | null;
  wallet_status: string;
  available: string;
  reserved: string;
  by_source: Record<"Corporate" | "Referral" | "Promotion", string>;
  expired_unspent: string;
  future_unvested: string;
  grants: WalletGrant[];
};

/** The logged-in member is resolved server-side; no member ID in this API. */
export function getMyWallet(): Promise<MyWallet> {
  return apiGet<MyWallet>("/api/method/club100_core.wallet.core.my_wallet");
}

export function formatInr(value: string | number): string {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-IN", {style:"currency", currency:"INR"}).format(amount)
    : "—";
}
