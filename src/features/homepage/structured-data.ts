/**
 * schema.org graph for the homepage, built from content.ts so every value
 * matches what's visible on the page (a Google structured-data requirement,
 * and what makes AI answer engines trust and quote it).
 */
import { absoluteUrl, site } from "@/lib/site";
import { clm, faq, hero, meta, programs } from "./content";

const id = (fragment: string) => `${site.url}/#${fragment}`;

export function homepageStructuredData() {
  const clmDefinition = faq.items.find((item) => item.id === "clm")?.answer ?? "";

  const organization = {
    "@type": ["Organization", "EducationalOrganization"],
    "@id": id("organization"),
    name: site.name,
    legalName: site.legalName,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl(site.logo.src), width: site.logo.width, height: site.logo.height },
    description: site.description,
    slogan: site.tagline,
    knowsAbout: [
      "Cognitive Literacy Mapping",
      ...clm.skills.map((skill) => skill.name),
      ...programs.items.map((program) => program.title),
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Spellzee 1:1 live programmes",
      itemListElement: programs.items.map((program) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: program.title,
          description: program.description,
          serviceType: "1:1 live online learning",
          provider: { "@id": id("organization") },
          audience: { "@type": "EducationalAudience", educationalRole: "student" },
        },
      })),
    },
    ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
  };

  const website = {
    "@type": "WebSite",
    "@id": id("website"),
    url: absoluteUrl("/"),
    name: site.name,
    description: site.description,
    publisher: { "@id": id("organization") },
    inLanguage: site.language,
  };

  const webpage = {
    "@type": "WebPage",
    "@id": id("webpage"),
    url: absoluteUrl("/"),
    name: meta.title,
    description: meta.description,
    isPartOf: { "@id": id("website") },
    about: { "@id": id("organization") },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(hero.image.src),
      width: hero.image.width,
      height: hero.image.height,
      caption: hero.image.alt,
    },
    inLanguage: site.language,
  };

  // The method as a named concept, so answer engines can resolve "what is CLM?" to Spellzee.
  const clmTerm = {
    "@type": "DefinedTerm",
    "@id": id("clm"),
    name: "Cognitive Literacy Mapping",
    alternateName: "CLM",
    description: clmDefinition,
    url: absoluteUrl("/#clm"),
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": id("faq"),
    url: absoluteUrl("/#faq"),
    isPartOf: { "@id": id("webpage") },
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, webpage, clmTerm, faqPage],
  };
}
