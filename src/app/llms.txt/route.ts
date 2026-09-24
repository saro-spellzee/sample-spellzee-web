import { book, classroom, clm, clmSteps, community, educators, faq, hero, oneOnOne, parentSupport, programs } from "@/features/homepage/content";
import { faqAnswerText } from "@/features/homepage/faq-answers";
import { isPublishable } from "@/features/homepage/pending-claims";
import { absoluteUrl, site } from "@/lib/site";

/**
 * /llms.txt (llmstxt.org): a plain-markdown brief of the site for AI assistants
 * and answer engines (GEO). Generated from content.ts at build time, so it
 * always states exactly what the page states, minus claims product hasn't
 * confirmed yet (pending-claims.ts).
 */
export const dynamic = "force-static";

const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

export function GET() {
  const facts = [
    ...community.stats.filter((stat) => isPublishable("stat", stat.id)).map((stat) => `${stat.value} ${stat.label}`),
    ...hero.ledger.filter((item) => isPublishable("ledger", item.id)).map((item) => item.title),
    ...hero.credentials.map((c) => `${c.name} ${c.caption}`),
    `${hero.language.label} ${hero.language.spoken}`,
    `Legal entity: ${site.legalName}`,
  ];
  const clmDefinition = faq.items.find((item) => item.id === "clm")?.answer ?? "";
  const { match } = educators;

  const body = `# ${site.name}

> ${site.name} helps children read, write and speak with confidence. It starts with Cognitive Literacy Mapping (CLM), a live diagnostic of a child's reading, writing and speaking, and continues with 1:1 live online sessions with a dedicated mentor. Parents can book a free 1:1 demo class and receive their child's CLM Report.

## Key facts

${list(facts)}

## What is Cognitive Literacy Mapping (CLM)?

${clmDefinition}

CLM covers six core skills:

${list(clm.skills.map((skill) => `**${skill.name}**${skill.alt ? ` (also called ${skill.alt})` : ""}: ${skill.description}`))}

The CLM process: ${clmSteps.map((step) => step.label).join(" → ")}.

## Programmes

${list(programs.items.map((p) => `**${p.title}**: ${p.description} Focus skills: ${p.focusSkills.map((s) => s.label).join(", ")}.`))}

## How 1:1 learning works

${oneOnOne.lead}

${list(oneOnOne.features.map((f) => f.title))}

Learning tools used in class:

${list(classroom.tools.items.map((tool) => `**${tool.label}**${tool.kind === tool.label ? "" : `: ${tool.kind}`}`))}

## Mentors

${educators.stat.value} ${educators.stat.title.toLowerCase()}. ${educators.stat.body}. ${match.before}${match.strong}${match.after}

## Parent support

${list(parentSupport.items.map((item) => `**${item.title}**: ${item.description}`))}

## What happens after booking a free demo class

${book.steps.map((s) => `${s.n}. **${s.title}** (${s.time}): ${s.description}`).join("\n")}

## Frequently asked questions

${faq.items.map((item) => `### ${item.question}\n\n${faqAnswerText(item)}`).join("\n\n")}

## Links

- [Homepage](${absoluteUrl("/")}): overview of CLM, programmes, educators and parent stories
- [How CLM works](${absoluteUrl("/#clm")})
- [Programmes](${absoluteUrl("/#programs")})
- [Meet the mentors](${absoluteUrl("/#educators")})
- [Book a free demo class](${absoluteUrl("/#book")})
- [FAQ](${absoluteUrl("/#faq")})
`;

  return new Response(body, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
