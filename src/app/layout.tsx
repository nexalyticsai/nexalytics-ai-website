import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SEO_METADATA, SITE_CONFIG } from "@/data/siteData";

export const metadata: Metadata = {
  title: SEO_METADATA.title,
  description: SEO_METADATA.description,
  keywords: SEO_METADATA.keywords,
  authors: [{ name: SITE_CONFIG.brandName }],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  alternates: {
    canonical: SITE_CONFIG.canonicalUrl,
  },
  openGraph: {
    type: "website",
    url: SITE_CONFIG.siteUrl,
    title: SEO_METADATA.ogTitle,
    description: SEO_METADATA.ogDescription,
    siteName: SITE_CONFIG.brandName,
    images: [{ url: SITE_CONFIG.heroAndOgImageUrl }],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_METADATA.twitterTitle,
    description: SEO_METADATA.twitterDescription,
    images: [SITE_CONFIG.heroAndOgImageUrl],
  },
};

const jsonLdPayload = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SITE_CONFIG.brandName,
      url: SITE_CONFIG.siteUrl,
      logo: SITE_CONFIG.logoUrl,
      email: SITE_CONFIG.email,
      founder: {
        "@type": "Person",
        name: SITE_CONFIG.founderName,
        jobTitle: SITE_CONFIG.founderTitle,
      },
      sameAs: [SITE_CONFIG.linkedInUrl, SITE_CONFIG.instagramUrl],
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_CONFIG.brandName,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cloud-Native, Linux, Docker",
      url: SITE_CONFIG.siteUrl,
      offers: [
        { "@type": "Offer", name: "Autonomous Data Analytics Sprint", price: "499", priceCurrency: "USD" },
        { "@type": "Offer", name: "Generative UI/UX System", price: "999", priceCurrency: "USD" },
        { "@type": "Offer", name: "AI Agent Evaluation Suite", price: "1499", priceCurrency: "USD" },
        { "@type": "Offer", name: "Full-Stack AI MVP", price: "1999", priceCurrency: "USD" },
      ],
      description:
        "Autonomous engineering lab delivering production data pipelines, deterministic LLM agent evaluation harnesses, and sub-5ms runtime schema firewalls.",
    },
  ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPayload) }}
        />
      </head>
      <body className="cyber-grid selection:bg-brandGreen selection:text-black relative">
        {children}

        <Script id="chatbase-config" strategy="afterInteractive">
          {`window.embeddedChatbotConfig = { chatbotId: "${SITE_CONFIG.chatbaseId}", domain: "${SITE_CONFIG.chatbaseDomain}" };`}
        </Script>
        <Script
          src="https://www.chatbase.co/embed.min.js"
          strategy="afterInteractive"
          data-chatbot-id={SITE_CONFIG.chatbaseId}
          data-domain={SITE_CONFIG.chatbaseDomain}
        />
      </body>
    </html>
  );
}
