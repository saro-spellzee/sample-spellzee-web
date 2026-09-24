import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
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
});
