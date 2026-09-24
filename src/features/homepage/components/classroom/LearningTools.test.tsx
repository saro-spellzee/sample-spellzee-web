import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { classroom } from "../../content";
import { LearningTools } from "./LearningTools";

const { tools } = classroom;
const tab = (i: number) => screen.getByRole("tab", { name: tools.items[i].label });
const panel = (i: number) => screen.getByRole("tabpanel", { name: tools.items[i].label });
const last = tools.items.length - 1;
const indexOf = (id: string) => tools.items.findIndex((t) => t.id === id);

function expectSelected(i: number) {
  tools.items.forEach((_, k) => {
    expect(tab(k)).toHaveAttribute("aria-selected", String(k === i));
    expect(tab(k)).toHaveAttribute("tabindex", k === i ? "0" : "-1");
  });
  expect(panel(i)).toBeVisible();
  expect(screen.getByText(tools.counter.replace("{n}", String(i + 1)).replace("{total}", String(tools.items.length)))).toBeInTheDocument();
  // The stage's kind chip (the Flashcards chip shares its tab's label, so skip the tabs).
  expect(screen.getAllByText(tools.items[i].kind).filter((el) => !el.closest("[role=tab]"))).toHaveLength(1);
}

describe("LearningTools", () => {
  it("renders a labelled tablist with the first tool selected and its stages", () => {
    render(<LearningTools />);

    expect(screen.getByRole("tablist", { name: tools.label })).toBeInTheDocument();
    expectSelected(0);
    const first = tools.items[0];
    expect(screen.getByText(tools.stageRange.replace("{from}", String(first.from)).replace("{to}", String(first.to)))).toBeInTheDocument();
  });

  it("switches tools on click and shows 'All stages' for the tool that suits every stage", async () => {
    const user = userEvent.setup();
    render(<LearningTools />);
    const progress = indexOf("progress");

    await user.click(tab(progress));

    expectSelected(progress);
    expect(screen.getByText(tools.allStages)).toBeInTheDocument();
  });

  it("moves selection and focus with the arrow keys, wrapping, and jumps with Home/End", async () => {
    const user = userEvent.setup();
    render(<LearningTools />);

    await user.tab();
    expect(tab(0)).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expectSelected(1);
    expect(tab(1)).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expectSelected(last);
    await user.keyboard("{Home}");
    expectSelected(0);
    await user.keyboard("{End}");
    expectSelected(last);
    expect(tab(last)).toHaveFocus();
  });

  it("flips a flashcard and steps through the deck, resetting the flip", async () => {
    const user = userEvent.setup();
    render(<LearningTools />);
    const { flashcards } = classroom;
    await user.click(tab(indexOf("flashcards")));
    const deck = within(panel(indexOf("flashcards")));
    const card = () => deck.getByRole("button", { name: new RegExp(`^${flashcards.deck[0].grapheme}`) });

    await user.click(card());
    expect(deck.getByRole("button", { name: new RegExp(flashcards.deck[0].words) })).toBeInTheDocument();

    await user.click(deck.getByRole("button", { name: flashcards.next }));
    expect(deck.getByText(`2 / ${flashcards.deck.length}`)).toBeInTheDocument();
    expect(deck.getByRole("button", { name: new RegExp(`^${flashcards.deck[1].grapheme}`) })).toBeInTheDocument();

    await user.click(deck.getByRole("button", { name: flashcards.previous }));
    await user.click(deck.getByRole("button", { name: flashcards.previous }));
    expect(deck.getByText(`${flashcards.deck.length} / ${flashcards.deck.length}`)).toBeInTheDocument();
  });

  it("scores the worksheet, locks answered rows and starts a new sheet", async () => {
    const user = userEvent.setup();
    render(<LearningTools />);
    const { worksheet } = classroom;
    await user.click(tab(indexOf("worksheet")));
    const sheet = within(panel(indexOf("worksheet")));
    const [q1, q2] = worksheet.sets[0];
    const row = (q: (typeof worksheet.sets)[number][number]) => within(sheet.getByRole("group", { name: `${q.before}${worksheet.blank}${q.after}` }));

    await user.click(row(q1).getByRole("button", { name: q1.options[q1.answer] }));
    const wrong = (q2.answer + 1) % 3;
    await user.click(row(q2).getByRole("button", { name: q2.options[wrong] }));
    await user.click(row(q2).getByRole("button", { name: q2.options[q2.answer] })); // locked: ignored

    expect(sheet.getByText(worksheet.score.replace("{n}", "1"))).toBeInTheDocument();
    expect(row(q2).getByRole("button", { name: q2.options[wrong] })).toHaveAttribute("aria-disabled", "true");

    await user.click(sheet.getByRole("button", { name: worksheet.reset }));
    expect(sheet.getByText(worksheet.score.replace("{n}", "0"))).toBeInTheDocument();
    const next = worksheet.sets[1][0];
    expect(sheet.getByRole("group", { name: `${next.before}${worksheet.blank}${next.after}` })).toBeInTheDocument();
  });

  it("shows a word's sounds in the reader, and flags the sight word", async () => {
    const user = userEvent.setup();
    render(<LearningTools />);
    const { reader } = classroom;
    await user.click(tab(indexOf("reader")));
    const stage = within(panel(indexOf("reader")));
    const dog = reader.words.find((w) => w.text === "dog")!;
    const sight = reader.words.find((w) => w.sounds === null)!;

    await user.click(stage.getByRole("button", { name: dog.text }));
    expect(stage.getByRole("button", { name: dog.text })).toHaveAttribute("aria-pressed", "true");
    for (const sound of dog.sounds!) expect(stage.getAllByText(sound).length).toBeGreaterThan(0);

    await user.click(stage.getByRole("button", { name: sight.text }));
    expect(stage.getByText(reader.tricky)).toBeInTheDocument();
  });

  it("ticks off assignments, updating the percentage and the message", async () => {
    const user = userEvent.setup();
    render(<LearningTools />);
    const { progress } = classroom;
    await user.click(tab(indexOf("progress")));
    const list = within(panel(indexOf("progress")));
    const open = progress.items.filter((_, i) => !progress.initial[i]);

    expect(list.getByText("50%")).toBeInTheDocument();
    expect(list.getByText(progress.pending)).toBeInTheDocument();
    for (const item of open) await user.click(list.getByRole("button", { name: new RegExp(item.title) }));

    expect(list.getByText("100%")).toBeInTheDocument();
    expect(list.getByText(progress.allDone)).toBeInTheDocument();
  });

  it("keeps a tool's progress when switching away and back", async () => {
    const user = userEvent.setup();
    render(<LearningTools />);
    const progress = indexOf("progress");

    await user.click(tab(progress));
    await user.click(within(panel(progress)).getByRole("button", { name: new RegExp(classroom.progress.items[2].title) }));
    await user.click(tab(0));
    await user.click(tab(progress));

    expect(within(panel(progress)).getByText("75%")).toBeInTheDocument();
  });

  it("has no axe violations on any tool", async () => {
    const user = userEvent.setup();
    const { container } = render(<LearningTools />);
    for (let i = 0; i < tools.items.length; i++) {
      await user.click(tab(i));
      expect(await axeViolations(container)).toEqual([]);
    }
  });
});
