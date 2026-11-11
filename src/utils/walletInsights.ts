type ExpiringGrant = {validity:string; expires_on:string|null; spendable:boolean; spendable_remaining:string; source:string};

export type UpcomingExpiry = { date: string; amount: string; sources: string[] };

/** Use the server's spendable grants; no future, expired, held or lifetime amounts. */
export function nextWalletExpiry(grants: ExpiringGrant[]): UpcomingExpiry | null {
  const eligible = grants.filter(g =>
    g.validity === "Expires On" && !!g.expires_on && g.spendable &&
    /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(g.expires_on) &&
    Number.isFinite(Number(g.spendable_remaining)) && Number(g.spendable_remaining) > 0
  );
  if (!eligible.length) return null;
  const date = eligible.reduce((min, grant) =>
    grant.expires_on! < min ? grant.expires_on! : min, eligible[0].expires_on!);
  const atDate = eligible.filter(g => g.expires_on === date);
  const totalPaise = atDate.reduce((sum, g) => sum + Math.round(Number(g.spendable_remaining) * 100), 0);
  return { date, amount: (totalPaise / 100).toFixed(2), sources: [...new Set(atDate.map(g => g.source))] };
}
