import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { clmSteps, faq } from "../content";
import { FaqAccordion } from "./FaqAccordion";
import { faqPanels } from "./faq/faqPanels";

const renderAccordion = () => render(<FaqAccordion panels={faqPanels()} />);

const question = (i: number) => screen.getByRole("button", { name: faq.items[i].question });
const answer = (i: number) => screen.getByText(faq.items[i].answer);

function expectOnlyOpen(open: number) {
  faq.items.forEach((_, i) => {
    expect(question(i)).toHaveAttribute("aria-expanded", String(i === open));
    if (i === open) expect(answer(i)).toBeVisible();
    else expect(answer(i)).not.toBeVisible();
  });
}

describe("FaqAccordion", () => {
  it("renders every question as a heading button, with the first one open", () => {
    renderAccordion();

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(faq.items.length);
    expectOnlyOpen(0);
  });

  it("links each question to its answer region", () => {
    renderAccordion();

    const region = screen.getByRole("region", { name: faq.items[0].question });
    expect(question(0)).toHaveAttribute("aria-controls", region.id);
    expect(region).toHaveTextContent(faq.items[0].answer);
  });

  it("opens one question at a time", async () => {
    const user = userEvent.setup();
    renderAccordion();

    await user.click(question(1));
    expectOnlyOpen(1);

    await user.click(question(faq.items.length - 1));
    expectOnlyOpen(faq.items.length - 1);
  });

  it("closes the open question when it is clicked again", async () => {
    const user = userEvent.setup();
    renderAccordion();

    await user.click(question(0));

    expectOnlyOpen(-1);
  });

  it("toggles with Enter and Space from the keyboard", async () => {
    const user = userEvent.setup();
    renderAccordion();

    await user.tab();
    expect(question(0)).toHaveFocus();
    await user.tab();
    expect(question(1)).toHaveFocus();

    await user.keyboard("{Enter}");
    expectOnlyOpen(1);
    await user.keyboard(" ");
    expectOnlyOpen(-1);
  });

  it("shows the CLM step chips inside answers that ask for them", async () => {
    const user = userEvent.setup();
    renderAccordion();
    const i = faq.items.findIndex((item) => item.showSteps);
    expect(i).toBeGreaterThanOrEqual(0);

    if (i !== 0) await user.click(question(i));
    const region = screen.getByRole("region", { name: faq.items[i].question });
    for (const step of clmSteps) expect(region).toHaveTextContent(step.label);
  });

  it("shows each answer's designed extra (cards, comparisons, steps)", async () => {
    const user = userEvent.setup();
    renderAccordion();
    const region = (i: number) => screen.getByRole("region", { name: faq.items[i].question });

    // First answer: the three "about" cards.
    for (const card of faq.extras.about) expect(region(0)).toHaveTextContent(card.title);

    const compare = faq.items.findIndex((item) => item.extra === "compare");
    await user.click(question(compare));
    expect(region(compare)).toHaveTextContent(faq.extras.compare.foundational.title);
    expect(region(compare)).toHaveTextContent(faq.extras.compare.recommendation.body.trim());

    const payment = faq.items.findIndex((item) => item.extra === "payment");
    await user.click(question(payment));
    expect(region(payment)).toHaveTextContent(faq.extras.payment.refund.body);
  });

  it("has no axe violations", async () => {
    const { container } = renderAccordion();
    expect(await axeViolations(container)).toEqual([]);
  });
});
