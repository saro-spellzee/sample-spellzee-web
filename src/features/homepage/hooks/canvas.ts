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
