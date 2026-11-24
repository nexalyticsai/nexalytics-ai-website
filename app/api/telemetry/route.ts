import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://iprwaercvarqteumreln.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcndhZXJjdmFycXRldW1yZWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMjEzODcsImV4cCI6MjEwNDc5NzM4N30.f0FmTMDFQkR3s_L9ynpcwprlvlhP-LKXbA9gCsiJv00";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : body.ip || "Unknown";

    const payload = {
      ip: clientIp,
      country: req.headers.get("x-vercel-ip-country") || body.country || "Unknown",
      region: req.headers.get("x-vercel-ip-country-region") || body.region || "Unknown",
      city: req.headers.get("x-vercel-ip-city") || body.city || "Unknown",
      path: String(body.path || "/").slice(0, 200),
      referrer: String(body.referrer || "Direct Visit").slice(0, 300),
      company: String(body.company || "Organic / Direct").slice(0, 150),
      industry: String(body.industry || "General").slice(0, 150),
      source: String(body.source || "Organic / Direct").slice(0, 150),
      ref: String(body.ref || "Organic / Direct").slice(0, 250)
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_visitors`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    return NextResponse.json({ ok: res.ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
