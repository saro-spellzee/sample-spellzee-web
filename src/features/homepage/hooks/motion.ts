import { useSyncExternalStore } from "react";

/**
 * The page-wide "Pause motion" switch. CSS animations pause through
 * `html[data-motion="paused"]` (globals.css); timers, canvases and SMIL read the
 * flag through `isMotionPaused()` or `useMotionPaused()`.
 */
let paused = false;
const listeners = new Set<() => void>();

export function isMotionPaused(): boolean {
  return paused;
}

export function setMotionPaused(next: boolean): void {
  if (next === paused) return;
  paused = next;
  if (next) document.documentElement.dataset.motion = "paused";
  else delete document.documentElement.dataset.motion;
  listeners.forEach((listener) => listener());
}

export function subscribeMotion(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useMotionPaused(): boolean {
  return useSyncExternalStore(subscribeMotion, isMotionPaused, () => false);
}
