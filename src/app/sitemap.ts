import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://nexalytics-ai-eta.vercel.app/",
      lastModified: new Date("2026-11-19"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
