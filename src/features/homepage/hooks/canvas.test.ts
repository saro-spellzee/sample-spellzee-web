import { afterEach, describe, expect, it, vi } from "vitest";
import { hexA, prefersReducedMotion, startCanvas } from "./canvas";

describe("hexA", () => {
  it("converts a hex colour and alpha to rgba()", () => {
    expect(hexA("#1557D6", 0.5)).toBe("rgba(21,87,214,0.5)");
    expect(hexA("#FFFFFF", 1)).toBe("rgba(255,255,255,1)");
  });

  it("clamps alpha to the 0..1 range", () => {
    expect(hexA("#000000", -0.3)).toBe("rgba(0,0,0,0)");
    expect(hexA("#000000", 1.7)).toBe("rgba(0,0,0,1)");
  });
});

describe("prefersReducedMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is false when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("reflects the reduced-motion media query", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)" }));
    expect(prefersReducedMotion()).toBe(true);

    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("startCanvas", () => {
  afterEach(() => vi.unstubAllGlobals());

  const withObservers = () => {
    class Stub {
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", Stub);
    vi.stubGlobal("IntersectionObserver", Stub);
  };

  it("skips the animation when observers are unavailable", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    const start = vi.fn(() => () => {});
    const stop = startCanvas("Test", document.createElement("canvas"), start);
    expect(start).not.toHaveBeenCalled();
    expect(() => stop()).not.toThrow();
  });

  it("contains a setup failure: no throw, canvas hidden, one warning", () => {
    withObservers();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const canvas = document.createElement("canvas");
    const stop = startCanvas("Test", canvas, () => {
      throw new Error("boom");
    });
    expect(canvas.hidden).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(() => stop()).not.toThrow();
  });

  it("stops and cleans up once when a guarded callback throws", () => {
    withObservers();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const canvas = document.createElement("canvas");
    const cleanup = vi.fn();
    const frame = vi.fn(() => {
      throw new Error("draw failed");
    });
    let tick = () => {};
    const stop = startCanvas("Test", canvas, (guard) => {
      tick = guard(frame);
      return cleanup;
    });
    tick();
    tick();
    stop();
    expect(frame).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(canvas.hidden).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("runs cleanup on unmount without hiding a healthy canvas", () => {
    withObservers();
    const canvas = document.createElement("canvas");
    const cleanup = vi.fn();
    const stop = startCanvas("Test", canvas, () => cleanup);
    stop();
    stop();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(canvas.hidden).toBe(false);
  });
});
