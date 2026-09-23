import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { HeroCanvas } from "./HeroCanvas";

describe("HeroCanvas", () => {
  beforeEach(() => {
    // jsdom has no 2D context; the hook must bail out quietly rather than throw.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  it("renders a decorative canvas hidden from assistive tech", () => {
    const { container } = render(
      <div data-hero-host>
        <div>
          <HeroCanvas />
        </div>
      </div>,
    );

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
