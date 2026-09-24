import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { educators } from "../content";
import { MentorBrowser } from "./MentorBrowser";

const tab = (i: number) => screen.getByRole("tab", { name: educators.filters[i].label });
const cards = () => screen.getAllByRole("article");

describe("MentorBrowser", () => {
  it("shows every mentor under 'All mentors' with the count", () => {
    render(<MentorBrowser />);

    expect(tab(0)).toHaveAttribute("aria-selected", "true");
    expect(cards()).toHaveLength(educators.mentors.length);
    for (const m of educators.mentors) expect(screen.getByRole("heading", { name: m.name })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName(educators.filters[0].label);
  });

  it("filters to one programme's mentors and updates the count", async () => {
    const user = userEvent.setup();
    render(<MentorBrowser />);
    const filter = educators.filters.findIndex((f) => f.id === "comm");
    const expected = educators.mentors.filter((m) => m.programme === "comm");

    await user.click(tab(filter));

    expect(tab(filter)).toHaveAttribute("aria-selected", "true");
    expect(cards()).toHaveLength(expected.length);
    expect(screen.getByRole("heading", { name: expected[0].name })).toBeInTheDocument();
    expect(screen.getByText(String(expected.length), { selector: "b" })).toBeInTheDocument();
  });

  it("moves between filters with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<MentorBrowser />);

    await user.tab();
    await user.keyboard("{ArrowLeft}");

    const last = educators.filters.length - 1;
    expect(tab(last)).toHaveFocus();
    expect(tab(last)).toHaveAttribute("aria-selected", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(<MentorBrowser />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
