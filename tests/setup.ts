import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest doesn't run Testing Library's auto-cleanup without `globals: true`.
afterEach(() => cleanup());

// jsdom has no <dialog> methods; give components the minimum they use.
if (typeof HTMLDialogElement !== "undefined" && typeof HTMLDialogElement.prototype.showModal !== "function") {
  if (!("open" in HTMLDialogElement.prototype)) {
    Object.defineProperty(HTMLDialogElement.prototype, "open", {
      get(this: HTMLDialogElement) {
        return this.hasAttribute("open");
      },
    });
  }
  const modals = new Set<HTMLDialogElement>();
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
    modals.add(this);
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    modals.delete(this);
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  // As in browsers, an open modal makes the rest of the page inert: focusing anything outside it
  // does nothing. (Returning focus to the opener before the dialog has closed is a real bug.)
  const focus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function focusUnlessInert(this: HTMLElement, options?: FocusOptions) {
    const modal = [...modals].reverse().find((d) => d.isConnected);
    if (modal && !modal.contains(this)) return;
    focus.call(this, options);
  };
  afterEach(() => modals.clear());
}
