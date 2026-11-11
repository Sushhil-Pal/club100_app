import { apiGet, apiPost } from "./api";

export type ReferralDashboard = {
  registered: boolean;
  can_register?: boolean;
  program_enabled: boolean;
  code?: string;
  status?: string;
  partner_type?: string;
  referral_count?: number;
};

export const getMyReferralDashboard = () => apiGet<ReferralDashboard>(
  "/api/method/club100_core.referrals.service.my_referral_dashboard"
);
export const ensureMyReferralCode = () => apiPost<{code:string;partner_type:string}>(
  "/api/method/club100_core.referrals.service.ensure_my_referral_code"
);
export const validateReferralCode = (code: string) => apiGet<{valid:boolean}>(
  `/api/method/club100_core.referrals.service.validate_referral_code?code=${encodeURIComponent(code)}`
);
export const claimMyReferral = (code: string) => apiPost<{captured:boolean;existing:boolean}>(
  "/api/method/club100_core.referrals.service.claim_my_referral",
  {code}
);
