import { describe, expect, it } from "vitest";
import { site } from "@/lib/site";
import { clm, faq, meta, programs } from "./content";
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

  it("has one Question per FAQ item, matching the visible copy", () => {
    const entities = byType("FAQPage").mainEntity as { name: string; acceptedAnswer: { text: string } }[];

    expect(entities).toHaveLength(faq.items.length);
    entities.forEach((q, i) => {
      expect(q.name).toBe(faq.items[i].question);
      expect(q.acceptedAnswer.text).toBe(faq.items[i].answer);
    });
  });

  it("offers one Service per programme", () => {
    const catalog = byType("Organization").hasOfferCatalog as { itemListElement: { itemOffered: { name: string } }[] };

    expect(catalog.itemListElement.map((o) => o.itemOffered.name)).toEqual(programs.items.map((p) => p.title));
  });

  it("names every CLM skill in knowsAbout", () => {
    const knowsAbout = byType("Organization").knowsAbout as string[];
    for (const skill of clm.skills) expect(knowsAbout).toContain(skill.name);
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
