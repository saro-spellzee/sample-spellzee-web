import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";

/**
 * Everything on the marketing site is public. AI search / answer crawlers are
 * listed explicitly so the intent is on record (GEO): Spellzee wants to be cited
 * by ChatGPT, Claude, Perplexity, Gemini and Apple Intelligence answers.
 * To opt out of model *training* only, move GPTBot, ClaudeBot, Google-Extended,
 * Applebot-Extended and CCBot to a `disallow: "/"` rule and keep the search/user bots.
 */
const aiCrawlers = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended",
  "Bingbot", "DuckAssistBot", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: aiCrawlers, allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: site.url,
  };
}
