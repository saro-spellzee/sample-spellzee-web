import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { stories } from "../../content";
import { ReelRow } from "./ReelRow";

const labelOf = (reel: (typeof stories.reels)[number]) =>
  stories.playLabel.replace("{kind}", reel.kind).replace("{quote}", reel.quote).replace("{tag}", reel.tag);
const reelButton = (i: number) => screen.getByRole("button", { name: labelOf(stories.reels[i]) });
const videoDialog = () => screen.getByRole("dialog", { hidden: true });
/** Lower case, letters and digits only: how axe compares a visible label with an accessible name. */
const words = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

describe("ReelRow", () => {
  it("lists every reel as a labelled play button, with the CTA beside the arrows", () => {
    render(<ReelRow cta={<a href="#book">{stories.cta.label}</a>} />);

    stories.reels.forEach((_, i) => expect(reelButton(i)).toBeInTheDocument());
    expect(screen.getByRole("link", { name: stories.cta.label })).toBeInTheDocument();
    expect(videoDialog()).not.toHaveAttribute("open");
  });

  it("names each reel with all of its visible text, in order (WCAG 2.5.3 Label in Name)", () => {
    render(<ReelRow cta={null} />);

    stories.reels.forEach((reel, i) => {
      const visible = words([reel.kind, reel.quote, reel.tag].join(" "));
      expect(words(reelButton(i).getAttribute("aria-label") ?? "")).toContain(visible);
      // Each piece of visible text is its own word run (axe joins inline text without spaces).
      expect(words(reelButton(i).textContent ?? "")).toBe(visible);
    });
  });

  it("opens the video dialog for the chosen reel and returns focus when closed", async () => {
    const user = userEvent.setup();
    render(<ReelRow cta={null} />);
    const reel = stories.reels[3];

    await user.click(reelButton(3));

    expect(videoDialog()).toHaveAttribute("open");
    expect(videoDialog()).toHaveTextContent(reel.quote);
    expect(videoDialog()).toHaveTextContent(`${reel.kind} · ${reel.tag}`);
    expect(videoDialog()).toHaveTextContent(stories.video.note);

    const closeButtons = screen.getAllByRole("button", { name: stories.video.close, hidden: true });
    await user.click(closeButtons[closeButtons.length - 1]);

    expect(videoDialog()).not.toHaveAttribute("open");
    expect(reelButton(3)).toHaveFocus();
  });

  it("closes on Escape and returns focus to the reel that opened it", async () => {
    const user = userEvent.setup();
    render(<ReelRow cta={null} />);

    await user.click(reelButton(1));
    expect(videoDialog()).toHaveAttribute("open");
    fireEvent(videoDialog(), new Event("cancel", { cancelable: true })); // what Escape fires on a modal <dialog>

    expect(videoDialog()).not.toHaveAttribute("open");
    expect(reelButton(1)).toHaveFocus();
  });

  it("scrolls the row by most of its width with the arrows", async () => {
    const user = userEvent.setup();
    const scrollBy = vi.fn();
    const original = Element.prototype.scrollBy;
    Element.prototype.scrollBy = scrollBy; // jsdom has no scrolling
    try {
      render(<ReelRow cta={null} />);

      await user.click(screen.getByRole("button", { name: stories.next }));
      await user.click(screen.getByRole("button", { name: stories.previous }));

      expect(scrollBy).toHaveBeenCalledTimes(2);
      expect(scrollBy.mock.calls[0][0]).toMatchObject({ behavior: "smooth" });
    } finally {
      Element.prototype.scrollBy = original;
    }
  });

  it("jumps instead of gliding when the user prefers reduced motion", async () => {
    const user = userEvent.setup();
    const scrollBy = vi.fn();
    const original = Element.prototype.scrollBy;
    Element.prototype.scrollBy = scrollBy;
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query }));
    try {
      render(<ReelRow cta={null} />);

      await user.click(screen.getByRole("button", { name: stories.next }));

      expect(scrollBy.mock.calls[0][0]).toMatchObject({ behavior: "auto" });
    } finally {
      Element.prototype.scrollBy = original;
      vi.unstubAllGlobals();
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(<ReelRow cta={null} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
