import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { stories } from "../../content";
import { setMotionPaused } from "../../hooks/motion";
import { FeedbackToast } from "./FeedbackToast";
import { datedMessages, relativeWhen, shortDate } from "./feedback";

const SHOW_AFTER_MS = 700;
const ROTATE_MS = 7500;
const SWAP_GAP_MS = 380;
const NOW = new Date(2026, 8, 24, 21, 30); // Thursday, 9:30 PM

const { feedback } = stories;
/** The order the toast should show them in: newest class first. */
const feed = datedMessages(feedback.messages, NOW);
const titleOf = (i: number) => feedback.title.replace("{kid}", feed[i % feed.length].kid);
const dismissButton = () => screen.queryByRole("button", { name: feedback.dismiss });

/** Which message the card shows (by its text: two kids share a name); null when no card is on screen. */
function shownIndex() {
  if (!dismissButton()) return null;
  const i = feed.findIndex((m) => screen.queryByText(m.text));
  return i < 0 ? null : i;
}

let observed: ((entries: Partial<IntersectionObserverEntry>[]) => void) | null = null;
class FakeIntersectionObserver {
  constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
    observed = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const scrollIntoView = () => act(() => observed?.([{ isIntersecting: true }]));
const scrollAway = () => act(() => observed?.([{ isIntersecting: false }]));

function renderInSection() {
  return render(
    <section>
      <FeedbackToast />
    </section>,
  );
}

/** Renders the toast and brings the stories section into view until the first card shows. */
function renderShown() {
  const utils = renderInSection();
  scrollIntoView();
  tick(SHOW_AFTER_MS);
  return utils;
}

describe("FeedbackToast", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    observed = null;
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setMotionPaused(false);
  });

  it("shows nothing until the stories section has been in view for a moment", () => {
    renderInSection();
    expect(shownIndex()).toBeNull();

    scrollIntoView();
    tick(SHOW_AFTER_MS - 1);
    expect(shownIndex()).toBeNull();

    tick(1);
    expect(shownIndex()).toBe(0);
  });

  it("shows the newest message with its kid, text, time and mentor", () => {
    renderShown();
    const message = feed[0];

    expect(screen.getByText(titleOf(0))).toBeInTheDocument();
    expect(screen.getByText(message.text)).toBeInTheDocument();
    expect(screen.getByText(relativeWhen(message.end, NOW))).toBeInTheDocument();
    expect(screen.getByText(feedback.byline.replace("{tutor}", message.tutor).replace("{date}", shortDate(message.end)))).toBeInTheDocument();
    expect(screen.getByRole("img", { name: feedback.stars })).toBeInTheDocument();
  });

  it("cycles to the next message every few seconds and wraps after the last", () => {
    renderShown();

    // The card leaves, then the next one arrives after a short gap.
    tick(ROTATE_MS);
    expect(shownIndex()).toBeNull();
    tick(SWAP_GAP_MS);
    expect(shownIndex()).toBe(1);

    for (let i = 2; i <= feed.length; i++) tick(ROTATE_MS);
    expect(shownIndex()).toBe(0);
  });

  it("holds the current message while motion is paused, then carries on", () => {
    renderShown();

    act(() => setMotionPaused(true));
    tick(ROTATE_MS * 3);
    expect(shownIndex()).toBe(0);

    act(() => setMotionPaused(false));
    tick(ROTATE_MS + SWAP_GAP_MS);
    expect(shownIndex()).toBe(1);
  });

  it("shows one message and never cycles when the user prefers reduced motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query }));
    renderShown();

    tick(ROTATE_MS * 3);

    expect(shownIndex()).toBe(0);
  });

  it("hides while the section is out of view and returns when it scrolls back", () => {
    renderShown();

    scrollAway();
    expect(shownIndex()).toBeNull();
    tick(ROTATE_MS * 2);
    expect(shownIndex()).toBeNull();

    scrollIntoView();
    tick(SHOW_AFTER_MS);
    expect(shownIndex()).toBe(0);
  });

  it("can be dismissed from the keyboard, and stays away for the rest of the visit", async () => {
    // Testing Library's async wrapper waits on a real setTimeout(0), which only Jest's fake
    // timers flush for it; letting the fake clock follow real time too keeps userEvent moving.
    // Every assertion after the dismiss is "never shows again", so drift can't make it pass.
    vi.useFakeTimers({ now: NOW, shouldAdvanceTime: true });
    const user = userEvent.setup({ delay: null });
    renderShown();

    await user.tab();
    expect(dismissButton()).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(shownIndex()).toBeNull();

    tick(ROTATE_MS * 2);
    expect(shownIndex()).toBeNull();
    scrollAway();
    scrollIntoView();
    tick(SHOW_AFTER_MS + ROTATE_MS);
    expect(shownIndex()).toBeNull();
  });

  it("is not a live region, so screen readers aren't interrupted as it cycles", () => {
    const { container } = renderShown();

    expect(container.querySelector("[aria-live], [role=status], [role=alert], [role=log]")).toBeNull();
  });

  it("renders nothing, without errors, where IntersectionObserver is missing", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    renderInSection();

    tick(SHOW_AFTER_MS + ROTATE_MS);

    expect(shownIndex()).toBeNull();
  });

  it("stops its timers when unmounted", () => {
    const { unmount } = renderShown();
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("has no axe violations while a message shows", async () => {
    const { container } = renderShown();
    vi.useRealTimers(); // axe schedules its own timers
    expect(await axeViolations(container)).toEqual([]);
  });
});
