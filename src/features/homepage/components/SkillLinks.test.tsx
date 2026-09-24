import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { clm } from "../content";
import { setMotionPaused } from "../hooks/motion";
import { SkillLinks } from "./SkillLinks";

// jsdom has no SMIL timeline; give <svg> the three controls the component drives.
const SMIL = ["pauseAnimations", "unpauseAnimations", "setCurrentTime"] as const;
const smil = { pauseAnimations: vi.fn(), unpauseAnimations: vi.fn(), setCurrentTime: vi.fn() };
const originals = SMIL.map((name) => Object.getOwnPropertyDescriptor(SVGSVGElement.prototype, name));

/** A reduced-motion media query the test can flip, like the OS setting changing. */
function stubReducedMotion(matches: boolean) {
  const listeners = new Set<() => void>();
  const mq = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_: string, l: () => void) => listeners.add(l),
    removeEventListener: (_: string, l: () => void) => listeners.delete(l),
  };
  vi.stubGlobal("matchMedia", () => mq);
  return {
    listeners,
    change(next: boolean) {
      mq.matches = next;
      act(() => listeners.forEach((l) => l()));
    },
  };
}

const connectors = (container: HTMLElement) => [...container.querySelectorAll("svg > g")];
/** Each connector's white flowing dash is only visible on the selected skill. */
const flowing = (container: HTMLElement) => connectors(container).map((g) => g.querySelectorAll("path")[1].getAttribute("opacity") === "1");

describe("SkillLinks", () => {
  beforeEach(() => {
    for (const name of SMIL) {
      smil[name].mockClear();
      Object.defineProperty(SVGSVGElement.prototype, name, { value: smil[name], configurable: true, writable: true });
    }
  });
  afterEach(() => {
    SMIL.forEach((name, i) => {
      const original = originals[i];
      if (original) Object.defineProperty(SVGSVGElement.prototype, name, original);
      else delete (SVGSVGElement.prototype as unknown as Record<string, unknown>)[name];
    });
    vi.unstubAllGlobals();
    setMotionPaused(false);
  });

  it("draws one connector per skill, hidden from assistive tech", () => {
    const { container } = render(<SkillLinks active={0} />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(connectors(container)).toHaveLength(clm.skills.length);
  });

  it("shows the flowing dash on the selected skill's connector only", () => {
    const { container, rerender } = render(<SkillLinks active={2} />);
    expect(flowing(container)).toEqual(clm.skills.map((_, i) => i === 2));

    rerender(<SkillLinks active={4} />);
    expect(flowing(container)).toEqual(clm.skills.map((_, i) => i === 4));
  });

  it("plays while motion is on, pauses with the Pause motion switch and resumes after", () => {
    stubReducedMotion(false);
    render(<SkillLinks active={0} />);
    expect(smil.unpauseAnimations).toHaveBeenCalled();
    expect(smil.pauseAnimations).not.toHaveBeenCalled();

    act(() => setMotionPaused(true));
    expect(smil.pauseAnimations).toHaveBeenCalledTimes(1);

    smil.unpauseAnimations.mockClear();
    act(() => setMotionPaused(false));
    expect(smil.unpauseAnimations).toHaveBeenCalledTimes(1);
  });

  it("rests at the first frame under reduced motion, and follows the setting when it changes", () => {
    const reduced = stubReducedMotion(true);
    const { unmount } = render(<SkillLinks active={0} />);
    expect(smil.setCurrentTime).toHaveBeenCalledWith(0);
    expect(smil.pauseAnimations).toHaveBeenCalled();
    expect(smil.unpauseAnimations).not.toHaveBeenCalled();

    reduced.change(false);
    expect(smil.unpauseAnimations).toHaveBeenCalledTimes(1);

    unmount();
    expect(reduced.listeners.size).toBe(0);
  });

  it("renders without SMIL support or matchMedia (older engines, jsdom)", () => {
    // The shared afterEach restores the prototype.
    for (const name of SMIL) delete (SVGSVGElement.prototype as unknown as Record<string, unknown>)[name];
    vi.stubGlobal("matchMedia", undefined);

    expect(() => render(<SkillLinks active={0} />)).not.toThrow();
  });

  it("has no axe violations", async () => {
    const { container } = render(<SkillLinks active={0} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
