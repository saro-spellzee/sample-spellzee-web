/** Pure data + geometry for the hero neural-net canvas (`useNetCanvas`). No DOM access. */

export type Pt = { x: number; y: number };
export type Neuron = { id: number; x: number; y: number; vx: number; vy: number; r: number; c: string; ph: number; fire: number; rest: number };
export type Dust = { x: number; y: number; vx: number; vy: number; r: number; c: string };
export type Signal = { a: Neuron; b: Neuron; p: number; v: number; e: number };
export type Ring = { x: number; y: number; c: string; p: number };

/** Neuron colours from the design (the canvas needs hex for `hexA`). Four match `--color-vivid-*`; #DB2777 is canvas-only. */
export const PALETTE = ["#7C3AED", "#0891B2", "#DB2777", "#D97706", "#2563EB"];
/** Hero photo intrinsic size (the artwork's pixel space). */
export const IW = 1672;
export const IH = 941;
/** Minimum spacing between near neurons, and the repulsion radius. */
export const GAP = 84;
/** Maximum synapse length. */
export const LINK = 200;
/** Synapses per neuron (nearest neighbours). */
export const K = 2;
/** Refractory period after firing, in frames. */
export const REFRACT = 110;

/**
 * 1 where neurons may live, in photo pixel space: a wide band above her head and the
 * back-right; never on the child.
 */
export function inPhoto(ix: number, iy: number): 0 | 1 {
  const hx = (ix - 1130) / 275, hy = (iy - 385) / 290;
  if (hx * hx + hy * hy < 1) return 0;
  if (iy > 460 && ix > 740 && ix < 1610) return 0;
  if (iy < 170) return 1;
  if (ix > 1350) return 1;
  if (ix < 860 && iy < 300) return 1;
  return 0;
}

/** A gentle, stable bend for every synapse, like the flowing paths in the photo. */
export function curveControl(a: Neuron, b: Neuron): Pt {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
  const side = ((a.id * 7 + b.id * 13) % 2 ? 1 : -1) * (a.id < b.id ? 1 : -1);
  return { x: mx - dy * 0.18 * side, y: my + dx * 0.18 * side };
}

/** Point at `p` (0..1) along the quadratic curve a -> c -> b. */
export function quadPoint(a: Pt, c: Pt, b: Pt, p: number): Pt {
  const u = 1 - p;
  return { x: u * u * a.x + 2 * u * p * c.x + p * p * b.x, y: u * u * a.y + 2 * u * p * c.y + p * p * b.y };
}

/**
 * Joins each neuron to its K nearest neighbours within LINK (one edge per pair, and only
 * when the edge's midpoint is inside `region`). Refills `neighbours` (neuron -> linked
 * neurons, used to propagate firing) and returns the edge list.
 */
export function linkNearest(
  near: Neuron[],
  region: (x: number, y: number) => number,
  neighbours: Map<Neuron, Neuron[]>,
): [Neuron, Neuron][] {
  neighbours.clear();
  const seen = new Set<string>(), edges: [Neuron, Neuron][] = [];
  for (const a of near) {
    const cand: [number, Neuron][] = [];
    for (const b of near) { if (a === b) continue; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < LINK) cand.push([d, b]); }
    cand.sort((p, q) => p[0] - q[0]);
    for (const [, b] of cand.slice(0, K)) {
      const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
      if (seen.has(key) || !region((a.x + b.x) / 2, (a.y + b.y) / 2)) continue;
      seen.add(key);
      edges.push([a, b]);
      neighbours.set(a, [...(neighbours.get(a) ?? []), b]);
      neighbours.set(b, [...(neighbours.get(b) ?? []), a]);
    }
  }
  return edges;
}
