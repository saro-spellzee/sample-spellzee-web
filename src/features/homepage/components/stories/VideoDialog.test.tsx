import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../../../../tests/axe";
import { stories } from "../../content";
import { VideoDialog } from "./VideoDialog";

const { video } = stories;
const reel = stories.reels[2];
// A closed <dialog> is hidden from role queries (and has no computed name), so include hidden ones.
const dialog = () => screen.getByRole("dialog", { hidden: true });
const closeButtons = () => screen.getAllByRole("button", { name: video.close, hidden: true });

describe("VideoDialog", () => {
  it("stays closed and empty without a reel", () => {
    render(<VideoDialog reel={null} onClose={() => {}} />);

    expect(dialog()).not.toHaveAttribute("open");
    expect(dialog()).toBeEmptyDOMElement();
  });

  it("opens as a labelled modal showing the reel's quote, kind and tag", () => {
    render(<VideoDialog reel={reel} onClose={() => {}} />);

    expect(screen.getByRole("dialog", { name: video.label })).toHaveAttribute("open");
    expect(dialog()).toHaveTextContent(reel.quote);
    expect(dialog()).toHaveTextContent(`${reel.kind} · ${reel.tag}`);
    expect(dialog()).toHaveTextContent(video.note);
  });

  it("starts with focus on the visible close button, not the full-screen backdrop", () => {
    render(<VideoDialog reel={reel} onClose={() => {}} />);
    const [backdrop, button] = closeButtons();

    expect(button).toHaveFocus();
    expect(backdrop).not.toHaveFocus();
  });

  it("asks to close on Escape instead of closing itself, so the owner can restore focus", () => {
    const onClose = vi.fn();
    render(<VideoDialog reel={reel} onClose={onClose} />);
    const cancel = new Event("cancel", { cancelable: true }); // what Escape fires on a modal <dialog>

    fireEvent(dialog(), cancel);

    expect(onClose).toHaveBeenCalledOnce();
    expect(cancel.defaultPrevented).toBe(true);
  });

  it("closes from the close button (keyboard) and the backdrop (pointer only)", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<VideoDialog reel={reel} onClose={onClose} />);
    const [backdrop, button] = closeButtons();

    // Only the visible close button is in the Tab order; the backdrop is a pointer target.
    expect(backdrop).toHaveAttribute("tabindex", "-1");
    button.focus();
    await user.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("closes when its reel is cleared", () => {
    const { rerender } = render(<VideoDialog reel={reel} onClose={() => {}} />);

    rerender(<VideoDialog reel={null} onClose={() => {}} />);

    expect(dialog()).not.toHaveAttribute("open");
  });

  it("has no axe violations while open", async () => {
    const { container } = render(<VideoDialog reel={reel} onClose={() => {}} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
