/**
 * Each FAQ answer as plain text, for the FAQPage JSON-LD and /llms.txt. Search and answer
 * engines quote this text, so it's the whole visible answer (Google: "the entire text of the
 * answer"): the short answer plus the words of its designed extra (cards, steps, comparisons)
 * in reading order. Many short answers are only a lead-in ("Here's a side-by-side view…").
 *
 * Built from content only. Buttons are calls to action, not answer text, so they're left out,
 * as are claims product hasn't confirmed yet (pending-claims.ts).
 */
import { clmSteps, faqExtras as extras } from "./content";
import { isPublishable } from "./pending-claims";
import type { Faq, FaqExtra } from "./types";

type Note = { strong: string; body: string };
type CheckColumn = { title: string; tag: string; items: readonly { label: string; included: boolean }[]; result: Note };

/** Ends a phrase with a full stop unless it already has closing punctuation. */
const sentence = (text: string) => {
  const t = text.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
};
/** A card, box or list as one sentence: "Title: body." */
const labelled = (title: string, body: string) => `${title.trim()}: ${sentence(body)}`;
/** Numbered steps: "1. First. 2. Second." */
const numbered = (items: readonly string[]) => items.map((item, i) => `${i + 1}. ${sentence(item)}`).join(" ");
/** A note exactly as shown, e.g. "Good to know: reading and writing improve…". */
const note = ({ strong, body }: Note) => sentence(`${strong}${body}`);

/** A tick/cross list: what it covers, then (shown with a cross on the page) what it doesn't. */
function checkColumn({ title, tag, items, result }: CheckColumn) {
  const covered = items.filter((item) => item.included).map((item) => item.label);
  const missing = items.filter((item) => !item.included).map((item) => item.label);
  return [
    labelled(`${title} (${tag})`, covered.join("; ")),
    ...(missing.length ? [labelled(extras.compare.notCovered, missing.join("; "))] : []),
    note(result),
  ].join(" ");
}

function extraText(kind: FaqExtra): string[] {
  switch (kind) {
    case "about":
      return extras.about.map((card) => labelled(card.title, card.body));
    case "online":
      return extras.online.map((card) => labelled(card.title, card.body));
    case "programmes":
      return [...extras.programmes.cards.map((card) => labelled(card.title, card.body)), note(extras.programmes.note)];
    case "improve":
      return [numbered(extras.improve.steps.map((step) => step.label)), note(extras.improve.note)];
    case "speak": {
      const { school, spellzee } = extras.speak;
      return [labelled(school.title, school.body), labelled(spellzee.title, spellzee.body), note(extras.speak.note)];
    }
    case "ages": {
      const { from, to, labels } = extras.ages;
      return [labelled(`${from} to ${to}`, labels.join("; "))];
    }
    case "alone": {
      const { good, missing, recommendation } = extras.alone;
      const first = recommendation.first;
      return [
        labelled(good.title, good.items.join("; ")),
        labelled(missing.title, missing.items.join("; ")),
        labelled(recommendation.title, `${first.before}${first.strong}${first.middle}${first.strong2}${first.after}`),
        sentence(recommendation.second),
      ];
    }
    case "compare": {
      const { foundational, phonics, recommendation } = extras.compare;
      return [checkColumn(foundational), checkColumn(phonics), note(recommendation)];
    }
    case "structure": {
      const { title, stats, lengthTitle, plans, unit, note: closing } = extras.structure;
      return [
        labelled(title, stats.map((stat) => `${stat.value} (${stat.label})`).join("; ")),
        labelled(lengthTitle, `${plans.map((plan) => plan.value).join(", ")} ${unit}`),
        sentence(closing),
      ];
    }
    case "progress":
      return extras.progress.map((tile) => labelled(tile.title, tile.body));
    case "demo":
      return [numbered(extras.demo.map((step) => labelled(step.title, step.body)))];
    case "payment": {
      const { classes, refund } = extras.payment;
      const refundText = isPublishable("faq", "refund-timing") ? `${refund.body} ${refund.timing}` : refund.body;
      return [labelled(classes.title, classes.body), labelled(refund.title, refundText)];
    }
  }
}

/** The full text of one FAQ answer, in the order the page shows it. */
export function faqAnswerText(item: Faq): string {
  return [
    sentence(item.answer),
    ...(item.extra ? extraText(item.extra) : []),
    ...(item.showSteps ? [numbered(clmSteps.map((step) => step.label))] : []),
  ].join(" ");
}
