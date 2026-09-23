import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { classroom } from "../content";
import { ClassroomActivities } from "./ClassroomActivities";

const tab = (i: number) => screen.getByRole("tab", { name: classroom.tabs[i] });
const last = classroom.tabs.length - 1;

function expectSelected(i: number) {
  classroom.tabs.forEach((_, k) => {
    expect(tab(k)).toHaveAttribute("aria-selected", String(k === i));
    expect(tab(k)).toHaveAttribute("tabindex", k === i ? "0" : "-1");
  });
  expect(screen.getByRole("tabpanel", { name: classroom.tabs[i] })).toBeVisible();
}

describe("ClassroomActivities", () => {
  it("renders a labelled tablist with the first activity selected", () => {
    render(<ClassroomActivities />);

    expect(screen.getByRole("tablist", { name: classroom.activitiesLabel })).toBeInTheDocument();
    expectSelected(0);
    expect(screen.getByText(classroom.read.passage)).not.toBeVisible();
  });

  it("switches panels on click", async () => {
    const user = userEvent.setup();
    render(<ClassroomActivities />);

    await user.click(tab(1));

    expectSelected(1);
    expect(screen.getByText(classroom.read.passage)).toBeVisible();
  });

  it("moves selection and focus with the arrow keys, wrapping at both ends", async () => {
    const user = userEvent.setup();
    render(<ClassroomActivities />);

    await user.tab();
    expect(tab(0)).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expectSelected(1 % classroom.tabs.length);
    expect(tab(1 % classroom.tabs.length)).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expectSelected(0);
    await user.keyboard("{ArrowLeft}");
    expectSelected(last);
    expect(tab(last)).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expectSelected(0);
  });

  it("jumps to the first and last tab with Home and End", async () => {
    const user = userEvent.setup();
    render(<ClassroomActivities />);

    await user.tab();
    await user.keyboard("{End}");
    expectSelected(last);
    expect(tab(last)).toHaveFocus();

    await user.keyboard("{Home}");
    expectSelected(0);
    expect(tab(0)).toHaveFocus();
  });

  it("keeps an activity's progress when switching away and back", async () => {
    const user = userEvent.setup();
    render(<ClassroomActivities />);
    const { read } = classroom;

    await user.click(tab(1));
    await user.click(screen.getByRole("button", { name: read.options[read.correctIndex] }));
    await user.click(tab(0));
    await user.click(tab(1));

    expect(screen.getByText(read.right)).toBeVisible();
  });

  it("has no axe violations on either tab", async () => {
    const user = userEvent.setup();
    const { container } = render(<ClassroomActivities />);
    expect(await axeViolations(container)).toEqual([]);

    await user.click(tab(1));
    expect(await axeViolations(container)).toEqual([]);
  });
});
