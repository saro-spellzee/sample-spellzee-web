import type { MouseEvent } from "react";

/** How to reach a URL with a fresh document: load it, or reload the current page at it. */
export type FullLoad = { assign: string } | { reloadAt: string };

/**
 * Loading `to` from `here` as a new document. When only the #fragment differs (or nothing),
 * the browser would just scroll, so the current page is reloaded at `to` instead.
 */
export function fullLoadPlan(to: URL, here: URL): FullLoad {
  const samePage = to.origin === here.origin && to.pathname === here.pathname && to.search === here.search;
  return samePage ? { reloadAt: to.href } : { assign: to.href };
}

/**
 * Click handler for the links on the error screens (put it on their container as
 * `onClickCapture`). The page under the screen has failed, so a link must load a fresh
 * document rather than navigate client-side: Next resets an error boundary only when the path
 * changes, so a client navigation to the same path (the homepage's "Back to homepage" and
 * "/#book") would leave the error on screen. After a reload at a #fragment, Firefox and Safari
 * open at the fragment; Chrome restores the old scroll position (the top, where the homepage's
 * booking CTA also is). Modified clicks (new tab or window) are left to the browser.
 */
export function followWithFullLoad(e: MouseEvent<HTMLElement>): void {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const link = e.target instanceof Element ? e.target.closest("a") : null;
  if (!link?.href) return;
  e.preventDefault();
  const plan = fullLoadPlan(new URL(link.href), new URL(window.location.href));
  if ("assign" in plan) {
    window.location.assign(plan.assign);
    return;
  }
  if (plan.reloadAt !== window.location.href) window.history.replaceState(window.history.state, "", plan.reloadAt);
  window.location.reload();
}
