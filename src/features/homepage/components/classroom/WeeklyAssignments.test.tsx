import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { classroom } from "../../content";
import { WeeklyAssignments } from "./WeeklyAssignments";

const { progress } = classroom;
const { items } = progress;
const item = (i: number) => screen.getByRole("button", { name: new RegExp(items[i].title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
const percent = (done: number) => `${Math.round((done / items.length) * 100)}%`;
const initiallyDone = progress.initial.filter(Boolean).length;
const open = items.map((_, i) => i).filter((i) => !progress.initial[i]);
const ticked = items.map((_, i) => i).filter((i) => progress.initial[i]);

describe("WeeklyAssignments", () => {
  it("starts with this week's ticked items, their percentage and the pending message", () => {
    render(<WeeklyAssignments />);

    items.forEach((_, i) => expect(item(i)).toHaveAttribute("aria-pressed", String(progress.initial[i])));
    expect(screen.getByText(percent(initiallyDone))).toBeInTheDocument();
    expect(screen.getByText(progress.pending)).toBeInTheDocument();
  });

  it("reaches 100% and the all-done message once every item is ticked", async () => {
    const user = userEvent.setup();
    render(<WeeklyAssignments />);

    for (const i of open) await user.click(item(i));

    items.forEach((_, i) => expect(item(i)).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByText(percent(items.length))).toBeInTheDocument();
    expect(screen.getByText(progress.allDone)).toHaveAttribute("aria-live", "polite");
  });

  it("goes back to the pending message when a finished week loses a tick", async () => {
    const user = userEvent.setup();
    render(<WeeklyAssignments />);
    for (const i of open) await user.click(item(i));

    await user.click(item(open[0]));

    expect(screen.getByText(percent(items.length - 1))).toBeInTheDocument();
    expect(screen.getByText(progress.pending)).toBeInTheDocument();
    expect(screen.queryByText(progress.allDone)).not.toBeInTheDocument();
  });

  it("unticks an item on a second tap, lowering the percentage", async () => {
    const user = userEvent.setup();
    render(<WeeklyAssignments />);

    await user.click(item(ticked[0]));

    expect(item(ticked[0])).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(percent(initiallyDone - 1))).toBeInTheDocument();
    expect(screen.getByText(progress.pending)).toBeInTheDocument();
  });

  it("works from the keyboard with Tab, Enter and Space", async () => {
    const user = userEvent.setup();
    render(<WeeklyAssignments />);

    await user.tab();
    expect(item(0)).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(item(0)).toHaveAttribute("aria-pressed", String(!progress.initial[0]));
    await user.keyboard(" ");
    expect(item(0)).toHaveAttribute("aria-pressed", String(progress.initial[0]));
  });

  it("has no axe violations", async () => {
    const { container } = render(<WeeklyAssignments />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
