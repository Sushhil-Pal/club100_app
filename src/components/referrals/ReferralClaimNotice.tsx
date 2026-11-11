import { useState } from "react";

const NOTICE_KEY = "club100_referral_claim_notice";

export default function ReferralClaimNotice() {
  const [notice, setNotice] = useState(() => {
    try {
      const value = sessionStorage.getItem(NOTICE_KEY) || "";
      sessionStorage.removeItem(NOTICE_KEY);
      return value;
    } catch { return ""; }
  });
  if (!notice) return null;
  return <div role="status" className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#12395B]">
    <div className="flex items-start justify-between gap-2"><p>{notice}</p>
      <button type="button" className="font-semibold underline" onClick={() => setNotice("")}>Dismiss</button></div>
  </div>;
}
