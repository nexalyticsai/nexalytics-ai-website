import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://iprwaercvarqteumreln.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcndhZXJjdmFycXRldW1yZWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMjEzODcsImV4cCI6MjEwNDc5NzM4N30.f0FmTMDFQkR3s_L9ynpcwprlvlhP-LKXbA9gCsiJv00";
const FORMSUBMIT_AJAX = process.env.FORMSUBMIT_URL || "https://formsubmit.co/ajax/nexalytics.ai@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formPayload, dbRecord } = body || {};

    if (!dbRecord || !dbRecord.email || !dbRecord.ticket_id) {
      return NextResponse.json({ ok: false, error: "Invalid intake payload" }, { status: 400 });
    }

    const tasks: Promise<unknown>[] = [];

    if (formPayload) {
      tasks.push(
        fetch(FORMSUBMIT_AJAX, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(formPayload)
        }).catch(() => null)
      );
    }

    tasks.push(
      fetch(`${SUPABASE_URL}/rest/v1/client_intake`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(dbRecord)
      }).catch(() => null)
    );

    await Promise.allSettled(tasks);
    return NextResponse.json({ ok: true, ticketId: dbRecord.ticket_id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
