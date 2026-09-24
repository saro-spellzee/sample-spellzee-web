import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { educators } from "../content";
import { MentorBrowser } from "./MentorBrowser";

const { filters, mentors } = educators;
const last = filters.length - 1;
const tab = (i: number) => screen.getByRole("tab", { name: filters[i].label });
const cards = () => screen.getAllByRole("article");
/** A programme filter (not "All mentors") that has mentors, taken from the content. */
const programme = filters.findIndex((f) => f.id !== "all" && mentors.some((m) => m.programme === f.id));

/** One tab selected, and only it in the Tab order (roving tabindex); the panel is named after it. */
function expectSelected(active: number) {
  filters.forEach((_, i) => {
    expect(tab(i)).toHaveAttribute("aria-selected", String(i === active));
    expect(tab(i)).toHaveAttribute("tabindex", i === active ? "0" : "-1");
  });
  expect(screen.getByRole("tabpanel")).toHaveAccessibleName(filters[active].label);
}

describe("MentorBrowser", () => {
  it("shows every mentor under 'All mentors' with the count", () => {
    render(<MentorBrowser />);

    expectSelected(0);
    expect(cards()).toHaveLength(mentors.length);
    for (const m of mentors) expect(screen.getByRole("heading", { name: m.name })).toBeInTheDocument();
  });

  it("filters to one programme's mentors and updates the count", async () => {
    const user = userEvent.setup();
    render(<MentorBrowser />);
    const expected = mentors.filter((m) => m.programme === filters[programme].id);

    await user.click(tab(programme));

    expectSelected(programme);
    expect(cards()).toHaveLength(expected.length);
    expect(screen.getByRole("heading", { name: expected[0].name })).toBeInTheDocument();
    expect(screen.getByText(String(expected.length), { selector: "b" })).toBeInTheDocument();
  });

  it("moves between filters with the arrow keys, wrapping at both ends", async () => {
    const user = userEvent.setup();
    render(<MentorBrowser />);

    await user.tab();
    expect(tab(0)).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(tab(last)).toHaveFocus();
    expectSelected(last);

    await user.keyboard("{ArrowRight}");
    expect(tab(0)).toHaveFocus();
    expectSelected(0);
    await user.keyboard("{ArrowRight}");
    expectSelected(1);
  });

  it("jumps to the first and last filter with Home and End", async () => {
    const user = userEvent.setup();
    render(<MentorBrowser />);

    await user.tab();
    await user.keyboard("{End}");
    expect(tab(last)).toHaveFocus();
    expectSelected(last);

    await user.keyboard("{Home}");
    expect(tab(0)).toHaveFocus();
    expectSelected(0);
  });

  it("has no axe violations, filtered or not", async () => {
    const user = userEvent.setup();
    const { container } = render(<MentorBrowser />);
    expect(await axeViolations(container)).toEqual([]);

    await user.click(tab(programme));
    expect(await axeViolations(container)).toEqual([]);
  });
});
