import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { motion } from "../content";
import { isMotionPaused, setMotionPaused } from "../hooks/motion";
import { MotionToggle } from "./MotionToggle";

describe("MotionToggle", () => {
  afterEach(() => setMotionPaused(false));

  it("pauses and resumes motion, naming itself by what it will do next", async () => {
    const user = userEvent.setup();
    render(<MotionToggle />);

    await user.click(screen.getByRole("button", { name: motion.pause }));

    expect(isMotionPaused()).toBe(true);
    expect(document.documentElement).toHaveAttribute("data-motion", "paused");

    await user.click(screen.getByRole("button", { name: motion.play }));

    expect(isMotionPaused()).toBe(false);
    expect(document.documentElement).not.toHaveAttribute("data-motion");
  });

  it("works from the keyboard with Tab, Enter and Space", async () => {
    const user = userEvent.setup();
    render(<MotionToggle />);

    await user.tab();
    expect(screen.getByRole("button", { name: motion.pause })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(isMotionPaused()).toBe(true);

    expect(screen.getByRole("button", { name: motion.play })).toHaveFocus();
    await user.keyboard(" ");
    expect(isMotionPaused()).toBe(false);
  });

  it("follows the shared switch when motion is paused elsewhere", () => {
    render(<MotionToggle />);

    act(() => setMotionPaused(true));

    expect(screen.getByRole("button", { name: motion.play })).toBeInTheDocument();
  });

  it("has no axe violations in either state", async () => {
    const user = userEvent.setup();
    const { container } = render(<MotionToggle />);
    expect(await axeViolations(container)).toEqual([]);

    await user.click(screen.getByRole("button", { name: motion.pause }));
    expect(await axeViolations(container)).toEqual([]);
  });
});
