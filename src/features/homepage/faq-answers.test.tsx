import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { faqPanels } from "./components/faq/faqPanels";
import { faq, faqExtras } from "./content";
import { faqAnswerText } from "./faq-answers";

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

/** Every piece of text a reader sees in one rendered answer, outside its buttons and links (calls to action). */
function visibleTexts(panel: ReactNode): string[] {
  const { container, unmount } = render(<>{panel}</>);
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const texts: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = squash(node.textContent ?? "");
    if (text && !node.parentElement?.closest("a, button, [aria-hidden='true']")) texts.push(text);
  }
  unmount();
  return texts;
}

/**
 * What the answer text may add between the page's own strings: list punctuation, "to" for the
 * age range bar and "Not covered" for the items the comparison marks with a cross.
 */
const CONNECTORS = /\b(?:Not covered|to)\b|[\s.,:;()]/g;

/** Shown on the page but held back from JSON-LD and llms.txt until product confirms it (pending-claims.ts). */
const PENDING = [faqExtras.payment.refund.timing];

describe("faqAnswerText", () => {
  const panels = faqPanels();

  it.each(faq.items.map((item, i) => [item.question, item, i] as const))("is the whole visible answer to “%s”", (_, item, i) => {
    const answer = faqAnswerText(item);
    const texts = visibleTexts(panels[i]);

    expect(answer.startsWith(item.answer)).toBe(true);
    expect(texts.length).toBeGreaterThan(1);

    // Everything the answer panel shows is in the text, apart from pending claims…
    for (const text of texts) {
      if (PENDING.includes(text)) expect(answer).not.toContain(text);
      else expect(answer).toContain(text);
    }

    // …and the text says nothing the panel doesn't: take out every visible string (longest
    // first) and only connectors are left.
    const leftover = [...texts].sort((a, b) => b.length - a.length).reduce((rest, text) => rest.split(text).join(" "), answer);
    expect(leftover.replace(CONNECTORS, "")).toBe("");
  });

  it("gives the comparison's crossed-out items as not covered", () => {
    const compare = faq.items.find((item) => item.extra === "compare")!;
    const missing = faqExtras.compare.phonics.items.filter((i) => !i.included).map((i) => i.label);

    expect(faqAnswerText(compare)).toContain(`Not covered: ${missing.join("; ")}.`);
  });
});
