import { book, clm, clmSteps, community, faq, hero, oneOnOne, parentSupport, programs, classroom } from "@/features/homepage/content";
import { absoluteUrl, site } from "@/lib/site";

/**
 * /llms.txt (llmstxt.org): a plain-markdown brief of the site for AI assistants
 * and answer engines (GEO). Generated from content.ts at build time, so it
 * always states exactly what the page states.
 */
export const dynamic = "force-static";

const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

export function GET() {
  const facts = [
    ...community.stats.map((stat) => `${stat.value} ${stat.label}`),
    ...hero.ledger.map((item) => `${item.title}: ${item.description}`),
    ...hero.credentials.map((c) => `${c.name} ${c.caption}`),
    `Legal entity: ${site.legalName}`,
  ];

  const body = `# ${site.name}

> ${site.name} helps children read, write and speak with confidence. It starts with Cognitive Literacy Mapping (CLM), a live diagnostic of a child's reading, writing and speaking, and continues with 1:1 live online sessions with a dedicated mentor. Parents can book a free assessment and receive a personalised improvement plan.

## Key facts

${list(facts)}

## What is Cognitive Literacy Mapping (CLM)?

${faq.items.find((item) => item.id === "clm")?.answer ?? ""}

CLM covers six core skills:

${list(clm.skills.map((skill) => `**${skill.name}**${skill.alt ? ` (also called ${skill.alt})` : ""}: ${skill.description}`))}

The CLM process: ${clmSteps.map((step) => step.label).join(" → ")}.

## Programmes

${list(programs.items.map((p) => `**${p.title}**: ${p.description} Focus skills: ${p.focusSkills.map((s) => s.label).join(", ")}.`))}

## How 1:1 learning works

${oneOnOne.lead}

${list(oneOnOne.features.map((f) => `**${f.title}**: ${f.description}`))}

Learning materials: ${classroom.materials.map((m) => m.title.toLowerCase()).join(", ")}.

Parent support: ${parentSupport.items.map((i) => `${i.title.toLowerCase()} (${i.description.toLowerCase()})`).join("; ")}.

## What happens after booking a free assessment

${book.steps.map((s) => `${s.n}. **${s.title}**: ${s.description}`).join("\n")}

## Frequently asked questions

${faq.items.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n")}

## Links

- [Homepage](${absoluteUrl("/")}): overview of CLM, programmes, educators and parent stories
- [How CLM works](${absoluteUrl("/#clm")})
- [Programmes](${absoluteUrl("/#programs")})
- [Book a free assessment](${absoluteUrl("/#book")})
- [FAQ](${absoluteUrl("/#faq")})
`;

  return new Response(body, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
