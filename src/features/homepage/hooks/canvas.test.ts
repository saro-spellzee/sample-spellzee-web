import { afterEach, describe, expect, it, vi } from "vitest";
import { hexA, prefersReducedMotion } from "./canvas";

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
