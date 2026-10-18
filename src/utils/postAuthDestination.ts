// The marketing site may request only this known, internal destination.
// No arbitrary `next` URLs or redirects are accepted.
const KEY = "club100_post_auth_destination";
const FREE_PATH = "/free-assessment";
const TRIAL_PATH = "/free-trial";
const ALLOWED = [FREE_PATH, TRIAL_PATH];

export function captureAssessmentDestination(search: string): void {
  const next = new URLSearchParams(search).get("next");
  if (next && ALLOWED.includes(next)) {
    sessionStorage.setItem(KEY, next);
  }
}

export function postAuthDestination(): string {
  const path = sessionStorage.getItem(KEY);
  return path && ALLOWED.includes(path) ? path : "/dashboard";
}

export function consumePostAuthDestination(): string {
  const path = postAuthDestination();
  sessionStorage.removeItem(KEY);
  return path;
}

export function assessmentAuthLink(path: "/login" | "/register"): string {
  const target = postAuthDestination();
  return ALLOWED.includes(target)
    ? `${path}?next=${encodeURIComponent(target)}` : path;
}
