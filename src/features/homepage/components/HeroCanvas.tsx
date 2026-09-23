"use client";

import { useRef } from "react";
import { useNetCanvas } from "../hooks/useNetCanvas";

/** Decorative neural-net overlay on the hero photo. */
export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useNetCanvas(ref);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-2" />;
}
