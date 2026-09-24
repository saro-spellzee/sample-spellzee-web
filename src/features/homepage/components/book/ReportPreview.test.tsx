import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { book } from "../../content";
import { ReportPreview } from "./ReportPreview";

const { report } = book;
const { rings, plan } = report;
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// jsdom applies no CSS, so a button's name runs its spans together ("72%Phonemic Awareness…").
const ring = (i: number) => screen.getByRole("button", { name: new RegExp(`^${rings[i].value}%\\s*${escape(rings[i].label)}`) });
const week = (i: number) => screen.getByRole("button", { name: new RegExp(`^${i + 1}\\s*${escape(plan.weekLabel.replace("{n}", String(i + 1)))}`) });
/** A ring other than the one selected on load. */
const other = (report.initialRing + 1) % rings.length;

function expectRing(active: number) {
  rings.forEach((_, i) => expect(ring(i)).toHaveAttribute("aria-pressed", String(i === active)));
  // The observation is announced politely as it changes.
  expect(screen.getByText(rings[active].note).closest("[aria-live]")).toHaveAttribute("aria-live", "polite");
}

function expectWeek(active: number) {
  plan.weeks.forEach((_, i) => expect(week(i)).toHaveAttribute("aria-pressed", String(i === active)));
  expect(screen.getByText(plan.weeks[active].detail)).toHaveAttribute("aria-live", "polite");
}

describe("ReportPreview", () => {
  it("starts on the priority skill's observation and the first week", () => {
    render(<ReportPreview />);

    expectRing(report.initialRing);
    expectWeek(0);
  });

  it("shows what the mentor observed for the tapped skill", async () => {
    const user = userEvent.setup();
    render(<ReportPreview />);

    await user.click(ring(other));

    expectRing(other);
    expect(screen.queryByText(rings[report.initialRing].note)).not.toBeInTheDocument();
  });

  it("shows the focus of the tapped week", async () => {
    const user = userEvent.setup();
    render(<ReportPreview />);

    await user.click(week(2));

    expectWeek(2);
    expect(screen.queryByText(plan.weeks[0].detail)).not.toBeInTheDocument();
  });

  it("works from the keyboard: Enter on a skill, Space on a week", async () => {
    const user = userEvent.setup();
    render(<ReportPreview />);

    await user.tab();
    expect(ring(0)).toHaveFocus();
    await user.keyboard("{Enter}");
    expectRing(0);

    for (let i = 1; i < rings.length; i++) await user.tab();
    await user.tab();
    expect(week(0)).toHaveFocus();
    await user.tab();
    expect(week(1)).toHaveFocus();
    await user.keyboard(" ");
    expectWeek(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(<ReportPreview />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
