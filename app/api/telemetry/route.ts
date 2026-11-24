import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://iprwaercvarqteumreln.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcndhZXJjdmFycXRldW1yZWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMjEzODcsImV4cCI6MjEwNDc5NzM4N30.f0FmTMDFQkR3s_L9ynpcwprlvlhP-LKXbA9gCsiJv00";

async function postToVisitors(payload: Record<string, any>) {
  return fetch(`${SUPABASE_URL}/rest/v1/site_visitors`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(payload)
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : body.ip || "Unknown";

    let payload: Record<string, any> = {
      ip: String(clientIp || "Unknown").slice(0, 100),
      country: String(req.headers.get("x-vercel-ip-country") || body.country || "Unknown").slice(0, 100),
      region: String(req.headers.get("x-vercel-ip-country-region") || body.region || "Unknown").slice(0, 100),
      city: String(req.headers.get("x-vercel-ip-city") || body.city || "Unknown").slice(0, 100),
      path: String(body.path || "/").slice(0, 200),
      referrer: String(body.referrer || "Direct Visit").slice(0, 300),
      company: String(body.company || "Organic / Direct").slice(0, 150),
      industry: String(body.industry || "General").slice(0, 150),
      source: String(body.source || "Organic / Direct").slice(0, 150),
      ref: String(body.ref || "Organic / Direct").slice(0, 250)
    };

    for (let attempt = 0; attempt < 6; attempt++) {
      const res = await postToVisitors(payload);
      if (res.ok) {
        return NextResponse.json({ ok: true });
      }

      const errText = await res.text().catch(() => "");
      const colMatch =
        errText.match(/column "([^"]+)" of relation "site_visitors"/i) ||
        errText.match(/Could not find the '([^']+)' column/i);

      if (colMatch && colMatch[1] && Object.prototype.hasOwnProperty.call(payload, colMatch[1])) {
        const badCol = colMatch[1];
        const nextPayload = { ...payload };
        delete nextPayload[badCol];
        payload = nextPayload;
        continue;
      }

      return NextResponse.json(
        { ok: false, status: res.status, error: errText || "Supabase 400 error" },
        { status: res.status >= 400 ? res.status : 500 }
      );
    }

    return NextResponse.json(
      { ok: false, status: 400, error: "Exceeded column fallback retries" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Telemetry route error" },
      { status: 500 }
    );
  }
}
