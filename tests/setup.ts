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
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
