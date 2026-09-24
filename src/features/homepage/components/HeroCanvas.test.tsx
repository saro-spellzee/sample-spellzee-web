import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { fakeCanvas } from "../../../../tests/canvas";
import { setMotionPaused } from "../hooks/motion";
import { HeroCanvas } from "./HeroCanvas";

/** The canvas only animates inside the hero (it listens for the pointer on `[data-hero-host]`). */
const renderInHero = () =>
  render(
    <div data-hero-host>
      <div>
        <HeroCanvas />
      </div>
    </div>,
  );

describe("HeroCanvas", () => {
  describe("without a drawing context (jsdom)", () => {
    beforeEach(() => {
      vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    });

    it("renders a decorative canvas hidden from assistive tech", () => {
      const { container } = renderInHero();

      const canvas = container.querySelector("canvas");
      expect(canvas).toHaveAttribute("aria-hidden", "true");
    });

    it("mounts and unmounts without a drawing context or hero host", () => {
      const { unmount } = render(<HeroCanvas />);
      expect(() => unmount()).not.toThrow();
    });

    it("has no axe violations", async () => {
      const { container } = render(<HeroCanvas />);
      expect(await axeViolations(container)).toEqual([]);
    });
  });

  describe("animation", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      setMotionPaused(false);
    });

    it("draws a frame on every animation frame while on screen", () => {
      const canvas = fakeCanvas();
      renderInHero();

      canvas.runFrame();
      canvas.runFrame();

      expect(canvas.drawn()).toBe(2);
    });

    it("holds its last frame while motion is paused, then carries on", () => {
      const canvas = fakeCanvas();
      renderInHero();
      canvas.runFrame();

      act(() => setMotionPaused(true));
      canvas.runFrame();
      canvas.runFrame();
      expect(canvas.drawn()).toBe(1);

      act(() => setMotionPaused(false));
      canvas.runFrame();
      expect(canvas.drawn()).toBe(2);
    });

    it("holds while scrolled off screen, then carries on", () => {
      const canvas = fakeCanvas();
      renderInHero();

      canvas.setOnScreen(false);
      canvas.runFrame();
      expect(canvas.drawn()).toBe(0);

      canvas.setOnScreen(true);
      canvas.runFrame();
      expect(canvas.drawn()).toBe(1);
    });

    it("draws one still frame and never animates when the user prefers reduced motion", () => {
      vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query }));
      const canvas = fakeCanvas();
      renderInHero();

      expect(canvas.drawn()).toBe(1);
      expect(canvas.pending()).toBe(0);
    });

    it("stops animating when unmounted", () => {
      const canvas = fakeCanvas();
      const { unmount } = renderInHero();
      expect(canvas.pending()).toBe(1);

      unmount();

      expect(canvas.pending()).toBe(0);
    });
  });
});
