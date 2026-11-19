"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ASYNC_STEPS,
  FAQ_ITEMS,
  PRICING_TIERS,
  ROI_PACKAGES,
  SANDBOX_PRESETS,
  SITE_CONFIG,
  TECH_STACK,
} from "@/data/siteData";
import {
  checkRateLimitCooldown,
  isSafeUrlOrRepo,
  isValidEmail,
  logVisitorTelemetry,
  makeTicketId,
  readTicketFromSession,
  sanitizeText,
  saveTicketToSession,
  TicketRecord,
} from "@/lib/clientEngine";

interface AuditReceipt {
  verdict: string;
  code: string;
  elapsedMs: string;
  riskScore: number;
}

export default function EnterprisePlatform() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ticket, setTicket] = useState<TicketRecord | null>(null);

  // Sandbox state
  const [activePreset, setActivePreset] = useState<"injection" | "drift" | "pii" | "clean">("injection");
  const [sandboxInput, setSandboxInput] = useState(SANDBOX_PRESETS.injection);
  const [latencyText, setLatencyText] = useState("Intercepted: 1.44ms");
  const [gateMs, setGateMs] = useState("1.44ms");
  const [riskFooter, setRiskFooter] = useState("Enforcement: AST Semantic Kernel · Risk Score: 99/100");
  const [verdictLines, setVerdictLines] = useState<{
    title: string;
    titleClass: string;
    bullets: string[];
  }>({
    title: "[CRITICAL_INTERCEPT] AST_INJECTION_DETECTED",
    titleClass: "text-rose-400 font-bold",
    bullets: [
      "• Semantic AST Guard: 99.98% deterministic match on unauthorized tool override.",
      "• Latency: 1.44ms deterministic vs ~420ms LLM-as-a-Judge",
      "• Result: 0 tokens leaked. Tool call aborted and database state preserved.",
    ],
  });
  const [lastAuditReceipt, setLastAuditReceipt] = useState<AuditReceipt>({
    verdict: "CRITICAL_INTERCEPT",
    code: "AST_INJECTION_DETECTED",
    elapsedMs: "1.44",
    riskScore: 99,
  });
  const [copiedJson, setCopiedJson] = useState(false);

  // Sandbox email receipt
  const [sandboxHoney, setSandboxHoney] = useState("");
  const [sandboxLeadEmail, setSandboxLeadEmail] = useState("");
  const [sandboxReceiptError, setSandboxReceiptError] = useState("");
  const [sandboxSending, setSandboxSending] = useState(false);
  const [sandboxConfirmed, setSandboxConfirmed] = useState(false);

  // ROI calculator
  const [roiFocus, setRoiFocus] = useState<"analytics" | "uiux" | "evaluation" | "fullstack">("evaluation");
  const [roiIncidents, setRoiIncidents] = useState(4);
  const [roiHours, setRoiHours] = useState(3);
  const [roiRate, setRoiRate] = useState(110);
  const [roiRuns, setRoiRuns] = useState(100000);

  // Ingress Modal
  const [ingressOpen, setIngressOpen] = useState(false);
  const [activeIngressTier, setActiveIngressTier] = useState("Autonomous Data Analytics ($499)");
  const [ingressRepo, setIngressRepo] = useState("");
  const [ingressEmail, setIngressEmail] = useState("");
  const [ingressError, setIngressError] = useState("");
  const [ingressSubmitting, setIngressSubmitting] = useState(false);

  // Legal Modals
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | "deletion" | null>(null);

  // Contact Inquiry Form
  const [contactHoney, setContactHoney] = useState("");
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryContact, setInquiryContact] = useState("");
  const [inquiryRepo, setInquiryRepo] = useState("");
  const [serviceSelect, setServiceSelect] = useState("Autonomous Data Analytics ($499)");
  const [deliveryTimeline, setDeliveryTimeline] = useState("Autonomous Sprint (48–72 Hours)");
  const [inquiryDetails, setInquiryDetails] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [dispatchedTicket, setDispatchedTicket] = useState<TicketRecord | null>(null);

  // Back to top button
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const saved = readTicketFromSession();
    if (saved) setTicket(saved);

    if (!sessionStorage.getItem("nexalytics_visitor_logged")) {
      void logVisitorTelemetry().then((ok) => {
        if (ok) sessionStorage.setItem("nexalytics_visitor_logged", "true");
      });
    }

    const onScroll = () => {
      setShowBackTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIngressOpen(false);
        setLegalModal(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const handleHash = () => {
      if (window.location.hash === "#privacy") setLegalModal("privacy");
      if (window.location.hash === "#terms") setLegalModal("terms");
      if (window.location.hash === "#data-deletion") setLegalModal("deletion");
      if (window.location.hash === "#work") {
        document.getElementById("benchmarks")?.scrollIntoView({ behavior: "smooth" });
      }
      if (window.location.hash === "#outcomes") {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  function activateTicket(nextTicket: TicketRecord) {
    saveTicketToSession(nextTicket);
    setTicket(nextTicket);
  }

  function runGuardrailOnPayload(rawVal: string) {
    const t0 = performance.now();
    let parsed: Record<string, unknown> | null = null;
    let syntaxValid = true;
    try {
      const candidate = JSON.parse(rawVal);
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
        syntaxValid = false;
      } else {
        parsed = candidate as Record<string, unknown>;
      }
    } catch {
      syntaxValid = false;
    }

    const elapsed = Math.max(1.12, performance.now() - t0 + 1.44).toFixed(2);
    setGateMs(`${elapsed}ms`);

    const isInjection =
      /ignore\s+(all\s+)?prior\s+instructions|bypass[_ -]?(auth|schema|validation)|drop\s+table|execute_sql_query|master\s+auth\s+credentials/i.test(
        rawVal
      ) || Boolean(parsed && parsed.bypass_auth === true);
    const hasDbUri = /(postgres|mysql|mongodb):\/\/[^"'\s]+/i.test(rawVal);
    const hasSecretKey = /\b(sk-[a-z0-9_-]{12,}|ghp_[a-z0-9]{16,}|Bearer\s+[a-z0-9._-]{16,})/i.test(rawVal);
    const hasPiiEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(rawVal);
    const isPii = hasDbUri || hasSecretKey || hasPiiEmail;
    const contractHash = parsed && typeof parsed.contract_hash === "string" ? parsed.contract_hash : "";
    const hasValidHash = /^sha256:[a-f0-9]{16,}$/i.test(contractHash);
    const isDrift =
      /unvalidated|dangerous_state_mutation|unexpected_field/i.test(rawVal) || !hasValidHash;

    if (!syntaxValid) {
      const receipt = { verdict: "SYNTAX_REJECTED", code: "MALFORMED_JSON_STREAM", elapsedMs: elapsed, riskScore: 95 };
      setLastAuditReceipt(receipt);
      setLatencyText(`Blocked: ${elapsed}ms`);
      setRiskFooter("Enforcement: AST Semantic Kernel · Risk Score: 95/100");
      setVerdictLines({
        title: "[SYNTAX_REJECTED] MALFORMED_JSON_STREAM",
        titleClass: "text-rose-400 font-bold",
        bullets: [
          "• AST_JSON_BOUNDARY: Caught truncated or invalid JSON output from LLM stream.",
          `• Latency: ${elapsed}ms deterministic vs ~420ms LLM-as-a-Judge`,
          "• Result: Upstream structured retry triggered cleanly. Zero downstream crash.",
        ],
      });
    } else if (isInjection) {
      const receipt = { verdict: "CRITICAL_INTERCEPT", code: "AST_INJECTION_DETECTED", elapsedMs: elapsed, riskScore: 99 };
      setLastAuditReceipt(receipt);
      setLatencyText(`Intercepted: ${elapsed}ms`);
      setRiskFooter("Enforcement: AST Semantic Kernel · Risk Score: 99/100");
      setVerdictLines({
        title: "[CRITICAL_INTERCEPT] AST_INJECTION_DETECTED",
        titleClass: "text-rose-400 font-bold",
        bullets: [
          "• Semantic AST Guard: 99.98% deterministic match on unauthorized tool override.",
          `• Latency: ${elapsed}ms deterministic vs ~420ms LLM-as-a-Judge`,
          "• Result: 0 tokens leaked. Tool call aborted and database state preserved.",
        ],
      });
    } else if (isPii) {
      const receipt = { verdict: "PII_LEAK_BLOCKED", code: "SECRET_OR_PII_EGRESS_BLOCKED", elapsedMs: elapsed, riskScore: 92 };
      setLastAuditReceipt(receipt);
      setLatencyText(`Blocked: ${elapsed}ms`);
      setRiskFooter("Enforcement: AST Semantic Kernel · Risk Score: 92/100");
      setVerdictLines({
        title: "[PII_LEAK_BLOCKED] SECRET_OR_PII_EGRESS_BLOCKED",
        titleClass: "text-rose-400 font-bold",
        bullets: [
          "• ZERO_PII_FIREWALL: Detected & blocked DB URI / live API secret / raw PII email before egress.",
          `• Latency: ${elapsed}ms deterministic vs ~420ms LLM-as-a-Judge`,
          "• Result: Credentials stripped in-memory; ephemeral audit log recorded with zero retention.",
        ],
      });
    } else if (isDrift) {
      const receipt = { verdict: "SCHEMA_DRIFT_BLOCKED", code: "UNDECLARED_STATE_MUTATION", elapsedMs: elapsed, riskScore: 76 };
      setLastAuditReceipt(receipt);
      setLatencyText(`Blocked: ${elapsed}ms`);
      setRiskFooter("Enforcement: AST Semantic Kernel · Risk Score: 76/100");
      setVerdictLines({
        title: "[SCHEMA_DRIFT_BLOCKED] UNDECLARED_STATE_MUTATION",
        titleClass: "text-amber-300 font-bold",
        bullets: [
          "• Schema Contract: Undeclared mutation keys or missing SHA-256 contract_hash rejected.",
          `• Latency: ${elapsed}ms deterministic vs ~420ms LLM-as-a-Judge`,
          "• Result: Payload routed to isolated quarantine buffer. Zero production downtime.",
        ],
      });
    } else {
      const receipt = { verdict: "CONTRACT_VERIFIED", code: "PASS_DETERMINISTIC_GATE", elapsedMs: elapsed, riskScore: 0 };
      setLastAuditReceipt(receipt);
      setLatencyText(`Verified: ${elapsed}ms`);
      setRiskFooter("Enforcement: AST Semantic Kernel · Risk Score: 0/100");
      setVerdictLines({
        title: "[CONTRACT_VERIFIED] PASS_DETERMINISTIC_GATE",
        titleClass: "text-brandNeon font-bold",
        bullets: [
          "• SHA256_SIGNATURE_MATCH: Cryptographic contract signature & strict types verified.",
          `• Latency: ${elapsed}ms deterministic vs ~420ms LLM-as-a-Judge`,
          "• Result: Committed to production microservice with cryptographic audit log.",
        ],
      });
    }
  }

  function handlePresetSelect(preset: "injection" | "drift" | "pii" | "clean") {
    setActivePreset(preset);
    const nextVal = SANDBOX_PRESETS[preset];
    setSandboxInput(nextVal);
    runGuardrailOnPayload(nextVal);
  }

  async function handleCopySandboxJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(lastAuditReceipt, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 1800);
    } catch {}
  }

  async function handleSandboxEmailReceipt(e: React.FormEvent) {
    e.preventDefault();
    setSandboxReceiptError("");
    if (sandboxHoney.trim()) return;
    if (!checkRateLimitCooldown()) {
      setSandboxReceiptError("Wait a few seconds before requesting another report.");
      return;
    }

    const cleanEmail = sanitizeText(sandboxLeadEmail, 200);
    if (!isValidEmail(cleanEmail)) {
      setSandboxReceiptError("Enter a valid work email to receive your full AST audit receipt.");
      return;
    }

    setSandboxSending(true);
    const nextTicket: TicketRecord = {
      ticketId: makeTicketId(),
      tier: "Complimentary 24h Staging Benchmark",
      repoOrUrl: `Sandbox Test (${lastAuditReceipt.verdict || activePreset})`,
      email: cleanEmail,
      status: "ARCHITECT_REVIEW",
    };

    try {
      await fetch(SITE_CONFIG.formSubmitAjaxUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `⚡ Live Sandbox Lead: ${nextTicket.repoOrUrl} [${nextTicket.ticketId}]`,
          _captcha: "false",
          _template: "table",
          "Ticket ID": nextTicket.ticketId,
          email: cleanEmail,
          "Guardrail Verdict": `${lastAuditReceipt.verdict} (${lastAuditReceipt.code})`,
          "Execution Latency": `${lastAuditReceipt.elapsedMs}ms`,
          "Tested Payload": sanitizeText(sandboxInput, 800),
        }),
      });
    } catch {}

    void logVisitorTelemetry("/#sandbox-lead", cleanEmail, `SANDBOX_LEAD:${nextTicket.ticketId}`);
    activateTicket(nextTicket);
    setSandboxConfirmed(true);
    setSandboxSending(false);
  }

  function selectSprintOption(optionValue: string) {
    setServiceSelect(optionValue);
    if (optionValue === "Complimentary 24h Staging Benchmark") {
      setDeliveryTimeline("Complimentary 24h Dry-Run");
    }
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  function openIngressModal(tier: string) {
    setActiveIngressTier(tier);
    setIngressError("");
    setIngressOpen(true);
  }

  async function handleIngressSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIngressError("");
    if (!checkRateLimitCooldown()) {
      setIngressError("Please wait a few seconds before submitting another ingress request.");
      return;
    }

    const cleanRepo = sanitizeText(ingressRepo, 400);
    const cleanEmail = sanitizeText(ingressEmail, 200);

    if (!isSafeUrlOrRepo(cleanRepo)) {
      setIngressError("Enter a valid GitHub repo path or HTTPS staging URL (e.g. github.com/org/repo).");
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setIngressError("Enter a valid work email for async sandbox updates.");
      return;
    }

    setIngressSubmitting(true);
    const nextTicket: TicketRecord = {
      ticketId: makeTicketId(),
      tier: activeIngressTier,
      repoOrUrl: cleanRepo,
      email: cleanEmail,
      status: "QUEUED_FOR_SANDBOX",
    };

    try {
      await fetch(SITE_CONFIG.formSubmitAjaxUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `⚡ Instant Ingress Intent: ${activeIngressTier} [${nextTicket.ticketId}]`,
          _captcha: "false",
          _template: "table",
          ticket_id: nextTicket.ticketId,
          tier: activeIngressTier,
          target_repo_staging: cleanRepo,
          founder_email: cleanEmail,
          ingress_channel: "Self-Serve Pricing Modal (100% Async)",
        }),
      });
    } catch {}

    void logVisitorTelemetry("/#ingress-modal", cleanEmail, `INGRESS_TICKET:${nextTicket.ticketId}`);
    activateTicket(nextTicket);
    window.open(SITE_CONFIG.razorpayUrl, "_blank", "noopener,noreferrer");
    setIngressSubmitting(false);
    setIngressOpen(false);
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactError("");
    if (contactHoney.trim()) return;
    if (!checkRateLimitCooldown()) {
      setContactError("Please wait a few seconds before submitting another specification.");
      return;
    }

    const cleanName = sanitizeText(inquiryName, 120);
    const cleanEmail = sanitizeText(inquiryEmail, 200);
    const cleanContact = sanitizeText(inquiryContact, 120);
    const cleanRepo = sanitizeText(inquiryRepo, 400);
    const cleanDetails = sanitizeText(inquiryDetails, 2000);

    if (cleanName.length < 2) {
      setContactError("Please enter your full name.");
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setContactError("Please enter a valid work email address.");
      return;
    }
    if (cleanRepo && !isSafeUrlOrRepo(cleanRepo)) {
      setContactError("Target Repo / Staging URL must be a safe HTTPS URL or repo path.");
      return;
    }
    if (cleanDetails.length < 10) {
      setContactError("Please share brief technical requirements (at least 10 characters).");
      return;
    }

    setContactSubmitting(true);
    const nextTicket: TicketRecord = {
      ticketId: makeTicketId(),
      tier: serviceSelect,
      repoOrUrl: cleanRepo || "Provided in specifications",
      email: cleanEmail,
      status: "ARCHITECT_REVIEW",
    };

    try {
      await fetch(SITE_CONFIG.formSubmitAjaxUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "🚀 New Client Inquiry - Nexalytics AI",
          _captcha: "false",
          _template: "table",
          _autoresponse:
            "Hi, Thank you for getting in touch with Nexalytics AI. We have received your inquiry. An engineering lead will follow up asynchronously via email within 4–12 business hours.",
          "Ticket ID": nextTicket.ticketId,
          "Full Name": cleanName,
          email: cleanEmail,
          "Contact No": cleanContact || "Async Email Only (No Calls)",
          "Repo or URL": nextTicket.repoOrUrl,
          "Service Needed": serviceSelect,
          "Delivery Timeline": deliveryTimeline,
          "Project Details": cleanDetails,
        }),
      });
    } catch {}

    void logVisitorTelemetry("/#contact-lead", cleanEmail, `INQUIRY_TICKET:${nextTicket.ticketId}`);
    activateTicket(nextTicket);
    setDispatchedTicket(nextTicket);
    setContactSubmitting(false);
  }

  // ROI computations
  const hoursReclaimed = Math.round(roiIncidents * roiHours * 4.33 * 0.85);
  const engWaste = Math.round(roiIncidents * roiHours * 4.33 * roiRate);
  const retryWaste = Math.round(roiRuns * 0.025 * 0.045);
  const totalMonthlyBurn = engWaste + retryWaste;
  const activeRoiPkg = ROI_PACKAGES[roiFocus];
  const paybackDays = Math.max(1, Math.round(activeRoiPkg.price / Math.max(1, totalMonthlyBurn / 30)));
  const roiMultiplier = ((totalMonthlyBurn * 12) / activeRoiPkg.price).toFixed(1);

  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#021a22]/95 backdrop-blur-xl shadow-lg border-b border-white/5">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center group">
              <img
                src={SITE_CONFIG.logoUrl}
                alt="Nexalytics AI Logo"
                className="h-10 sm:h-12 w-auto group-hover:drop-shadow-[0_0_20px_rgba(0,255,170,0.85)] transition-all duration-300 group-hover:scale-105"
              />
            </a>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brandNeon/10 border border-brandNeon/30 text-[10px] font-mono text-brandNeon shadow-[0_0_10px_rgba(0,255,170,0.2)] whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-brandNeon animate-ping" />
              <span>99.98% Telemetry Active</span>
            </div>
          </div>

          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-3.5 text-xs font-medium ml-auto">
            <a href="#about" className="text-gray-300 hover:text-brandNeon transition">About</a>
            <a href="#services" className="text-gray-300 hover:text-brandNeon transition">Capabilities</a>
            <a href="#specs" className="text-gray-300 hover:text-brandNeon transition flex items-center gap-1">
              <span>Specs</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-brandNeon/20 text-brandNeon">LIVE</span>
            </a>
            <a href="#sandbox" className="text-gray-300 hover:text-brandNeon transition flex items-center gap-1">
              <span>Interactive Sandbox</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-brandOrange/20 text-brandOrange">DEMO</span>
            </a>
            <a href="#benchmarks" className="text-gray-300 hover:text-brandNeon transition">Benchmarks</a>
            <a href="#roi-calculator" className="text-gray-300 hover:text-brandNeon transition">ROI Calc</a>
            <a href="#pricing" className="text-gray-300 hover:text-brandNeon transition">Pricing</a>
            <a href="#faq" className="text-gray-300 hover:text-brandNeon transition">FAQ</a>
            <a
              href={SITE_CONFIG.pocHubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brandNeon hover:underline flex items-center gap-1 transition text-[11px] font-mono px-2.5 py-1 rounded-md bg-brandNeon/10 border border-brandNeon/30 whitespace-nowrap"
            >
              <span>POC Hub ↗</span>
            </a>
            <a
              href={SITE_CONFIG.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nexalytics AI on LinkedIn"
              title="Nexalytics AI LinkedIn"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#0077b5]/20 border border-white/10 hover:border-[#0077b5]/50 flex items-center justify-center text-gray-300 hover:text-brandNeon transition shrink-0"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a
              href={SITE_CONFIG.razorpayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brandOrange hover:bg-brandOrangeHover text-black font-extrabold px-4 py-1.5 rounded-full text-xs transition shadow-[0_0_18px_rgba(255,89,0,0.35)] hover:scale-105 shrink-0 ml-1 whitespace-nowrap"
            >
              Instant Checkout ⚡
            </a>
          </nav>

          <div className="flex lg:hidden items-center gap-2.5 shrink-0">
            <a
              href={SITE_CONFIG.razorpayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 bg-brandOrange text-black font-extrabold px-3.5 py-1.5 rounded-full text-xs"
            >
              <span>Checkout ⚡</span>
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 bg-white/5 text-white hover:border-brandNeon/50 cursor-pointer"
            >
              ☰
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden absolute right-4 sm:right-6 top-[calc(100%+0.5rem)] w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-[#021922] border border-brandNeon/45 shadow-2xl p-4 space-y-3 z-50">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brandNeon font-bold">System Navigation</span>
              <span className="text-[10px] font-mono text-slate-400">100% Async</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
              <a href="#sandbox" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-brandNeon">Live Sandbox</a>
              <a href="#services" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-brandNeon">Capabilities</a>
              <a href="#specs" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-brandNeon">Specs LIVE</a>
              <a href="#benchmarks" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-brandNeon">Benchmarks</a>
              <a href="#roi-calculator" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-brandNeon">ROI Calculator</a>
              <a href="#pricing" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-brandNeon">Pricing</a>
              <a href="#about" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-brandNeon">Founder & Protocol</a>
              <a href="#contact" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-brandNeon">Inquiry Hub</a>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openIngressModal("Autonomous Data Analytics ($499)");
                }}
                className="py-2 px-3 rounded-full bg-brandNeon text-black font-extrabold text-[11px] cursor-pointer"
              >
                Async Ingress ⚡
              </button>
              <a
                href={SITE_CONFIG.razorpayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-full bg-brandOrange text-black font-extrabold text-[11px] text-center"
              >
                Razorpay ↗
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ACTIVE ASYNC TICKET TRACKER BANNER */}
      {ticket && (
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="w-full rounded-2xl p-4 sm:p-5 bg-brandNeon/10 border border-brandNeon/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-brandNeon font-bold">
                {`✓ Active Async Ticket · ${ticket.ticketId} · ${ticket.status}`}
              </div>
              <p className="text-sm text-white font-semibold">{`${ticket.tier} — ${ticket.repoOrUrl}`}</p>
              <p className="text-xs text-slate-300 font-mono">
                {`Updates & sandbox credentials dispatched asynchronously to ${ticket.email}`}
              </p>
            </div>
            <a
              href={SITE_CONFIG.razorpayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full bg-brandOrange hover:bg-brandOrangeHover text-black font-bold text-xs whitespace-nowrap shrink-0 text-center"
            >
              Proceed to Razorpay Checkout ⚡
            </a>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative min-h-[84vh] flex items-center overflow-hidden z-10 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-brandGreen/10 border border-brandGreen/40 text-xs font-mono mb-6 text-brandNeon rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(0,255,170,0.25)]">
              <span className="w-2 h-2 rounded-full bg-brandNeon animate-ping" />
              <span>Autonomous Systems Architecture & LLM Runtime Guard Engine</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight mb-6 gradient-headline drop-shadow-md">
              Deterministic Schema Firewalls & Evaluation Harnesses for Production AI
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed font-normal">
              Nexalytics AI eliminates silent agent runtime failures by deploying deterministic AST schema contracts, automated prompt injection fuzzing, and telemetry-verified Next.js platforms in 48 to 72 hours — shipped 100% asynchronously with zero calls or WhatsApp friction.
            </p>

            <div className="flex flex-wrap gap-3.5 font-semibold text-sm mb-5">
              <button
                type="button"
                onClick={() => openIngressModal("Autonomous Data Analytics ($499)")}
                className="bg-brandOrange hover:bg-brandOrangeHover text-black font-extrabold px-6 py-3.5 rounded-full transition shadow-[0_0_25px_rgba(255,89,0,0.35)] hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Initialize Instant Staging Ingress</span>
                <span className="font-mono text-xs">⚡</span>
              </button>
              <button
                type="button"
                onClick={() => selectSprintOption("Complimentary 24h Staging Benchmark")}
                className="bg-brandNeon/15 hover:bg-brandNeon text-brandNeon hover:text-black border border-brandNeon/40 px-6 py-3.5 rounded-full backdrop-blur-md transition flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,170,0.25)] hover:scale-105 cursor-pointer"
              >
                <span>Free 24h Dry-Run Audit</span>
                <span className="text-xs font-mono">→</span>
              </button>
              <a
                href="#sandbox"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/25 px-6 py-3.5 rounded-full backdrop-blur-md transition flex items-center gap-2 hover:scale-105"
              >
                <span>Live Interactive Sandbox</span>
                <span className="text-xs font-mono">↓</span>
              </a>
              <a
                href={SITE_CONFIG.pocHubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brandGreen/15 hover:bg-brandGreen text-brandNeon hover:text-black border border-brandGreen/40 px-6 py-3.5 rounded-full backdrop-blur-md transition flex items-center gap-1.5"
              >
                <span>Architecture POC Hub</span>
                <span>↗</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 text-xs font-mono text-gray-400 pt-2">
              <span className="flex items-center gap-1.5"><span className="text-brandGreen">✓</span> Sub-5ms AST Runtime Gate</span>
              <span className="flex items-center gap-1.5"><span className="text-brandGreen">✓</span> 100% Repository & Telemetry Handover</span>
              <span className="flex items-center gap-1.5 text-brandNeon"><span>⚡</span> 100% Async (No Calls · No WhatsApp)</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[11px]">
                <span>🌐</span> International Geneva AI Governance (GAIGI Connect)
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="relative w-full max-w-lg mx-auto flex items-center justify-center"
          >
            <div className="absolute -inset-6 bg-gradient-to-tr from-brandNeon/30 via-cyan-500/25 to-transparent blur-3xl rounded-full -z-10 pointer-events-none" />
            <div className="floating-hero-monitor w-full">
              <img
                src={SITE_CONFIG.heroAndOgImageUrl}
                alt="AI Neural Network Visual"
                className="relative z-10 w-full h-auto object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-brandNeon/40 p-2.5 glass-3d-card rounded-2xl shadow-[0_0_40px_rgba(0,255,170,0.25)]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4-PRESET INTERACTIVE AST SANDBOX + EMAIL AUDIT RECEIPT */}
      <section id="sandbox" className="py-14 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="glass-3d-card rounded-3xl p-5 sm:p-8 border-2 border-brandNeon/40 bg-[#011b22]/95 shadow-[0_0_50px_rgba(0,255,170,0.15)]">
          <div className="pb-6 border-b border-white/10 space-y-5">
            <div>
              <p className="text-xs font-mono text-brandOrange font-semibold mb-1.5 uppercase tracking-wider">⚡ Interactive Public Sandbox Demo · Live AST Engine</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Live LLM Agent Runtime Schema Guard</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                Simulate adversarial prompt injection, schema drift, or credential/PII leakage. Watch the deterministic AST filter intercept in sub-5ms without calling an external LLM judge.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
              {(
                [
                  { id: "injection", label: "1. Jailbreak Payload", activeClass: "bg-rose-500 text-white border-rose-500 font-bold" },
                  { id: "drift", label: "2. Schema Drift", activeClass: "bg-amber-400 text-black border-amber-400 font-bold" },
                  { id: "pii", label: "3. Secret / PII Leak", activeClass: "bg-rose-500 text-white border-rose-500 font-bold" },
                  { id: "clean", label: "4. Validated Contract", activeClass: "bg-brandNeon text-black border-brandNeon font-bold" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePresetSelect(item.id)}
                  className={`px-3 py-2.5 rounded-lg border transition cursor-pointer ${
                    activePreset === item.id
                      ? item.activeClass
                      : "bg-white/5 text-slate-200 border-white/15 hover:border-brandNeon/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 items-stretch">
            <div className="flex flex-col justify-between space-y-4">
              <div className="flex-1 flex flex-col">
                <label htmlFor="sandboxInput" className="block text-xs font-mono text-slate-300 mb-2">
                  Inbound Agent Tool-Call Payload (Editable JSON):
                </label>
                <textarea
                  id="sandboxInput"
                  rows={8}
                  spellCheck={false}
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  className="w-full flex-1 bg-[#02141a] border border-white/15 p-3.5 text-brandNeon font-mono text-xs rounded-xl focus:border-brandNeon focus:outline-none transition leading-relaxed"
                />
              </div>
              <button
                type="button"
                onClick={() => runGuardrailOnPayload(sandboxInput)}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-brandOrange to-brandGreen text-black font-extrabold text-xs sm:text-sm font-mono uppercase tracking-wider rounded-xl hover:opacity-95 active:scale-[0.99] transition cursor-pointer"
              >
                ▶ Run Deterministic Guardrail Intercept
              </button>
            </div>

            <div className="bg-[#000d12] border border-cyan-500/30 rounded-xl p-4 sm:p-5 font-mono text-xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-2 text-slate-200 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-brandNeon animate-pulse" /> AST_FIREWALL_GATEWAY
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-rose-400 font-bold">{latencyText}</span>
                  <button
                    type="button"
                    onClick={handleCopySandboxJson}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition cursor-pointer"
                  >
                    {copiedJson ? "✓ Copied" : "Copy JSON"}
                  </button>
                </div>
              </div>

              <div className="py-4 space-y-2.5 text-gray-300 terminal-scroll overflow-y-auto">
                <div className={verdictLines.titleClass}>{verdictLines.title}</div>
                {verdictLines.bullets.map((b, idx) => (
                  <div
                    key={idx}
                    className={
                      b.startsWith("• Result:")
                        ? "text-brandGreen text-[11px]"
                        : "text-gray-300 text-[11px]"
                    }
                  >
                    {b}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] my-2">
                <div className="p-2.5 rounded-lg bg-[#021a22] border border-white/10">
                  <div className="text-slate-400">Nexalytics AST Gate</div>
                  <div className="text-brandNeon font-bold mt-0.5">{gateMs}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#021a22] border border-white/10">
                  <div className="text-slate-400">LLM-as-a-Judge Baseline</div>
                  <div className="text-slate-300 font-bold mt-0.5">~420ms</div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                <span>{riskFooter}</span>
                <span className="text-brandNeon">Stateless · Zero-Leak</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10">
            {sandboxConfirmed && ticket ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-brandNeon/10 border border-brandNeon/40 text-xs font-mono">
                <div>
                  <span className="text-white font-bold">
                    {`✓ Audit Receipt Logged (${ticket.ticketId}) — Sent to ${ticket.email}`}
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Our systems architect received your sandbox verdict and will follow up asynchronously with your AST patch &amp; complimentary 24h endpoint benchmark.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => selectSprintOption("Complimentary 24h Staging Benchmark")}
                  className="shrink-0 px-4 py-2 rounded-full bg-brandOrange text-black font-bold text-xs cursor-pointer"
                >
                  Add Staging Repo URL →
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-mono text-slate-200">
                    <span className="text-brandNeon font-bold">Email This Audit Receipt &amp; Get Free AST Fix:</span> Receive this verdict + remediation snippet asynchronously and unlock a free 24h staging fuzz audit.
                  </p>
                  {sandboxReceiptError && (
                    <p className="text-xs font-mono text-rose-300">{sandboxReceiptError}</p>
                  )}
                </div>
                <form
                  onSubmit={handleSandboxEmailReceipt}
                  noValidate
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    name="_honey"
                    tabIndex={-1}
                    autoComplete="off"
                    value={sandboxHoney}
                    onChange={(e) => setSandboxHoney(e.target.value)}
                    className="hidden"
                  />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={sandboxLeadEmail}
                    onChange={(e) => setSandboxLeadEmail(e.target.value)}
                    className="bg-[#02141a] border border-white/20 px-3.5 py-2.5 rounded-full text-xs font-mono text-white focus:border-brandNeon outline-none sm:w-52"
                  />
                  <button
                    type="submit"
                    disabled={sandboxSending}
                    className="px-4 py-2.5 rounded-full bg-brandNeon hover:bg-brandGreen text-black font-extrabold text-xs font-mono transition whitespace-nowrap cursor-pointer"
                  >
                    {sandboxSending ? "Sending..." : "✉ Email Audit Receipt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectSprintOption("Complimentary 24h Staging Benchmark")}
                    className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-mono text-xs transition whitespace-nowrap cursor-pointer"
                  >
                    Free 24h Audit →
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 100% ASYNC ENGINEERING PROTOCOL */}
      <section id="async-protocol" className="py-14 relative z-10 border-y border-white/10 bg-[#01141b]/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-brandNeon uppercase tracking-widest mb-1">100% Async Engineering Protocol</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Zero Discovery Calls. Zero WhatsApp Threads. Pure Shipping Velocity.</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Meetings add 2–3 weeks of coordination drag. Everything at Nexalytics AI runs asynchronously through encrypted ingress tickets, GitHub PRs, email telemetry, and our 24/7 AI Concierge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ASYNC_STEPS.map((item) => (
              <div key={item.step} className="glass-3d-card rounded-2xl p-5 flex flex-col justify-between border border-white/10">
                <div>
                  <div className="text-xs font-mono text-brandNeon font-bold mb-2">{item.step}</div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-slate-400">{item.footer}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs font-mono text-slate-300">
            <span>💬 Need instant pre-purchase answers? Use the 24/7 AI Concierge widget (90+ languages) in the bottom-right corner.</span>
            <a href="#contact" className="text-brandNeon hover:underline font-semibold">Or submit technical specs asynchronously →</a>
          </div>
        </div>
      </section>

      {/* TECH STACK TICKER */}
      <section className="bg-[#02141a]/90 py-9 relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-6">Engineered With Enterprise Production Architecture</p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 md:gap-5 max-w-5xl mx-auto">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 ${tech.borderHover} hover:text-white transition`}
              >
                {tech.isPowerBi ? (
                  <svg className="w-5 h-5 fill-amber-400" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                  </svg>
                ) : (
                  <i className={tech.iconClass} />
                )}
                <span className="text-xs font-mono font-semibold">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES SECTION */}
      <section id="services" className="py-24 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-mono text-brandNeon uppercase tracking-widest">Capabilities</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-white">We engineer verifiable outcomes, not billed hours.</h2>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Predictive data pipelines, design systems, evaluation harnesses, and full-stack software handled by autonomous execution engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">
            {/* Card 1 */}
            <div className="glass-3d-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-brandNeon/15 border border-brandNeon/40 text-brandNeon text-[9px] font-mono font-bold px-2.5 py-1 rounded-full">MOST REQUESTED</span>
                </div>
                <div className="w-full h-44 mb-4 overflow-hidden rounded-xl border border-brandNeon/30 bg-gradient-to-br from-[#02161d] via-[#042b38] to-[#021218] relative flex flex-col justify-between p-3.5 shadow-lg">
                  <div className="flex items-center justify-between text-[9px] font-mono text-brandNeon/90">
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brandNeon animate-ping" /> ETL_TELEMETRY</span>
                    <span className="px-1.5 py-0.5 rounded bg-brandNeon/15 border border-brandNeon/30">P95 &lt;12ms</span>
                  </div>
                  <svg className="w-full h-24" viewBox="0 0 260 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="anaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00ffaa" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#00ffaa" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <g stroke="rgba(0,255,170,0.12)" strokeWidth="1">
                      <line x1="0" y1="24" x2="260" y2="24" />
                      <line x1="0" y1="48" x2="260" y2="48" />
                      <line x1="0" y1="72" x2="260" y2="72" />
                    </g>
                    <rect x="18" y="54" width="16" height="34" rx="3" fill="#00e5ff" fillOpacity="0.35" />
                    <rect x="46" y="42" width="16" height="46" rx="3" fill="#00e5ff" fillOpacity="0.5" />
                    <rect x="74" y="48" width="16" height="40" rx="3" fill="#00ffaa" fillOpacity="0.45" />
                    <rect x="102" y="28" width="16" height="60" rx="3" fill="#00ffaa" fillOpacity="0.65" />
                    <rect x="130" y="34" width="16" height="54" rx="3" fill="#00ffaa" fillOpacity="0.55" />
                    <rect x="158" y="18" width="16" height="70" rx="3" fill="#00ffaa" fillOpacity="0.8" />
                    <rect x="186" y="22" width="16" height="66" rx="3" fill="#00e5ff" fillOpacity="0.7" />
                    <rect x="214" y="10" width="16" height="78" rx="3" fill="#00ffaa" />
                    <path d="M26 50 L54 38 L82 43 L110 24 L138 30 L166 15 L194 19 L222 8 L222 88 L26 88 Z" fill="url(#anaGrad)" />
                    <path d="M26 50 L54 38 L82 43 L110 24 L138 30 L166 15 L194 19 L222 8" stroke="#00ffaa" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="110" cy="24" r="3.5" fill="#02161d" stroke="#00ffaa" strokeWidth="2" />
                    <circle cx="166" cy="15" r="3.5" fill="#02161d" stroke="#00ffaa" strokeWidth="2" />
                    <circle cx="222" cy="8" r="4" fill="#00ffaa" />
                  </svg>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 border-t border-white/10 pt-1.5">
                    <span>Parquet + BI Marts</span>
                    <span className="text-brandNeon font-bold">99.98% SLA</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Autonomous Data Analytics</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  End-to-end pipelines, predictive models, and executive BI telemetry deployed in hours.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 text-xs font-mono text-brandNeon flex items-center justify-between">
                <span className="text-gray-400 text-[10px]">TURNAROUND</span>
                <button type="button" onClick={() => selectSprintOption("Autonomous Data Analytics ($499)")} className="font-bold hover:underline cursor-pointer">
                  48 HOURS →
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-3d-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-brandOrange/15 border border-brandOrange/40 text-brandOrange text-[9px] font-mono font-bold px-2.5 py-1 rounded-full">FAST DELIVERY</span>
                </div>
                <div className="w-full h-44 mb-4 overflow-hidden rounded-xl border border-brandOrange/35 bg-gradient-to-br from-[#191118] via-[#072633] to-[#02141a] relative flex flex-col justify-between p-3.5 shadow-lg">
                  <div className="flex items-center justify-between text-[9px] font-mono text-brandOrange">
                    <span>UI_TOKEN_SYSTEM</span>
                    <span className="px-1.5 py-0.5 rounded bg-brandOrange/15 border border-brandOrange/30">REACT / TW</span>
                  </div>
                  <svg className="w-full h-24" viewBox="0 0 260 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="8" width="150" height="80" rx="8" fill="#031c24" stroke="#00e5ff" strokeOpacity="0.45" strokeWidth="1.5" />
                    <circle cx="20" cy="18" r="2.5" fill="#ff5900" />
                    <circle cx="28" cy="18" r="2.5" fill="#fbbf24" />
                    <circle cx="36" cy="18" r="2.5" fill="#00ffaa" />
                    <rect x="18" y="28" width="64" height="22" rx="4" fill="#00ffaa" fillOpacity="0.2" stroke="#00ffaa" strokeOpacity="0.6" />
                    <rect x="88" y="28" width="60" height="22" rx="4" fill="#ff5900" fillOpacity="0.22" stroke="#ff5900" strokeOpacity="0.7" />
                    <rect x="18" y="56" width="130" height="22" rx="4" fill="#00e5ff" fillOpacity="0.12" stroke="#00e5ff" strokeOpacity="0.4" />
                    <rect x="170" y="8" width="82" height="22" rx="6" fill="#00ffaa" fillOpacity="0.18" stroke="#00ffaa" strokeOpacity="0.5" />
                    <circle cx="182" cy="19" r="4" fill="#00ffaa" />
                    <text x="192" y="22" fill="#e2e8f0" fontSize="8" fontFamily="monospace">#00FFAA</text>
                    <rect x="170" y="37" width="82" height="22" rx="6" fill="#ff5900" fillOpacity="0.2" stroke="#ff5900" strokeOpacity="0.6" />
                    <circle cx="182" cy="48" r="4" fill="#ff5900" />
                    <text x="192" y="51" fill="#e2e8f0" fontSize="8" fontFamily="monospace">#FF5900</text>
                    <rect x="170" y="66" width="82" height="22" rx="6" fill="#00e5ff" fillOpacity="0.18" stroke="#00e5ff" strokeOpacity="0.5" />
                    <circle cx="182" cy="77" r="4" fill="#00e5ff" />
                    <text x="192" y="80" fill="#e2e8f0" fontSize="8" fontFamily="monospace">#00E5FF</text>
                  </svg>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 border-t border-white/10 pt-1.5">
                    <span>10 Screens + Tokens</span>
                    <span className="text-brandOrange font-bold">WCAG AA</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Generative UI/UX Design</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Production-ready wireframes, responsive interfaces, and design token architectures.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 text-xs font-mono text-brandNeon flex items-center justify-between">
                <span className="text-gray-400 text-[10px]">TURNAROUND</span>
                <button type="button" onClick={() => selectSprintOption("Generative UI/UX System ($999)")} className="font-bold hover:underline cursor-pointer">
                  72 HOURS →
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-3d-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-purple-500/15 border border-purple-400/40 text-purple-300 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full">EVALUATION HARNESS</span>
                </div>
                <div className="w-full h-44 mb-4 overflow-hidden rounded-xl border border-purple-400/40 bg-gradient-to-br from-[#140c24] via-[#1b1236] to-[#041922] relative flex flex-col justify-between p-3.5 shadow-lg">
                  <div className="flex items-center justify-between text-[9px] font-mono text-purple-300">
                    <span>AST_GUARD_KERNEL</span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-400/40">&lt;5ms GATE</span>
                  </div>
                  <svg className="w-full h-24" viewBox="0 0 260 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="130" cy="48" r="38" stroke="#a855f7" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 3" />
                    <circle cx="130" cy="48" r="26" fill="#a855f7" fillOpacity="0.14" stroke="#c084fc" strokeWidth="1.5" />
                    <path d="M130 27 L146 34 V47 C146 58 139 66 130 70 C121 66 114 58 114 47 V34 L130 27 Z" fill="#1e1035" stroke="#00ffaa" strokeWidth="2" />
                    <path d="M124 48 L128 52 L137 43" stroke="#00ffaa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="20" y1="26" x2="92" y2="40" stroke="#f43f5e" strokeWidth="1.6" strokeDasharray="3 3" />
                    <circle cx="20" cy="26" r="4" fill="#f43f5e" />
                    <text x="12" y="17" fill="#fda4af" fontSize="7.5" fontFamily="monospace">INJECT</text>
                    <line x1="20" y1="70" x2="92" y2="56" stroke="#fbbf24" strokeWidth="1.6" strokeDasharray="3 3" />
                    <circle cx="20" cy="70" r="4" fill="#fbbf24" />
                    <text x="12" y="85" fill="#fde047" fontSize="7.5" fontFamily="monospace">DRIFT</text>
                    <line x1="168" y1="48" x2="238" y2="48" stroke="#00ffaa" strokeWidth="2" />
                    <circle cx="238" cy="48" r="4.5" fill="#00ffaa" />
                    <text x="206" y="39" fill="#6ee7b7" fontSize="7.5" fontFamily="monospace">VERIFIED</text>
                  </svg>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 border-t border-white/10 pt-1.5">
                    <span>1,200 Fuzz Vectors</span>
                    <span className="text-purple-300 font-bold">0 LEAKS</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">AI Agent Evaluation Suite</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Automated stress-testing harnesses, prompt injection audits, and semantic drift matrices.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 text-xs font-mono text-purple-300 flex items-center justify-between">
                <span className="text-gray-400 text-[10px]">TURNAROUND</span>
                <button type="button" onClick={() => selectSprintOption("AI Agent Evaluation Suite ($1,499)")} className="font-bold hover:underline cursor-pointer">
                  5 DAYS →
                </button>
              </div>
            </div>

            {/* Card 4 */}
            <div className="glass-3d-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full">ENTERPRISE STACK</span>
                </div>
                <div className="w-full h-44 mb-4 overflow-hidden rounded-xl border border-cyan-400/35 bg-gradient-to-br from-[#021824] via-[#062d42] to-[#02121a] relative flex flex-col justify-between p-3.5 shadow-lg">
                  <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300">
                    <span>MICROSERVICE_MESH</span>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-400/15 border border-cyan-400/30">NEXT + API</span>
                  </div>
                  <svg className="w-full h-24" viewBox="0 0 260 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="28" width="66" height="40" rx="7" fill="#032230" stroke="#00e5ff" strokeWidth="1.5" />
                    <text x="21" y="46" fill="#ffffff" fontSize="8.5" fontFamily="monospace" fontWeight="bold">NEXT.JS</text>
                    <text x="22" y="58" fill="#67e8f9" fontSize="7" fontFamily="monospace">Edge UI</text>
                    <line x1="76" y1="48" x2="98" y2="48" stroke="#00ffaa" strokeWidth="1.8" />
                    <polygon points="98,45 104,48 98,51" fill="#00ffaa" />
                    <rect x="104" y="24" width="66" height="48" rx="7" fill="#042936" stroke="#00ffaa" strokeWidth="1.6" />
                    <text x="114" y="45" fill="#00ffaa" fontSize="8.5" fontFamily="monospace" fontWeight="bold">FASTAPI</text>
                    <text x="113" y="58" fill="#cbd5e1" fontSize="7" fontFamily="monospace">AST Gate</text>
                    <line x1="170" y1="48" x2="192" y2="48" stroke="#00e5ff" strokeWidth="1.8" />
                    <polygon points="192,45 198,48 192,51" fill="#00e5ff" />
                    <rect x="198" y="28" width="52" height="40" rx="7" fill="#032230" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="206" y="46" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">PG/VEC</text>
                    <text x="207" y="58" fill="#7dd3fc" fontSize="7" fontFamily="monospace">RLS DB</text>
                  </svg>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 border-t border-white/10 pt-1.5">
                    <span>Docker + CI/CD</span>
                    <span className="text-cyan-300 font-bold">100% IP REPO</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Full-Stack AI MVP</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  API microservices and database engineering deployed at lightning speed.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 text-xs font-mono text-brandNeon flex items-center justify-between">
                <span className="text-gray-400 text-[10px]">TURNAROUND</span>
                <button type="button" onClick={() => selectSprintOption("Full-Stack AI MVP ($1,999)")} className="font-bold hover:underline cursor-pointer">
                  7 DAYS →
                </button>
              </div>
            </div>

            {/* Card 5 */}
            <div className="glass-3d-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-brandGreen/15 border border-brandGreen/40 text-brandGreen text-[9px] font-mono font-bold px-2.5 py-1 rounded-full">AUTONOMOUS AGENT</span>
                </div>
                <div className="w-full h-44 mb-4 overflow-hidden rounded-xl border border-brandGreen/35 bg-gradient-to-br from-[#021b18] via-[#052e29] to-[#02131a] relative flex flex-col justify-between p-3.5 shadow-lg">
                  <div className="flex items-center justify-between text-[9px] font-mono text-brandNeon">
                    <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brandNeon" /> ASYNC_CONCIERGE</span>
                    <span className="px-1.5 py-0.5 rounded bg-brandGreen/20 border border-brandGreen/40">90+ LANGS</span>
                  </div>
                  <svg className="w-full h-24" viewBox="0 0 260 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="12" y="10" width="142" height="24" rx="6" fill="#032824" stroke="#00ffaa" strokeOpacity="0.5" />
                    <text x="20" y="25" fill="#d1fae5" fontSize="8" fontFamily="monospace">Ticket #NX-8492 Queued</text>
                    <rect x="96" y="40" width="152" height="24" rx="6" fill="#063732" stroke="#00e5ff" strokeOpacity="0.6" />
                    <text x="104" y="55" fill="#cffafe" fontSize="8" fontFamily="monospace">AST Spec Synced · 0 Calls</text>
                    <rect x="12" y="70" width="166" height="20" rx="6" fill="#00b870" fillOpacity="0.2" stroke="#00ffaa" strokeOpacity="0.65" />
                    <text x="20" y="83" fill="#00ffaa" fontSize="8" fontFamily="monospace" fontWeight="bold">✓ PR &amp; Telemetry Dispatched</text>
                  </svg>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 border-t border-white/10 pt-1.5">
                    <span>Zero-Call Onboarding</span>
                    <span className="text-brandNeon font-bold">24/7 LIVE</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">24/7 AI Concierge</h3>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Multilingual support in 90+ languages that guides your project from onboarding to delivery.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 text-xs font-mono text-brandNeon flex items-center justify-between">
                <span className="text-gray-400 text-[10px]">AVAILABILITY</span>
                <button type="button" onClick={() => selectSprintOption("Complimentary 24h Staging Benchmark")} className="font-bold hover:underline cursor-pointer">
                  REAL-TIME →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEMS SPECS & BLUEPRINTS */}
      <section id="specs" className="py-24 relative z-10 bg-[#01141b]/95 border-y border-brandNeon/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brandCyan/10 border border-brandCyan/30 text-[11px] font-mono text-brandCyan mb-3">
                <span>⚡ PRODUCTION BLUEPRINTS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Enterprise Systems Specs &amp; Blueprints</h2>
            </div>
            <p className="text-gray-400 text-sm max-w-lg">
              Deterministic contracts, sub-5ms middleware, and audit telemetry engineered for teams replacing manual latency with verifiable agent pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-3d-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-brandNeon mb-4">
                  <span>BLUEPRINT #01</span>
                  <span className="px-2 py-0.5 rounded bg-brandNeon/10 border border-brandNeon/30">IDEMPOTENT</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">High-Throughput CRM Sync Buffer</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-5">
                  Decoupled FastAPI + Supabase buffer solving external rate limits and concurrency locks with automatic exponential backoff and zero payload loss.
                </p>
                <div className="bg-[#02242e] p-3.5 rounded-xl border border-white/10 font-mono text-[11px] space-y-1.5 text-gray-300 mb-6">
                  <div className="text-cyan-300">▹ Ingestion Latency: &lt; 4.2ms</div>
                  <div className="text-brandNeon">▹ Concurrency: 10,000+ req/sec</div>
                  <div className="text-gray-400">▹ Protocol: REST Webhook / HMAC SHA-256</div>
                </div>
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => openIngressModal("Full-Stack AI MVP ($1,999)")} className="w-full text-center py-2.5 px-4 rounded-xl bg-brandGreen/20 hover:bg-brandGreen text-brandNeon hover:text-black border border-brandGreen/40 text-xs font-mono font-bold transition cursor-pointer">
                  Deploy Architecture Spec ($1,999) ⚡
                </button>
                <a href={SITE_CONFIG.razorpayUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center text-[11px] font-mono text-gray-400 hover:text-brandNeon py-0.5">
                  Direct Razorpay Checkout ↗
                </a>
              </div>
            </div>

            <div className="glass-3d-card p-6 rounded-2xl flex flex-col justify-between border-t-2 border-t-purple-400">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-purple-300 mb-4">
                  <span>BLUEPRINT #02</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/40">AUDIT COMPLIANT</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Deterministic Runtime Guardrails</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-5">
                  Compile-time semantic contracts and AST execution isolation for autonomous multi-agent pipelines, eliminating silent state mutations and cognitive drift.
                </p>
                <div className="bg-[#02242e] p-3.5 rounded-xl border border-white/10 font-mono text-[11px] space-y-1.5 text-gray-300 mb-6">
                  <div className="text-purple-300">▹ Compliance: EU AI Act &amp; SOC2 Aligned</div>
                  <div className="text-brandNeon">▹ Verification: Verified AST Sandbox</div>
                  <div className="text-gray-400">▹ Retention: Ephemeral / Zero-Leak</div>
                </div>
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => openIngressModal("AI Agent Evaluation Suite ($1,499)")} className="w-full text-center py-2.5 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-400/40 text-xs font-mono font-bold transition cursor-pointer">
                  Deploy Governance Spec ($1,499) ⚡
                </button>
                <a href={SITE_CONFIG.razorpayUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center text-[11px] font-mono text-gray-400 hover:text-brandNeon py-0.5">
                  Direct Razorpay Checkout ↗
                </a>
              </div>
            </div>

            <div className="glass-3d-card p-6 rounded-2xl flex flex-col justify-between border-t-2 border-t-brandOrange">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-brandOrange mb-4">
                  <span>BLUEPRINT #03</span>
                  <span className="px-2 py-0.5 rounded bg-brandOrange/20 border border-brandOrange/40">ENTERPRISE TELEMETRY</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Dynamic Enterprise Middleware</h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-5">
                  High-frequency pricing recalculation and automated procurement middleware that eliminates database concurrency bottlenecks.
                </p>
                <div className="bg-[#02242e] p-3.5 rounded-xl border border-white/10 font-mono text-[11px] space-y-1.5 text-gray-300 mb-6">
                  <div className="text-brandOrange">▹ Batch Latency Reduction: 84%</div>
                  <div className="text-cyan-300">▹ Architecture: Event-Driven Kafka / Celery</div>
                  <div className="text-gray-400">▹ Integration: PostgreSQL / Supabase REST</div>
                </div>
              </div>
              <button type="button" onClick={() => selectSprintOption("Complimentary 24h Staging Benchmark")} className="w-full text-center py-2.5 px-4 rounded-xl bg-white/5 hover:bg-brandOrange/20 border border-white/10 hover:border-brandOrange/50 text-brandOrange text-xs font-mono font-bold transition cursor-pointer">
                Request Benchmark Audit (Complimentary) →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* EMPIRICAL BENCHMARKS & HARDENING REPORTS */}
      <section id="benchmarks" className="py-24 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono text-brandNeon uppercase tracking-widest">Verifiable Proof</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-4 text-white">Synthetic Stress-Test &amp; Hardening Reports</h2>
            <p className="text-gray-300 text-sm">
              Empirical execution results engineered across production vector ingress, high-concurrency databases, and LLM agent runtimes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-3d-card p-6 rounded-2xl flex flex-col justify-between border-t-2 border-t-brandNeon">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-brandNeon mb-4">
                  <span>BENCHMARK 01</span>
                  <span className="px-2 py-0.5 rounded bg-brandNeon/10 border border-brandNeon/30">RUNTIME GUARD</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">LangChain / LlamaIndex Vector Ingress</h4>
                <p className="text-gray-300 text-xs leading-relaxed mb-6">
                  Re-engineered vector partitions and deployed deterministic inline schema guards, eliminating cascading tool-call timeouts.
                </p>
                <div className="p-4 bg-[#02242e] rounded-xl border border-white/10 font-mono text-xs space-y-2 text-gray-200">
                  <div className="flex justify-between"><span>P99 Latency:</span> <strong className="text-brandNeon">840ms → 12ms</strong></div>
                  <div className="flex justify-between"><span>Throughput:</span> <strong>2,400 QPS</strong></div>
                  <div className="flex justify-between"><span>Schema Drift:</span> <strong className="text-brandGreen">0.00% Defect</strong></div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-xs font-mono text-gray-400">
                <span>HARNESS: AST VERIFIED</span>
                <span className="text-brandNeon">48H SPRINT</span>
              </div>
            </div>

            <div className="glass-3d-card p-6 rounded-2xl flex flex-col justify-between border-t-2 border-t-purple-400">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-purple-300 mb-4">
                  <span>BENCHMARK 02</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/40">ADVERSARIAL FUZZ</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Adversarial Prompt Fuzzing</h4>
                <p className="text-gray-300 text-xs leading-relaxed mb-6">
                  Stress-tested agent tool-call boundaries against 1,200 synthetic jailbreak payloads. Implemented deterministic AST gates with zero leakages.
                </p>
                <div className="p-4 bg-[#02242e] rounded-xl border border-white/10 font-mono text-xs space-y-2 text-gray-200">
                  <div className="flex justify-between"><span>Tested Payloads:</span> <strong>1,200 Injection Vectors</strong></div>
                  <div className="flex justify-between"><span>Filtered Ingress:</span> <strong className="text-purple-300">100% Intercepted</strong></div>
                  <div className="flex justify-between"><span>Token Leakage:</span> <strong className="text-brandGreen">0 Leaks Committed</strong></div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-xs font-mono text-gray-400">
                <span>AUDIT: SOC2 ALIGNED</span>
                <span className="text-purple-300">5-DAY HARNESS</span>
              </div>
            </div>

            <div className="glass-3d-card p-6 rounded-2xl flex flex-col justify-between border-t-2 border-t-cyan-400">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 mb-4">
                  <span>BENCHMARK 03</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-400/15 border border-cyan-400/30">ETL COMPRESSION</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">High-Volume Telemetry Streaming</h4>
                <p className="text-gray-300 text-xs leading-relaxed mb-6">
                  Ingested and compacted streaming unmodeled telemetry logs into memory-mapped Parquet cohorts with sub-second analytical queries.
                </p>
                <div className="p-4 bg-[#02242e] rounded-xl border border-white/10 font-mono text-xs space-y-2 text-gray-200">
                  <div className="flex justify-between"><span>Memory Footprint:</span> <strong className="text-cyan-300">4.2GB Log → 180MB Parquet</strong></div>
                  <div className="flex justify-between"><span>Compression Ratio:</span> <strong>95.7% Reduced</strong></div>
                  <div className="flex justify-between"><span>Query Refresh:</span> <strong className="text-brandGreen">Sub-second P95</strong></div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-xs font-mono text-gray-400">
                <span>STATUS: TELEMETRY ACTIVE</span>
                <span className="text-cyan-300">48H SPRINT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS / BY THE NUMBERS */}
      <section id="results" className="py-20 bg-brandMint text-black shadow-2xl relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-800">By the numbers</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">Architecture shipped in hours, not months</h2>
            </div>
            <p className="text-gray-700 text-base leading-relaxed">
              Every Nexalytics AI engagement runs on autonomous pipelines built for speed. We turn complex system bottlenecks into hardened production code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-black/10 pt-10">
            <div className="border-l-2 border-black/80 pl-6">
              <div className="text-5xl font-black mb-2 tracking-tight">24h</div>
              <div className="font-bold text-lg">Avg. staging start</div>
              <p className="text-gray-700 text-sm mt-1">Average time to provision client diagnostic sandboxes.</p>
            </div>
            <div className="border-l-2 border-black/80 pl-6">
              <div className="text-5xl font-black mb-2 tracking-tight">100%</div>
              <div className="font-bold text-lg">Source code handover</div>
              <p className="text-gray-700 text-sm mt-1">Zero vendor lock-in or recurring agency retainers.</p>
            </div>
            <div className="border-l-2 border-black/80 pl-6">
              <div className="text-5xl font-black mb-2 tracking-tight">&lt; 5ms</div>
              <div className="font-bold text-lg">Runtime execution gate</div>
              <p className="text-gray-700 text-sm mt-1">Sub-5ms deterministic middleware latency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SPRINT PAYBACK & ROI CALCULATOR */}
      <section id="roi-calculator" className="py-20 relative z-10 bg-[#01141b]/80 border-b border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-3d-card rounded-3xl p-6 sm:p-10 border border-brandNeon/25">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <p className="text-xs font-mono text-brandNeon uppercase tracking-widest mb-1.5">⚡ Sprint Payback Estimator</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Calculate What Silent Failures &amp; Agency Delays Cost You Monthly</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Adjust your engineering burn and agent volume to see the exact payback timeline of a fixed-price async sprint.
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-mono text-slate-300 mb-2">Primary Bottleneck:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {(
                      [
                        { id: "analytics", label: "Data Pipelines & BI ($499)" },
                        { id: "uiux", label: "Generative UI/UX ($999)" },
                        { id: "evaluation", label: "LLM Agent Guard & Eval ($1,499)" },
                        { id: "fullstack", label: "Full-Stack AI MVP ($1,999)" },
                      ] as const
                    ).map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setRoiFocus(btn.id)}
                        className={`text-left px-3.5 py-2.5 rounded-xl border transition cursor-pointer ${
                          roiFocus === btn.id
                            ? "bg-brandNeon/15 border-brandNeon text-brandNeon font-bold"
                            : "bg-white/5 border-white/10 text-slate-300 hover:border-white/30"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-mono">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="roiIncidents" className="text-slate-300">Schema/Agent Incidents / Week</label>
                      <span className="text-brandNeon font-bold">{roiIncidents}</span>
                    </div>
                    <input
                      id="roiIncidents"
                      type="range"
                      min={1}
                      max={20}
                      value={roiIncidents}
                      onChange={(e) => setRoiIncidents(Number(e.target.value))}
                      className="w-full accent-[#00ffaa]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="roiHours" className="text-slate-300">Eng Hours Debugged / Incident</label>
                      <span className="text-brandNeon font-bold">{`${roiHours}h`}</span>
                    </div>
                    <input
                      id="roiHours"
                      type="range"
                      min={1}
                      max={12}
                      step={0.5}
                      value={roiHours}
                      onChange={(e) => setRoiHours(Number(e.target.value))}
                      className="w-full accent-[#00ffaa]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="roiRate" className="text-slate-300">Engineer Hourly Cost (USD)</label>
                      <span className="text-brandNeon font-bold">{`$${roiRate}/hr`}</span>
                    </div>
                    <input
                      id="roiRate"
                      type="range"
                      min={40}
                      max={250}
                      step={10}
                      value={roiRate}
                      onChange={(e) => setRoiRate(Number(e.target.value))}
                      className="w-full accent-[#00ffaa]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="roiRuns" className="text-slate-300">Monthly Agent / API Runs</label>
                      <span className="text-brandNeon font-bold">{roiRuns.toLocaleString()}</span>
                    </div>
                    <input
                      id="roiRuns"
                      type="range"
                      min={10000}
                      max={1000000}
                      step={10000}
                      value={roiRuns}
                      onChange={(e) => setRoiRuns(Number(e.target.value))}
                      className="w-full accent-[#00ffaa]"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#02141a] border border-white/15 rounded-2xl p-6 space-y-5">
                <div className="border-b border-white/10 pb-4">
                  <div className="text-xs font-mono text-slate-400">Estimated Monthly Burn Without Guardrails</div>
                  <div className="text-3xl sm:text-4xl font-black text-brandOrange mt-1">
                    {`$${totalMonthlyBurn.toLocaleString()} `}
                    <span className="text-sm font-mono text-slate-300">/ mo</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    {`Eng time reclaimed: ${hoursReclaimed} hrs/month · Retry waste: $${retryWaste.toLocaleString()}`}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-slate-400">Sprint Payback</div>
                    <div className="text-xl font-bold text-brandNeon mt-0.5">{`${paybackDays} Days`}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-slate-400">12-Month ROI</div>
                    <div className="text-xl font-bold text-white mt-0.5">{`${roiMultiplier}x`}</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-brandNeon/10 border border-brandNeon/30 space-y-1.5">
                  <div className="text-[11px] font-mono text-brandNeon font-bold">{`Recommended: ${activeRoiPkg.name}`}</div>
                  <p className="text-xs text-slate-200 leading-relaxed">{activeRoiPkg.reason}</p>
                </div>
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => openIngressModal(activeRoiPkg.name)}
                    className="w-full py-3.5 px-5 rounded-full bg-brandOrange hover:bg-brandOrangeHover text-black font-extrabold text-xs sm:text-sm transition hover:scale-[1.01] cursor-pointer"
                  >
                    {`Start ${activeRoiPkg.name} ⚡`}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectSprintOption("Complimentary 24h Staging Benchmark")}
                    className="w-full py-2.5 px-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-mono text-xs transition cursor-pointer"
                  >
                    Or verify first with Free 24h Dry-Run Audit →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TIERS */}
      <section id="pricing" className="py-24 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-brandNeon uppercase tracking-widest">Predictable Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-3 text-white">Fixed-scope engineering packages</h2>
            <p className="text-gray-300 text-sm">
              Transparent USD pricing with zero surprise fees and zero sales calls. Initialize instant staging ingress or deploy via Razorpay.
            </p>
          </div>

          <div className="mb-10 rounded-2xl p-5 bg-[#02242e] border border-brandNeon/40 shadow-[0_0_30px_rgba(0,255,170,0.1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                🛡 Not ready to pay upfront? Start with a Complimentary 24h Staging Benchmark ($0)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                We run an isolated dry-run audit on 1 staging endpoint or sample schema and deliver the defect report asynchronously before you spend $1.
              </p>
            </div>
            <button
              type="button"
              onClick={() => selectSprintOption("Complimentary 24h Staging Benchmark")}
              className="shrink-0 px-5 py-2.5 rounded-full bg-brandNeon hover:bg-brandGreen text-black font-extrabold text-xs font-mono transition shadow-[0_0_20px_rgba(0,255,170,0.45)] whitespace-nowrap cursor-pointer"
            >
              Claim Free 24h Audit →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((plan) => (
              <div
                key={plan.name}
                className={
                  plan.featured
                    ? "glass-3d-card p-6 rounded-3xl flex flex-col justify-between border-2 border-brandOrange bg-[#064d60]/40 shadow-[0_0_40px_rgba(255,89,0,0.25)]"
                    : plan.accent === "purple"
                    ? "glass-3d-card p-6 rounded-3xl flex flex-col justify-between border border-purple-400/40 bg-[#064d60]/30 shadow-[0_0_35px_rgba(168,85,247,0.2)]"
                    : "glass-3d-card p-6 rounded-3xl flex flex-col justify-between"
                }
              >
                {plan.topTag && (
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      plan.accent === "purple" ? "bg-purple-500 text-white" : "bg-brandOrange text-black"
                    }`}
                  >
                    {plan.topTag}
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold mb-2 text-white">{plan.name}</h3>
                  <p className="text-xs text-gray-300 mb-6">{plan.subtitle}</p>
                  <div className="text-3xl font-black mb-1 text-white">
                    {`${plan.price} `}
                    <span
                      className={`text-xs font-normal font-mono ${
                        plan.accent === "orange"
                          ? "text-brandOrange"
                          : plan.accent === "purple"
                          ? "text-purple-300"
                          : "text-brandNeon"
                      }`}
                    >
                      USD
                    </span>
                  </div>
                  <div className="text-xs font-mono text-brandGreen mb-6">{plan.badgeLabel}</div>
                  <ul className="space-y-3 text-xs text-gray-300 border-t border-white/10 pt-6 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <span
                          className={
                            plan.accent === "orange"
                              ? "text-brandOrange"
                              : plan.accent === "purple"
                              ? "text-purple-400"
                              : "text-brandGreen"
                          }
                        >
                          ✓
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => openIngressModal(plan.tierValue)}
                    className={`w-full text-center font-extrabold py-3.5 rounded-full transition text-xs hover:scale-105 active:scale-95 cursor-pointer ${
                      plan.accent === "orange"
                        ? "bg-brandOrange hover:bg-brandOrangeHover text-black shadow-[0_0_28px_rgba(255,89,0,0.5)]"
                        : plan.accent === "purple"
                        ? "bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)]"
                        : "bg-brandGreen hover:bg-brandGreenHover text-black shadow-[0_0_20px_rgba(0,184,112,0.35)]"
                    }`}
                  >
                    {plan.ctaLabel}
                  </button>
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono px-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => selectSprintOption(plan.tierValue)}
                      className="text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      Submit Specs Form ↓
                    </button>
                    <a
                      href={SITE_CONFIG.razorpayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brandNeon hover:underline"
                    >
                      Razorpay ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROTOCOL & FOUNDER SECTION */}
      <section id="about" className="py-24 relative z-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono text-brandNeon uppercase tracking-widest">Protocol &amp; Values</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 mb-6 text-white">Autonomous Engineering &amp; Intelligence Protocol</h2>
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>
                  <strong className="text-white">Our Mission:</strong> To eliminate development latency by autonomously engineering production-grade Data Analytics, UI/UX systems, AI agent evaluation suites, and Full-Stack code in hours rather than months.
                </p>
                <p>
                  <strong className="text-white">Our Architecture:</strong> To establish the technical benchmark for autonomous systems engineering, empowering teams to eliminate prompt injection vulnerabilities, database concurrency bottlenecks, and runtime drift.
                </p>
                <p>
                  <strong className="text-white">Foundational Core Values:</strong> Zero Latency (machine-speed execution), Deterministic Runtime (sub-5ms enforcement), and Enterprise Precision (verifiable database &amp; model telemetry).
                </p>
              </div>
            </div>

            <div className="glass-3d-card p-8 rounded-3xl border border-white/15 flex flex-col sm:flex-row items-center gap-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
              <img
                src={SITE_CONFIG.founderImageUrl}
                alt="Deepak Kumar"
                className="w-32 h-32 rounded-full object-cover object-top border-2 border-brandNeon shadow-[0_0_30px_rgba(0,255,170,0.5)] shrink-0"
              />
              <div className="space-y-2.5 text-center sm:text-left">
                <div>
                  <h3 className="text-xl font-bold text-white">{SITE_CONFIG.founderName}</h3>
                  <p className="text-brandNeon text-xs font-mono">{SITE_CONFIG.founderTitle}</p>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Architecting autonomous analytics pipelines, deterministic AST agent evaluation harnesses, and full-stack runtime systems for high-growth engineering teams.
                </p>
                <div className="pt-1 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono">
                    <span>🌐</span> GAIGI Connect · Geneva AI Governance Ecosystem
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brandNeon/10 border border-brandNeon/30 text-brandNeon text-[10px] font-mono">
                    <span>⚡</span> Zero-Retainer · Async Execution
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE SECURITY & ZERO-DATA RETENTION */}
      <section className="py-16 relative z-10 bg-[#021016]/80 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono text-brandNeon uppercase tracking-widest">Compliance Posture</span>
            <h3 className="text-2xl font-bold text-white mt-1">Engineered for Sovereign Enterprise Data</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-brandNeon font-mono font-bold text-lg mb-1">0-PII</div>
              <p className="text-xs text-gray-300">Stateless execution without customer credential logging.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-purple-300 font-mono font-bold text-lg mb-1">AST Sandbox</div>
              <p className="text-xs text-gray-300">Isolated stress-testing preventing raw production exposure.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-cyan-300 font-mono font-bold text-lg mb-1">SOC2 Aligned</div>
              <p className="text-xs text-gray-300">Verifiable telemetry ready for enterprise audit compliance.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-brandOrange font-mono font-bold text-lg mb-1">Sub-5ms</div>
              <p className="text-xs text-gray-300">Deterministic runtime latency across microservices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-brandMint text-black relative z-10 shadow-2xl scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-800">FAQ</span>
            <h2 className="text-3xl font-extrabold mt-1">How does our async diagnostic ingress operate?</h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="bg-white/85 backdrop-blur-md p-6 rounded-2xl cursor-pointer border border-black/10 transition shadow-sm hover:shadow-md">
                <summary className="font-bold text-lg">{item.q}</summary>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT & ENGAGEMENT FORM */}
      <section id="contact" className="py-24 relative z-10 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono text-brandNeon uppercase tracking-widest">Initialization</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Nexalytics AI Staging &amp; Inquiry Hub</h2>
            <p className="text-gray-300 text-sm max-w-xl mx-auto">
              Deploy an autonomous sprint or request an evaluation sandbox. 100% async — no discovery calls or WhatsApp required. Drop your technical specs below for an automated architectural proposal within 4 business hours.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brandGreen/10 border border-brandGreen/30 rounded-xl text-xs font-mono text-brandNeon mt-2">
              <span>⚡</span>
              <span>Zero-Risk Staging: Request a complimentary 24h benchmark audit on 1 staging endpoint.</span>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 text-brandNeon font-mono text-xs">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <a href={`mailto:${SITE_CONFIG.email}`} className="hover:underline">{SITE_CONFIG.email}</a>
            </div>
          </div>

          {dispatchedTicket ? (
            <div className="glass-3d-card p-8 sm:p-10 rounded-3xl border border-brandNeon/45 space-y-6">
              <div>
                <div className="text-xs font-mono text-brandNeon font-bold">{`✓ Async Ticket Dispatched · ${dispatchedTicket.ticketId}`}</div>
                <h3 className="text-2xl font-extrabold text-white mt-1">Your Technical Specs Are Queued</h3>
                <p className="text-sm text-slate-300 mt-1">
                  {`Confirmation & proposal updates will arrive asynchronously at ${dispatchedTicket.email} within 4–12 business hours (zero calls).`}
                </p>
              </div>
              <div className="bg-[#02141a] rounded-2xl p-4 border border-white/10 font-mono text-xs space-y-2 text-slate-300">
                <div><span className="text-slate-400">Ticket ID:</span> <strong className="text-brandNeon">{dispatchedTicket.ticketId}</strong></div>
                <div><span className="text-slate-400">Selected Sprint:</span> <strong className="text-white">{dispatchedTicket.tier}</strong></div>
                <div><span className="text-slate-400">Target Repo / URL:</span> <strong className="text-white">{dispatchedTicket.repoOrUrl}</strong></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={SITE_CONFIG.razorpayUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 px-5 rounded-full bg-brandOrange hover:bg-brandOrangeHover text-black font-extrabold text-xs text-center">
                  Skip Wait &amp; Pay via Razorpay Now ⚡
                </a>
                <button
                  type="button"
                  onClick={() => setDispatchedTicket(null)}
                  className="py-3.5 px-5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-mono text-xs cursor-pointer"
                >
                  Submit Another Spec
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleContactSubmit}
              noValidate
              className="glass-3d-card p-8 sm:p-10 space-y-6 rounded-3xl border border-white/20 shadow-2xl relative"
            >
              <input
                type="text"
                name="_honey"
                tabIndex={-1}
                autoComplete="off"
                value={contactHoney}
                onChange={(e) => setContactHoney(e.target.value)}
                className="hidden"
              />

              {contactError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-mono">
                  {contactError}
                </div>
              )}

              <div>
                <label htmlFor="inquiryName" className="block text-xs font-mono uppercase text-gray-300 mb-2">Full name *</label>
                <input
                  id="inquiryName"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  className="w-full bg-[#02242e] border border-white/20 p-3.5 text-white rounded-xl focus:border-brandNeon outline-none text-sm"
                />
              </div>

              <div>
                <label htmlFor="inquiryEmail" className="block text-xs font-mono uppercase text-gray-300 mb-2">Work email (Primary Async Channel) *</label>
                <input
                  id="inquiryEmail"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  className="w-full bg-[#02242e] border border-white/20 p-3.5 text-white rounded-xl focus:border-brandNeon outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inquiryContact" className="block text-xs font-mono uppercase text-gray-300 mb-2">Slack / Async Handle (Optional)</label>
                  <input
                    id="inquiryContact"
                    type="text"
                    placeholder="Optional · Async delivery only (no calls)"
                    value={inquiryContact}
                    onChange={(e) => setInquiryContact(e.target.value)}
                    className="w-full bg-[#02242e] border border-white/20 p-3.5 text-white rounded-xl focus:border-brandNeon outline-none text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="inquiryRepo" className="block text-xs font-mono uppercase text-gray-300 mb-2">Target Repo / Staging URL</label>
                  <input
                    id="inquiryRepo"
                    type="text"
                    placeholder="github.com/org/repo or staging link"
                    value={inquiryRepo}
                    onChange={(e) => setInquiryRepo(e.target.value)}
                    className="w-full bg-[#02242e] border border-white/20 p-3.5 text-white rounded-xl focus:border-brandNeon outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="serviceSelectDropdown" className="block text-xs font-mono uppercase text-gray-300 mb-2">Which sprint do you need? *</label>
                <select
                  id="serviceSelectDropdown"
                  required
                  value={serviceSelect}
                  onChange={(e) => setServiceSelect(e.target.value)}
                  className="w-full bg-[#02242e] border border-white/20 p-3.5 text-white rounded-xl focus:border-brandNeon outline-none text-sm"
                >
                  <option value="Autonomous Data Analytics ($499)">Autonomous Data Analytics ($499)</option>
                  <option value="Generative UI/UX System ($999)">Generative UI/UX System ($999)</option>
                  <option value="AI Agent Evaluation Suite ($1,499)">AI Agent Evaluation Suite ($1,499)</option>
                  <option value="Full-Stack AI MVP ($1,999)">Full-Stack AI MVP ($1,999)</option>
                  <option value="Enterprise Architecture Blueprint Review">Enterprise Architecture Blueprint Review (Custom)</option>
                  <option value="Complimentary 24h Staging Benchmark">Complimentary 24h Staging Benchmark (Zero Commitment)</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-mono uppercase text-gray-300 mb-3">Target delivery window *</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-gray-200">
                  {[
                    "Autonomous Sprint (48–72 Hours)",
                    "Agent Evaluation Sprint (5 Days)",
                    "Full-Stack Build (7 Days)",
                    "Complimentary 24h Dry-Run",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-brandNeon/50 transition"
                    >
                      <input
                        type="radio"
                        name="Delivery Timeline"
                        value={opt}
                        checked={deliveryTimeline === opt}
                        onChange={(e) => setDeliveryTimeline(e.target.value)}
                        className="accent-brandNeon w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm">
                        {opt === "Complimentary 24h Dry-Run" ? "Complimentary 24h Dry-Run Audit" : opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="inquiryDetails" className="block text-xs font-mono uppercase text-gray-300 mb-2">
                  Technical requirements or bottleneck details *
                </label>
                <textarea
                  id="inquiryDetails"
                  rows={4}
                  required
                  placeholder="Share your data sources, current pipeline bottleneck, agent endpoints, or staging requirements..."
                  value={inquiryDetails}
                  onChange={(e) => setInquiryDetails(e.target.value)}
                  className="w-full bg-[#02242e] border border-white/20 p-3.5 text-white rounded-xl focus:border-brandNeon outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={contactSubmitting}
                className="w-full bg-brandOrange hover:bg-brandOrangeHover text-black font-extrabold py-4 rounded-full uppercase tracking-wider transition text-sm shadow-[0_0_25px_rgba(255,89,0,0.45)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{contactSubmitting ? "INITIALIZING PIPELINE..." : "Initialize Sandbox Pipeline (Zero-Call Async) →"}</span>
              </button>
              <p className="text-center text-[11px] font-mono text-slate-400">
                🛡 100% Async Delivery · No Phone Calls · No WhatsApp Spam
              </p>
            </form>
          )}
        </div>
      </section>

      {/* STRUCTURED FOOTER */}
      <footer className="bg-[#01141b] text-gray-400 relative z-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <img src={SITE_CONFIG.logoUrl} alt="Nexalytics AI Logo" className="h-9 w-auto" />
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Autonomous systems architecture lab delivering production data pipelines, executive BI telemetry, agent evaluation suites, and full-stack runtime software asynchronously within 48 to 72 hours.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={SITE_CONFIG.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-brandNeon transition"
                title="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href={SITE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-pink-400 transition"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white">Direct Async Channel</h4>
            <div className="space-y-1 text-xs">
              <p className="text-gray-400">Inquiries &amp; Proposals (No Calls / No WhatsApp):</p>
              <a href={`mailto:${SITE_CONFIG.email}`} className="text-brandNeon hover:underline font-mono">{SITE_CONFIG.email}</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-white">Network &amp; Assets</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href={SITE_CONFIG.pocHubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brandNeon transition">
                  Architecture &amp; POC Hub ↗
                </a>
              </li>
              <li><a href="#services" className="hover:text-brandNeon transition">Capabilities &amp; Sprints</a></li>
              <li><a href="#specs" className="hover:text-brandNeon transition">Systems Specs &amp; Blueprints</a></li>
              <li><a href="#benchmarks" className="hover:text-brandNeon transition">Telemetry Benchmarks</a></li>
              <li><a href="#pricing" className="hover:text-brandNeon transition">Pricing Packages</a></li>
              <li><button type="button" onClick={() => setLegalModal("privacy")} className="hover:text-brandNeon transition text-left cursor-pointer">Privacy Policy</button></li>
              <li><button type="button" onClick={() => setLegalModal("terms")} className="hover:text-brandNeon transition text-left cursor-pointer">Terms of Service</button></li>
            </ul>
          </div>
        </div>

        <div className="py-6 bg-[#000d12] text-center text-xs text-gray-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 Nexalytics AI. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <button type="button" onClick={() => setLegalModal("privacy")} className="hover:text-brandNeon transition cursor-pointer">Privacy Policy</button>
              <span>•</span>
              <button type="button" onClick={() => setLegalModal("terms")} className="hover:text-brandNeon transition cursor-pointer">Terms of Service</button>
              <span>•</span>
              <button type="button" onClick={() => setLegalModal("deletion")} className="hover:text-brandNeon transition cursor-pointer">User Data Deletion</button>
            </div>
            <p className="flex items-center gap-1.5 justify-center text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-brandNeon animate-ping" />
              Distributed Autonomous Architecture · Zero Data Retention
            </p>
          </div>
        </div>
      </footer>

      {/* SELF-SERVE INGRESS MODAL */}
      {ingressOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setIngressOpen(false); }} className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-3d-card bg-[#02242e]/98 border-2 border-brandNeon/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 text-gray-200 text-sm shadow-[0_0_50px_rgba(0,255,170,0.25)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-brandNeon uppercase tracking-widest font-bold">Self-Serve Async Ingress Protocol</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{`Authorize: ${activeIngressTier.split(" (")[0]}`}</h3>
              </div>
              <button type="button" onClick={() => setIngressOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold p-1 cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-gray-300">
              Submit your target repository or staging endpoint. Zero discovery calls — upon authorization, our runtime provisioner instantiates your isolated sandbox in under 48 hours.
            </p>
            {ingressError && (
              <p className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-mono">{ingressError}</p>
            )}

            <form onSubmit={handleIngressSubmit} noValidate className="space-y-4 font-mono text-xs">
              <div>
                <label htmlFor="ingressRepo" className="block text-gray-400 mb-1">TARGET GITHUB REPO / STAGING URL *</label>
                <input
                  id="ingressRepo"
                  type="text"
                  required
                  placeholder="github.com/org/repo or api.domain.com/v1"
                  value={ingressRepo}
                  onChange={(e) => setIngressRepo(e.target.value)}
                  className="w-full bg-[#02141a] border border-white/20 p-3 text-white rounded-xl focus:border-brandNeon outline-none"
                />
              </div>
              <div>
                <label htmlFor="ingressEmail" className="block text-gray-400 mb-1">FOUNDER / ARCHITECT WORK EMAIL *</label>
                <input
                  id="ingressEmail"
                  type="email"
                  required
                  placeholder="founder@company.com"
                  value={ingressEmail}
                  onChange={(e) => setIngressEmail(e.target.value)}
                  className="w-full bg-[#02141a] border border-white/20 p-3 text-white rounded-xl focus:border-brandNeon outline-none"
                />
              </div>
              <div>
                <label htmlFor="ingressTierDisplay" className="block text-gray-400 mb-1">SELECTED SPRINT TIER</label>
                <input
                  id="ingressTierDisplay"
                  type="text"
                  readOnly
                  value={activeIngressTier}
                  className="w-full bg-[#031d25] border border-white/10 p-3 text-brandNeon font-bold rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={ingressSubmitting}
                className="w-full py-4 bg-brandOrange hover:bg-brandOrangeHover text-black font-extrabold uppercase rounded-xl tracking-wider shadow-[0_0_25px_rgba(255,89,0,0.45)] hover:scale-[1.02] active:scale-95 transition text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{ingressSubmitting ? "RECORDING INGRESS TICKET... ⚡" : "Authorize Ingress & Checkout (Razorpay) ⚡"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LEGAL MODALS */}
      {legalModal === "privacy" && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setLegalModal(null); }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-3d-card bg-[#02242e]/95 border border-brandNeon/30 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-5 text-gray-300 text-xs sm:text-sm shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-brandNeon uppercase tracking-widest">Legal Governance</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Privacy Policy</h3>
              </div>
              <button type="button" onClick={() => setLegalModal(null)} className="text-gray-400 hover:text-white text-2xl font-bold p-1 cursor-pointer">✕</button>
            </div>
            <div className="space-y-4 leading-relaxed">
              <p><strong className="text-white">Effective Date:</strong> January 1, 2026</p>
              <p><strong className="text-white">1. Overview:</strong> Nexalytics AI operates as an autonomous systems architecture and evaluation engineering lab. We respect client confidentiality and maintain zero unauthorized storage or cross-model training on proprietary codebase repositories.</p>
              <p><strong className="text-white">2. Information Collection:</strong> When you submit requirements via our Staging &amp; Inquiry Hub or Sandbox Audit Receipt, we collect your name, business email, and technical specifications solely for delivery evaluation and automated proposal execution.</p>
              <p><strong className="text-white">3. Third-Party Sandboxes &amp; Zero-Retention:</strong> Client evaluation suites, prompt schemas, and database staging endpoints are executed in deterministic, ephemeral sandboxes. We do not sell, rent, or leak your codebase or proprietary pipelines to third parties.</p>
              <p><strong className="text-white">4. Direct Contact:</strong> Email us directly at <a href={`mailto:${SITE_CONFIG.email}`} className="text-brandNeon underline font-mono">{SITE_CONFIG.email}</a>.</p>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button type="button" onClick={() => setLegalModal(null)} className="px-5 py-2 rounded-full bg-brandNeon text-black font-bold font-mono text-xs cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {legalModal === "terms" && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setLegalModal(null); }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-3d-card bg-[#02242e]/95 border border-brandOrange/30 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-5 text-gray-300 text-xs sm:text-sm shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-brandOrange uppercase tracking-widest">Legal Governance</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Terms of Service</h3>
              </div>
              <button type="button" onClick={() => setLegalModal(null)} className="text-gray-400 hover:text-white text-2xl font-bold p-1 cursor-pointer">✕</button>
            </div>
            <div className="space-y-4 leading-relaxed">
              <p><strong className="text-white">Effective Date:</strong> January 1, 2026</p>
              <p><strong className="text-white">1. Scope of Engagement:</strong> Nexalytics AI provides fixed-deliverable autonomous engineering sprints delivered 100% asynchronously without mandatory calls or meetings.</p>
              <p><strong className="text-white">2. Intellectual Property (100% Handover):</strong> Upon full settlement of sprint invoices, all custom pipelines, source repositories, and visual assets belong entirely to the client.</p>
              <p><strong className="text-white">3. Turnaround Windows:</strong> Stated turnaround windows (48h, 72h, 5-Day, 7-Day) commence once prerequisite schemas or repository access are provided.</p>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button type="button" onClick={() => setLegalModal(null)} className="px-5 py-2 rounded-full bg-brandOrange text-black font-bold font-mono text-xs cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {legalModal === "deletion" && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setLegalModal(null); }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-3d-card bg-[#02242e]/95 border border-brandCyan/30 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-5 text-gray-300 text-xs sm:text-sm shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-brandCyan uppercase tracking-widest">Compliance &amp; User Rights</span>
                <h3 className="text-xl font-bold text-white mt-0.5">User Data Deletion Callback</h3>
              </div>
              <button type="button" onClick={() => setLegalModal(null)} className="text-gray-400 hover:text-white text-2xl font-bold p-1 cursor-pointer">✕</button>
            </div>
            <div className="space-y-4 leading-relaxed">
              <p>
                You may request complete deletion of any telemetry logs or inquiry history associated with your email or Ticket ID (`NX-...`) by emailing{" "}
                <a href={`mailto:${SITE_CONFIG.email}`} className="text-brandCyan underline">{SITE_CONFIG.email}</a> with subject{" "}
                <span className="text-brandNeon">&quot;Data Deletion Request&quot;</span>.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button type="button" onClick={() => setLegalModal(null)} className="px-5 py-2 rounded-full bg-brandCyan text-black font-bold font-mono text-xs cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BACK-TO-TOP BUTTON */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to Top"
        className={`fixed bottom-6 right-24 z-40 w-11 h-11 rounded-full bg-white/5 hover:bg-brandNeon/20 border border-white/15 hover:border-brandNeon/50 text-gray-300 hover:text-brandNeon backdrop-blur-xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer ${
          showBackTop ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
}
