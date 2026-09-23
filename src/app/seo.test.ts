// @vitest-environment node
import { describe, expect, it } from "vitest";
import { community, faq, meta, programs } from "@/features/homepage/content";
import { absoluteUrl, site } from "@/lib/site";
import { GET as llmsTxt } from "./llms.txt/route";
import { metadata } from "./page";
import robots from "./robots";
import sitemap from "./sitemap";

describe("homepage metadata", () => {
  it("keeps the title and description within search-result limits", () => {
    expect(meta.title.length).toBeLessThanOrEqual(60);
    expect(meta.description.length).toBeLessThanOrEqual(160);
  });

  it("sets canonical, Open Graph and Twitter from content.ts", () => {
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph).toMatchObject({
      title: meta.title,
      description: meta.description,
      url: "/",
      siteName: site.name,
      locale: site.locale,
    });
    expect(metadata.twitter).toMatchObject({ title: meta.title, description: meta.description });
  });
});

describe("crawl files", () => {
  it("lists the homepage in the sitemap", () => {
    expect(sitemap().map((entry) => entry.url)).toContain(absoluteUrl("/"));
  });

  it("allows every crawler and points at the sitemap", () => {
    const { rules, sitemap: sitemapUrl } = robots();
    for (const rule of [rules].flat()) {
      expect(rule.allow).toBe("/");
      expect(rule.disallow).toBeUndefined();
    }
    expect(sitemapUrl).toBe(absoluteUrl("/sitemap.xml"));
  });
});

describe("/llms.txt", () => {
  it("states the page's key facts, programmes and every FAQ", async () => {
    const response = llmsTxt();
    const body = await response.text();

    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(body.startsWith(`# ${site.name}\n`)).toBe(true);
    for (const stat of community.stats) expect(body).toContain(`${stat.value} ${stat.label}`);
    for (const program of programs.items) expect(body).toContain(`**${program.title}**`);
    for (const item of faq.items) {
      expect(body).toContain(`### ${item.question}`);
      expect(body).toContain(item.answer);
    }
    expect(body).toContain(`(${absoluteUrl("/#book")})`);
  });
});
