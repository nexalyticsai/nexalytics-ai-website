"use client";

import React, { useState } from "react";

interface CaseStudy {
  id: string;
  tierBadge: string;
  serviceName: string;
  title: string;
  targetB2B: string;
  videoSrc: string;
  problem: string;
  howSolved: string;
  metrics: {
    label: string;
    before: string;
    after: string;
  }[];
  takeaway: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "data-analytics-499",
    tierBadge: "$499 • 48-Hr Async Sprint",
    serviceName: "Autonomous Data Analytics Sprint",
    title: "Eliminating $22K/Mo Silent Ledger Drift in B2B Billing",
    targetB2B: "B2B SaaS, FinOps & Multi-Branch ERP Operations",
    videoSrc: "/videos/01_data_analytics_499.mp4",
    problem:
      "Dashboards showed green row counts, yet ERP exports, payment webhooks, and SQL tables had a 5.8% month-end reconciliation mismatch (~$22K/mo unattributed) from duplicate retries and drifted fields.",
    howSolved:
      "Deployed a zero-trust staging schema gate, composite idempotency keys, and an automated variance assertion—with full repo handover and zero calls.",
    metrics: [
      { label: "Ledger Variance", before: "5.8% (~$22K/mo)", after: "0.00% Verified" },
      { label: "Manual Ops Cleanup", before: "12 hrs / week", after: "0 hrs Automated" },
      { label: "Delivery Model", before: "Retainer / Calls", after: "48-Hr Async Repo" },
    ],
    takeaway: "Zero production DB lock-in • Full repository handover",
  },
  {
    id: "applied-ml-999",
    tierBadge: "$999 • 3-Day Async Sprint",
    serviceName: "Applied ML & Predictive Engine Sprint",
    title: "34-Day Early B2B Account Churn & Risk Detection Engine",
    targetB2B: "Subscription SaaS, B2B Marketplaces & Risk Teams",
    videoSrc: "/videos/02_applied_ml_999.mp4",
    problem:
      "Enterprise and SMB accounts contracted silently—teams only noticed when renewals failed, losing 11% ARR to reactive follow-ups.",
    howSolved:
      "Built a leakage-free behavioral feature pipeline and a calibrated scoring microservice (<45ms CPU inference) sending exact triggers into existing workflows.",
    metrics: [
      { label: "Churn Lead Time", before: "0d (Post-loss)", after: "34 Days Early" },
      { label: "Renewal Recovery", before: "Reactive Baseline", after: "+28% Lift" },
      { label: "Inference Speed", before: "Heavy Black-Box", after: "<45ms CPU" },
    ],
    takeaway: "Explainable triggers • No mandatory GPU bloat",
  },
  {
    id: "ai-guardrails-1499",
    tierBadge: "$1,499 • 5-Day Async Sprint",
    serviceName: "AI Agent Evaluation & AST Guardrail Sprint",
    title: "Cutting Silent AI Tool-Call Failures by 97.8% in Production",
    targetB2B: "Agentic AI Startups, Hiring/Screening & Workflow Tech",
    videoSrc: "/videos/03_ai_guardrails_1499.mp4",
    problem:
      "Multi-turn AI agents returned HTTP 200 OK while malformed JSON arguments and drifted enum values silently corrupted downstream records.",
    howSolved:
      "Added deterministic schema/AST interception before tool execution, a bounded self-correction loop, and a 150-case CI evaluation harness.",
    metrics: [
      { label: "Silent Failures", before: "14.0% in Prod", after: "0.3% (-97.8%)" },
      { label: "Corrupted Writes", before: "~90 rows / week", after: "0 at Gate" },
      { label: "Prompt QA Cycle", before: "2 Days Manual", after: "4 Mins CI Suite" },
    ],
    takeaway: "Deterministic boundary enforcement • CI regression suite",
  },
  {
    id: "fullstack-mvp-1999",
    tierBadge: "$1,999 • 7-Day Async Sprint",
    serviceName: "Full-Stack AI MVP & Data Architecture Sprint",
    title: "From Manual Compliance Spreadsheets to B2B AI Portal in 7 Days",
    targetB2B: "Seed/Series-A Founders, B2B Consultancies & Ops Teams",
    videoSrc: "/videos/04_fullstack_mvp_1999.mp4",
    problem:
      "Vendor compliance reviews took 4.5 days across scattered PDFs and spreadsheets, while traditional agencies quoted months and retainers.",
    howSolved:
      "Shipped an isolated multi-tenant data layer, confidence-gated document extraction, and a clean operator portal in 7 async days with full code ownership.",
    metrics: [
      { label: "Audit Turnaround", before: "4.5 Days / Case", after: "18 Minutes" },
      { label: "Launch Speed", before: "3+ Mos Agency", after: "7 Async Days" },
      { label: "IP Ownership", before: "Vendor Lock-In", after: "100% Client Repo" },
    ],
    takeaway: "100% async delivery • Zero retainers • Full IP handover",
  },
];

export default function CaseStudiesSection() {
  const [selectedTier, setSelectedTier] = useState<string>("all");

  const filteredStudies =
    selectedTier === "all"
      ? CASE_STUDIES
      : CASE_STUDIES.filter((cs) => cs.id === selectedTier);

  return (
    <section
      id="case-studies"
      aria-labelledby="case-studies-heading"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#090d16] text-slate-100 border-t border-slate-800/80"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-teal-400">
              Engineering Case Studies & Architecture Logs
            </p>
            <h2
              id="case-studies-heading"
              className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white"
            >
              How B2B Bottlenecks Get Solved Async
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl">
              IP-safe architectural breakdowns and before/after benchmarks across our 4 fixed-scope sprints. No discovery calls, no retainers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTier("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedTier === "all"
                  ? "bg-teal-400 text-slate-950"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              All 4 Sprints
            </button>
            {CASE_STUDIES.map((cs) => (
              <button
                key={cs.id}
                type="button"
                onClick={() => setSelectedTier(cs.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedTier === cs.id
                    ? "bg-teal-400 text-slate-950"
                    : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {cs.tierBadge.split("•")[0].trim()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredStudies.map((study) => (
            <article
              key={study.id}
              className="rounded-2xl border border-slate-800 bg-[#0d1320] p-6 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-teal-500/10 border border-teal-500/30 px-3 py-1 text-xs font-semibold text-teal-300">
                    {study.tierBadge}
                  </span>
                  <span className="text-xs text-slate-400">{study.serviceName}</span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-white leading-snug">
                  {study.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Built for: <span className="text-slate-300">{study.targetB2B}</span>
                </p>

                <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 bg-black">
                  <video
                    src={study.videoSrc}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full aspect-video object-cover"
                  />
                </div>

                <div className="mt-5 space-y-3 text-sm leading-relaxed">
                  <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-3.5">
                    <span className="font-semibold text-rose-400">B2B Problem: </span>
                    <span className="text-slate-300">{study.problem}</span>
                  </div>

                  <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-3.5">
                    <span className="font-semibold text-teal-300">How We Solved It (IP-Safe): </span>
                    <span className="text-slate-300">{study.howSolved}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {study.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-lg border border-slate-800/90 bg-slate-950/90 p-2.5"
                    >
                      <p className="text-[11px] font-medium text-slate-400 truncate">
                        {m.label}
                      </p>
                      <p className="mt-1 text-[11px] text-rose-400/90 line-through">
                        {m.before}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-emerald-400">
                        {m.after}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-slate-400">{study.takeaway}</p>
                <a
                  href="#sprints"
                  className="inline-flex items-center justify-center rounded-lg bg-teal-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-teal-300 transition shrink-0"
                >
                  Select Sprint →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
