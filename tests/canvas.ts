import { act } from "@testing-library/react";
import { vi, type Mock } from "vitest";

/**
 * A stand-in browser for the decorative canvas animations (jsdom has no 2D context, no layout
 * and no animation frames). Every drawing call is a spy, so a test can count frames (each one
 * starts with `clearRect`) without reading pixels; animation frames run only when the test
 * calls `runFrame()`; and the test decides whether the canvas is on screen.
 * Call `vi.unstubAllGlobals()` after each test (spies are restored by `restoreMocks`).
 */
export function fakeCanvas({ width = 800, height = 450 } = {}) {
  const gradient = { addColorStop: vi.fn() };
  // Any method the drawing code calls becomes a spy (gradient factories hand back a gradient);
  // properties it sets (fillStyle, lineWidth…) are stored as written.
  const ctx = new Proxy({} as Record<string | symbol, unknown>, {
    get(target, prop) {
      if (!(prop in target)) target[prop] = vi.fn(() => gradient);
      return target[prop];
    },
  });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
    { x: 0, y: 0, top: 0, left: 0, width, height, right: width, bottom: height, toJSON: () => ({}) } as DOMRect,
  );

  const frames = new Map<number, FrameRequestCallback>();
  let nextId = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frames.set(++nextId, cb);
    return nextId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));

  // Like a browser, an observer reports whether its target is on screen as soon as it starts
  // observing (here synchronously), and again whenever the test moves it with `setOnScreen`.
  let visible = true;
  const onScreen: ((entries: Partial<IntersectionObserverEntry>[]) => void)[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private cb: (entries: Partial<IntersectionObserverEntry>[]) => void;
      constructor(cb: (entries: Partial<IntersectionObserverEntry>[]) => void) {
        this.cb = cb;
        onScreen.push(cb);
      }
      observe() {
        this.cb([{ isIntersecting: visible }]);
      }
      disconnect() {}
    },
  );
  // The canvases start once the browser is idle; the test browser is always idle.
  vi.stubGlobal("requestIdleCallback", (cb: IdleRequestCallback) => {
    cb({ didTimeout: false, timeRemaining: () => 50 });
    return 1;
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );

  return {
    /** Frames drawn so far. */
    drawn: () => (ctx.clearRect as Mock).mock.calls.length,
    /** Animation frames waiting to run (0 once the loop has stopped). */
    pending: () => frames.size,
    /** Runs every queued animation frame once, as the browser would on its next paint. */
    runFrame() {
      const due = [...frames.values()];
      frames.clear();
      act(() => due.forEach((cb) => cb(performance.now())));
    },
    /** Reports the canvas scrolling into or out of view. */
    setOnScreen(isIntersecting: boolean) {
      visible = isIntersecting;
      act(() => onScreen.forEach((cb) => cb([{ isIntersecting }])));
    },
  };
}
