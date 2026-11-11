// The first valid link in this browser session wins until the account is
// registered or the session ends. The server independently validates the code.
const KEY = "club100_pending_referral_v1";
const CODE = /^[A-Z0-9]{6,20}$/;

export function normalizedReferralCode(value: string | null | undefined): string {
  const code = (value || "").trim().toUpperCase();
  return CODE.test(code) ? code : "";
}
export function pendingReferralCode(): string {
  try { return normalizedReferralCode(sessionStorage.getItem(KEY)); }
  catch { return ""; }
}
export function captureReferralFromSearch(search: string): string {
  const existing = pendingReferralCode();
  if (existing) return existing;
  const params = new URLSearchParams(search);
  const incoming = normalizedReferralCode(params.get("ref"));
  if (incoming) {
    try { sessionStorage.setItem(KEY, incoming); } catch { /* blocked storage */ }
  }
  return incoming;
}
export function clearPendingReferral(): void {
  try { sessionStorage.removeItem(KEY); } catch { /* blocked storage */ }
}
export function referralSignupUrl(origin: string, code: string): string {
  const normalized = normalizedReferralCode(code);
  if (!normalized) throw new Error("Invalid referral code");
  const url = new URL("/register", origin);
  url.searchParams.set("ref", normalized);
  return url.toString();
}
export function withPendingReferral(base: string): string {
  const code = pendingReferralCode();
  if (!code) return base;
  const [path, query = ""] = base.split("?");
  const params = new URLSearchParams(query);
  params.set("ref", code);
  return `${path}?${params.toString()}`;
}
