import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../tests/axe";
import { clm } from "../content";
import { SkillMap } from "./SkillMap";

const AUTO_ADVANCE_MS = 3600;
const IDLE_AFTER_TOUCH_MS = 7000;
const skills = clm.skills;

const pill = (i: number) => screen.getByRole("button", { name: skills[i].name });
const detail = () => screen.getByRole("heading", { level: 3 });

function expectActive(active: number) {
  skills.forEach((_, i) => expect(pill(i)).toHaveAttribute("aria-pressed", String(i === active)));
  expect(detail()).toHaveTextContent(skills[active].name);
  expect(screen.getByText(skills[active].description)).toBeInTheDocument();
}

/** Renders inside a <section> whose box is reported as in or out of the viewport. */
function renderInSection(inView: boolean) {
  const utils = render(
    <section>
      <SkillMap />
    </section>,
  );
  const section = utils.container.querySelector("section")!;
  const top = inView ? 0 : window.innerHeight * 2;
  vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
    top,
    bottom: top + 600,
    left: 0,
    right: 1000,
    width: 1000,
    height: 600,
    x: 0,
    y: top,
    toJSON: () => ({}),
  });
  return utils;
}

const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("SkillMap", () => {
  beforeEach(() => {
    // jsdom has no 2D context; the brain canvas hook bails out.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("starts on the first skill and describes it", () => {
    render(<SkillMap />);

    expectActive(0);
    expect(screen.getByRole("img", { name: clm.brain.alt })).toBeInTheDocument();
  });

  it("selects a skill on click, hover and focus", async () => {
    const user = userEvent.setup();
    render(<SkillMap />);

    await user.click(pill(2));
    expectActive(2);

    await user.hover(pill(4));
    expectActive(4);

    act(() => pill(1).focus());
    expectActive(1);
  });

  it("follows keyboard focus when tabbing through the pills", async () => {
    const user = userEvent.setup();
    render(<SkillMap />);

    await user.tab();
    await user.tab();
    await user.tab();

    expect(pill(2)).toHaveFocus();
    expectActive(2);
  });

  it("shows the alternative name only for skills that have one", async () => {
    const user = userEvent.setup();
    render(<SkillMap />);
    const withAlt = skills.findIndex((s) => s.alt);
    const withoutAlt = skills.findIndex((s) => !s.alt);

    await user.click(pill(withAlt));
    expect(screen.getByText(`${clm.altPrefix}${skills[withAlt].alt}`)).toBeInTheDocument();

    await user.click(pill(withoutAlt));
    expect(screen.queryByText(new RegExp(clm.altPrefix))).not.toBeInTheDocument();
  });

  describe("auto-advance", () => {
    beforeEach(() => {
      // Start both clocks at 0 so event.timeStamp (Date.now in jsdom) and performance.now agree.
      vi.useFakeTimers({ now: 0 });
    });

    it("advances every few seconds while the section is in view, wrapping at the end", () => {
      renderInSection(true);

      tick(AUTO_ADVANCE_MS);
      expectActive(1);

      tick(AUTO_ADVANCE_MS * (skills.length - 1));
      expectActive(0);
    });

    it("does not advance while the section is off screen", () => {
      renderInSection(false);

      tick(AUTO_ADVANCE_MS * 3);

      expectActive(0);
    });

    it("does not advance when the user prefers reduced motion", () => {
      vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query }));
      renderInSection(true);

      tick(AUTO_ADVANCE_MS * 3);

      expectActive(0);
    });

    it("pauses after the user picks a skill, then resumes once idle", () => {
      renderInSection(true);
      tick(1);
      fireEvent.click(pill(3));
      expectActive(3);

      tick(IDLE_AFTER_TOUCH_MS - 1);
      expectActive(3);

      tick(AUTO_ADVANCE_MS);
      expectActive(4);
    });
  });

  it("has no axe violations", async () => {
    const { container } = render(<SkillMap />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
