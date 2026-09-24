import { describe, expect, it } from "vitest";
import { site } from "@/lib/site";
import { classroom, clm, community, faq, faqExtras, hero, meta, programs } from "./content";
import { faqAnswerText } from "./faq-answers";
import { homepageStructuredData } from "./structured-data";

type Node = Record<string, unknown> & { "@type": string | string[]; "@id": string };

const data = homepageStructuredData();
const graph = data["@graph"] as Node[];
const byType = (type: string) => {
  const node = graph.find((n) => [n["@type"]].flat().includes(type));
  if (!node) throw new Error(`no ${type} node in the graph`);
  return node;
};

/** Every string value anywhere in the graph under the given key. */
function collect(value: unknown, key: string, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => collect(v, key, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === key && typeof v === "string") out.push(v);
      collect(v, key, out);
    }
  }
  return out;
}

describe("homepageStructuredData", () => {
  it("is a schema.org graph with the expected node types and unique ids", () => {
    expect(data["@context"]).toBe("https://schema.org");
    for (const type of ["Organization", "WebSite", "WebPage", "DefinedTerm", "FAQPage"]) byType(type);
    const ids = graph.map((n) => n["@id"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has one Question per FAQ item, answered with the whole visible answer", () => {
    const entities = byType("FAQPage").mainEntity as { name: string; acceptedAnswer: { text: string } }[];

    expect(entities).toHaveLength(faq.items.length);
    entities.forEach((q, i) => {
      expect(q.name).toBe(faq.items[i].question);
      // faq-answers.test.tsx checks this text against the rendered answer panel, both ways.
      expect(q.acceptedAnswer.text).toBe(faqAnswerText(faq.items[i]));
      expect(q.acceptedAnswer.text.startsWith(faq.items[i].answer)).toBe(true);
    });
  });

  it("asserts no unconfirmed claim: no ratings, reviews, people or prices, and no pending figures", () => {
    const json = JSON.stringify(data);
    const types = collect(graph, "@type").concat(graph.flatMap((n) => [n["@type"]].flat()));

    for (const type of ["AggregateRating", "Rating", "Review", "Person", "PriceSpecification"]) expect(types).not.toContain(type);
    for (const key of ["aggregateRating", "review", "price", "priceCurrency"]) expect(json).not.toContain(`"${key}"`);

    const pending = [
      classroom.live.rating.score,
      hero.ledger.find((item) => item.id === "satisfaction")!.title,
      hero.ledger.find((item) => item.id === "refund")!.title,
      community.stats.find((stat) => stat.id === "minutes")!.value,
      faqExtras.payment.refund.timing,
    ];
    for (const claim of pending) expect(json).not.toContain(claim);
  });

  it("offers one Service per programme", () => {
    const catalog = byType("Organization").hasOfferCatalog as { itemListElement: { itemOffered: { name: string } }[] };

    expect(catalog.itemListElement.map((o) => o.itemOffered.name)).toEqual(programs.items.map((p) => p.title));
  });

  it("names every CLM skill and programme in knowsAbout, once each", () => {
    const knowsAbout = byType("Organization").knowsAbout as string[];
    for (const skill of clm.skills) expect(knowsAbout).toContain(skill.name);
    for (const program of programs.items) expect(knowsAbout).toContain(program.title);
    expect(new Set(knowsAbout).size).toBe(knowsAbout.length);
  });

  it("defines CLM with the FAQ's own answer", () => {
    const clmAnswer = faq.items.find((item) => item.id === "clm")?.answer;

    expect(clmAnswer).toBeTruthy();
    expect(byType("DefinedTerm").description).toBe(clmAnswer);
  });

  it("uses the page's meta title and description", () => {
    const page = byType("WebPage");
    expect(page.name).toBe(meta.title);
    expect(page.description).toBe(meta.description);
  });

  it("only references ids defined in the graph", () => {
    const defined = new Set(graph.map((n) => n["@id"]));
    const withoutOwnIds = graph.map((n) => Object.fromEntries(Object.entries(n).filter(([k]) => k !== "@id")));
    const refs = collect(withoutOwnIds, "@id");

    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(defined).toContain(ref);
  });

  it("uses absolute URLs on the site's origin", () => {
    const urls = collect(graph, "url");

    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(url.startsWith(`${site.url}/`)).toBe(true);
  });
});
