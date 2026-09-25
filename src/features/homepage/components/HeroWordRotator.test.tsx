import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { hero } from "../content";
import { setMotionPaused } from "../hooks/motion";
import { HeroWordRotator } from "./HeroWordRotator";

const ROTATE_MS = 3600;
const words = hero.title.words.map((w) => w.text);

/** The word on show: jsdom applies no CSS, so read the class that makes it visible. */
function shownWords() {
  return words.filter((text) => screen.getByText(text).parentElement!.className.split(/\s+/).includes("opacity-100"));
}
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("HeroWordRotator", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setMotionPaused(false);
  });

  it("shows only the first word to start", () => {
    render(<HeroWordRotator />);

    expect(shownWords()).toEqual([words[0]]);
  });

  it("moves to the next word every few seconds and wraps after the last", () => {
    render(<HeroWordRotator />);

    tick(ROTATE_MS - 1);
    expect(shownWords()).toEqual([words[0]]);
    tick(1);
    expect(shownWords()).toEqual([words[1]]);

    tick(ROTATE_MS * (words.length - 1));
    expect(shownWords()).toEqual([words[0]]);
  });

  it("holds its word while motion is paused, then carries on", () => {
    render(<HeroWordRotator />);

    act(() => setMotionPaused(true));
    // Checked after every step: a whole cycle would land back on the first word anyway.
    for (let i = 0; i < words.length; i++) {
      tick(ROTATE_MS);
      expect(shownWords()).toEqual([words[0]]);
    }

    act(() => setMotionPaused(false));
    tick(ROTATE_MS);
    expect(shownWords()).toEqual([words[1]]);
  });

  it("stays on the first word when the user prefers reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query }));
    render(<HeroWordRotator />);

    tick(ROTATE_MS);

    expect(shownWords()).toEqual([words[0]]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops its timer when unmounted", () => {
    const { unmount } = render(<HeroWordRotator />);
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("has no axe violations", async () => {
    vi.useRealTimers();
    const { container } = render(<HeroWordRotator />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
