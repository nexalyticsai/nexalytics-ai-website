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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : body.ip || "Unknown";

    const payload: Record<string, string> = {
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

    let res = await fetch(`${SUPABASE_URL}/rest/v1/site_visitors`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    // Agar `referrer` column schema mein nahi ho toh fallback bina `referrer` ke try karega
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      if (errText.toLowerCase().includes("referrer")) {
        const { referrer: _removed, ...fallbackPayload } = payload;
        res = await fetch(`${SUPABASE_URL}/rest/v1/site_visitors`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify(fallbackPayload)
        });
      } else {
        return NextResponse.json(
          { ok: false, status: res.status, error: errText || "Supabase insert rejected" },
          { status: res.status >= 400 ? res.status : 500 }
        );
      }
    }

    if (!res.ok) {
      const retryErr = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, status: res.status, error: retryErr || "Supabase insert failed after fallback" },
        { status: res.status >= 400 ? res.status : 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Telemetry route error" },
      { status: 500 }
    );
  }
}
