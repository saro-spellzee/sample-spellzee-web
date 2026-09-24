import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { classroom } from "../../content";
import { Worksheet } from "./Worksheet";

const { worksheet } = classroom;
type Question = (typeof worksheet.sets)[number][number];

const row = (q: Question) => within(screen.getByRole("group", { name: `${q.before}${worksheet.blank}${q.after}` }));
const option = (q: Question, choice: number) => row(q).getByRole("button", { name: q.options[choice] });
const score = (n: number) => screen.getByText(worksheet.score.replace("{n}", String(n)));
const wrongChoice = (q: Question) => (q.answer + 1) % q.options.length;

function expectRowLocked(q: Question, locked: boolean) {
  q.options.forEach((_, i) => expect(option(q, i)).toHaveAttribute("aria-disabled", String(locked)));
}

describe("Worksheet", () => {
  const [q1, q2, q3] = worksheet.sets[0];

  it("starts a fresh sheet: no score and every row open", () => {
    render(<Worksheet />);

    expect(score(0)).toBeInTheDocument();
    for (const q of worksheet.sets[0]) expectRowLocked(q, false);
  });

  it("counts a right answer and locks its row", async () => {
    const user = userEvent.setup();
    render(<Worksheet />);

    await user.click(option(q1, q1.answer));

    expect(score(1)).toBeInTheDocument();
    expectRowLocked(q1, true);
    expectRowLocked(q2, false);
  });

  it("counts nothing for a wrong answer, locks the row and ignores a second pick", async () => {
    const user = userEvent.setup();
    render(<Worksheet />);

    await user.click(option(q2, wrongChoice(q2)));
    await user.click(option(q2, q2.answer));

    expect(score(0)).toBeInTheDocument();
    expectRowLocked(q2, true);
  });

  it("scores the whole sheet", async () => {
    const user = userEvent.setup();
    render(<Worksheet />);

    await user.click(option(q1, q1.answer));
    await user.click(option(q2, wrongChoice(q2)));
    await user.click(option(q3, q3.answer));

    expect(score(2)).toBeInTheDocument();
  });

  it("starts a new sheet with the next set of words, wrapping after the last", async () => {
    const user = userEvent.setup();
    render(<Worksheet />);
    await user.click(option(q1, q1.answer));

    await user.click(screen.getByRole("button", { name: worksheet.reset }));
    expect(score(0)).toBeInTheDocument();
    for (const q of worksheet.sets[1]) expectRowLocked(q, false);

    for (let i = 2; i <= worksheet.sets.length; i++) await user.click(screen.getByRole("button", { name: worksheet.reset }));
    expectRowLocked(q1, false);
  });

  it("announces the score politely as it changes", () => {
    render(<Worksheet />);

    expect(score(0)).toHaveAttribute("aria-live", "polite");
  });

  it("can be answered from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Worksheet />);

    await user.tab();
    expect(option(q1, 0)).toHaveFocus();
    for (let i = 0; i < q1.answer; i++) await user.tab();
    await user.keyboard("{Enter}");

    expect(score(1)).toBeInTheDocument();
  });

  it("has no axe violations before and after answering", async () => {
    const user = userEvent.setup();
    const { container } = render(<Worksheet />);
    expect(await axeViolations(container)).toEqual([]);

    await user.click(option(q1, wrongChoice(q1)));
    expect(await axeViolations(container)).toEqual([]);
  });
});
