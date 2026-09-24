import { Fragment, type ReactNode } from "react";
import { faq } from "../../content/faq";
import { ClmStepChips } from "../ClmStepChips";
import { FaqExtra } from "./FaqExtra";

/** Each FAQ answer (text, designed extra, CLM steps), in `faq.items` order, for the accordion. */
export function faqPanels(): ReactNode[] {
  return faq.items.map((item) => (
    <Fragment key={item.id}>
      <p className="m-0 text-body leading-[1.7] text-ink-soft">{item.answer}</p>
      {item.extra ? <FaqExtra kind={item.extra} /> : null}
      {item.showSteps ? <ClmStepChips size="sm" className="mt-3.5 gap-2" /> : null}
    </Fragment>
  ));
}
