import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isMotionPaused, setMotionPaused, subscribeMotion, useMotionPaused } from "./motion";

describe("motion store (the page's Pause motion switch)", () => {
  afterEach(() => setMotionPaused(false));

  it("starts playing, with no pause flag on the page", () => {
    expect(isMotionPaused()).toBe(false);
    expect(document.documentElement).not.toHaveAttribute("data-motion");
  });

  it("flags <html> while paused so CSS animations stop, and clears it on resume", () => {
    setMotionPaused(true);
    expect(isMotionPaused()).toBe(true);
    expect(document.documentElement).toHaveAttribute("data-motion", "paused");

    setMotionPaused(false);
    expect(isMotionPaused()).toBe(false);
    expect(document.documentElement).not.toHaveAttribute("data-motion");
  });

  it("notifies subscribers once per real change, and not after they unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeMotion(listener);

    setMotionPaused(true);
    setMotionPaused(true); // no change: no notification
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    setMotionPaused(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("re-renders components that read it when the switch flips", () => {
    const { result } = renderHook(() => useMotionPaused());
    expect(result.current).toBe(false);

    act(() => setMotionPaused(true));
    expect(result.current).toBe(true);

    act(() => setMotionPaused(false));
    expect(result.current).toBe(false);
  });
});
