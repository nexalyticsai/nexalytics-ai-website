import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexalytics AI — Autonomous Systems Architecture & LLM Runtime Guard Engine",
  description:
    "Nexalytics AI engineers deterministic schema firewalls, automated LLM agent evaluation harnesses, and sub-5ms runtime guard contracts within 48 to 72 hours.",
  keywords: [
    "AI Agent Evaluation",
    "Deterministic LLM Contracts",
    "Autonomous Data Pipelines",
    "Schema Drift Prevention",
    "Prompt Injection Firewall",
    "Production Next.js Systems",
    "AI Architecture Sprints"
  ],
  authors: [{ name: "Nexalytics AI" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  alternates: {
    canonical: "https://nexalytics-ai-eta.vercel.app/"
  },
  openGraph: {
    type: "website",
    url: "https://nexalytics-ai-eta.vercel.app/",
    title: "Nexalytics AI — Autonomous Systems Architecture & LLM Runtime Guard Engine",
    description:
      "Deterministic schema firewalls, automated prompt injection audits, and autonomous data pipelines engineered asynchronously in 48-72 hour sprints.",
    images: [
      "https://rjdavx8ozyznxeyh.public.blob.vercel-storage.com/production/websites/infinite-images/03033985-b292-404d-9b46-a29543cbc69d-VNvOTD13eO3blcopE5CkK6gWTPxq2f.png"
    ],
    siteName: "Nexalytics AI"
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexalytics AI — Autonomous Systems Architecture & LLM Runtime Guard Engine",
    description:
      "Autonomous data analytics, generative UI/UX systems, deterministic AI agent evaluation suites, and full-stack runtime builds.",
    images: [
      "https://rjdavx8ozyznxeyh.public.blob.vercel-storage.com/production/websites/infinite-images/03033985-b292-404d-9b46-a29543cbc69d-VNvOTD13eO3blcopE5CkK6gWTPxq2f.png"
    ]
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://nexalytics-ai-eta.vercel.app/#website",
      name: "Nexalytics AI",
      url: "https://nexalytics-ai-eta.vercel.app/",
      description: "Autonomous Systems Architecture & Sub-5ms LLM Runtime Guard Engine for Enterprise AI."
    },
    {
      "@type": "Organization",
      "@id": "https://nexalytics-ai-eta.vercel.app/#organization",
      name: "Nexalytics AI",
      url: "https://nexalytics-ai-eta.vercel.app/",
      logo: "https://rjdavx8ozyznxeyh.public.blob.vercel-storage.com/production/websites/generated-logos/f4d6a6ae-85bd-43f5-bcd8-0af6cb713450-sbNEFJm8gkxwYV7TkVr4SWPq8lGnuq.png",
      email: "nexalytics.ai@gmail.com",
      knowsAbout: [
        "LLM Runtime Guardrails",
        "AST Schema Validation",
        "AI Agent Evaluation Harness",
        "Prompt Injection Defense",
        "Autonomous Data Pipelines",
        "Next.js & FastAPI Microservices"
      ],
      founder: {
        "@type": "Person",
        name: "Deepak Kumar",
        jobTitle: "Founder & Principal Systems Architect"
      },
      sameAs: [
        "https://www.linkedin.com/company/nexalytics-ai",
        "https://www.instagram.com/nexalytics.ai",
        "https://shine-rayon-459.notion.site/Nexalytics-AI-Architecture-7-Day-POC-Hub-3e6b247e791b80eaa94ef0f426086dac"
      ]
    },
    {
      "@type": "SoftwareApplication",
      name: "Nexalytics AI Runtime Guard & Evaluation Engine",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cloud-Native, Linux, Docker, VPC",
      url: "https://nexalytics-ai-eta.vercel.app/",
      offers: [
        { "@type": "Offer", name: "Complimentary 24h Staging Benchmark", price: "0", priceCurrency: "USD" },
        { "@type": "Offer", name: "Autonomous Data Analytics Sprint", price: "499", priceCurrency: "USD" },
        { "@type": "Offer", name: "Generative UI/UX System", price: "999", priceCurrency: "USD" },
        { "@type": "Offer", name: "AI Agent Evaluation Suite", price: "1499", priceCurrency: "USD" },
        { "@type": "Offer", name: "Full-Stack AI MVP", price: "1999", priceCurrency: "USD" }
      ],
      description:
        "Autonomous engineering lab delivering production data pipelines, deterministic LLM agent evaluation harnesses, and sub-5ms runtime schema firewalls."
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can Nexalytics AI handle enterprise architecture without meetings, calls, or WhatsApp?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. 100% of our workflow is asynchronous via encrypted staging ingress tickets, GitHub PRs, and email telemetry with zero discovery calls or WhatsApp threads."
          }
        },
        {
          "@type": "Question",
          name: "How do you evaluate AI agents without exposing production data or customer PII?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "All evaluations run inside isolated deterministic sandboxes using sanitized JSON schemas, masked sample payloads, or staging endpoints—never touching proprietary customer credentials or raw PII."
          }
        },
        {
          "@type": "Question",
          name: "Can teams test Nexalytics AI with zero upfront risk before paying?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Request a Complimentary 24h Staging Benchmark on 1 staging endpoint or masked schema to receive an asynchronous defect and latency report before committing to a fixed sprint."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&family=Source+Sans+3:wght@300;400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script id="tailwind-cdn" src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Script id="tailwind-config" strategy="beforeInteractive">
          {`
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    brandDark: '#044051',
                    brandDarker: '#02242e',
                    brandSurface: '#064d60',
                    brandOrange: '#ff5900',
                    brandOrangeHover: '#e04e00',
                    brandGreen: '#00b870',
                    brandGreenHover: '#009e60',
                    brandNeon: '#00ffaa',
                    brandCyan: '#00e5ff',
                    brandMint: '#daf9ed'
                  },
                  fontFamily: {
                    display: ['"Plus Jakarta Sans"', '"Source Sans 3"', 'sans-serif'],
                    sans: ['"Source Sans 3"', 'sans-serif'],
                    mono: ['"JetBrains Mono"', 'monospace']
                  }
                }
              }
            }
          `}
        </Script>
        <Script
          id="vanilla-tilt"
          src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="cyber-grid selection:bg-brandGreen selection:text-black relative">
        {children}
        <Script id="chatbase-config" strategy="afterInteractive">
          {`
            window.embeddedChatbotConfig = {
              chatbotId: "Pwiukh6tpcv68h1TdCzDA",
              domain: "www.chatbase.co"
            };
          `}
        </Script>
        <Script
          id="chatbase-embed"
          src="https://www.chatbase.co/embed.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
