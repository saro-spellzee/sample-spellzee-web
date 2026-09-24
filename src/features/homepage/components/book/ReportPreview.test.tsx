import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { book } from "../../content";
import { ReportPreview } from "./ReportPreview";

const { report } = book;
const ring = (i: number) => screen.getByRole("button", { name: new RegExp(`^${report.rings[i].value}%`) });
const week = (i: number) => screen.getByRole("button", { name: new RegExp(`Week ${i + 1}`) });

describe("ReportPreview", () => {
  it("starts on the priority skill's observation and the first week", () => {
    render(<ReportPreview />);

    expect(ring(report.initialRing)).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(report.rings[report.initialRing].note)).toBeInTheDocument();
    expect(screen.getByText(report.plan.weeks[0].detail)).toBeInTheDocument();
  });

  it("shows what the mentor observed for the tapped skill", async () => {
    const user = userEvent.setup();
    render(<ReportPreview />);

    await user.click(ring(3));

    expect(ring(3)).toHaveAttribute("aria-pressed", "true");
    expect(ring(report.initialRing)).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(report.rings[3].note)).toBeInTheDocument();
  });

  it("shows the focus of the tapped week", async () => {
    const user = userEvent.setup();
    render(<ReportPreview />);

    await user.click(week(2));

    expect(week(2)).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(report.plan.weeks[2].detail)).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ReportPreview />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
