/** Shared helpers for the homepage canvas animations. */

export const TAU = 6.283;

export function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
}

export function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a: number): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hexA(c, a));
  g.addColorStop(1, hexA(c, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

/** Wraps a callback so a throw stops the animation instead of escaping. */
export type Guard = <A extends unknown[]>(fn: (...args: A) => void) => (...args: A) => void;

/** How far outside the viewport a canvas starts, so it is already drawing when scrolled to. */
const START_MARGIN = "200px";
/** The longest a visible canvas waits for an idle moment before starting anyway. */
const IDLE_TIMEOUT = 600;

/**
 * Calls `fn` once `el` comes within START_MARGIN of the viewport and the main thread is idle.
 * Returns a cancel function. Keeps the canvases' setup (sizing, seeding, the first GPU frame)
 * out of page load and hydration: a canvas below the fold costs nothing until it's scrolled
 * near, and one in view starts right after hydration instead of inside it.
 */
function whenNearAndIdle(el: Element, fn: () => void): () => void {
  let cancelled = false;
  let near = false;
  const run = () => {
    if (!cancelled) fn();
  };
  const io = new IntersectionObserver(
    (entries) => {
      if (cancelled || near || !entries.some((e) => e.isIntersecting)) return;
      near = true;
      io.disconnect();
      // Safari has no requestIdleCallback; a timeout still lets hydration finish first.
      if (typeof requestIdleCallback === "function") requestIdleCallback(run, { timeout: IDLE_TIMEOUT });
      else setTimeout(run, 1);
    },
    { rootMargin: START_MARGIN },
  );
  io.observe(el);
  return () => {
    cancelled = true;
    io.disconnect();
  };
}

/**
 * Starts a decorative canvas animation so that a failure can never blank its section.
 * Setup runs inside `useEffect`, where a throw would reach the route's error boundary
 * and replace the whole page. Here it is caught instead: the loop stops, the canvas is
 * hidden (the artwork underneath stays), and a single warning is logged.
 * `start` runs once the canvas is near the viewport and the browser is idle (see
 * `whenNearAndIdle`); it must return its cleanup; wrap async callbacks (rAF, observers) in `guard`.
 * Missing browser APIs (old engines without ResizeObserver) skip the animation.
 */
export function startCanvas(
  name: string,
  canvas: HTMLCanvasElement,
  start: (guard: Guard) => () => void,
): () => void {
  if (typeof ResizeObserver === "undefined" || typeof IntersectionObserver === "undefined") return () => {};
  let cleanup: (() => void) | undefined;
  let stopped = false;
  const stop = (error?: unknown) => {
    if (stopped) return;
    stopped = true;
    try {
      cleanup?.();
    } catch {
      // Already failing; nothing more to release.
    }
    if (error !== undefined) {
      canvas.hidden = true;
      console.warn(`${name}: decorative animation stopped after an error.`, error);
    }
  };
  const guard: Guard =
    (fn) =>
    (...args) => {
      if (stopped) return;
      try {
        fn(...args);
      } catch (error) {
        stop(error);
      }
    };
  const cancelStart = whenNearAndIdle(canvas, () => {
    if (stopped) return;
    try {
      cleanup = start(guard);
    } catch (error) {
      stop(error);
    }
  });
  return () => {
    cancelStart();
    stop();
  };
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Sizes a canvas to its parent box at up to 2x DPR; returns the CSS size. */
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, box: HTMLElement) {
  const r = box.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, r.width * dpr);
  canvas.height = Math.max(1, r.height * dpr);
  canvas.style.width = `${r.width}px`;
  canvas.style.height = `${r.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return r;
}
