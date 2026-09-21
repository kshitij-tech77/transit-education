import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// AI and answer-engine crawlers (GPTBot, OAI-SearchBot, ClaudeBot,
// PerplexityBot, Google-Extended, ...) are deliberately not listed: they fall
// under the `*` rule below and may crawl the public site so it can be cited.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cms", "/cms/", "/admin", "/admin/", "/portal", "/portal/", "/api/", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
