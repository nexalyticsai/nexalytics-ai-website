import { SITE_CONFIG } from "@/data/siteData";

export interface TicketRecord {
  ticketId: string;
  tier: string;
  repoOrUrl: string;
  email: string;
  status: string;
}

let lastFormSubmitTs = 0;

export function sanitizeText(str: string, maxLen = 1000): string {
  return String(str || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<\s*\/?\s*(script|iframe|object|embed|svg|style)[^>]*>|on\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLen);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isSafeUrlOrRepo(raw: string): boolean {
  const t = raw.trim();
  if (!t || t.length < 4 || t.length > 500) return false;
  if (/^(javascript|data|vbscript|file):/i.test(t)) return false;
  if (/^https?:\/\//i.test(t)) {
    try {
      const u = new URL(t);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }
  return /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/[^\s<>"']*)?$/i.test(t);
}

export function makeTicketId(): string {
  return "NX-" + (Date.now() % 1000000).toString(36).toUpperCase().padStart(4, "0");
}

export function checkRateLimitCooldown(): boolean {
  const now = Date.now();
  if (now - lastFormSubmitTs < 5000) return false;
  lastFormSubmitTs = now;
  return true;
}

export function saveTicketToSession(ticket: TicketRecord): void {
  try {
    sessionStorage.setItem("ingress_ticket", JSON.stringify(ticket));
  } catch {
    // ignore storage errors
  }
}

export function readTicketFromSession(): TicketRecord | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem("ingress_ticket") || "null");
    if (saved && saved.ticketId) return saved;
  } catch {
    // ignore
  }
  return null;
}

export async function logVisitorTelemetry(
  pathOverride?: string,
  leadEmailOverride?: string,
  eventTag?: string
): Promise<boolean> {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const refSource = urlParams.get("ref") || urlParams.get("utm_source") || "";
    let campaignComp = urlParams.get("comp") || urlParams.get("company") || "";
    let leadEmail = leadEmailOverride || urlParams.get("email") || urlParams.get("recipient") || "";
    const campaignInd = eventTag || urlParams.get("industry") || "General";

    if (campaignComp) {
      try {
        campaignComp = decodeURIComponent(campaignComp);
      } catch {}
    }
    if (leadEmail) {
      try {
        leadEmail = decodeURIComponent(leadEmail);
      } catch {}
    }
    if (!campaignComp && refSource) {
      campaignComp = refSource.toLowerCase() === "outreach" ? "Cold Outreach Lead" : refSource;
    }
    if (!campaignComp) campaignComp = "Organic / Direct";

    let geo: Record<string, string> = {};
    try {
      const geoRes = await fetch("https://ipapi.co/json/");
      if (geoRes.ok) geo = await geoRes.json();
    } catch {}

    const payload = {
      ip: geo.ip || "Unknown",
      country: geo.country_name || "Unknown",
      region: geo.region || "Unknown",
      city: geo.city || "Unknown",
      path: pathOverride || window.location.pathname || "/",
      referrer: document.referrer || (refSource ? `Email Campaign (${refSource})` : "Direct Visit"),
      company: campaignComp,
      industry: campaignInd,
      source: campaignComp,
      ref: leadEmail ? `${campaignComp} (${leadEmail})` : campaignComp,
    };

    const res = await fetch(`${SITE_CONFIG.supabaseUrl}/rest/v1/site_visitors`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: SITE_CONFIG.supabaseAnonKey,
        Authorization: `Bearer ${SITE_CONFIG.supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
