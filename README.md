# Nexalytics AI — Enterprise Next.js 14 Production App

## What Was Upgraded (Zero Data / Content Changes)
1. **Compiled Production Bundle (`productionBrowserSourceMaps: false`):** No single raw readable `index.html` script exposed; Next.js compiles, splits, and minifies JS bundles cleanly.
2. **Server-Side API Routes (`/api/intake` & `/api/telemetry`):** Supabase endpoints/keys and FormSubmit webhook routing execute server-side on Vercel Serverless Functions instead of raw client-side fetch calls.
3. **Enterprise Security Headers (`next.config.mjs`):** Added `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, and `Permissions-Policy`.
4. **100% Data & UI Parity:** Every heading, price (`$499`, `$999`, `$1,499`, `$1,999`, `$0` Free 24h Audit), AST Sandbox, ROI Calculator, Razorpay checkout link, Notion POC Hub link, and Chatbase concierge widget remains identical.

## Deploy to Vercel (₹0 Free Tier)
1. Unzip this folder and push its contents (`package.json`, `next.config.mjs`, `tsconfig.json`, `app/`) to your GitHub repository root (replace the old `index.html`).
2. In Vercel Project Settings -> Framework Preset, ensure **Next.js** is selected (auto-detected).
3. Click **Deploy** — builds cleanly with zero external npm dependency conflicts.
