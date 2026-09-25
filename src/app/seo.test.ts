// @vitest-environment node
import { describe, expect, it } from "vitest";
import { community, faq, faqExtras, hero, meta, programs } from "@/features/homepage/content";
import { faqAnswerText } from "@/features/homepage/faq-answers";
import { isPublishable } from "@/features/homepage/pending-claims";
import { lastChanged } from "@/lib/last-changed";
import { absoluteUrl, site } from "@/lib/site";
import { GET as llmsTxt } from "./llms.txt/route";
import { metadata as notFoundMetadata } from "./not-found";
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

  it("dates the homepage by its last content change, never the build time", () => {
    const home = sitemap().find((entry) => entry.url === absoluteUrl("/"))!;
    const expected = lastChanged("src/features/homepage/content", "public/images/homepage");

    expect(home.lastModified).toEqual(expected);
    if (expected) expect(expected.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("reads a path's last change from git, and gives up quietly without history", () => {
    expect(lastChanged("package.json")).toBeInstanceOf(Date);
    expect(lastChanged("no/such/path")).toBeUndefined();
  });

  it("keeps the 404 page out of the index, with no tag saying otherwise", () => {
    expect(notFoundMetadata.robots).toMatchObject({ index: false, googleBot: { index: false } });
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
  it("states the page's key facts, programmes and every FAQ with its whole answer", async () => {
    const response = llmsTxt();
    const body = await response.text();

    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(body.startsWith(`# ${site.name}\n`)).toBe(true);
    for (const stat of community.stats.filter((s) => isPublishable("stat", s.id))) expect(body).toContain(`${stat.value} ${stat.label}`);
    for (const program of programs.items) expect(body).toContain(`**${program.title}**`);
    for (const item of faq.items) expect(body).toContain(`### ${item.question}\n\n${faqAnswerText(item)}\n`);
    expect(body).toContain(`(${absoluteUrl("/#book")})`);
  });

  it("leaves out the claims product hasn't confirmed", async () => {
    const body = await llmsTxt().text();
    const pending = [
      ...community.stats.filter((s) => !isPublishable("stat", s.id)).map((s) => s.value),
      ...hero.ledger.filter((i) => !isPublishable("ledger", i.id)).map((i) => i.title),
      faqExtras.payment.refund.timing,
    ];

    expect(pending.length).toBeGreaterThan(2);
    for (const claim of pending) expect(body).not.toContain(claim);
  });
});
