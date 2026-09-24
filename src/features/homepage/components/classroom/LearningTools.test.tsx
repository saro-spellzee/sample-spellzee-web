import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { classroom } from "../../content";
import { LearningTools } from "./LearningTools";

// Each tool's own behaviour is tested in its file (BlendGame, FlashcardDeck, Worksheet,
// DecodableReader, WeeklyAssignments); this covers the tabs around them.
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
  // Every tab controls its own panel; only the selected one shows (hidden panels have no name to query by).
  tools.items.forEach((_, k) => {
    const controlled = document.getElementById(tab(k).getAttribute("aria-controls")!);
    expect(controlled).toHaveAttribute("role", "tabpanel");
    if (k === i) expect(controlled).toBeVisible();
    else expect(controlled).not.toBeVisible();
  });
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

  it("keeps a tool's progress when switching away and back", async () => {
    const user = userEvent.setup();
    render(<LearningTools />);
    const progress = indexOf("progress");
    const { items, initial } = classroom.progress;
    const open = initial.indexOf(false);
    const percent = `${Math.round(((initial.filter(Boolean).length + 1) / items.length) * 100)}%`;

    await user.click(tab(progress));
    await user.click(within(panel(progress)).getByRole("button", { name: new RegExp(items[open].title) }));
    await user.click(tab(0));
    await user.click(tab(progress));

    expect(within(panel(progress)).getByText(percent)).toBeInTheDocument();
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
